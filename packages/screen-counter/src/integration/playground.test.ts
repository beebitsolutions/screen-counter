import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { analyze } from '../analyzer/index.js';
import type { AnalysisResult, ScreenInfo, Signal } from '../types.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PLAYGROUND = path.resolve(HERE, '..', '..', '..', '..', 'apps', 'playground');
const SNAPSHOT = path.resolve(PLAYGROUND, '__snapshots__', 'analysis.json');

const EXPECTED_COUNT = 25;

function sortSignals(signals: readonly Signal[]): Signal[] {
  return [...signals].sort((a, b) => {
    if (a.kind !== b.kind) return a.kind.localeCompare(b.kind);
    if (a.rule !== b.rule) return a.rule.localeCompare(b.rule);
    return (a.detail ?? '').localeCompare(b.detail ?? '');
  });
}

function isSortedByPath(list: readonly ScreenInfo[]): boolean {
  // Match the analyzer's deterministic code-point comparison (analyzer/index.ts:byPath).
  // localeCompare would case-fold ('W' > 'u') and disagree with the analyzer's '<' on
  // mixed-case paths like 'components/WelcomeTourModal.tsx' vs 'components/ui/dialog.tsx'.
  for (let i = 1; i < list.length; i++) {
    const prev = list[i - 1]!.path;
    const curr = list[i]!.path;
    if (prev > curr) return false;
  }
  return true;
}

function normalize(result: AnalysisResult): Record<string, unknown> {
  const normalizeList = (list: readonly ScreenInfo[]): ScreenInfo[] =>
    list.map((s) => ({ ...s, signals: sortSignals(s.signals) }));
  const out: Record<string, unknown> = {
    count: result.count,
    routes: normalizeList(result.routes),
    modals: normalizeList(result.modals),
    disabled: normalizeList(result.disabled),
  };
  if (result.warnings && result.warnings.length > 0) {
    out['warnings'] = [...result.warnings].sort();
  }
  return out;
}

describe('analyze() against apps/playground (integration snapshot)', () => {
  it('should produce the documented count of 25 screens', async () => {
    const result = await analyze(PLAYGROUND);
    expect(result.count).toBe(EXPECTED_COUNT);
  });

  it('should return routes/modals/disabled already sorted by path', async () => {
    const result = await analyze(PLAYGROUND);
    expect(isSortedByPath(result.routes)).toBe(true);
    expect(isSortedByPath(result.modals)).toBe(true);
    expect(isSortedByPath(result.disabled)).toBe(true);
  });

  it('should match the committed snapshot byte-for-byte', async () => {
    const result = await analyze(PLAYGROUND);
    const serialized = JSON.stringify(normalize(result), null, 2) + '\n';
    await expect(serialized).toMatchFileSnapshot(SNAPSHOT);
  });
});
