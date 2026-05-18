import { describe, expect, it } from 'vitest';
import { parseSnippet } from '../__test-helpers__/snippets.js';
import { detectModalJsxAttrs } from './jsx-attrs.js';

function run(code: string, filePath = 'components/Snippet.tsx') {
  const { extracted } = parseSnippet(code, filePath);
  return detectModalJsxAttrs(extracted.jsxRoots);
}

describe('jsx-attrs heuristic — positive cases', () => {
  it('should detect role="dialog" on the JSX root', () => {
    const signals = run(`export default function X(){return <div role="dialog">x</div>;}`);
    expect(signals).toContainEqual({ kind: 'strong', rule: 'jsx-attr:role=dialog' });
  });

  it('should detect aria-modal="true" on the JSX root', () => {
    const signals = run(`export default function X(){return <section aria-modal="true">x</section>;}`);
    expect(signals).toContainEqual({ kind: 'strong', rule: 'jsx-attr:aria-modal=true' });
  });

  it('should detect both signals when both attributes are present', () => {
    const signals = run(
      `export default function X(){return <div role="dialog" aria-modal="true">x</div>;}`,
    );
    expect(signals).toEqual([
      { kind: 'strong', rule: 'jsx-attr:role=dialog' },
      { kind: 'strong', rule: 'jsx-attr:aria-modal=true' },
    ]);
  });

  it('should detect role="dialog" on either branch of a ternary return', () => {
    const signals = run(
      `export default function X({open}:{open:boolean}){return open ? <div role="dialog">x</div> : <span>hidden</span>;}`,
    );
    expect(signals).toContainEqual({ kind: 'strong', rule: 'jsx-attr:role=dialog' });
  });

  it('should detect aria-modal="true" on an arrow component returning JSX directly', () => {
    const signals = run(
      `import React from 'react';\nexport default () => <article aria-modal="true">x</article>;`,
    );
    expect(signals).toContainEqual({ kind: 'strong', rule: 'jsx-attr:aria-modal=true' });
  });

  it('should fire only once per signal even if multiple roots match', () => {
    const signals = run(
      `export default function X({open}:{open:boolean}){return open ? <div role="dialog">a</div> : <div role="dialog">b</div>;}`,
    );
    const roleSignals = signals.filter((s) => s.rule === 'jsx-attr:role=dialog');
    expect(roleSignals).toHaveLength(1);
  });
});

describe('jsx-attrs heuristic — negative cases', () => {
  it('should NOT detect role="dialog" when value differs', () => {
    expect(run(`export default function X(){return <div role="alert">x</div>;}`)).toEqual([]);
  });

  it('should NOT detect aria-modal="true" when value is non-true literal', () => {
    expect(run(`export default function X(){return <div aria-modal="false">x</div>;}`)).toEqual([]);
  });

  it('should NOT detect signal when component returns no JSX', () => {
    expect(run(`export default function X(){return null;}`)).toEqual([]);
  });

  it('should NOT detect signal when attribute uses an expression container (we do not evaluate)', () => {
    expect(
      run(
        `export default function X({role}:{role:string}){return <div role={role}>x</div>;}`,
      ),
    ).toEqual([]);
  });

  it('should NOT detect signal on JSX fragments (no opening element with attributes)', () => {
    expect(run(`export default function X(){return <><span>a</span></>;}`)).toEqual([]);
  });
});
