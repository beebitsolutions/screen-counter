# playground

Next.js 15 / App Router fixtures app for `@beebit/screen-counter`.

The same files serve two purposes:

- **Live demo**: `pnpm dev:playground` boots a Next.js app where the badge
  injected by `withScreenCounter` shows the current screen count for *this*
  project. Every fixture renders a triggerable example so you can see the
  modal markup in a real browser.
- **Test fixtures**: the integration snapshot (planned for prompt 09) calls
  `analyze('apps/playground')` and pins the exact set of routes, modals and
  disabled entries listed below.

## Total expected from `analyze()`

| Bucket               | Count |
| -------------------- | ----- |
| Routes (Block A)     | 8     |
| Modals (Block B)     | 6     |
| Modals (Block C)     | 2     |
| Forced modals (D)    | 1     |
| **`count`**          | **17**|
| Disabled (D)         | 1     |

The CLI verbose run should agree:

```bash
pnpm build
node packages/screen-counter/dist/cli.js apps/playground --verbose
```

## Inventory

### Block A — Routes (App Router)

| #    | Path                                      | Expectation                              |
| ---- | ----------------------------------------- | ---------------------------------------- |
| A.1  | `app/page.tsx`                            | counts; route `/`                        |
| A.2  | `app/about/page.tsx`                      | counts; route `/about`                   |
| A.3  | `app/users/[id]/page.tsx`                 | counts; route `/users/[id]` (dynamic)    |
| A.4  | `app/blog/[...slug]/page.tsx`             | counts; route `/blog/[...slug]`          |
| A.5  | `app/docs/[[...slug]]/page.tsx`           | counts; route `/docs/[[...slug]]`        |
| A.6  | `app/(marketing)/landing/page.tsx`        | counts; route `/landing` (group dropped) |
| A.7  | `app/(marketing)/contact/page.tsx`        | counts; route `/contact`                 |
| A.8  | `app/dashboard/layout.tsx`                | does NOT count (layout)                  |
| A.9  | `app/dashboard/page.tsx`                  | counts; route `/dashboard`               |
| A.10 | `app/dashboard/loading.tsx`               | does NOT count (loading)                 |
| A.11 | `app/dashboard/error.tsx`                 | does NOT count (error)                   |
| A.12 | `app/dashboard/not-found.tsx`             | does NOT count (not-found)               |
| A.13 | `app/api/health/route.ts`                 | does NOT count (api route)               |

### Block B — Modals by library

| #   | Path                                                    | Expected signal(s)                                     |
| --- | ------------------------------------------------------- | ------------------------------------------------------ |
| B.1 | `app/components/RadixDialogExample.tsx`                 | strong: `import:@radix-ui/react-dialog`                |
| B.2 | `app/components/HeadlessUIDialogExample.tsx`            | strong: `import:@headlessui/react` (Dialog)            |
| B.3 | `app/components/MUIDialogExample.tsx`                   | strong: `import:@mui/material` (Dialog)                |
| B.4 | `app/components/ChakraModalExample.tsx`                 | strong: `import:@chakra-ui/react` (Modal)              |
| B.5 | `app/components/VaulDrawerExample.tsx`                  | strong: `import:vaul`                                  |
| B.6 | `components/ui/dialog.tsx`                              | strong: `path:shadcn-ui` (+ Radix import for free)     |

### Block C — Homemade + edge cases

| #   | Path                                                | Outcome                                                                    |
| --- | --------------------------------------------------- | -------------------------------------------------------------------------- |
| C.1 | `app/components/HomemadeModal.tsx`                  | **counts**: strong `jsx-attr:role=dialog` + weak suffix + weak portal      |
| C.2 | `app/components/SoloPortalToast.tsx`                | does NOT count: only 1 weak signal (`react-dom:createPortal`)              |
| C.3 | `app/components/LoginModalProvider.tsx`             | does NOT count: `Provider` suffix excluded                                 |
| C.4 | `app/components/AppContext.tsx`                     | does NOT count: `Context` suffix excluded                                  |
| C.5 | `app/components/NestedModal.tsx`                    | **counts as 1**: nested modal does not double-count                        |

### Block D — Escape hatches

| #   | Path                                            | Outcome                                                                  |
| --- | ----------------------------------------------- | ------------------------------------------------------------------------ |
| D.1 | `app/components/ForcedInclude.tsx`              | **counts as forced**: `data-screen-counter="screen"` on JSX root         |
| D.2 | `app/components/ForcedExclude.tsx`              | lands in `result.disabled`: `data-screen-counter="disable"` on JSX root  |

## How to run

```bash
pnpm install                # first time only
pnpm build                  # build the package so its types resolve
pnpm dev:playground         # → http://localhost:3000
```

The badge in the top-right is auto-injected by the plugin. Change any fixture
and the badge updates on save (HMR is wired by `src/plugin/hmr.ts`).

## Regenerating snapshots

The integration snapshot lives outside this app (planned in prompt 09). When
it lands, the workflow will be:

```bash
pnpm --filter @beebit/screen-counter test -- --update
```

Until that prompt ships, this section is a placeholder.

## Adding fixtures

See `documentation/dev-notes/06-fixtures-inventario.md` for the policy. Short
version: **fixture first, then heuristic change, then test** — heuristic
changes are breaking semver and must ship with a corresponding playground
fixture and a unit test.
