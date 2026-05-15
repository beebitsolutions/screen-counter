import type { Module } from '@swc/core';
import type { Signal } from '../../../types.js';
import { type AnyNode, type ImportInfo, walkAst } from '../parse.js';

/**
 * Weak signal: the module imports `createPortal` (or any local alias) from
 * `react-dom` AND actually calls that local binding somewhere.
 *
 * Namespace imports (`import * as ReactDOM from 'react-dom'`) are not
 * supported in v1 — documented as a known gap.
 */
export function detectCreatePortalUse(ast: Module, imports: ImportInfo[]): Signal[] {
  const localNames = collectCreatePortalLocals(imports);
  if (localNames.size === 0) return [];

  let used = false;
  walkAst(ast, (node) => {
    if (used) return;
    if (node.type !== 'CallExpression') return;
    const callee = node['callee'] as AnyNode | undefined;
    if (!callee) return;
    if (callee.type === 'Identifier' && localNames.has(callee['value'] as string)) {
      used = true;
    }
  });

  if (!used) return [];
  return [{ kind: 'weak', rule: 'react-dom:createPortal' }];
}

function collectCreatePortalLocals(imports: ImportInfo[]): Set<string> {
  const locals = new Set<string>();
  for (const imp of imports) {
    if (imp.source !== 'react-dom') continue;
    for (const spec of imp.specifiers) {
      if (spec.imported === 'createPortal') locals.add(spec.local);
    }
  }
  return locals;
}
