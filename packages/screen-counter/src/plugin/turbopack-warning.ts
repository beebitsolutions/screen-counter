import pc from 'picocolors';

let warned = false;

export function isTurbopack(): boolean {
  // Explicit CLI flags (Next 14/15 opt-in, still accepted in Next 16).
  if (process.argv.includes('--turbo')) return true;
  if (process.argv.includes('--turbopack')) return true;

  // Next.js itself sets `TURBOPACK` in worker processes when Turbopack is
  // active: `1` historically (with `--turbo` on Next 14/15), `auto` in Next 16
  // when Turbopack is the default. The plugin runs inside a Next worker
  // (NEXT_PRIVATE_WORKER=1), where argv is stripped — this env var is the
  // only reliable signal there.
  const env = process.env['TURBOPACK'];
  if (env && env !== '0' && env !== 'false') return true;

  return false;
}

export function warnTurbopackOnce(): void {
  if (warned) return;
  warned = true;
  const head = pc.yellow('[@beebit/screen-counter]');
  process.stderr.write(
    `${head} Turbopack detected. The plugin requires webpack and will be disabled.\n` +
      `  The screen badge will not appear in this run.\n` +
      `\n` +
      `  To use the plugin in Next.js 16, opt out of Turbopack:\n` +
      `    next dev --webpack\n` +
      `    next build --webpack\n` +
      `\n` +
      `  Real Turbopack support is planned for v2 (see screen-counter issue tracker).\n`,
  );
}

export function resetTurbopackWarningForTests(): void {
  warned = false;
}
