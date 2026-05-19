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
    // Custom order: 'Modal' precedes 'Dialog'. The last word of 'ModalDialog' is
    // 'dialog', so Modal does not match against either name or basename. Dialog
    // wins on the name lookup.
    expect(detectNameSuffix('ModalDialog', 'components/X.tsx', ['Modal', 'Dialog'])).toEqual([
      { kind: 'weak', rule: 'name-suffix:Dialog', detail: 'ModalDialog' },
    ]);
  });

  it('should detect kebab-case file names ending in -modal', () => {
    expect(detectNameSuffix(null, 'components/login-modal.tsx', SUFFIXES)).toEqual([
      { kind: 'weak', rule: 'name-suffix:Modal', detail: 'login-modal' },
    ]);
  });

  it('should detect snake_case file names ending in _dialog', () => {
    expect(detectNameSuffix(null, 'components/confirm_dialog.tsx', SUFFIXES)).toEqual([
      { kind: 'weak', rule: 'name-suffix:Dialog', detail: 'confirm_dialog' },
    ]);
  });

  it('should detect a single-word lowercase basename like dialog.tsx', () => {
    expect(detectNameSuffix(null, 'components/ui/dialog.tsx', SUFFIXES)).toEqual([
      { kind: 'weak', rule: 'name-suffix:Dialog', detail: 'dialog' },
    ]);
  });

  it('should use the canonical config-cased suffix in the rule key even for kebab inputs', () => {
    expect(detectNameSuffix(null, 'components/feature-flags-modal.tsx', SUFFIXES)).toEqual([
      { kind: 'weak', rule: 'name-suffix:Modal', detail: 'feature-flags-modal' },
    ]);
  });

  it('should detect on the component name when the file is unrelated (mixed kebab path)', () => {
    expect(
      detectNameSuffix('FeatureFlagsModal', 'components/feature-flags-modal.tsx', SUFFIXES),
    ).toEqual([{ kind: 'weak', rule: 'name-suffix:Modal', detail: 'FeatureFlagsModal' }]);
  });
});

describe('naming heuristic — negative cases', () => {
  it('should NOT detect signal when neither name nor basename ends in a configured suffix', () => {
    expect(detectNameSuffix('Button', 'components/Button.tsx', SUFFIXES)).toEqual([]);
  });

  it('should NOT detect signal when the suffix is mid-name (last-word match only)', () => {
    expect(detectNameSuffix('ModalAdjacent', 'components/ModalAdjacent.tsx', SUFFIXES)).toEqual(
      [],
    );
  });

  it('should NOT detect signal when no suffixes are configured', () => {
    expect(detectNameSuffix('LoginModal', 'components/LoginModal.tsx', [])).toEqual([]);
  });

  it('should NOT crash and emit nothing for empty string suffixes (defensive)', () => {
    expect(detectNameSuffix('LoginModal', 'components/LoginModal.tsx', [''])).toEqual([]);
  });

  it('should NOT match when the substring is mid-word like "modalize"', () => {
    // The last word is `modalize`, not a configured suffix — no signal.
    expect(detectNameSuffix(null, 'components/modalize.tsx', SUFFIXES)).toEqual([]);
  });

  it('should NOT detect kebab-case with non-modal last word like "login-modal-helper"', () => {
    expect(detectNameSuffix(null, 'components/login-modal-helper.tsx', SUFFIXES)).toEqual([]);
  });

  it('should NOT detect kebab-case when last word is a Provider (excluded suffix, dropped here too)', () => {
    // The naming heuristic itself does not know about excludeSuffixes — but
    // `provider` is simply not in the modal-suffix list, so it returns empty.
    // The scoring layer makes the exclusion behaviour explicit.
    expect(
      detectNameSuffix(null, 'components/login-modal-provider.tsx', SUFFIXES),
    ).toEqual([]);
  });

  it('should NOT detect when "modal" is embedded with no separator like "loginmodal.tsx"', () => {
    // With no kebab/snake/CamelCase boundary, the whole basename IS the last
    // word — `loginmodal` ≠ `modal`. Lower-case naming alone does not opt in.
    expect(detectNameSuffix(null, 'components/loginmodal.tsx', SUFFIXES)).toEqual([]);
  });
});
