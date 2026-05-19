import { describe, expect, it } from 'vitest';
import { lastWord } from './name-utils.js';

describe('lastWord()', () => {
  it('returns the lowercased basename for a single-word PascalCase identifier', () => {
    expect(lastWord('Modal')).toBe('modal');
  });

  it('extracts the trailing PascalCase segment', () => {
    expect(lastWord('LoginModal')).toBe('modal');
  });

  it('extracts the trailing kebab-case segment', () => {
    expect(lastWord('login-modal')).toBe('modal');
  });

  it('extracts the trailing snake_case segment', () => {
    expect(lastWord('login_modal')).toBe('modal');
  });

  it('extracts the last word from a mixed kebab + PascalCase basename', () => {
    expect(lastWord('login-LoginModal')).toBe('modal');
  });

  it('strips a .tsx extension before splitting', () => {
    expect(lastWord('login-modal.tsx')).toBe('modal');
  });

  it('strips a .ts/.jsx/.js extension before splitting', () => {
    expect(lastWord('Dialog.ts')).toBe('dialog');
    expect(lastWord('drawer.jsx')).toBe('drawer');
    expect(lastWord('sheet.js')).toBe('sheet');
  });

  it('treats a non-suffix word like "modalize" as one whole token', () => {
    expect(lastWord('modalize')).toBe('modalize');
    expect(lastWord('modalize-image')).toBe('image');
  });

  it('lowercases a single uppercase letter', () => {
    expect(lastWord('A')).toBe('a');
  });

  it('returns an empty string for empty input', () => {
    expect(lastWord('')).toBe('');
  });

  it('handles trailing separators by returning the empty segment', () => {
    expect(lastWord('login-modal-')).toBe('');
  });

  it('splits CamelCase boundaries inside a single segment', () => {
    expect(lastWord('LoginModalProvider')).toBe('provider');
  });

  it('extracts provider from kebab-case "onboarding-modal-provider"', () => {
    expect(lastWord('onboarding-modal-provider')).toBe('provider');
  });

  it('extracts context from snake_case "auth_modal_context"', () => {
    expect(lastWord('auth_modal_context')).toBe('context');
  });
});
