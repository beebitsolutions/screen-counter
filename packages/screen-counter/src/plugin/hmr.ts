import path from 'node:path';
import chokidar, { type FSWatcher } from 'chokidar';

const DEBOUNCE_MS = 150;

export interface StartWatcherOptions {
  rootDir: string;
  onChange: () => void | Promise<void>;
}

interface Active {
  watcher: FSWatcher;
  refs: number;
  timer: ReturnType<typeof setTimeout> | null;
  beforeExit: () => void;
}

let active: Active | null = null;

function buildWatchTargets(rootDir: string): string[] {
  const targets = ['app', 'src/app', 'pages', 'src/pages', 'components', 'src/components'].map(
    (rel) => path.join(rootDir, rel),
  );
  for (const name of [
    'screen-counter.config.mjs',
    'screen-counter.config.cjs',
    'screen-counter.config.js',
  ]) {
    targets.push(path.join(rootDir, name));
  }
  return targets;
}

export function startWatcher(opts: StartWatcherOptions): { stop: () => Promise<void> } {
  if (active) {
    active.refs += 1;
    return { stop: () => decrementAndMaybeClose() };
  }

  const watcher = chokidar.watch(buildWatchTargets(opts.rootDir), {
    ignored: (target: string) =>
      /(^|[\\/])(node_modules|\.next|\.turbo|dist|coverage)([\\/]|$)/.test(target),
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 50, pollInterval: 25 },
  });

  const a: Active = {
    watcher,
    refs: 1,
    timer: null,
    beforeExit: () => {
      void closeWatcher();
    },
  };

  const trigger = (): void => {
    if (a.timer) clearTimeout(a.timer);
    a.timer = setTimeout(() => {
      a.timer = null;
      void Promise.resolve(opts.onChange()).catch((err: unknown) => {
        process.stderr.write(
          `[@beebit/screen-counter] watcher onChange failed: ${
            err instanceof Error ? err.message : String(err)
          }\n`,
        );
      });
    }, DEBOUNCE_MS);
  };

  watcher.on('add', trigger).on('change', trigger).on('unlink', trigger);
  process.once('beforeExit', a.beforeExit);

  active = a;
  return { stop: () => decrementAndMaybeClose() };
}

async function decrementAndMaybeClose(): Promise<void> {
  if (!active) return;
  active.refs -= 1;
  if (active.refs <= 0) {
    await closeWatcher();
  }
}

async function closeWatcher(): Promise<void> {
  if (!active) return;
  const a = active;
  active = null;
  if (a.timer) clearTimeout(a.timer);
  process.removeListener('beforeExit', a.beforeExit);
  try {
    await a.watcher.close();
  } catch {
    // ignore
  }
}
