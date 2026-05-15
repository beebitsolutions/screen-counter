import fs from 'node:fs/promises';
import path from 'node:path';
import { analyze } from '../analyzer/index.js';
import type { AnalysisResult } from '../types.js';
import { formatHuman } from './format/human.js';
import { formatJson } from './format/json.js';
import { formatVerbose } from './format/verbose.js';
import type { CliOptions } from './options.js';

/**
 * Run a single analysis pass and write the formatted report.
 *
 * Returns the raw `AnalysisResult` so callers (notably the watch loop) can
 * reuse the data without re-analysing — e.g. to render a timestamped delta.
 */
export async function runOnce(opts: CliOptions): Promise<AnalysisResult> {
  const result = await analyze(opts.rootDir, opts.config);
  const text = render(result, opts);
  if (opts.out) {
    await writeOutput(opts.out, text);
  } else {
    process.stdout.write(text);
  }
  return result;
}

export function render(result: AnalysisResult, opts: CliOptions): string {
  if (opts.json) return formatJson(result);
  if (opts.verbose) return formatVerbose(result, opts);
  return formatHuman(result, opts);
}

async function writeOutput(outPath: string, contents: string): Promise<void> {
  const abs = path.resolve(outPath);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, contents, 'utf8');
}
