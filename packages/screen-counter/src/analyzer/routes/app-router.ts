/**
 * Result of classifying a single App Router `page.*` file.
 *
 * Either the file maps to a countable route (with its canonical URL) or it
 * is skipped with a warning string the orchestrator can surface.
 */
export type AppRouterClassification =
  | { kind: 'route'; route: string }
  | { kind: 'skip'; warning: string };

/** Parallel routes use a leading `@` (for example `@modal`, `@sidebar`). */
const PARALLEL_SEGMENT = /^@/;
/** Intercepted routes wrap the marker in parentheses: `(.)`, `(..)`, `(...)`. */
const INTERCEPTED_SEGMENT = /^\(\.{1,3}\)/;
/** Route groups: `(group)` — anything in parens that is NOT an intercept marker. */
const ROUTE_GROUP_SEGMENT = /^\([^.][^)]*\)$/;

/**
 * Classify an App Router `page.*` file path into either a route + canonical
 * URL or a skip + warning.
 *
 * @param relativePath POSIX project-relative path (e.g. `app/users/[id]/page.tsx`).
 * @param rootPrefix   Detected App Router root, either `app` or `src/app`.
 */
export function classifyAppRouterFile(
  relativePath: string,
  rootPrefix: string,
): AppRouterClassification {
  const withoutRoot = relativePath.slice(rootPrefix.length + 1); // drop "app/" or "src/app/"
  const segments = withoutRoot.split('/');
  // Remove the trailing `page.{tsx,jsx,ts,js}` — the glob guarantees it.
  segments.pop();

  const urlSegments: string[] = [];
  for (const segment of segments) {
    if (PARALLEL_SEGMENT.test(segment)) {
      return {
        kind: 'skip',
        warning: `Parallel route skipped: ${relativePath} (not supported in v1)`,
      };
    }
    if (INTERCEPTED_SEGMENT.test(segment)) {
      return {
        kind: 'skip',
        warning: `Intercepted route skipped: ${relativePath} (not supported in v1)`,
      };
    }
    if (ROUTE_GROUP_SEGMENT.test(segment)) {
      // Route groups don't appear in the URL but the page still counts.
      continue;
    }
    urlSegments.push(segment);
  }

  const route = urlSegments.length === 0 ? '/' : `/${urlSegments.join('/')}`;
  return { kind: 'route', route };
}
