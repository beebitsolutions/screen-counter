import path from 'node:path';
import chokidar from 'chokidar';
import { makePalette } from './format/palette.js';
import { runOnce } from './run.js';
import type { CliOptions } from './options.js';

/** Debounce window for filesystem events. Matches the spec's 150 ms target. */
const DEBOUNCE_MS = 150;

/**
 * Long-running watch loop. Re-analyses on changes to `app/`, `pages/`,
 * `components/`, or the active config file, debounced to coalesce bursts.
 *
 * Resolves with exit code `0` on a clean SIGINT shutdown so the CLI can
 * propagate it to `process.exit`.
 */
export async function runWatch(opts: CliOptions): Promise<number> {
  const c = makePalette(opts.colorEnabled);
  await runOnceWithBanner(opts, c, 'initial');

  const watched = buildWatchTargets(opts);
  const watcher = chokidar.watch(watched, {
    ignored: (target) => /(^|[\\/])(node_modules|\.next|\.turbo|dist|coverage)([\\/]|$)/.test(target),
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 50, pollInterval: 25 },
  });

  let timer: ReturnType<typeof setTimeout> | null = null;
  const trigger = (): void => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      void runOnceWithBanner(opts, c, 'rebuild').catch((err: unknown) => {
        process.stderr.write(`${c.warn('!')} watch: ${errorMessage(err)}\n`);
      });
    }, DEBOUNCE_MS);
  };
  watcher.on('add', trigger).on('change', trigger).on('unlink', trigger);

  return new Promise<number>((resolve) => {
    const shutdown = (): void => {
      if (timer) clearTimeout(timer);
      void watcher.close().finally(() => {
        process.stderr.write(`\n${c.dim('watch: stopped')}\n`);
        resolve(0);
      });
    };
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  });
}

function buildWatchTargets(opts: CliOptions): string[] {
  const targets = ['app', 'src/app', 'pages', 'src/pages', 'components', 'src/components'].map(
    (rel) => path.join(opts.rootDir, rel),
  );
  if (opts.configPath) {
    targets.push(path.resolve(opts.configPath));
  }
  for (const name of ['screen-counter.config.mjs', 'screen-counter.config.cjs', 'screen-counter.config.js']) {
    targets.push(path.join(opts.rootDir, name));
  }
  return targets;
}

async function runOnceWithBanner(
  opts: CliOptions,
  c: ReturnType<typeof makePalette>,
  reason: 'initial' | 'rebuild',
): Promise<void> {
  const stamp = new Date().toISOString().replace('T', ' ').replace(/\..+$/, '');
  if (reason === 'rebuild') {
    process.stderr.write(`\n${c.cyan(`[${stamp}]`)} ${c.dim('change detected, re-analyzing…')}\n`);
  }
  await runOnce(opts);
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
