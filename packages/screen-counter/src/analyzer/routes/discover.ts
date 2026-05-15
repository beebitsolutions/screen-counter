import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import ignore, { type Ignore } from 'ignore';
import { toPosix } from './normalize.js';

/**
 * Glob excludes that always apply, regardless of `.gitignore` or user config.
 * Keeps the walker from descending into build artifacts and dependency folders.
 */
export const DEFAULT_EXCLUDES = [
  '**/node_modules/**',
  '**/.next/**',
  '**/.turbo/**',
  '**/dist/**',
  '**/build/**',
  '**/out/**',
  '**/coverage/**',
];

/**
 * Load and parse the consumer project's `.gitignore`, returning an `Ignore`
 * instance ready to test paths. Returns `null` when no `.gitignore` exists.
 */
export async function loadGitignore(rootDir: string): Promise<Ignore | null> {
  const gitignorePath = path.join(rootDir, '.gitignore');
  try {
    const contents = await fs.readFile(gitignorePath, 'utf8');
    return ignore().add(contents);
  } catch (err) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: unknown }).code === 'ENOENT'
    ) {
      return null;
    }
    throw err;
  }
}

export interface DiscoverOptions {
  /** Absolute path to the project root. */
  rootDir: string;
  /** fast-glob patterns relative to `rootDir`. */
  patterns: string[];
  /** Extra excludes appended to {@link DEFAULT_EXCLUDES} (and the user config). */
  extraExcludes: string[];
  /** Optional pre-loaded `.gitignore` matcher. */
  gitignore: Ignore | null;
}

/**
 * Walk the filesystem and return all files matching `patterns`, filtered by
 * the default excludes, the user-supplied excludes and the project's
 * `.gitignore`. Output is POSIX, project-relative and sorted lexicographically
 * so downstream processing is deterministic.
 */
export async function discoverFiles(options: DiscoverOptions): Promise<string[]> {
  const { rootDir, patterns, extraExcludes, gitignore: gi } = options;
  const matches = await fg(patterns, {
    cwd: rootDir,
    ignore: [...DEFAULT_EXCLUDES, ...extraExcludes],
    dot: false,
    onlyFiles: true,
    absolute: false,
    followSymbolicLinks: false,
    suppressErrors: true,
  });

  const normalized = matches.map(toPosix);
  const filtered = gi ? normalized.filter((p) => !gi.ignores(p)) : normalized;

  filtered.sort();
  return filtered;
}
