import fs from 'node:fs';
import path from 'node:path';
import { toPosix } from '../routes/normalize.js';

/**
 * Pragmatic path resolver for re-export tracing. Supports:
 *
 * - Relative specifiers: `./foo`, `../bar/baz`.
 * - The `@/*` alias (read from the project's `tsconfig.json` when present,
 *   otherwise falling back to `<rootDir>/src/*` if `src/` exists else
 *   `<rootDir>/*`).
 *
 * Custom aliases (`@app/*`, `~/`, etc.) are intentionally NOT resolved in
 * this version — documented as a limitation in
 * `dev-notes/02-heuristicas-modales.md`.
 *
 * The resolver returns project-relative POSIX paths so they line up with
 * the keys used in `result.modals`.
 */
export interface PathResolver {
  /**
   * Resolve `specifier` against the directory containing `importer`. Returns a
   * project-relative POSIX path to the file (with a probed extension), or
   * `null` if the target cannot be resolved or lies outside `rootDir`.
   */
  resolve(importer: string, specifier: string): string | null;
  /** Human-readable description for diagnostics. */
  aliasDescription: string;
}

const FILE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'] as const;
const INDEX_FILES = FILE_EXTENSIONS.map((ext) => `index${ext}`);

/**
 * Build a resolver bound to `rootDir`. Reads `tsconfig.json` once (with
 * lenient JSON-with-comments parsing); subsequent `resolve()` calls are
 * I/O-light (one `existsSync` per probed candidate).
 */
export function createPathResolver(rootDir: string): PathResolver {
  const absRoot = path.resolve(rootDir);
  const aliasTarget = resolveAtAliasTarget(absRoot);
  const aliasDescription = `@/* → ${path.posix.relative(toPosix(absRoot), aliasTarget) || '.'}`;

  function resolve(importer: string, specifier: string): string | null {
    if (specifier.length === 0) return null;
    let absTarget: string | null = null;

    if (specifier.startsWith('./') || specifier.startsWith('../')) {
      const importerDir = path.dirname(path.resolve(absRoot, importer));
      absTarget = path.resolve(importerDir, specifier);
    } else if (specifier === '@' || specifier.startsWith('@/')) {
      // `@` alone is degenerate; treat as the alias root.
      const rest = specifier === '@' ? '' : specifier.slice(2);
      absTarget = rest.length > 0 ? path.resolve(aliasTarget, rest) : aliasTarget;
    } else {
      return null;
    }

    const probed = probeFile(absTarget);
    if (probed === null) return null;

    const rel = path.relative(absRoot, probed);
    if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
    return toPosix(rel);
  }

  return { resolve, aliasDescription };
}

/**
 * Try `<target>` directly (if the specifier already has an extension), then
 * `<target>.tsx`, `.ts`, `.jsx`, `.js`, then `<target>/index.tsx`, etc.
 * Returns the first existing absolute path, or `null`.
 */
function probeFile(absTarget: string): string | null {
  if (looksLikeFile(absTarget) && fs.existsSync(absTarget)) {
    return absTarget;
  }
  for (const ext of FILE_EXTENSIONS) {
    const candidate = absTarget + ext;
    if (fs.existsSync(candidate)) return candidate;
  }
  for (const idx of INDEX_FILES) {
    const candidate = path.join(absTarget, idx);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function looksLikeFile(absPath: string): boolean {
  const ext = path.extname(absPath);
  return ext.length > 0;
}

/**
 * Decide what `@/*` resolves to under `rootDir`:
 *
 * 1. If `tsconfig.json` has `compilerOptions.paths['@/*']`, honour the first
 *    mapping. Relative entries are resolved against `compilerOptions.baseUrl`
 *    or `rootDir` if no baseUrl is set.
 * 2. Otherwise, fall back to `<rootDir>/src` if that directory exists.
 * 3. Otherwise, fall back to `<rootDir>` itself.
 */
function resolveAtAliasTarget(absRoot: string): string {
  const fromTsconfig = readAtAliasFromTsconfig(absRoot);
  if (fromTsconfig) return fromTsconfig;
  const srcDir = path.join(absRoot, 'src');
  if (existsDir(srcDir)) return srcDir;
  return absRoot;
}

function readAtAliasFromTsconfig(absRoot: string): string | null {
  const tsconfigPath = path.join(absRoot, 'tsconfig.json');
  let raw: string;
  try {
    raw = fs.readFileSync(tsconfigPath, 'utf8');
  } catch {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripJsonComments(raw));
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) return null;
  const compilerOptions = (parsed as { compilerOptions?: unknown }).compilerOptions;
  if (typeof compilerOptions !== 'object' || compilerOptions === null) return null;

  const paths = (compilerOptions as { paths?: unknown }).paths;
  if (typeof paths !== 'object' || paths === null) return null;
  const entry = (paths as Record<string, unknown>)['@/*'];
  if (!Array.isArray(entry) || entry.length === 0) return null;
  const first = entry[0];
  if (typeof first !== 'string') return null;
  // Drop the trailing /* so we can join arbitrary segments later.
  const cleaned = first.replace(/\/\*$/, '');

  const baseUrlRaw = (compilerOptions as { baseUrl?: unknown }).baseUrl;
  const baseDir =
    typeof baseUrlRaw === 'string' ? path.resolve(absRoot, baseUrlRaw) : absRoot;
  return path.resolve(baseDir, cleaned);
}

function existsDir(absPath: string): boolean {
  try {
    return fs.statSync(absPath).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Strip `//` line comments and `/* * /` block comments from a JSON-with-comments
 * string. Crude but sufficient for tsconfig.json files generated by Next.js
 * and shadcn templates. Quoted strings are preserved verbatim.
 */
function stripJsonComments(input: string): string {
  let out = '';
  let i = 0;
  const n = input.length;
  while (i < n) {
    const ch = input[i];
    const next = i + 1 < n ? input[i + 1] : '';
    if (ch === '"') {
      out += ch;
      i++;
      while (i < n) {
        const c = input[i]!;
        out += c;
        if (c === '\\' && i + 1 < n) {
          out += input[i + 1];
          i += 2;
          continue;
        }
        i++;
        if (c === '"') break;
      }
      continue;
    }
    if (ch === '/' && next === '/') {
      while (i < n && input[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      i += 2;
      while (i < n - 1 && !(input[i] === '*' && input[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    out += ch ?? '';
    i++;
  }
  return out;
}
