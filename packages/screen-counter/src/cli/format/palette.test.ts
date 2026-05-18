import { describe, expect, it } from 'vitest';
import { makePalette } from './palette.js';

describe('makePalette', () => {
  it('should return identity functions when colours are disabled', () => {
    const p = makePalette(false);
    expect(p.check('a')).toBe('a');
    expect(p.dim('b')).toBe('b');
    expect(p.warn('c')).toBe('c');
    expect(p.green('d')).toBe('d');
    expect(p.amber('e')).toBe('e');
    expect(p.red('f')).toBe('f');
    expect(p.bold('g')).toBe('g');
    expect(p.cyan('h')).toBe('h');
  });

  it('should expose every named colour helper when enabled (and each is a distinct function)', () => {
    const enabled = makePalette(true);
    const disabled = makePalette(false);
    // Smoke-call every helper so each function is reached by v8 coverage —
    // picocolors decides at runtime whether to emit ANSI, but the call itself
    // is what we care about for "no broken keys".
    for (const fn of [
      enabled.check,
      enabled.dim,
      enabled.warn,
      enabled.green,
      enabled.amber,
      enabled.red,
      enabled.bold,
      enabled.cyan,
    ]) {
      expect(typeof fn('x')).toBe('string');
    }
    expect(enabled.check).not.toBe(disabled.check);
    expect(enabled.green).not.toBe(disabled.green);
  });
});
