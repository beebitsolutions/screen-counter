import fg from 'fast-glob';
import type { Ignore } from 'ignore';
import { DEFAULT_EXCLUDES } from '../routes/discover.js';
import { toPosix } from '../routes/normalize.js';

/**
 * Glob patterns that exclude Next.js special files and route files from the
 * modal candidate pool. Routes are discovered with disjoint patterns, so
 * including them here is just defensive — every modal candidate must be a
 * component file, not a routable file.
 */
const NEXTJS_SPECIALS_AND_ROUTES = [
  '**/page.{tsx,jsx,ts,js}',
  '**/layout.{tsx,jsx,ts,js}',
  '**/loading.{tsx,jsx,ts,js}',
  '**/error.{tsx,jsx,ts,js}',
  '**/not-found.{tsx,jsx,ts,js}',
  '**/template.{tsx,jsx,ts,js}',
  '**/default.{tsx,jsx,ts,js}',
  '**/route.{ts,js}',
  '**/_app.{tsx,jsx,ts,js}',
  '**/_document.{tsx,jsx,ts,js}',
  '**/_error.{tsx,jsx,ts,js}',
  '**/api/**',
];

export interface DiscoverModalOptions {
  /** Absolute path to the project root. */
  rootDir: string;
  /** Extra includes appended to the analyzer defaults. */
  include: string[];
  /** Extra excludes appended to the analyzer defaults. */
  exclude: string[];
  /** Pre-loaded `.gitignore` matcher, or `null`. */
  gitignore: Ignore | null;
}

/**
 * Walk the project and return all `.tsx`/`.jsx` files that could plausibly be
 * a React component (and therefore a modal). Output is POSIX, project-relative
 * and sorted lexicographically — same determinism rules as route discovery.
 */
export async function discoverModalCandidates(options: DiscoverModalOptions): Promise<string[]> {
  const { rootDir, include, exclude, gitignore } = options;
  const matches = await fg(['**/*.{tsx,jsx}', ...include], {
    cwd: rootDir,
    ignore: [...DEFAULT_EXCLUDES, ...NEXTJS_SPECIALS_AND_ROUTES, ...exclude],
    dot: false,
    onlyFiles: true,
    absolute: false,
    followSymbolicLinks: false,
    suppressErrors: true,
  });
  const normalized = matches.map(toPosix);
  const filtered = gitignore ? normalized.filter((p) => !gitignore.ignores(p)) : normalized;
  filtered.sort();
  return filtered;
}
