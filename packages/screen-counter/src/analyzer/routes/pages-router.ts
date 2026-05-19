import type { Ignore } from 'ignore';
import type { ScreenInfo } from '../../types.js';
import { discoverFiles } from './discover.js';

/**
 * Result of classifying a single Pages Router source file.
 *
 * Either the file maps to a countable route (with its canonical URL) or it
 * is skipped silently. Unlike App Router, Pages Router skips (`_app`,
 * `_document`, `_error`, `api/*`) are expected — they don't warrant a
 * warning.
 */
export type PagesRouterClassification =
  | { kind: 'route'; route: string }
  | { kind: 'skip' };

export interface PagesRouterResult {
  routes: ScreenInfo[];
  warnings: string[];
}

/** Special top-level basenames Next treats as non-routable. */
const SPECIAL_TOP_LEVEL = new Set(['_app', '_document', '_error']);

/** Extensions matched by the discovery glob. */
const ROUTE_EXTS = /\.(tsx|jsx|ts|js)$/;

/**
 * Map a path relative to the Pages Router root to its canonical URL.
 *
 * Rules:
 *  - Strip the file extension.
 *  - `index` as the trailing segment becomes the directory's URL
 *    (`foo/index` → `/foo`, `index` → `/`).
 *  - Dynamic (`[id]`), catch-all (`[...slug]`) and optional catch-all
 *    (`[[...slug]]`) segments pass through verbatim.
 */
export function pagesPathToRoute(relFromPagesRoot: string): string {
  const noExt = relFromPagesRoot.replace(ROUTE_EXTS, '');
  const segments = noExt.split('/');
  if (segments.length > 0 && segments[segments.length - 1] === 'index') {
    segments.pop();
  }
  if (segments.length === 0) return '/';
  return `/${segments.join('/')}`;
}

/**
 * Classify a Pages Router file relative to the project root.
 *
 * @param relativePath POSIX project-relative path (e.g. `pages/users/[id].tsx`).
 * @param rootPrefix   Detected Pages Router root, either `pages` or `src/pages`.
 */
export function classifyPagesRouterFile(
  relativePath: string,
  rootPrefix: string,
): PagesRouterClassification {
  const withoutRoot = relativePath.slice(rootPrefix.length + 1); // drop "pages/" or "src/pages/"
  const segments = withoutRoot.split('/');

  // Anything under `api/` is an API route, never a screen. Matches the spec
  // ("no se cuenta api/*") and defends against gaps in the glob filter.
  if (segments[0] === 'api') {
    return { kind: 'skip' };
  }

  // Special top-level files only count when at depth 0. Nested files like
  // `pages/admin/_internal.tsx` are real routes — Next only treats the
  // root-level `_app`/`_document`/`_error` as non-routable.
  if (segments.length === 1) {
    const baseNoExt = segments[0]!.replace(ROUTE_EXTS, '');
    if (SPECIAL_TOP_LEVEL.has(baseNoExt)) {
      return { kind: 'skip' };
    }
  }

  return { kind: 'route', route: pagesPathToRoute(withoutRoot) };
}

interface DiscoverOpts {
  include: string[];
  exclude: string[];
  gitignore: Ignore | null;
}

/**
 * Discover and classify every Pages Router screen under `pagesRoot`.
 *
 * Reuses {@link discoverFiles} for the glob walk and `.gitignore` filtering.
 * `api/**` is excluded at the glob level as defense-in-depth — the classifier
 * also rejects it, so misconfigured user `include` globs can't smuggle API
 * routes back in.
 */
export async function discoverPagesRouterRoutes(
  rootDir: string,
  pagesRoot: string,
  opts: DiscoverOpts = { include: [], exclude: [], gitignore: null },
): Promise<PagesRouterResult> {
  const files = await discoverFiles({
    rootDir,
    patterns: [`${pagesRoot}/**/*.{tsx,jsx,ts,js}`, ...opts.include],
    extraExcludes: [...opts.exclude, `${pagesRoot}/api/**`],
    gitignore: opts.gitignore,
  });

  const routes: ScreenInfo[] = [];
  for (const file of files) {
    const classification = classifyPagesRouterFile(file, pagesRoot);
    if (classification.kind === 'skip') continue;
    routes.push({
      kind: 'route',
      path: file,
      route: classification.route,
      signals: [],
    });
  }
  return { routes, warnings: [] };
}
