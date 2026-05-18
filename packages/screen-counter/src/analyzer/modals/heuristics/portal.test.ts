import { describe, expect, it } from 'vitest';
import { parseSnippet } from '../__test-helpers__/snippets.js';
import { detectCreatePortalUse } from './portal.js';

function run(code: string) {
  const { ast, imports } = parseSnippet(code);
  return detectCreatePortalUse(ast, imports);
}

describe('portal heuristic — positive cases', () => {
  it('should detect createPortal imported and called by its original name', () => {
    const code = `
      import { createPortal } from 'react-dom';
      export default function X(){ return createPortal(<div/>, document.body); }
    `;
    expect(run(code)).toEqual([{ kind: 'weak', rule: 'react-dom:createPortal' }]);
  });

  it('should detect createPortal called through a local alias', () => {
    const code = `
      import { createPortal as portal } from 'react-dom';
      export default function X(){ return portal(<div/>, document.body); }
    `;
    expect(run(code)).toEqual([{ kind: 'weak', rule: 'react-dom:createPortal' }]);
  });

  it('should detect createPortal even when called inside a helper function', () => {
    const code = `
      import { createPortal } from 'react-dom';
      function mount(node){ return createPortal(node, document.body); }
      export default function X(){ return mount(<div/>); }
    `;
    expect(run(code)).toEqual([{ kind: 'weak', rule: 'react-dom:createPortal' }]);
  });

  it('should detect createPortal mixed with other react-dom imports', () => {
    const code = `
      import { render, createPortal } from 'react-dom';
      export default function X(){ render(<div/>, document.body); return createPortal(<span/>, document.body); }
    `;
    expect(run(code)).toEqual([{ kind: 'weak', rule: 'react-dom:createPortal' }]);
  });

  it('should detect createPortal inside conditional return branches', () => {
    const code = `
      import { createPortal } from 'react-dom';
      export default function X({open}){ return open ? createPortal(<div/>, document.body) : null; }
    `;
    expect(run(code)).toEqual([{ kind: 'weak', rule: 'react-dom:createPortal' }]);
  });

  it('should emit exactly one signal even when createPortal is called multiple times', () => {
    const code = `
      import { createPortal } from 'react-dom';
      export default function X(){
        const a = createPortal(<div/>, document.body);
        const b = createPortal(<span/>, document.body);
        return [a, b];
      }
    `;
    expect(run(code)).toHaveLength(1);
  });
});

describe('portal heuristic — negative cases', () => {
  it('should NOT detect signal when createPortal is imported but never called', () => {
    const code = `
      import { createPortal } from 'react-dom';
      export default function X(){ return null; }
    `;
    expect(run(code)).toEqual([]);
  });

  it('should NOT detect signal when createPortal is not imported', () => {
    const code = `
      function createPortal(){ return null; }
      export default function X(){ return createPortal(); }
    `;
    expect(run(code)).toEqual([]);
  });

  it('should NOT detect signal for createPortal from a non-react-dom source', () => {
    const code = `
      import { createPortal } from 'some-other-lib';
      export default function X(){ return createPortal(<div/>, document.body); }
    `;
    expect(run(code)).toEqual([]);
  });

  it('should NOT detect signal for a namespace import (documented gap)', () => {
    const code = `
      import * as ReactDOM from 'react-dom';
      export default function X(){ return ReactDOM.createPortal(<div/>, document.body); }
    `;
    expect(run(code)).toEqual([]);
  });
});
