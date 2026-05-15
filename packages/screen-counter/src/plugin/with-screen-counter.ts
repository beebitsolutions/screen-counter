import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pc from 'picocolors';
import { analyze } from '../analyzer/index.js';
import {
  VirtualModulePlugin,
  seedRuntimeFile,
  writeRuntimeFile,
} from './virtual-module.js';
import { startWatcher } from './hmr.js';
import { isTurbopack, warnTurbopackOnce } from './turbopack-warning.js';
import type {
  BadgeOptions,
  NextConfigFn,
  NextConfigInput,
  NextConfigLike,
  WithScreenCounter,
  WithScreenCounterOptions,
} from './types.js';

const LAYOUT_TEST = /[\\/]app[\\/]layout\.(tsx|jsx|ts|js)$/;
const RUNTIME_ALIAS_KEY = '@beebit/screen-counter/runtime$';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LOADER_PATH = path.join(HERE, 'plugin', 'inject-loader.cjs');

interface WebpackCtx {
  dev?: boolean;
  isServer?: boolean;
  buildId?: string;
  defaultLoaders?: unknown;
  webpack?: unknown;
}

type AnyConfig = Record<string, unknown>;

function logPrefix(): string {
  return pc.cyan('[@beebit/screen-counter]');
}

function logError(err: unknown): void {
  process.stderr.write(`${logPrefix()} ${pc.red(err instanceof Error ? err.message : String(err))}\n`);
}

function logInfo(msg: string, verbose: boolean): void {
  if (!verbose) return;
  process.stderr.write(`${logPrefix()} ${msg}\n`);
}

function logWarn(msg: string): void {
  process.stderr.write(`${logPrefix()} ${pc.yellow(msg)}\n`);
}

function addAlias(config: AnyConfig, generated: string): void {
  const resolve = (config['resolve'] as AnyConfig | undefined) ?? {};
  const alias = (resolve['alias'] as Record<string, string | string[]> | undefined) ?? {};
  resolve['alias'] = { ...alias, [RUNTIME_ALIAS_KEY]: generated };
  config['resolve'] = resolve;
}

function addLoaderRule(
  config: AnyConfig,
  rootDir: string,
  badge: BadgeOptions | undefined,
): void {
  const moduleField = (config['module'] as AnyConfig | undefined) ?? {};
  const rules = (moduleField['rules'] as unknown[] | undefined) ?? [];
  const rule = {
    test: LAYOUT_TEST,
    use: [
      {
        loader: LOADER_PATH,
        options: badge ? { rootDir, badge } : { rootDir },
      },
    ],
  };
  moduleField['rules'] = [...rules, rule];
  config['module'] = moduleField;
}

function installVirtualModulePlugin(config: AnyConfig, generated: string): void {
  const plugins = (config['plugins'] as unknown[] | undefined) ?? [];
  config['plugins'] = [...plugins, new VirtualModulePlugin(generated)];
}

function isWebpackHookFn(value: unknown): value is (cfg: AnyConfig, ctx: WebpackCtx) => unknown {
  return typeof value === 'function';
}

function transform(opts: WithScreenCounterOptions, cfg: NextConfigLike): NextConfigLike {
  const rootDir = process.cwd();
  const generated = seedRuntimeFile(rootDir);

  if (opts.pagesRouter) {
    logWarn('pagesRouter option is not yet implemented; ignoring.');
  }

  const userWebpack = cfg['webpack'];
  const autoInject = opts.autoInject !== false;

  const wrappedWebpack = async (config: AnyConfig, ctx: WebpackCtx): Promise<AnyConfig> => {
    let out: AnyConfig = config;
    if (isWebpackHookFn(userWebpack)) {
      const r = await Promise.resolve(userWebpack(config, ctx) as unknown);
      out = (r as AnyConfig | undefined) ?? config;
    }

    try {
      addAlias(out, generated);
      if (autoInject) addLoaderRule(out, rootDir, opts.badge);
      installVirtualModulePlugin(out, generated);
    } catch (err) {
      logError(err);
    }

    if (ctx.dev && ctx.isServer === false) {
      try {
        startWatcher({
          rootDir,
          onChange: async () => {
            try {
              const result = await analyze(rootDir, opts.analyzer);
              writeRuntimeFile(generated, result);
              logInfo(`runtime updated (count=${result.count})`, opts.verbose === true);
            } catch (err) {
              logError(err);
            }
          },
        });
      } catch (err) {
        logError(err);
      }
    }

    void analyze(rootDir, opts.analyzer)
      .then((result) => {
        writeRuntimeFile(generated, result);
        logInfo(`runtime seeded (count=${result.count})`, opts.verbose === true);
      })
      .catch((err: unknown) => logError(err));

    return out;
  };

  return { ...cfg, webpack: wrappedWebpack };
}

export const withScreenCounter: WithScreenCounter = (opts = {}) => {
  return (nextConfig: NextConfigInput = {}) => {
    if (isTurbopack()) {
      warnTurbopackOnce();
      return nextConfig;
    }

    if (typeof nextConfig === 'function') {
      const fn = nextConfig as NextConfigFn;
      const wrapped: NextConfigFn = (phase, ctx) => {
        const inner = fn(phase, ctx);
        if (inner && typeof (inner as Promise<NextConfigLike>).then === 'function') {
          return (inner as Promise<NextConfigLike>).then((resolved) => transform(opts, resolved));
        }
        return transform(opts, inner as NextConfigLike);
      };
      return wrapped;
    }

    return transform(opts, nextConfig as NextConfigLike);
  };
};
