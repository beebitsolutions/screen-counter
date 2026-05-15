import type { Module } from '@swc/core';
import {
  type AnyNode,
  type ImportInfo,
  findDefaultExport,
  resolveSameFileIdentifier,
} from './parse.js';

/** JSX root candidate. Fragments expose no attributes, but other heuristics still apply. */
export type JsxRoot = AnyNode & { type: 'JSXElement' | 'JSXFragment' };

export interface ExtractedComponent {
  /** Local name of the default-exported component, when statically resolvable. */
  componentName: string | null;
  /**
   * JSX root elements the component returns. May contain 0, 1, or 2 entries:
   * - 0 when the export is not a component (e.g. an object literal) or the body
   *   never returns JSX.
   * - 2 when the body returns a ternary whose branches are both JSX.
   */
  jsxRoots: JsxRoot[];
  /** Non-fatal notes (unresolved identifier, unsupported wrapping, ...). */
  warnings: string[];
}

/**
 * Drive default-export resolution, HoC unwrapping, and JSX-root extraction.
 *
 * The caller passes both the parsed module and the pre-computed import list so
 * we can recognise `memo` / `forwardRef` HoCs from `react`.
 */
export function extractComponent(ast: Module, imports: ImportInfo[]): ExtractedComponent {
  const warnings: string[] = [];
  const hoc = collectReactHocNames(imports);

  const def = findDefaultExport(ast);
  if (def === null) {
    return { componentName: null, jsxRoots: [], warnings };
  }

  const resolved = resolveExport(ast, def, hoc, warnings, new Set<string>());
  if (resolved === null) {
    return { componentName: null, jsxRoots: [], warnings };
  }

  return {
    componentName: resolved.componentName,
    jsxRoots: collectJsxRoots(resolved.body),
    warnings,
  };
}

/* -------------------------------------------------------------------------- */
/*  Default-export resolution                                                 */
/* -------------------------------------------------------------------------- */

interface ResolvedExport {
  componentName: string | null;
  /** Function/arrow body — either a `BlockStatement` or a direct expression (implicit return). */
  body: AnyNode | null;
}

function resolveExport(
  ast: Module,
  node: AnyNode,
  hoc: HocNames,
  warnings: string[],
  seenIdentifiers: Set<string>,
): ResolvedExport | null {
  switch (node.type) {
    case 'FunctionDeclaration':
    case 'FunctionExpression': {
      const ident = node['identifier'] as { value?: string } | null | undefined;
      return {
        componentName: ident?.value ?? null,
        body: (node['body'] as AnyNode | undefined) ?? null,
      };
    }
    case 'ArrowFunctionExpression': {
      return {
        componentName: null,
        body: (node['body'] as AnyNode | undefined) ?? null,
      };
    }
    case 'ClassDeclaration':
    case 'ClassExpression': {
      // Class components are rare in modern React; documented as a known gap.
      return null;
    }
    case 'Identifier': {
      const name = node['value'] as string;
      if (seenIdentifiers.has(name)) {
        warnings.push(`circular default export reference: ${name}`);
        return null;
      }
      seenIdentifiers.add(name);
      const target = resolveSameFileIdentifier(ast, name);
      if (target === null) {
        warnings.push(`unresolved default export reference: ${name}`);
        return null;
      }
      const inner = resolveExport(ast, target, hoc, warnings, seenIdentifiers);
      if (inner && inner.componentName === null) {
        return { componentName: name, body: inner.body };
      }
      return inner;
    }
    case 'CallExpression': {
      if (!isHocCall(node, hoc)) {
        warnings.push(`unsupported HoC wrapping pattern in default export`);
        return null;
      }
      const args = node['arguments'] as Array<{ expression?: AnyNode }> | undefined;
      const first = args?.[0]?.expression;
      if (!first) return null;
      return resolveExport(ast, first, hoc, warnings, seenIdentifiers);
    }
    case 'ParenthesisExpression': {
      const inner = node['expression'] as AnyNode | undefined;
      if (!inner) return null;
      return resolveExport(ast, inner, hoc, warnings, seenIdentifiers);
    }
    default:
      // Object/array literals, primitives, etc.: not a component.
      return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  HoC recognition (memo / forwardRef from `react`)                          */
/* -------------------------------------------------------------------------- */

interface HocNames {
  /** Local names bound to `memo` or `forwardRef` from `react`. */
  bare: Set<string>;
  /** Local names bound to the `react` default or namespace import (`React`, etc.). */
  reactNs: Set<string>;
}

function collectReactHocNames(imports: ImportInfo[]): HocNames {
  const bare = new Set<string>();
  const reactNs = new Set<string>();
  for (const imp of imports) {
    if (imp.source !== 'react') continue;
    for (const spec of imp.specifiers) {
      if (spec.imported === 'memo' || spec.imported === 'forwardRef') {
        bare.add(spec.local);
      } else if (spec.imported === 'default' || spec.imported === '*') {
        reactNs.add(spec.local);
      }
    }
  }
  return { bare, reactNs };
}

function isHocCall(call: AnyNode, hoc: HocNames): boolean {
  if (call.type !== 'CallExpression') return false;
  const callee = call['callee'] as AnyNode | undefined;
  if (!callee) return false;
  if (callee.type === 'Identifier') {
    return hoc.bare.has(callee['value'] as string);
  }
  if (callee.type === 'MemberExpression') {
    const object = callee['object'] as AnyNode | undefined;
    const property = callee['property'] as AnyNode | undefined;
    if (
      object?.type === 'Identifier' &&
      hoc.reactNs.has(object['value'] as string) &&
      property?.type === 'Identifier' &&
      (property['value'] === 'memo' || property['value'] === 'forwardRef')
    ) {
      return true;
    }
  }
  return false;
}

/* -------------------------------------------------------------------------- */
/*  JSX root extraction (stays inside the component scope)                    */
/* -------------------------------------------------------------------------- */

function collectJsxRoots(body: AnyNode | null): JsxRoot[] {
  if (body === null) return [];
  return jsxRootsFromExpressionOrBlock(body);
}

function jsxRootsFromExpressionOrBlock(node: AnyNode): JsxRoot[] {
  switch (node.type) {
    case 'JSXElement':
    case 'JSXFragment':
      return [node as JsxRoot];
    case 'ParenthesisExpression': {
      const inner = node['expression'] as AnyNode | undefined;
      return inner ? jsxRootsFromExpressionOrBlock(inner) : [];
    }
    case 'ConditionalExpression': {
      const c = node['consequent'] as AnyNode | undefined;
      const a = node['alternate'] as AnyNode | undefined;
      const roots: JsxRoot[] = [];
      if (c) roots.push(...jsxRootsFromExpressionOrBlock(c));
      if (a) roots.push(...jsxRootsFromExpressionOrBlock(a));
      return roots;
    }
    case 'BlockStatement': {
      const roots: JsxRoot[] = [];
      forEachReturnInBlock(node, (ret) => {
        const arg = ret['argument'] as AnyNode | undefined;
        if (arg) roots.push(...jsxRootsFromExpressionOrBlock(arg));
      });
      return roots;
    }
    default:
      return [];
  }
}

const FUNCTION_BOUNDARY_TYPES = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
  'ClassDeclaration',
  'ClassExpression',
  'MethodDeclaration',
]);

function forEachReturnInBlock(node: AnyNode, visit: (ret: AnyNode) => void): void {
  if (node.type === 'ReturnStatement') {
    visit(node);
    return;
  }
  if (FUNCTION_BOUNDARY_TYPES.has(node.type)) return;
  for (const key of Object.keys(node)) {
    const child = node[key];
    if (child === null || typeof child !== 'object') continue;
    if (Array.isArray(child)) {
      for (const item of child) {
        if (item && typeof item === 'object' && typeof (item as AnyNode).type === 'string') {
          forEachReturnInBlock(item as AnyNode, visit);
        }
      }
    } else if (typeof (child as AnyNode).type === 'string') {
      forEachReturnInBlock(child as AnyNode, visit);
    }
  }
}
