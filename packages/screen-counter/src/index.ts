/**
 * Public entry point for `@beebit/screen-counter`.
 *
 * Anything exported here is part of the package's public API and is
 * semver-relevant. See `documentation/SEMVER.md` for the policy.
 */
export { VERSION } from './version.js';
export { analyze } from './analyzer/index.js';
export { ScreenCounterBadge } from '@beebit/screen-counter/badge';
export type { ScreenCounterBadgeProps } from '@beebit/screen-counter/badge';
export type {
  AnalysisResult,
  Config,
  ScoringThreshold,
  ScreenInfo,
  ScreenKind,
  Signal,
} from './types.js';
