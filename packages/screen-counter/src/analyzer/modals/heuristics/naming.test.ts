import { describe, expect, it } from 'vitest';
import { DEFAULT_NAME_SUFFIXES } from '../../../config/schema.js';
import { detectNameSuffix } from './naming.js';

const SUFFIXES = [...DEFAULT_NAME_SUFFIXES];

describe('naming heuristic — positive cases', () => {
  it('should detect Modal suffix on component name', () => {
    expect(detectNameSuffix('LoginModal', 'components/Login.tsx', SUFFIXES)).toEqual([
      { kind: 'weak', rule: 'name-suffix:Modal', detail: 'LoginModal' },
    ]);
  });

  it('should detect Dialog suffix on file basename when component name is null', () => {
    expect(detectNameSuffix(null, 'components/ConfirmDialog.tsx', SUFFIXES)).toEqual([
      { kind: 'weak', rule: 'name-suffix:Dialog', detail: 'ConfirmDialog' },
    ]);
  });

  it('should detect Drawer suffix on file basename', () => {
    expect(detectNameSuffix(null, 'components/NavDrawer.jsx', SUFFIXES)).toEqual([
      { kind: 'weak', rule: 'name-suffix:Drawer', detail: 'NavDrawer' },
    ]);
  });

  it('should detect Sheet suffix on component name', () => {
    expect(detectNameSuffix('FilterSheet', 'components/Filter.tsx', SUFFIXES)).toEqual([
      { kind: 'weak', rule: 'name-suffix:Sheet', detail: 'FilterSheet' },
    ]);
  });

  it('should detect Popup suffix on file basename', () => {
    expect(detectNameSuffix(null, 'components/CookiePopup.tsx', SUFFIXES)).toEqual([
      { kind: 'weak', rule: 'name-suffix:Popup', detail: 'CookiePopup' },
    ]);
  });

  it('should detect Overlay suffix on component name', () => {
    expect(detectNameSuffix('LoadingOverlay', 'components/Loader.tsx', SUFFIXES)).toEqual([
      { kind: 'weak', rule: 'name-suffix:Overlay', detail: 'LoadingOverlay' },
    ]);
  });

  it('should pick the first matching suffix from the configured list (order matters)', () => {
    // Custom order: 'Modal' precedes 'Dialog'. ModalDialog ends with Dialog,
    // but the function returns the first suffix that endsWith matches against
    // either componentName or basename. Modal does not endsWith here, so Dialog wins.
    expect(detectNameSuffix('ModalDialog', 'components/X.tsx', ['Modal', 'Dialog'])).toEqual([
      { kind: 'weak', rule: 'name-suffix:Dialog', detail: 'ModalDialog' },
    ]);
  });
});

describe('naming heuristic — negative cases', () => {
  it('should NOT detect signal when neither name nor basename ends in a configured suffix', () => {
    expect(detectNameSuffix('Button', 'components/Button.tsx', SUFFIXES)).toEqual([]);
  });

  it('should NOT detect signal when the suffix is mid-name (endsWith only)', () => {
    expect(detectNameSuffix('ModalAdjacent', 'components/ModalAdjacent.tsx', SUFFIXES)).toEqual([]);
  });

  it('should NOT detect signal when no suffixes are configured', () => {
    expect(detectNameSuffix('LoginModal', 'components/LoginModal.tsx', [])).toEqual([]);
  });

  it('should NOT crash and emit nothing for empty string suffixes (defensive)', () => {
    expect(detectNameSuffix('LoginModal', 'components/LoginModal.tsx', [''])).toEqual([]);
  });

  it('should NOT match case-insensitively (endsWith is case-sensitive)', () => {
    expect(detectNameSuffix('loginmodal', 'components/loginmodal.tsx', SUFFIXES)).toEqual([]);
  });
});
