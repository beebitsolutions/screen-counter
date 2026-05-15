import path from 'node:path';
import type { ScoringThreshold, Signal } from '../../types.js';
import type { EscapeHatch } from './escape-hatches.js';

export type Classification =
  | { kind: 'modal' | 'forced' | 'disabled'; signals: Signal[] }
  | null;

export interface ClassifyContext {
  escapeHatch: EscapeHatch;
  componentName: string | null;
  filePath: string;
  signals: Signal[];
  excludeSuffixes: ReadonlyArray<string>;
  threshold: ScoringThreshold;
}

/**
 * Combine the gathered heuristic signals, escape hatch, and exclusion suffixes
 * into a final classification. Precedence (first match wins):
 *
 * 1. `data-screen-counter="disable"` ⇒ `disabled`.
 * 2. Name/file suffix in `excludeSuffixes` ⇒ not counted at all (returns `null`).
 *    This is intentional: a `LoginModalProvider` with `data-screen-counter="screen"`
 *    is still excluded — the suffix list is absolute.
 * 3. `data-screen-counter="screen"` ⇒ `forced`. Organic signals are kept in
 *    the output so `--verbose` can show *what else* matched.
 * 4. Heuristic scoring: `strongCount >= threshold.strong || weakCount >= threshold.weak`.
 */
export function classifyCandidate(ctx: ClassifyContext): Classification {
  if (ctx.escapeHatch === 'disable') {
    return {
      kind: 'disabled',
      signals: [{ kind: 'strong', rule: 'escape-hatch:disable' }],
    };
  }

  if (matchesExclusion(ctx.componentName, ctx.filePath, ctx.excludeSuffixes)) {
    return null;
  }

  if (ctx.escapeHatch === 'screen') {
    return {
      kind: 'forced',
      signals: [{ kind: 'strong', rule: 'escape-hatch:screen' }, ...ctx.signals],
    };
  }

  let strongCount = 0;
  let weakCount = 0;
  for (const sig of ctx.signals) {
    if (sig.kind === 'strong') strongCount++;
    else weakCount++;
  }
  if (strongCount >= ctx.threshold.strong || weakCount >= ctx.threshold.weak) {
    return { kind: 'modal', signals: ctx.signals };
  }
  return null;
}

function matchesExclusion(
  componentName: string | null,
  filePath: string,
  suffixes: ReadonlyArray<string>,
): boolean {
  const basename = path.posix.basename(filePath).replace(/\.[^.]+$/, '');
  for (const suffix of suffixes) {
    if (suffix.length === 0) continue;
    if (componentName && componentName.endsWith(suffix)) return true;
    if (basename.endsWith(suffix)) return true;
  }
  return false;
}
