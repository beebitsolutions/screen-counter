/**
 * Classification of a screen detected by the analyzer.
 *
 * - `route` — a Next.js routable file (App Router `page.*` or Pages Router file).
 * - `modal` — a component flagged by the modal heuristic.
 * - `forced` — explicitly opted in via `data-screen-counter="screen"`.
 * - `disabled` — explicitly opted out via `data-screen-counter="disable"`.
 */
export type ScreenKind = 'route' | 'modal' | 'forced' | 'disabled';

/**
 * A single heuristic match that contributed to classifying a component.
 *
 * Stable rule keys (used by the CLI `--verbose` output and snapshot tests):
 * - `import:<source>` — modal-library import (e.g. `import:@radix-ui/react-dialog`).
 * - `path:shadcn-ui` — file path matches a shadcn UI dialog pattern.
 * - `jsx-attr:role=dialog`, `jsx-attr:aria-modal=true` — root JSX attributes.
 * - `name-suffix:<suffix>` — last word of the name or basename matches a known
 *   modal suffix (case- and casing-insensitive: PascalCase, kebab-case and
 *   snake_case all collapse to the same lookup).
 * - `react-dom:createPortal` — module imports and calls `createPortal`.
 * - `reexport:<source>` — re-export tracing: an import in this file resolves
 *   to a local modal primitive (a file that itself fired a strong
 *   `import:*` or `path:shadcn-ui` signal).
 * - `escape-hatch:screen`, `escape-hatch:disable` — explicit overrides.
 */
export interface Signal {
  kind: 'strong' | 'weak';
  rule: string;
  detail?: string;
}

/**
 * Information about a single detected screen.
 *
 * All paths are POSIX-normalized and relative to the project root, so results
 * can be snapshot-tested across machines.
 */
export interface ScreenInfo {
  /** Why this entry was emitted. */
  kind: ScreenKind;
  /** Project-relative POSIX path of the source file. Never absolute. */
  path: string;
  /**
   * Canonical URL for routes (for example `/users/[id]`).
   * Undefined for non-route entries.
   */
  route?: string;
  /**
   * Heuristic signals that triggered classification. Empty for plain routes.
   * Order is deterministic (imports → jsx-attrs → naming → portal).
   */
  signals: Signal[];
}

/**
 * Structured result of `analyze()`. Designed for snapshot testing:
 * fields are always present (except `warnings`, which is omitted when empty)
 * and arrays are sorted deterministically.
 */
export interface AnalysisResult {
  /** Total number of countable screens. Currently equals `routes.length`; modals join in prompt 03. */
  count: number;
  /** Routes discovered in App Router and (optionally) Pages Router. Sorted alphabetically by `path`. */
  routes: ScreenInfo[];
  /** Modal components. Populated in prompt 03. */
  modals: ScreenInfo[];
  /** Components explicitly disabled via `data-screen-counter="disable"`. Populated in prompt 03. */
  disabled: ScreenInfo[];
  /**
   * Non-fatal notes from the analyzer (for example: parallel routes skipped).
   * Only present when at least one warning was emitted.
   */
  warnings?: string[];
}

/**
 * Thresholds for the modal scoring formula:
 * a component is a modal when it triggers at least `strong` strong signals
 * OR at least `weak` weak signals.
 */
export interface ScoringThreshold {
  strong: number;
  weak: number;
}

/**
 * User-facing configuration for `analyze()`. All fields are optional.
 */
export interface Config {
  /**
   * Enable discovery of Pages Router files (`pages/**\/*.{tsx,jsx,ts,js}`
   * or `src/pages/**\/*.{tsx,jsx,ts,js}`). Defaults to `false`.
   *
   * When enabled, the analyzer counts each file as one screen and skips
   * `_app`, `_document`, `_error` at the Pages Router root, plus anything
   * under `api/`. Dynamic, catch-all and optional catch-all segments pass
   * through verbatim. Collisions with App Router routes (same canonical URL)
   * surface as warnings; both entries remain in the report.
   */
  pagesRouter?: boolean;
  /** Extra include globs appended to the analyzer defaults. */
  include?: string[];
  /** Extra exclude globs appended to the analyzer defaults. */
  exclude?: string[];
  /**
   * Additional module sources that should count as a strong modal-library
   * signal. Appended to the built-in list (`@radix-ui/react-dialog`, etc.).
   */
  modalLibraries?: string[];
  /**
   * Suffixes that act as a weak signal when they match the component name or
   * file basename. **Overrides** the default list when provided. Default:
   * `['Modal', 'Dialog', 'Drawer', 'Sheet', 'Popup', 'Lightbox', 'Overlay']`.
   */
  nameSuffixes?: string[];
  /**
   * Suffixes that hard-exclude a component from modal counting, regardless of
   * heuristic score or escape hatches. **Overrides** the default list when
   * provided. Default: `['Provider', 'Context', 'Wrapper']`.
   */
  excludeSuffixes?: string[];
  /**
   * Scoring threshold. Defaults to `{ strong: 1, weak: 2 }` — the rule
   * documented in the spec.
   */
  scoringThreshold?: ScoringThreshold;
}
