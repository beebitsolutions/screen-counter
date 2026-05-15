import type { ScreenInfo } from '../../types.js';

export interface PagesRouterResult {
  routes: ScreenInfo[];
  warnings: string[];
}

/**
 * Pages Router discovery is a v0.x stub. The flag `config.pagesRouter` is
 * already wired through the public API and the analyzer orchestrator, but
 * the actual classification is gated on the open decision documented in
 * `documentation/preguntas-screen-counter.md §3`.
 *
 * This function exists so the call site is real today: the day the decision
 * lands, only this file needs to grow.
 *
 * @param _rootDir    Absolute project root.
 * @param _pagesRoot  Detected `pages` directory (relative POSIX path).
 */
export async function discoverPagesRouterRoutes(
  _rootDir: string,
  _pagesRoot: string,
): Promise<PagesRouterResult> {
  return { routes: [], warnings: [] };
}
