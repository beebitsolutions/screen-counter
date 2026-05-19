# @beebit/screen-counter

## 0.1.0

### Minor Changes

- 1a95ce7: Heuristic improvements for shadcn-pattern projects (BREAKING).
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
    _primitives_ — files at `components/ui/{dialog,sheet,drawer,alert-dialog}.tsx`
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
    and every component that _renders_ one should not inherit a strong
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

- 1a95ce7: Initial release of @beebit/screen-counter.

  Includes:
  - Analyzer for Next.js routes (App Router) and modal heuristics.
  - CLI with --json, --watch, --verbose, --config, --out flags.
  - Next.js plugin with automatic badge injection (webpack only, Turbopack disabled).
  - ScreenCounterBadge React component with environment-driven visibility.
  - Support for Next.js 15 and 16.
  - Playground with realistic admin dashboard fixtures (17 screens).

- 1a95ce7: Add Pages Router discovery. Set `pagesRouter: true` (programmatically or
  in `screen-counter.config.{mjs,cjs,js}`) to make the analyzer count
  every `pages/**/*.{tsx,jsx,ts,js}` (and `src/pages/**/*`) as a screen.
  `_app`, `_document`, `_error` at the Pages Router root and anything
  under `api/` are excluded silently. Dynamic, catch-all and optional
  catch-all segments pass through verbatim.

  Routes that collide with App Router routes (same canonical URL) surface
  as warnings; both entries remain in the report so paths stay truthful.

  The redundant top-level `pagesRouter` option on `withScreenCounter()`
  has been removed in favour of `analyzer.pagesRouter`. The flag is
  off by default, so existing analyses keep their counts.
