import type { JsxRoot } from './extract.js';
import type { AnyNode } from './parse.js';

/** Resolved escape hatch for a candidate component. */
export type EscapeHatch = 'disable' | 'screen' | null;

/**
 * Inspect the JSX root(s) for a `data-screen-counter` attribute.
 *
 * `disable` always wins over `screen` when both appear (e.g. in different
 * ternary branches) — opting out is the safer default.
 */
export function readEscapeHatch(roots: JsxRoot[]): EscapeHatch {
  let result: EscapeHatch = null;
  for (const root of roots) {
    if (root.type !== 'JSXElement') continue;
    const opening = root['opening'] as AnyNode | undefined;
    const attrs = opening?.['attributes'] as AnyNode[] | undefined;
    if (!attrs) continue;
    for (const attr of attrs) {
      if (attr.type !== 'JSXAttribute') continue;
      const name = readAttributeName(attr);
      if (name !== 'data-screen-counter') continue;
      const value = readStringAttributeValue(attr);
      if (value === 'disable') return 'disable';
      if (value === 'screen' && result === null) result = 'screen';
    }
  }
  return result;
}

function readAttributeName(attr: AnyNode): string | null {
  const name = attr['name'] as AnyNode | undefined;
  if (!name || name.type !== 'Identifier') return null;
  return (name['value'] as string) ?? null;
}

function readStringAttributeValue(attr: AnyNode): string | null {
  const value = attr['value'] as AnyNode | undefined;
  if (!value || value.type !== 'StringLiteral') return null;
  return (value['value'] as string) ?? null;
}
