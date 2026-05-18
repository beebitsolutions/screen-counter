import type { Module } from '@swc/core';
import { extractComponent, type ExtractedComponent } from '../extract.js';
import { clearParseCache, getImports, parseTsx, type ImportInfo } from '../parse.js';

/**
 * Test-only helper. Parse a TSX/JSX snippet and return everything the
 * heuristics consume so each test can stay focused on a single rule.
 *
 * Why a local helper instead of stubbing nodes by hand: SWC's AST shape is
 * stable across SWC minor versions, but its TypeScript types churn — going
 * through the real parser keeps the tests honest about what production code
 * actually sees.
 */
export interface ParsedSnippet {
  ast: Module;
  imports: ImportInfo[];
  extracted: ExtractedComponent;
}

export function parseSnippet(code: string, filePath = 'components/Snippet.tsx'): ParsedSnippet {
  const { ast } = parseTsx(filePath, code);
  const imports = getImports(ast);
  const extracted = extractComponent(ast, imports);
  return { ast, imports, extracted };
}

/**
 * Reset the lifetime-of-process parse cache. Vitest reuses the worker between
 * files; tests that mutate or hash-compare AST nodes can call this in a
 * `beforeEach` if needed. Most tests don't bother — the cache is content-keyed
 * and harmless.
 */
export function resetParseCache(): void {
  clearParseCache();
}
