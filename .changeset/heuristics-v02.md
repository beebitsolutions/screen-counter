---
"@beebit/screen-counter": minor
---

Heuristic improvements for shadcn-pattern projects (BREAKING).

- **Naming normalised across casings.** The weak `name-suffix:*` signal
  now matches the **last word** of the component name or file basename
  after splitting on `-`, `_` and CamelCase transitions, lowercased. So
  `LoginModal.tsx`, `login-modal.tsx` and `login_modal.tsx` all qualify
  as `name-suffix:Modal`. The same algorithm drives the exclusion-suffix
  check (`Provider`/`Context`/`Wrapper`), so kebab/snake-cased
  `onboarding-modal-provider.tsx` and `auth_modal_context.tsx` are now
  correctly excluded.

- **Re-export tracing for shadcn primitives.** A second analyzer pass
  propagates a strong `reexport:<source>` signal from local modal
  *primitives* — files at `components/ui/{dialog,sheet,drawer,alert-dialog}.tsx`
  — to any candidate whose imports resolve to them. Both the `@/*` alias
  (read from `tsconfig.json`) and relative imports (`./ui/dialog`,
  `../../components/ui/drawer`) are supported.

**Why MAJOR.** Existing projects analysed with v0.1.x will likely show a
significantly higher count. Validation against a Beebit shadcn-based ERP
prototype showed the modal count climb from ~2 to ~20+ (the analyzer was
under-counting by ~26%). If you have a budget agreed on the previous
count, review your CHANGELOG and the project's audit before bumping.

**Scope notes.**

- Propagation is gated on `path:shadcn-ui`, not on every library-import
  signal. That is deliberate: application-level modals (e.g. a
  `DeleteProjectDialog` that imports Radix directly) are not primitives,
  and every component that *renders* one should not inherit a strong
  signal. Counting remains by **definition**, not by use.
- A side effect of the naming normalisation: a basename like `dialog.tsx`
  now matches `name-suffix:Dialog` (last word `dialog`), so the shadcn
  primitive emits both `path:shadcn-ui` (strong) and `name-suffix:Dialog`
  (weak). Classification is unchanged.

**Limitations** (queued for a future minor):

- Only the `@/*` alias is honoured. Custom aliases (`@app/*`, `~/`,
  `@components/*`) are silently ignored by the path resolver.
- `tsconfig.json` `extends` chains are not followed.
- Re-export propagation from non-shadcn primitives (e.g. a hand-rolled
  Radix wrapper outside `components/ui/`) is not supported and can be
  opted in by placing the file under `components/ui/<basename>.tsx`.
