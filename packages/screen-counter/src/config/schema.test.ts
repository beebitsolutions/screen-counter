import { describe, expect, it } from 'vitest';
import {
  DEFAULT_EXCLUDE_SUFFIXES,
  DEFAULT_NAME_SUFFIXES,
  DEFAULT_SCORING_THRESHOLD,
  parseConfig,
} from './schema.js';

describe('parseConfig', () => {
  it('should fill defaults when called with undefined input', () => {
    const cfg = parseConfig(undefined);
    expect(cfg.pagesRouter).toBe(false);
    expect(cfg.include).toEqual([]);
    expect(cfg.exclude).toEqual([]);
    expect(cfg.nameSuffixes).toEqual([...DEFAULT_NAME_SUFFIXES]);
    expect(cfg.excludeSuffixes).toEqual([...DEFAULT_EXCLUDE_SUFFIXES]);
    expect(cfg.scoringThreshold).toEqual({ ...DEFAULT_SCORING_THRESHOLD });
  });

  it('should accept user overrides verbatim', () => {
    const cfg = parseConfig({
      pagesRouter: true,
      include: ['extra/**/*.tsx'],
      modalLibraries: ['./my-kit'],
      scoringThreshold: { strong: 2, weak: 3 },
    });
    expect(cfg.pagesRouter).toBe(true);
    expect(cfg.include).toEqual(['extra/**/*.tsx']);
    expect(cfg.modalLibraries).toEqual(['./my-kit']);
    expect(cfg.scoringThreshold).toEqual({ strong: 2, weak: 3 });
  });

  it('should reject unknown top-level keys (strict schema)', () => {
    expect(() => parseConfig({ unknownKey: true } as never)).toThrow(TypeError);
  });

  it('should reject scoringThreshold values below 1', () => {
    expect(() =>
      parseConfig({ scoringThreshold: { strong: 0, weak: 1 } } as never),
    ).toThrow(TypeError);
  });
});
