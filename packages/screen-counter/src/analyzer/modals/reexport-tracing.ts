import type { Signal } from '../../types.js';
import type { ImportInfo } from './parse.js';
import type { PathResolver } from './path-resolver.js';

/**
 * Pass-1 result the orchestrator hands to the second pass. We only need the
 * file path and signals — everything else stays local to the caller.
 */
export interface PassOneResult {
  filePath: string;
  signals: Signal[];
}

/**
 * A rule key counts as a "propagation source" when it identifies a reusable
 * modal *primitive* — a low-level wrapper that other components compose. In
 * practice this is the shadcn pattern (`components/ui/<name>.tsx`).
 *
 * Library-import signals (`import:@radix-ui/react-dialog`, …) are
 * deliberately NOT propagation sources. Application-level modals such as
 * `DeleteProjectDialog.tsx` typically use a modal library directly, and we
 * do not want every component that *renders* them (rows of a table, page
 * shells, etc.) to inherit a strong signal. That would conflate "uses a
 * modal" with "is a modal" — but counting is by **definition**, not by
 * use (see `CLAUDE.md` § Counting is by definition, not by use).
 */
function isPropagationSourceRule(rule: string): boolean {
  return rule === 'path:shadcn-ui';
}

/**
 * Build the set of project-relative POSIX paths whose pass-1 signals make
 * them eligible to seed a `reexport:*` signal in their consumers.
 *
 * A file is included as soon as **any** of its signals matches the
 * propagation-source rule list — even if the file also has weak signals or
 * is destined to be excluded by a suffix downstream (the second pass only
 * uses this set to mark consumers; whether the primitive itself counts is
 * decided by `classifyCandidate`).
 */
export function buildModalSourceSet(candidates: ReadonlyArray<PassOneResult>): Set<string> {
  const sources = new Set<string>();
  for (const c of candidates) {
    for (const s of c.signals) {
      if (s.kind !== 'strong') continue;
      if (isPropagationSourceRule(s.rule)) {
        sources.add(c.filePath);
        break;
      }
    }
  }
  return sources;
}

/**
 * Second-pass detector. Given a candidate that did NOT already qualify as a
 * propagation source, resolve each of its imports against the provided
 * resolver. If any import lands on a file in `sourceSet`, emit one strong
 * `reexport:<source>` signal (deterministic — the first match in import
 * order wins).
 */
export function detectReexportSignal(
  filePath: string,
  imports: ReadonlyArray<ImportInfo>,
  sourceSet: ReadonlySet<string>,
  resolver: PathResolver,
): Signal | null {
  if (sourceSet.size === 0) return null;
  for (const imp of imports) {
    const resolved = resolver.resolve(filePath, imp.source);
    if (resolved === null) continue;
    if (sourceSet.has(resolved)) {
      return { kind: 'strong', rule: `reexport:${resolved}` };
    }
  }
  return null;
}

/**
 * Convenience predicate: returns true when a candidate's pass-1 signals
 * already include a propagation-source rule (in which case the second pass
 * should leave them alone — covered by the "no double-counting" test).
 */
export function hasPropagationSourceSignal(signals: ReadonlyArray<Signal>): boolean {
  for (const s of signals) {
    if (s.kind === 'strong' && isPropagationSourceRule(s.rule)) return true;
  }
  return false;
}
