import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { AnalysisResult } from '../types.js';

interface MinimalCompilation {
  fileDependencies: { add(file: string): void };
}

interface MinimalCompiler {
  hooks: {
    compilation: {
      tap(name: string, cb: (compilation: MinimalCompilation) => void): void;
    };
  };
}

const PLUGIN_NAME = 'ScreenCounterVirtualModulePlugin';

const PLACEHOLDER: AnalysisResult = {
  count: 0,
  routes: [],
  modals: [],
  disabled: [],
};

export function getGeneratedFilePath(rootDir: string): string {
  return path.join(rootDir, 'node_modules', '.cache', 'screen-counter', 'runtime.mjs');
}

export function seedRuntimeFile(rootDir: string): string {
  const target = getGeneratedFilePath(rootDir);
  try {
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, renderModule(PLACEHOLDER), 'utf8');
  } catch {
    // Caller logs; we never throw from here.
  }
  return target;
}

export function writeRuntimeFile(filePath: string, result: AnalysisResult): void {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, renderModule(result), 'utf8');
}

function renderModule(result: AnalysisResult): string {
  const payload = JSON.stringify(result, null, 2);
  const generatedAt = new Date().toISOString();
  return [
    '// @beebit/screen-counter — generated runtime module. Do not edit.',
    `export const data = ${payload};`,
    `export const count = ${result.count};`,
    `export const generatedAt = ${JSON.stringify(generatedAt)};`,
    '',
  ].join('\n');
}

export class VirtualModulePlugin {
  constructor(private readonly generatedFilePath: string) {}

  apply(compiler: MinimalCompiler): void {
    const file = this.generatedFilePath;
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      try {
        compilation.fileDependencies.add(file);
      } catch {
        // Some webpack versions wrap fileDependencies behind a setter; ignore.
      }
    });
  }
}
