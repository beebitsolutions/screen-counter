import type { Signal } from '../../../types.js';
import type { JsxRoot } from '../extract.js';
import type { AnyNode } from '../parse.js';

/**
 * Strong signal: the JSX root element of the component has `role="dialog"`
 * and/or `aria-modal="true"`. Spread attributes are ignored — we never
 * evaluate expressions.
 *
 * When the component returns a ternary, both branches are passed in via
 * `roots`; a match on either branch fires the signal.
 */
export function detectModalJsxAttrs(roots: JsxRoot[]): Signal[] {
  const signals: Signal[] = [];
  let roleMatched = false;
  let ariaMatched = false;

  for (const root of roots) {
    if (root.type !== 'JSXElement') continue;
    const opening = root['opening'] as AnyNode | undefined;
    if (!opening) continue;
    const attrs = opening['attributes'] as AnyNode[] | undefined;
    if (!attrs) continue;
    for (const attr of attrs) {
      if (attr.type !== 'JSXAttribute') continue;
      const name = readAttributeName(attr);
      const value = readStringAttributeValue(attr);
      if (value === null) continue;
      if (!roleMatched && name === 'role' && value === 'dialog') {
        roleMatched = true;
      }
      if (!ariaMatched && name === 'aria-modal' && value === 'true') {
        ariaMatched = true;
      }
    }
  }

  if (roleMatched) signals.push({ kind: 'strong', rule: 'jsx-attr:role=dialog' });
  if (ariaMatched) signals.push({ kind: 'strong', rule: 'jsx-attr:aria-modal=true' });
  return signals;
}

function readAttributeName(attr: AnyNode): string | null {
  const name = attr['name'] as AnyNode | undefined;
  if (!name) return null;
  if (name.type === 'Identifier') return (name['value'] as string) ?? null;
  // JSXNamespacedName — e.g. `xml:lang`. Not used by our signals.
  return null;
}

function readStringAttributeValue(attr: AnyNode): string | null {
  const value = attr['value'] as AnyNode | undefined;
  if (!value) return null;
  if (value.type === 'StringLiteral') return (value['value'] as string) ?? null;
  // JSXExpressionContainer with a string literal inside is uncommon for these
  // attributes; intentionally not unwrapped (we don't evaluate expressions).
  return null;
}
