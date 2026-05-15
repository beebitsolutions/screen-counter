/**
 * Public entry point for `@beebit/screen-counter`.
 *
 * Anything exported here is part of the package's public API and is
 * semver-relevant. See `documentation/SEMVER.md` for the policy.
 */
export const VERSION = '0.0.0';

export { analyze } from './analyzer/index.js';
export type {
  AnalysisResult,
  Config,
  ScoringThreshold,
  ScreenInfo,
  ScreenKind,
  Signal,
} from './types.js';
