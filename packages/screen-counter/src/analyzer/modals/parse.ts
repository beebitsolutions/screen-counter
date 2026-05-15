import { createHash } from 'node:crypto';
import { parseSync, type Module } from '@swc/core';

/**
 * Lifetime-of-process content-hash cache. Same source string → reuse parsed
 * Module. Sufficient for `--watch` mode where the same file with unchanged
 * contents is re-analyzed on every save of a sibling file.
 */
const parseCache = new Map<string, Module>();

/** Parse a `.tsx`/`.jsx` source string. The hash is the cache key. */
export function parseTsx(_filePath: string, contents: string): { ast: Module; hash: string } {
  const hash = createHash('sha1').update(contents).digest('hex');
  const cached = parseCache.get(hash);
  if (cached) return { ast: cached, hash };

  const ast = parseSync(contents, {
    syntax: 'typescript',
    tsx: true,
    decorators: true,
  });
  parseCache.set(hash, ast);
  return { ast, hash };
}

/** Empty the parse cache. Exported for tests; not part of the public API. */
export function clearParseCache(): void {
  parseCache.clear();
}

/* -------------------------------------------------------------------------- */
/*  AST traversal — narrow, structural, no external walker dependency         */
/* -------------------------------------------------------------------------- */

/**
 * Pre-order walk over every node in the subtree that has a `type` field.
 * Crosses function boundaries — use this when collecting module-wide things
 * (imports, call expressions). Use {@link walkStatementsInFunctionBody} when
 * you need to stay inside one function's body.
 */
export function walkAst(node: unknown, visit: (node: AnyNode) => void): void {
  if (node === null || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const child of node) walkAst(child, visit);
    return;
  }
  const obj = node as Record<string, unknown>;
  if (typeof obj['type'] === 'string') {
    visit(obj as AnyNode);
  }
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (value !== null && typeof value === 'object') walkAst(value, visit);
  }
}

/* -------------------------------------------------------------------------- */
/*  Import analysis                                                           */
/* -------------------------------------------------------------------------- */

export interface ImportInfo {
  /** The module source string (e.g. `'react-dom'`). */
  source: string;
  specifiers: ImportSpecifierInfo[];
}

export interface ImportSpecifierInfo {
  /** The original export name. `'default'` for default imports, `'*'` for namespace imports. */
  imported: string;
  /** The local binding name in scope. */
  local: string;
}

/** Extract every `import` declaration from the module. */
export function getImports(ast: Module): ImportInfo[] {
  const imports: ImportInfo[] = [];
  for (const item of ast.body) {
    if (item.type !== 'ImportDeclaration') continue;
    const source = item.source.value;
    const specifiers: ImportSpecifierInfo[] = [];
    for (const spec of item.specifiers) {
      if (spec.type === 'ImportDefaultSpecifier') {
        specifiers.push({ imported: 'default', local: spec.local.value });
      } else if (spec.type === 'ImportNamespaceSpecifier') {
        specifiers.push({ imported: '*', local: spec.local.value });
      } else if (spec.type === 'ImportSpecifier') {
        const imported = spec.imported ? moduleExportName(spec.imported) : spec.local.value;
        specifiers.push({ imported, local: spec.local.value });
      }
    }
    imports.push({ source, specifiers });
  }
  return imports;
}

function moduleExportName(name: { type: string; value: string }): string {
  // `Identifier` and `StringLiteral` both expose `.value`.
  return name.value;
}

/* -------------------------------------------------------------------------- */
/*  Default-export resolution                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Return the AST node that represents the module's default export, or `null`
 * when there is none. Handles both:
 * - `export default function Foo() {}` / `export default class Foo {}`
 *   (an `ExportDefaultDeclaration` wrapping a `FunctionExpression`/`ClassExpression`).
 * - `export default <expression>` (an `ExportDefaultExpression`).
 */
export function findDefaultExport(ast: Module): AnyNode | null {
  for (const item of ast.body) {
    if (item.type === 'ExportDefaultDeclaration') {
      return item.decl as unknown as AnyNode;
    }
    if (item.type === 'ExportDefaultExpression') {
      return item.expression as unknown as AnyNode;
    }
  }
  return null;
}

/**
 * Resolve a top-level identifier to its declaring expression in the same file.
 * Returns:
 * - the `FunctionDeclaration` node for `function name() {}`
 * - the initializer of `const|let|var name = <expr>`
 * - the `ClassDeclaration` for `class name {}`
 * - `null` if no top-level binding matches (e.g. it's an import or undefined).
 */
export function resolveSameFileIdentifier(ast: Module, name: string): AnyNode | null {
  for (const item of ast.body) {
    if (item.type === 'FunctionDeclaration' && item.identifier?.value === name) {
      return item as unknown as AnyNode;
    }
    if (item.type === 'ClassDeclaration' && item.identifier?.value === name) {
      return item as unknown as AnyNode;
    }
    if (item.type === 'ExportDeclaration') {
      const inner = item.declaration;
      if (inner.type === 'FunctionDeclaration' && inner.identifier?.value === name) {
        return inner as unknown as AnyNode;
      }
      if (inner.type === 'ClassDeclaration' && inner.identifier?.value === name) {
        return inner as unknown as AnyNode;
      }
      if (inner.type === 'VariableDeclaration') {
        const init = findInitializer(inner.declarations, name);
        if (init) return init;
      }
    }
    if (item.type === 'VariableDeclaration') {
      const init = findInitializer(item.declarations, name);
      if (init) return init;
    }
  }
  return null;
}

function findInitializer(declarations: unknown, name: string): AnyNode | null {
  if (!Array.isArray(declarations)) return null;
  for (const raw of declarations) {
    if (raw === null || typeof raw !== 'object') continue;
    const decl = raw as { id?: unknown; init?: unknown };
    const id = decl.id as AnyNode | undefined;
    if (!id || id.type !== 'Identifier') continue;
    if (id['value'] === name && decl.init) return decl.init as AnyNode;
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Generic node alias                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Structural alias for any SWC AST node. We deliberately keep this loose —
 * @swc/core's types are unions that change between minor versions, and the
 * heuristics only inspect a small number of fields by name.
 */
export type AnyNode = { type: string } & Record<string, unknown>;
