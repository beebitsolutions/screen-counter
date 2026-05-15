import type { AnalysisResult, ScreenInfo, Signal } from '../../types.js';
import type { CliOptions } from '../options.js';
import { formatHuman } from './human.js';
import { makePalette } from './palette.js';

/**
 * Verbose output: the regular human summary, plus a per-component dump of
 * the raw rule keys that fired. Rule keys are printed verbatim — see
 * `documentation/dev-notes/02-heuristicas-modales.md` for the stable list.
 */
export function formatVerbose(result: AnalysisResult, opts: CliOptions): string {
  const c = makePalette(opts.colorEnabled);
  const head = formatHuman(result, opts).replace(/\n$/, '');
  const sections: string[] = [head, ''];

  if (result.modals.length > 0) {
    sections.push(c.bold('modals:'));
    sections.push(...listEntries(result.modals, c));
    sections.push('');
  }

  if (result.disabled.length > 0) {
    sections.push(c.bold('disabled:'));
    sections.push(...listEntries(result.disabled, c));
    sections.push('');
  }

  return `${sections.join('\n').replace(/\n+$/, '')}\n`;
}

function listEntries(entries: ScreenInfo[], c: ReturnType<typeof makePalette>): string[] {
  const pad = entries.reduce((m, e) => Math.max(m, e.path.length), 0);
  return entries.map((entry) => {
    const path = entry.path.padEnd(pad, ' ');
    const tags = entry.signals.map(formatSignal).join(', ');
    return `  ${path}  ${c.dim(`[${tags}]`)}`;
  });
}

function formatSignal(s: Signal): string {
  const base = `${s.kind}:${s.rule}`;
  return s.detail ? `${base}:${s.detail}` : base;
}
