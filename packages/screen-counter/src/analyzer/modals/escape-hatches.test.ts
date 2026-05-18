import { describe, expect, it } from 'vitest';
import { parseSnippet } from './__test-helpers__/snippets.js';
import { readEscapeHatch } from './escape-hatches.js';

function read(code: string) {
  const { extracted } = parseSnippet(code);
  return readEscapeHatch(extracted.jsxRoots);
}

describe('readEscapeHatch — positive cases', () => {
  it('should read data-screen-counter="screen" on the JSX root', () => {
    expect(read(`export default () => <div data-screen-counter="screen">x</div>;`)).toBe('screen');
  });

  it('should read data-screen-counter="disable" on the JSX root', () => {
    expect(read(`export default () => <div data-screen-counter="disable">x</div>;`)).toBe(
      'disable',
    );
  });

  it('should prefer disable over screen when both appear in ternary branches', () => {
    const code = `
      export default function X({open}){
        return open
          ? <div data-screen-counter="screen">a</div>
          : <div data-screen-counter="disable">b</div>;
      }
    `;
    expect(read(code)).toBe('disable');
  });
});

describe('readEscapeHatch — negative cases', () => {
  it('should return null when no data-screen-counter attribute exists', () => {
    expect(read(`export default () => <div>x</div>;`)).toBeNull();
  });

  it('should return null when the attribute has an unrecognised value', () => {
    expect(read(`export default () => <div data-screen-counter="maybe">x</div>;`)).toBeNull();
  });

  it('should ignore expression-container values (we never evaluate expressions)', () => {
    const code = `
      const which = 'disable' as const;
      export default () => <div data-screen-counter={which}>x</div>;
    `;
    expect(read(code)).toBeNull();
  });

  it('should return null when the JSX root is a Fragment (no attributes)', () => {
    expect(read(`export default () => <><span>x</span></>;`)).toBeNull();
  });
});
