import { describe, expect, it } from 'vitest';
import type { AnalysisResult } from '../../types.js';
import { VERSION } from '../../version.js';
import { formatJson } from './json.js';

const empty: AnalysisResult = { count: 0, routes: [], modals: [], disabled: [] };

describe('formatJson', () => {
  it('should serialize with version, count, routes, modals, disabled, warnings', () => {
    const text = formatJson(empty);
    expect(text.endsWith('\n')).toBe(true);
    const parsed = JSON.parse(text) as Record<string, unknown>;
    expect(parsed).toEqual({
      version: VERSION,
      count: 0,
      routes: [],
      modals: [],
      disabled: [],
      warnings: [],
    });
  });

  it('should default warnings to an empty array when missing', () => {
    const text = formatJson(empty);
    expect(JSON.parse(text).warnings).toEqual([]);
  });

  it('should pass warnings through when present', () => {
    const result: AnalysisResult = { ...empty, warnings: ['skipped: app/@modal'] };
    expect(JSON.parse(formatJson(result)).warnings).toEqual(['skipped: app/@modal']);
  });

  it('should be deterministic — same input twice yields the exact same bytes', () => {
    expect(formatJson(empty)).toBe(formatJson(empty));
  });
});
