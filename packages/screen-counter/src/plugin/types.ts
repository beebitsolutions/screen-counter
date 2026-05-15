import type { Config } from '../types.js';

export type BadgePosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

export interface BadgeOptions {
  position?: BadgePosition;
}

export interface WithScreenCounterOptions {
  analyzer?: Config;
  autoInject?: boolean;
  badge?: BadgeOptions;
  pagesRouter?: boolean;
  verbose?: boolean;
}

export type NextConfigLike = Record<string, unknown>;

export type NextConfigFn = (
  phase: string,
  ctx: { defaultConfig: NextConfigLike },
) => NextConfigLike | Promise<NextConfigLike>;

export type NextConfigInput = NextConfigLike | NextConfigFn;

export type WithScreenCounter = (
  opts?: WithScreenCounterOptions,
) => (nextConfig?: NextConfigInput) => NextConfigInput;
