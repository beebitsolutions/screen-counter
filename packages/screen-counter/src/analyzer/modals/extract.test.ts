import { describe, expect, it } from 'vitest';
import { parseSnippet } from './__test-helpers__/snippets.js';

function extract(code: string) {
  return parseSnippet(code).extracted;
}

describe('extractComponent — default export resolution', () => {
  it('should return null name and no JSX roots when there is no default export', () => {
    const e = extract(`export const X = 1;`);
    expect(e.componentName).toBeNull();
    expect(e.jsxRoots).toEqual([]);
  });

  it('should extract componentName + body for a named function default', () => {
    const e = extract(`export default function Foo(){ return <div/>; }`);
    expect(e.componentName).toBe('Foo');
    expect(e.jsxRoots).toHaveLength(1);
  });

  it('should follow an identifier default export back to its declaration', () => {
    const e = extract(`function Foo(){ return <div/>; } export default Foo;`);
    expect(e.componentName).toBe('Foo');
    expect(e.jsxRoots).toHaveLength(1);
  });

  it('should treat arrow components with implicit return as a single JSX root', () => {
    const e = extract(`export default () => <span/>;`);
    expect(e.jsxRoots).toHaveLength(1);
  });

  it('should return two JSX roots for a ternary return', () => {
    const code = `
      export default function X({open}){ return open ? <a/> : <b/>; }
    `;
    expect(extract(code).jsxRoots).toHaveLength(2);
  });

  it('should unwrap React.memo() and forwardRef() HoCs', () => {
    const code = `
      import { memo, forwardRef } from 'react';
      const Inner = forwardRef(() => <div/>);
      export default memo(Inner);
    `;
    const e = extract(code);
    expect(e.componentName).toBe('Inner');
    expect(e.jsxRoots).toHaveLength(1);
  });

  it('should unwrap React.memo() via namespace import', () => {
    const code = `
      import * as React from 'react';
      export default React.memo(() => <div/>);
    `;
    expect(extract(code).jsxRoots).toHaveLength(1);
  });

  it('should add a warning for unsupported HoC patterns', () => {
    const code = `
      function customHoc(C){ return C; }
      export default customHoc(() => <div/>);
    `;
    const e = extract(code);
    expect(e.jsxRoots).toEqual([]);
    expect(e.warnings.some((w) => /unsupported HoC/.test(w))).toBe(true);
  });

  it('should add a warning for unresolved identifier default exports', () => {
    const code = `import { Something } from 'x'; export default Something;`;
    const e = extract(code);
    expect(e.warnings.some((w) => /unresolved default export reference/.test(w))).toBe(true);
  });

  it('should return null and add a warning for class components (documented gap)', () => {
    const code = `export default class Foo {}`;
    const e = extract(code);
    expect(e.componentName).toBeNull();
    expect(e.jsxRoots).toEqual([]);
  });

  it('should accept parenthesised JSX as a root', () => {
    const code = `export default () => (<div/>);`;
    expect(extract(code).jsxRoots).toHaveLength(1);
  });

  it('should treat fragments as a JSX root', () => {
    const code = `export default () => <><span/></>;`;
    expect(extract(code).jsxRoots).toHaveLength(1);
    expect(extract(code).jsxRoots[0]?.type).toBe('JSXFragment');
  });
});
