# @beebit/screen-counter

[![npm version](https://img.shields.io/npm/v/@beebit/screen-counter.svg)](https://www.npmjs.com/package/@beebit/screen-counter)
[![CI](https://github.com/beebitsolutions/screen-counter/actions/workflows/ci.yml/badge.svg)](https://github.com/beebitsolutions/screen-counter/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-blue)](#license)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](#compatibility)

> Count screens (routes + modals) in a Next.js project — for auditable
> budgets and live `X/Y screens` demos.

## Features

- **CLI for budgeting.** `npx @beebit/screen-counter` produces an auditable
  report (human-readable or JSON) of every route and every modal in any
  Next.js project. Drop the JSON straight into a quote.
- **Next.js plugin for live demos.** One line in `next.config.mjs` injects a
  floating `X/Y screens` badge that updates via HMR as you add or remove
  screens.
- **Modal heuristics that match real codebases.** Detects modals from Radix,
  Headless UI, MUI, Chakra, vaul and shadcn primitives — plus hand-rolled
  dialogs (via `role="dialog"`, `createPortal`, naming conventions).
- **Kebab-case / snake_case / PascalCase aware.** `LoginModal.tsx`,
  `login-modal.tsx` and `login_modal.tsx` all trigger the same signal.
- **shadcn re-export tracing.** Consumers that import from local primitives
  (`@/components/ui/dialog`) inherit the primitive's strong signal — so
  apps built on shadcn count correctly out of the box.
- **Escape hatches.** Force inclusion or exclusion of any component with a
  `data-screen-counter` attribute when heuristics miss or over-trigger.
- **Zero telemetry.** No data is sent anywhere.

## Compatibility

| What                         | Status                                                              |
| ---------------------------- | ------------------------------------------------------------------- |
| Next.js 15 / 16              | Supported (CI matrix).                                              |
| Next.js ≤ 14                 | Not supported.                                                      |
| App Router                   | Supported by default.                                               |
| Pages Router                 | Supported via `pagesRouter: true` (off by default).                 |
| Webpack                      | Supported.                                                          |
| Turbopack                    | **Not supported.** Plugin auto-disables with a warning. On Next.js 16 (Turbopack default) opt out with `next dev --webpack` / `next build --webpack`. |
| Node.js                      | `>= 20`                                                             |

## Install

```bash
npm install --save-dev @beebit/screen-counter
# or
pnpm add -D @beebit/screen-counter
# or
yarn add -D @beebit/screen-counter
```

Peer dependencies: `next >= 15`. `react >= 18` and `react-dom >= 18` are
needed only when you mount the badge — they are declared as optional
peers.

## Quick start

### CLI — audit a project for budgeting

Run it on any Next.js project, no setup required:

```bash
npx @beebit/screen-counter
```

```
@beebit/screen-counter — analyzing /path/to/your-app

✓ 12 routes
✓ 13 modals (radix: 2, reexport:components/ui/dialog.tsx: 2, role: 2, aria: 1, chakra: 1, forced: 1, headlessui: 1, mui: 1, shadcn: 1, vaul: 1)
✓ 1 component excluded manually
─────────────────
  25 screens total
```

Export the report as JSON to attach to a budget:

```bash
npx @beebit/screen-counter --json --out reports/screens.json
```

### Plugin — live badge in a Next.js app

Wrap your config in `next.config.mjs`:

```js
import { withScreenCounter } from '@beebit/screen-counter/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@beebit/screen-counter'],
};

export default withScreenCounter({})(nextConfig);
```

Start dev:

```bash
next dev            # Next.js 15
next dev --webpack  # Next.js 16 (Turbopack is the default; opt out with --webpack)
```

The badge appears in the corner of every page, refreshes via HMR, and
shows green / amber / red depending on how close the count is to the
configured limit.

## CLI reference

| Flag                 | Purpose                                                                  |
| -------------------- | ------------------------------------------------------------------------ |
| `--json`             | Print structured JSON to stdout (no colours, no decoration).             |
| `--out <path>`       | Write the report to a file. Creates intermediate directories.            |
| `--verbose`          | Per-component breakdown with the signals each one fired.                 |
| `--watch`            | Recompute on file changes (`chokidar`, 150 ms debounce, clean SIGINT).   |
| `--config <path>`    | Explicit path to a `screen-counter.config.{mjs,cjs,js}` file.            |
| `--help` / `-h`      | Print full help.                                                         |
| `--version` / `-v`   | Print the package version.                                               |

Exit codes: `0` ok · `1` analyzer error · `2` config error.

## Configuration

### `withScreenCounter(options)`

| Option        | Type           | Default | Notes                                                                                                                                              |
| ------------- | -------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `analyzer`    | `Config`       | `{}`    | Forwarded to `analyze()`. Same schema as `screen-counter.config.{mjs,cjs,js}`. Set `analyzer.pagesRouter: true` to enable Pages Router discovery.  |
| `autoInject`  | `boolean`      | `true`  | Disable to mount `<ScreenCounterBadge />` manually.                                                                                                |
| `badge`       | `BadgeOptions` | —       | Forwarded into the auto-injected badge.                                                                                                            |
| `verbose`     | `boolean`      | `false` | Print `[@beebit/screen-counter]` info lines on each analyzer run.                                                                                  |

### `screen-counter.config.mjs`

Optional repo-level config. Drop one of `screen-counter.config.{mjs,cjs,js}`
at the project root and both the CLI and the plugin will pick it up:

```js
// screen-counter.config.mjs
export default {
  // Extra module sources that trigger the strong "import:<lib>" signal.
  modalLibraries: ['@mantine/core'],

  // Last-word suffixes (kebab/snake/Camel) that exclude a component from
  // modal counting even if heuristics fire. Default: Provider, Context, Wrapper.
  excludeSuffixes: ['Provider', 'Context', 'Wrapper', 'Layout'],

  // How many of each signal kind are needed to count as a modal.
  // Default: 1 strong OR 2 weak.
  scoringThreshold: { strong: 1, weak: 2 },

  // Enable Pages Router discovery (off by default).
  pagesRouter: false,

  // Globs added to / removed from the default file walker.
  include: [],
  exclude: [],
};
```

All fields are optional. A config with no overrides is equivalent to no
config at all.

### Environment variables

| Variable                            | Values                          | Default | Effect                                                  |
| ----------------------------------- | ------------------------------- | ------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_SCREEN_COUNTER_LIMIT`  | integer `>= 0`                  | `20`    | Default badge limit; threshold for amber/red colouring. |
| `NEXT_PUBLIC_SCREEN_COUNTER_SHOW`   | `auto` \| `always` \| `never`   | `auto`  | Visibility policy. `auto` = visible in dev only.        |

Both require the `NEXT_PUBLIC_` prefix so Next.js inlines them at build time.

## How counting works

A screen is **defined**, not used. A modal reused 12 times still counts
once.

### Routes

- Every `app/**/page.{tsx,jsx,ts,js}` (App Router) and, when
  `pagesRouter: true`, every `pages/**/*.{tsx,jsx,ts,js}` excluding
  `_app`, `_document`, `_error` and `api/*`.
- Dynamic routes (`[id]`, `[...slug]`, `[[...slug]]`) and route groups
  (`(group)`) each count once.

### Modals — heuristics

A component is counted as a modal if it fires **one strong signal** or
**two weak signals**.

**Strong signals**

- Import from a known modal library: `@radix-ui/react-dialog`,
  `@headlessui/react` (`Dialog`), `@mui/material` (`Modal`/`Dialog`/`Drawer`),
  `@chakra-ui/react` (`Modal`/`Drawer`), `vaul`, shadcn pattern
  (`components/ui/dialog.tsx` and similar primitives).
- JSX root with `role="dialog"` or `aria-modal="true"`.
- **Re-export tracing**: the file imports a local shadcn primitive (e.g.
  `@/components/ui/dialog`). The consumer inherits the primitive's strong
  signal via `reexport:<source>`.

**Weak signals**

- The **last word** of the component name or file basename is one of
  `Modal`, `Dialog`, `Drawer`, `Sheet`, `Popup`, `Lightbox`, `Overlay`.
  The match is kebab/snake/Camel-case aware: `LoginModal.tsx`,
  `login-modal.tsx` and `login_modal.tsx` all qualify.
- `createPortal` is imported from `react-dom` and called.

### What does NOT count

- `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`,
  `template.tsx`, `default.tsx`, `route.ts`.
- `_app`, `_document`, `_error`, `api/*`.
- Components whose last word is a default exclusion suffix:
  `Provider`, `Context`, `Wrapper`. The same kebab/snake-aware match
  applies — `LoginModalProvider`, `login-modal-provider.tsx` and
  `auth_modal_context.tsx` are all excluded.
- Parallel routes (`@slot`) and intercepted routes (`(.)foo`) — skipped
  with a warning.

### Escape hatches

Two `data-screen-counter` attributes override the heuristic on the JSX
root:

```tsx
// Force exclusion — heuristic would have counted this.
return <div data-screen-counter="disable">…</div>;

// Force inclusion — hand-rolled modal the heuristic missed.
return <div data-screen-counter="screen">…</div>;
```

The exclusion suffix list always wins: a `LoginModalProvider` with
`data-screen-counter="screen"` is still excluded.

## Versioning policy

A pragmatic semver, tailored to a tool whose output can affect budgets
that are already closed with clients:

| Bump  | When                                                                                                                       |
| ----- | -------------------------------------------------------------------------------------------------------------------------- |
| MAJOR | A change **reduces or alters** what was counted before. Existing projects may see lower or differently-classified counts.  |
| MINOR | A change **only adds** detection (new library, new heuristic, opt-in feature). Old counts stay equal or grow.              |
| PATCH | Bug fixes and improvements that **do not change the count** observable from the outside.                                   |

Heuristic-driven changes that lower counts are explicitly MAJOR, even
when framed internally as bug fixes — what matters is the observable
effect on budgets, not intent.

## Privacy

The package sends **no telemetry**. No usage data, no errors, no counts.

## License

[MIT](./LICENSE) © Beebit Solutions.

## Links

- Source: <https://github.com/beebitsolutions/screen-counter>
- Issues: <https://github.com/beebitsolutions/screen-counter/issues>
- Changelog: <https://github.com/beebitsolutions/screen-counter/blob/dev/packages/screen-counter/CHANGELOG.md>
- Example app (fixtures + live badge demo): <https://github.com/beebitsolutions/screen-counter/tree/dev/apps/playground>

---

## Versión en español

`@beebit/screen-counter` cuenta las pantallas (rutas + modales) de un
proyecto Next.js, con dos modos de uso:

- **Modo presupuesto (CLI)**: `npx @beebit/screen-counter` genera un
  informe auditable para anexar a presupuestos.
- **Modo demo (plugin + badge)**: badge flotante "X/Y pantallas" en el
  navegador durante desarrollo y, opcionalmente, en demos a cliente.

### Instalación

```bash
pnpm add -D @beebit/screen-counter
```

### Uso rápido — CLI

```bash
npx @beebit/screen-counter

# Exportar JSON
npx @beebit/screen-counter --json --out reports/screens.json
```

### Uso rápido — Plugin

```js
import { withScreenCounter } from '@beebit/screen-counter/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@beebit/screen-counter'],
};

export default withScreenCounter({})(nextConfig);
```

Arranca con `next dev` (Next 15) o `next dev --webpack` (Next 16, hace
falta opt-out de Turbopack porque el plugin solo soporta webpack en v1).

### Qué cuenta como pantalla

- Cada `app/**/page.tsx` (App Router) y, si activas `pagesRouter: true`,
  cada `pages/**/*.{tsx,jsx,ts,js}` excluyendo `_app`, `_document`,
  `_error` y `api/*`.
- Cada componente con **1 señal fuerte** o **2 señales débiles**:
  importar una librería conocida de modales, `role="dialog"`,
  `createPortal`, sufijo `Modal`/`Dialog`/etc, o reexportar una primitiva
  local de shadcn.
- Rutas dinámicas y grupos `(group)` cuentan **1 vez** por definición,
  no por uso.

### Qué NO cuenta

- `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`,
  `template.tsx`, `default.tsx`, `route.ts`.
- `_app`, `_document`, `_error`, `api/*`.
- Componentes cuyo último segmento es `Provider`, `Context` o `Wrapper`
  (`LoginModalProvider` **no** cuenta).
- Componentes con `data-screen-counter="disable"` en su raíz JSX.

### Escape hatches

`data-screen-counter="screen"` fuerza la inclusión; `="disable"` fuerza
la exclusión. La lista de sufijos excluidos gana sobre `="screen"`.

### Variables de entorno

| Variable                            | Valores                       | Default | Efecto                                                  |
| ----------------------------------- | ----------------------------- | ------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_SCREEN_COUNTER_LIMIT`  | entero `>= 0`                 | `20`    | Límite del badge (umbral verde/ámbar/rojo).             |
| `NEXT_PUBLIC_SCREEN_COUNTER_SHOW`   | `auto` \| `always` \| `never` | `auto`  | Política de visibilidad. `auto` = visible solo en dev.  |

### Compatibilidad

Next.js 15 y 16 sobre webpack. App Router por defecto, Pages Router
opt-in con `pagesRouter: true`. **Turbopack no soportado en v1.**
Node `>= 20`.

### Política de versionado

Semver pragmático adaptado a un paquete cuyo output afecta presupuestos:

| Bump  | Cuándo se aplica                                                             |
| ----- | ---------------------------------------------------------------------------- |
| MAJOR | Cambios que **reducen o alteran** lo que se contaba antes.                   |
| MINOR | Cambios que **solo añaden** detección o features opt-in.                     |
| PATCH | Bugs y mejoras que **no cambian el conteo** observable.                      |

### Licencia

[MIT](./LICENSE) © Beebit Solutions.

### Enlaces

- Código: <https://github.com/beebitsolutions/screen-counter>
- Issues: <https://github.com/beebitsolutions/screen-counter/issues>
- Changelog: <https://github.com/beebitsolutions/screen-counter/blob/dev/packages/screen-counter/CHANGELOG.md>
- Demo viva (fixtures + badge): <https://github.com/beebitsolutions/screen-counter/tree/dev/apps/playground>
