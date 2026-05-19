import fs from 'node:fs/promises';
import path from 'node:path';
import { loadConfigFile } from '../config/load.js';
import { parseConfig } from '../config/schema.js';
import type { AnalysisResult, Config, ScreenInfo } from '../types.js';
import { discoverModalCandidates } from './modals/discover.js';
import { readEscapeHatch } from './modals/escape-hatches.js';
import { extractComponent } from './modals/extract.js';
import { detectModalLibraryImport } from './modals/heuristics/imports.js';
import { detectModalJsxAttrs } from './modals/heuristics/jsx-attrs.js';
import { detectNameSuffix } from './modals/heuristics/naming.js';
import { detectCreatePortalUse } from './modals/heuristics/portal.js';
import { getImports, parseTsx, type ImportInfo } from './modals/parse.js';
import { createPathResolver } from './modals/path-resolver.js';
import {
  buildModalSourceSet,
  detectReexportSignal,
  hasPropagationSourceSignal,
} from './modals/reexport-tracing.js';
import { classifyCandidate } from './modals/scoring.js';
import type { EscapeHatch } from './modals/escape-hatches.js';
import type { Signal } from '../types.js';
import { classifyAppRouterFile } from './routes/app-router.js';
import { discoverFiles, loadGitignore } from './routes/discover.js';
import { discoverPagesRouterRoutes } from './routes/pages-router.js';
import { toPosix } from './routes/normalize.js';

/** Candidate App Router roots, tried in order. First match wins. */
const APP_ROUTER_ROOTS = ['app', 'src/app'] as const;
/** Candidate Pages Router roots, tried in order. First match wins. */
const PAGES_ROUTER_ROOTS = ['pages', 'src/pages'] as const;

/**
 * Analyze a Next.js project for screens.
 *
 * Discovers routes (App Router fully, Pages Router as a stub gated by
 * `config.pagesRouter`) **and** modal components — the latter using SWC to
 * parse each candidate `.tsx`/`.jsx` and run the scored heuristic.
 *
 * The result is fully deterministic: the same project on disk always produces
 * the same bytes when serialized with `JSON.stringify`.
 *
 * @param rootDir Path to the Next.js project root. Relative paths are
 *                resolved against the current working directory.
 * @param config  Optional analyzer configuration. Invalid input throws.
 *                Merged shallowly over `screen-counter.config.{mjs,cjs,js}`
 *                in the project root (programmatic config takes precedence).
 */
export async function analyze(rootDir: string, config?: Config): Promise<AnalysisResult> {
  const absoluteRoot = path.resolve(rootDir);
  const stat = await fs.stat(absoluteRoot).catch((err: unknown) => {
    if (isErrnoCode(err, 'ENOENT')) {
      throw new Error(`screen-counter: rootDir does not exist: ${absoluteRoot}`);
    }
    throw err;
  });
  if (!stat.isDirectory()) {
    throw new Error(`screen-counter: rootDir is not a directory: ${absoluteRoot}`);
  }

  const fileConfig = await loadConfigFile(absoluteRoot);
  const merged: Config = { ...(fileConfig ?? {}), ...(config ?? {}) };
  const resolved = parseConfig(merged);

  const gitignore = await loadGitignore(absoluteRoot);
  const warnings: string[] = [];
  const routes: ScreenInfo[] = [];
  const modals: ScreenInfo[] = [];
  const disabled: ScreenInfo[] = [];

  /* -------------------------- routes -------------------------- */
  const appRoot = await firstExistingDir(absoluteRoot, APP_ROUTER_ROOTS);
  if (appRoot) {
    const files = await discoverFiles({
      rootDir: absoluteRoot,
      patterns: [`${appRoot}/**/page.{tsx,jsx,ts,js}`, ...resolved.include],
      extraExcludes: resolved.exclude,
      gitignore,
    });
    for (const file of files) {
      const classification = classifyAppRouterFile(file, appRoot);
      if (classification.kind === 'skip') {
        warnings.push(classification.warning);
        continue;
      }
      routes.push({
        kind: 'route',
        path: file,
        route: classification.route,
        signals: [],
      });
    }
  }
  if (resolved.pagesRouter) {
    const pagesRoot = await firstExistingDir(absoluteRoot, PAGES_ROUTER_ROOTS);
    if (pagesRoot) {
      const pages = await discoverPagesRouterRoutes(absoluteRoot, pagesRoot, {
        include: resolved.include,
        exclude: resolved.exclude,
        gitignore,
      });
      routes.push(...pages.routes);
      warnings.push(...pages.warnings);
    }
  }
  routes.sort(byPath);

  // Same URL emitted by both App and Pages routers → Next.js logs an error
  // and App Router wins. We still emit both entries so the report stays
  // faithful, but surface a warning so consumers know their count is
  // intentionally over-reporting until they remove one side.
  const byRoute = new Map<string, ScreenInfo[]>();
  for (const r of routes) {
    if (!r.route) continue;
    const bucket = byRoute.get(r.route) ?? [];
    bucket.push(r);
    byRoute.set(r.route, bucket);
  }
  for (const [route, entries] of byRoute) {
    if (entries.length < 2) continue;
    const paths = entries.map((e) => e.path).join(', ');
    warnings.push(`Route collision at ${route}: ${paths}`);
  }

  /* -------------------------- modals -------------------------- */
  const candidates = await discoverModalCandidates({
    rootDir: absoluteRoot,
    include: resolved.include,
    exclude: resolved.exclude,
    gitignore,
  });

  interface PassOne {
    filePath: string;
    componentName: string | null;
    imports: ImportInfo[];
    signals: Signal[];
    escapeHatch: EscapeHatch;
  }

  // Pass 1 — parse + gather raw signals + escape hatch, but defer classification.
  const passOne: PassOne[] = [];
  for (const file of candidates) {
    const absFile = path.join(absoluteRoot, file);
    let contents: string;
    try {
      contents = await fs.readFile(absFile, 'utf8');
    } catch (err) {
      warnings.push(`failed to read ${file}: ${errorMessage(err)}`);
      continue;
    }
    let ast;
    try {
      ast = parseTsx(file, contents).ast;
    } catch (err) {
      warnings.push(`failed to parse ${file}: ${errorMessage(err)}`);
      continue;
    }
    const imports = getImports(ast);
    const extracted = extractComponent(ast, imports);
    if (extracted.warnings.length > 0) {
      for (const w of extracted.warnings) warnings.push(`${file}: ${w}`);
    }

    const signals: Signal[] = [
      ...detectModalLibraryImport(imports, file, resolved.modalLibraries),
      ...detectModalJsxAttrs(extracted.jsxRoots),
      ...detectNameSuffix(extracted.componentName, file, resolved.nameSuffixes),
      ...detectCreatePortalUse(ast, imports),
    ];
    passOne.push({
      filePath: file,
      componentName: extracted.componentName,
      imports,
      signals,
      escapeHatch: readEscapeHatch(extracted.jsxRoots),
    });
  }

  // Pass 2 — propagate strong signals from local modal primitives to their
  // consumers via re-export tracing.
  const sourceSet = buildModalSourceSet(passOne);
  const pathResolver = createPathResolver(absoluteRoot);
  for (const entry of passOne) {
    if (hasPropagationSourceSignal(entry.signals)) continue;
    const reexport = detectReexportSignal(
      entry.filePath,
      entry.imports,
      sourceSet,
      pathResolver,
    );
    if (reexport) entry.signals.push(reexport);
  }

  // Classification pass.
  for (const entry of passOne) {
    const classification = classifyCandidate({
      escapeHatch: entry.escapeHatch,
      componentName: entry.componentName,
      filePath: entry.filePath,
      signals: entry.signals,
      excludeSuffixes: resolved.excludeSuffixes,
      threshold: resolved.scoringThreshold,
    });
    if (!classification) continue;

    const screen: ScreenInfo = {
      kind: classification.kind,
      path: entry.filePath,
      signals: classification.signals,
    };
    if (classification.kind === 'disabled') disabled.push(screen);
    else modals.push(screen);
  }

  modals.sort(byPath);
  disabled.sort(byPath);
  warnings.sort();

  const result: AnalysisResult = {
    count: routes.length + modals.length,
    routes,
    modals,
    disabled,
  };
  if (warnings.length > 0) {
    result.warnings = warnings;
  }
  return result;
}

function byPath(a: ScreenInfo, b: ScreenInfo): number {
  return a.path < b.path ? -1 : a.path > b.path ? 1 : 0;
}

/**
 * Return the first directory in `candidates` that exists under `rootDir`,
 * normalized as a POSIX relative path. Returns `null` if none exist.
 */
async function firstExistingDir(
  rootDir: string,
  candidates: readonly string[],
): Promise<string | null> {
  for (const candidate of candidates) {
    const abs = path.join(rootDir, candidate);
    try {
      const s = await fs.stat(abs);
      if (s.isDirectory()) return toPosix(candidate);
    } catch (err) {
      if (!isErrnoCode(err, 'ENOENT')) throw err;
    }
  }
  return null;
}

function isErrnoCode(err: unknown, code: string): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: unknown }).code === code
  );
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
