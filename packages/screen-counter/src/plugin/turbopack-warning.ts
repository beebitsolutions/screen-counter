import pc from 'picocolors';

let warned = false;

export function isTurbopack(): boolean {
  return (
    process.argv.includes('--turbo') ||
    process.argv.includes('--turbopack') ||
    process.env['TURBOPACK'] === '1'
  );
}

export function warnTurbopackOnce(): void {
  if (warned) return;
  warned = true;
  const head = pc.yellow('[@beebit/screen-counter]');
  process.stderr.write(
    `${head} Turbopack detected. The plugin requires webpack and will be disabled.\n` +
      `  The screen badge will not appear in dev.\n` +
      `  Run \`next dev\` without --turbo to use the plugin, or wait for v2 support.\n`,
  );
}

export function resetTurbopackWarningForTests(): void {
  warned = false;
}
