import type { Config } from '../types.js';

/**
 * Normalized CLI options shared by the runner, formatters and watch loop.
 *
 * `rootDir` is always an absolute path. `config` is an optional preloaded
 * `Config` object — when present, it is forwarded to `analyze()` and takes
 * precedence over any `screen-counter.config.*` discovered in `rootDir`.
 */
export interface CliOptions {
  rootDir: string;
  json: boolean;
  verbose: boolean;
  out?: string;
  configPath?: string;
  config?: Config;
  /** Resolved threshold for the human badge colour (green/amber/red). */
  budget: number;
  /** `true` when stdout is a TTY and `NO_COLOR` is not set. */
  colorEnabled: boolean;
}

/** Default screen budget used by the human formatter's colour cue. */
export const DEFAULT_BUDGET = 20;
