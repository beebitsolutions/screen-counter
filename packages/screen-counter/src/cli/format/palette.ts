import pc from 'picocolors';

export interface Palette {
  check: (s: string) => string;
  dim: (s: string) => string;
  warn: (s: string) => string;
  green: (s: string) => string;
  amber: (s: string) => string;
  red: (s: string) => string;
  bold: (s: string) => string;
  cyan: (s: string) => string;
}

/**
 * Build a palette that no-ops when colours are disabled (piped output, CI,
 * `NO_COLOR=1`). All formatters route through this so we never have to gate
 * colour decisions inline.
 */
export function makePalette(enabled: boolean): Palette {
  const id = (s: string): string => s;
  if (!enabled) {
    return {
      check: id,
      dim: id,
      warn: id,
      green: id,
      amber: id,
      red: id,
      bold: id,
      cyan: id,
    };
  }
  return {
    check: (s) => pc.green(s),
    dim: (s) => pc.dim(s),
    warn: (s) => pc.yellow(s),
    green: (s) => pc.green(pc.bold(s)),
    amber: (s) => pc.yellow(pc.bold(s)),
    red: (s) => pc.red(pc.bold(s)),
    bold: (s) => pc.bold(s),
    cyan: (s) => pc.cyan(s),
  };
}
