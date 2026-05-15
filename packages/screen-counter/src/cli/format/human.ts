import type { AnalysisResult } from '../../types.js';
import type { CliOptions } from '../options.js';
import { makePalette } from './palette.js';
import { summarizeBuckets } from './groups.js';

/**
 * Default human-readable report. Two-column-ish layout with a coloured
 * total line whose hue depends on how close the count is to `opts.budget`.
 */
export function formatHuman(result: AnalysisResult, opts: CliOptions): string {
  const c = makePalette(opts.colorEnabled);
  const lines: string[] = [];

  lines.push(c.dim(`@beebit/screen-counter — analyzing ${opts.rootDir}`));
  lines.push('');
  lines.push(`${c.check('✓')} ${plural(result.routes.length, 'route', 'routes')}`);

  const modalLine = `${c.check('✓')} ${plural(result.modals.length, 'modal', 'modals')}`;
  const buckets = summarizeBuckets(result.modals);
  if (buckets.length > 0) {
    const inner = buckets.map(([name, n]) => `${name}: ${n}`).join(', ');
    lines.push(`${modalLine} ${c.dim(`(${inner})`)}`);
  } else {
    lines.push(modalLine);
  }

  if (result.disabled.length > 0) {
    lines.push(
      `${c.check('✓')} ${plural(result.disabled.length, 'component', 'components')} excluded manually`,
    );
  }

  lines.push(c.dim('─────────────────'));
  lines.push(`  ${budgetColor(c, result.count, opts.budget)(`${result.count} screens total`)}`);

  if (result.warnings && result.warnings.length > 0) {
    lines.push('');
    lines.push(c.warn('warnings:'));
    for (const w of result.warnings) {
      lines.push(`  ${c.warn('!')} ${w}`);
    }
  }
  lines.push('');
  return lines.join('\n');
}

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

function budgetColor(
  c: ReturnType<typeof makePalette>,
  count: number,
  budget: number,
): (s: string) => string {
  if (count > budget) return c.red;
  if (count >= Math.ceil(budget * 0.8)) return c.amber;
  return c.green;
}
