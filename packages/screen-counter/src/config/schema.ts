import { z } from 'zod';
import type { Config } from '../types.js';

/**
 * Built-in modal-library sources matched as a strong signal. Some entries
 * require a specific named specifier (see `analyzer/modals/heuristics/imports.ts`)
 * — this list is just the union of supported source strings.
 */
export const BUILTIN_MODAL_LIBRARIES = [
  '@radix-ui/react-dialog',
  '@headlessui/react',
  '@mui/material',
  '@chakra-ui/react',
  'vaul',
] as const;

/** Default weak-signal suffixes. Used when `config.nameSuffixes` is not set. */
export const DEFAULT_NAME_SUFFIXES = [
  'Modal',
  'Dialog',
  'Drawer',
  'Sheet',
  'Popup',
  'Lightbox',
  'Overlay',
] as const;

/** Default hard-exclusion suffixes. Used when `config.excludeSuffixes` is not set. */
export const DEFAULT_EXCLUDE_SUFFIXES = ['Provider', 'Context', 'Wrapper'] as const;

/** Default scoring threshold from the spec: 1 strong OR 2 weak ⇒ modal. */
export const DEFAULT_SCORING_THRESHOLD = { strong: 1, weak: 2 } as const;

/**
 * Internal validated config shape: every field is present after `parseConfig`.
 * Distinct from the public `Config` (where every field is optional).
 */
export interface ResolvedConfig {
  pagesRouter: boolean;
  include: string[];
  exclude: string[];
  modalLibraries: string[];
  nameSuffixes: string[];
  excludeSuffixes: string[];
  scoringThreshold: { strong: number; weak: number };
}

const ScoringThresholdSchema = z
  .object({
    strong: z.number().int().min(1),
    weak: z.number().int().min(1),
  })
  .strict();

const ConfigSchema = z
  .object({
    pagesRouter: z.boolean().default(false),
    include: z.array(z.string()).default([]),
    exclude: z.array(z.string()).default([]),
    modalLibraries: z.array(z.string()).default([]),
    nameSuffixes: z.array(z.string()).default([...DEFAULT_NAME_SUFFIXES]),
    excludeSuffixes: z.array(z.string()).default([...DEFAULT_EXCLUDE_SUFFIXES]),
    scoringThreshold: ScoringThresholdSchema.default({ ...DEFAULT_SCORING_THRESHOLD }),
  })
  .strict();

/**
 * Validate and normalize a user-supplied `Config`. Throws a descriptive
 * `TypeError` when the input is invalid.
 */
export function parseConfig(input: Config | undefined): ResolvedConfig {
  const result = ConfigSchema.safeParse(input ?? {});
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new TypeError(`Invalid screen-counter config:\n${issues}`);
  }
  return result.data;
}
