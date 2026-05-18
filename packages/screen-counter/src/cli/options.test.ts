import { describe, expect, it } from 'vitest';
import { DEFAULT_BUDGET } from './options.js';

describe('CLI options module', () => {
  it('should expose a sensible default budget for the human formatter colour cue', () => {
    expect(DEFAULT_BUDGET).toBe(20);
  });
});
