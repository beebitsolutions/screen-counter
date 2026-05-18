import { describe, expect, it } from 'vitest';
import {
  clearParseCache,
  findDefaultExport,
  getImports,
  parseTsx,
  resolveSameFileIdentifier,
  walkAst,
} from './parse.js';

describe('parseTsx', () => {
  it('should produce a Module AST with body for a trivial snippet', () => {
    const { ast } = parseTsx('a.tsx', `export const x = 1;`);
    expect(ast.type).toBe('Module');
    expect(Array.isArray(ast.body)).toBe(true);
  });

  it('should reuse a cached AST when the contents hash is identical', () => {
    clearParseCache();
    const a = parseTsx('a.tsx', `export const x = 1;`);
    const b = parseTsx('a.tsx', `export const x = 1;`);
    expect(b.ast).toBe(a.ast);
    expect(b.hash).toBe(a.hash);
  });

  it('should re-parse when contents change (different hash)', () => {
    const a = parseTsx('a.tsx', `export const x = 1;`);
    const b = parseTsx('a.tsx', `export const x = 2;`);
    expect(b.hash).not.toBe(a.hash);
  });
});

describe('walkAst', () => {
  it('should visit every node with a string `type` field, pre-order', () => {
    const { ast } = parseTsx('a.tsx', `const x = 1;`);
    const seen = new Set<string>();
    walkAst(ast, (n) => seen.add(n.type));
    expect(seen.has('Module')).toBe(true);
    expect(seen.has('VariableDeclaration')).toBe(true);
    expect(seen.has('NumericLiteral')).toBe(true);
  });

  it('should ignore null and primitive values gracefully', () => {
    expect(() => walkAst(null, () => {})).not.toThrow();
    expect(() => walkAst(42 as unknown, () => {})).not.toThrow();
  });
});

describe('getImports', () => {
  it('should expand default, namespace, and named specifiers', () => {
    const { ast } = parseTsx(
      'a.tsx',
      `import React, * as ReactAll from 'react'; import { useState as us, useEffect } from 'react';`,
    );
    const imports = getImports(ast);
    expect(imports).toHaveLength(2);
    const all = imports.flatMap((i) => i.specifiers);
    expect(all).toEqual(
      expect.arrayContaining([
        { imported: 'default', local: 'React' },
        { imported: '*', local: 'ReactAll' },
        { imported: 'useState', local: 'us' },
        { imported: 'useEffect', local: 'useEffect' },
      ]),
    );
  });
});

describe('findDefaultExport / resolveSameFileIdentifier', () => {
  it('should resolve `export default function Foo()` directly', () => {
    const { ast } = parseTsx('a.tsx', `export default function Foo(){ return null; }`);
    const def = findDefaultExport(ast);
    expect(def?.type).toBe('FunctionExpression');
  });

  it('should follow an identifier default export back to its declaration', () => {
    const { ast } = parseTsx(
      'a.tsx',
      `function Foo(){ return null; } export default Foo;`,
    );
    const def = findDefaultExport(ast);
    expect(def?.type).toBe('Identifier');
    const target = resolveSameFileIdentifier(ast, 'Foo');
    expect(target?.type).toBe('FunctionDeclaration');
  });

  it('should resolve a const-bound arrow component', () => {
    const { ast } = parseTsx('a.tsx', `const Foo = () => null; export default Foo;`);
    const target = resolveSameFileIdentifier(ast, 'Foo');
    expect(target?.type).toBe('ArrowFunctionExpression');
  });

  it('should return null when the name cannot be resolved', () => {
    const { ast } = parseTsx('a.tsx', `export const X = 1;`);
    expect(resolveSameFileIdentifier(ast, 'Nope')).toBeNull();
  });

  it('should return null findDefaultExport when no default export exists', () => {
    const { ast } = parseTsx('a.tsx', `export const X = 1;`);
    expect(findDefaultExport(ast)).toBeNull();
  });

  it('should resolve identifier exported via inline export-const declaration', () => {
    const { ast } = parseTsx('a.tsx', `export const Foo = () => null;`);
    const target = resolveSameFileIdentifier(ast, 'Foo');
    expect(target?.type).toBe('ArrowFunctionExpression');
  });

  it('should resolve a class declaration', () => {
    const { ast } = parseTsx('a.tsx', `export class Foo {}`);
    const target = resolveSameFileIdentifier(ast, 'Foo');
    expect(target?.type).toBe('ClassDeclaration');
  });
});
