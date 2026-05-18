# @beebit/screen-counter

[![npm version](https://img.shields.io/badge/npm-v0.0.0-lightgrey)](https://www.npmjs.com/package/@beebit/screen-counter)
[![CI](https://img.shields.io/badge/CI-pending-lightgrey)](#)
[![license](https://img.shields.io/badge/license-UNLICENSED-red)](#license)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](#compatibility)

> Count screens (routes + modals) in a Next.js project — for auditable
> budgets and live `X/Y screens` demos.

## What is this?

A small library that walks a Next.js project, counts each App-Router
`page.tsx` plus each modal component (Radix, Headless UI, MUI, Chakra,
vaul, shadcn, custom), and produces a deterministic report. Ships as a
CLI for budgeting and a Next.js plugin + React badge for live demos.

## Install

```bash
# npm
npm install --save-dev @beebit/screen-counter

# pnpm
pnpm add -D @beebit/screen-counter

# yarn
yarn add -D @beebit/screen-counter
```

Peer dependencies: `next >= 14`, `react >= 18`, `react-dom >= 18` (the
last two are optional and only needed when you mount the badge).

## CLI usage

Audit any Next.js project with a one-liner:

```bash
npx @beebit/screen-counter
```

<!-- verified — run from the monorepo root against apps/playground -->

```
@beebit/screen-counter — analyzing /path/to/your-app

✓ 8 routes
✓ 9 modals (radix: 3, chakra: 1, forced: 1, headlessui: 1, mui: 1, role: 1, vaul: 1)
✓ 1 component excluded manually
─────────────────
  17 screens total
```

Useful flags:

```bash
npx @beebit/screen-counter --json --out reports/screens.json
npx @beebit/screen-counter --verbose
npx @beebit/screen-counter --watch
```

Full flag reference: see [`documentation/dev-notes/03-cli-referencia.md`](../../documentation/dev-notes/03-cli-referencia.md).

## Plugin usage

One line in `next.config.mjs`:

<!-- verified — same shape used by apps/playground/next.config.mjs -->

```js
import { withScreenCounter } from '@beebit/screen-counter/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@beebit/screen-counter'],
};

export default withScreenCounter({})(nextConfig);
```

The plugin runs `analyze()` at build/dev time, injects a
`<ScreenCounterBadge />` into your **App Router** root layout, and refreshes
the count via HMR when you add or remove screens.

`pages/`-only projects: not supported in v1. See [Compatibility](#compatibility).

## Configuration

`withScreenCounter(options)`:

| Option        | Type           | Default | Notes                                                                       |
| ------------- | -------------- | ------- | --------------------------------------------------------------------------- |
| `analyzer`    | `Config`       | `{}`    | Forwarded to `analyze()`. Same schema as `screen-counter.config.{mjs,cjs,js}`. |
| `autoInject`  | `boolean`      | `true`  | Disable to mount `<ScreenCounterBadge />` manually.                          |
| `badge`       | `BadgeOptions` | —       | Forwarded into the auto-injected badge.                                     |
| `verbose`     | `boolean`      | `false` | Print `[@beebit/screen-counter]` info lines on each analyzer run.            |
| `pagesRouter` | `boolean`      | `false` | Reserved. Logs a warning if `true`; not implemented in v1.                   |

Optional repo-level config — drop a `screen-counter.config.mjs` at the
project root and the CLI / plugin will pick it up:

```js
// screen-counter.config.mjs
export default {
  modalLibraries: ['@mantine/core'],
  excludeSuffixes: ['Provider', 'Context', 'Wrapper', 'Layout'],
  scoringThreshold: { strong: 1, weak: 2 },
};
```

Full schema and zone-grey decisions: [`documentation/dev-notes/02-heuristicas-modales.md`](../../documentation/dev-notes/02-heuristicas-modales.md).

## Counting rules (summary)

A screen is **defined**, not used — a modal reused 12 times still counts
once.

- Every `app/**/page.{tsx,jsx,ts,js}` (and `pages/**/*` when Pages Router lands).
- Every component triggering **1 strong signal** or **2 weak signals**:
  - **Strong**: import from a known modal lib (Radix, Headless UI, MUI,
    Chakra, vaul, shadcn), or a JSX root with `role="dialog"` /
    `aria-modal="true"`.
  - **Weak**: name/file ends with `Modal`/`Dialog`/`Drawer`/`Sheet`/`Popup`/
    `Lightbox`/`Overlay`, or `createPortal` from `react-dom`.

Dynamic routes (`[id]`, `[...slug]`, `[[...slug]]`) and route groups
(`(group)`) each count once. Detail: see the devs guide.

## What does NOT count

- `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`,
  `template.tsx`, `default.tsx`, `route.ts`.
- `_app`, `_document`, `_error`, `api/*`.
- Parallel routes (`@slot`) and intercepted routes (`(.)foo`) — skipped
  with a warning, decision deferred.
- Components whose name or file ends with a default exclusion suffix:
  `Provider`, `Context`, `Wrapper`. So `LoginModalProvider` is **not**
  counted.

## Escape hatches

Two `data-screen-counter` attributes override the heuristic on the JSX
root:

```tsx
// Force exclusion — heuristic would have counted this.
return <div data-screen-counter="disable">…</div>;

// Force inclusion — hand-rolled modal the heuristic missed.
return <div data-screen-counter="screen">…</div>;
```

The exclusion suffix list still wins: `LoginModalProvider` with
`data-screen-counter="screen"` is still excluded.

## Environment variables

| Variable                            | Values                         | Default | Effect                                                  |
| ----------------------------------- | ------------------------------ | ------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_SCREEN_COUNTER_LIMIT`  | integer `>= 0`                 | `20`    | Default badge limit; threshold for amber/red colouring. |
| `NEXT_PUBLIC_SCREEN_COUNTER_SHOW`   | `auto` \| `always` \| `never`  | `auto`  | Visibility policy. `auto` = dev only.                   |

Both require the `NEXT_PUBLIC_` prefix so Next inlines them at build time.

## Compatibility

| What                | v1 status                                                              |
| ------------------- | ---------------------------------------------------------------------- |
| Next.js 15 / 16     | Supported (CI matrix).                                                 |
| Next.js ≤ 14        | Not supported.                                                         |
| App Router          | Supported.                                                             |
| Pages Router        | Not supported in v1 (stub seam in place — decision pending).            |
| Turbopack           | **Not supported in v1.** Plugin auto-disables with a warning. On Next 16 (Turbopack default) opt out with `next dev --webpack` / `next build --webpack`. Tracked as `SC-056`. |
| Node                | `>= 20`.                                                                |

## Versioning policy

We follow a pragmatic semver — **heuristic changes that lower counts are
MAJOR** because they invalidate already-quoted budgets. See
[`documentation/SEMVER.md`](../../documentation/SEMVER.md).

## Privacy

The package sends **no telemetry** — no usage data, no errors, no counts.

## License

`UNLICENSED` — pending license decision. The package is **not yet
published to npm**. See `documentation/preguntas-screen-counter.md §1`.

## Links

- Devs guide: [`documentation/guides/02-modo-plugin-devs.md`](../../documentation/guides/02-modo-plugin-devs.md)
- PM/sales guide: [`documentation/guides/01-modo-presupuesto-pm.md`](../../documentation/guides/01-modo-presupuesto-pm.md)
- Project plan & open questions: [`documentation/`](../../documentation/)
- Issues / discussions: <!-- TODO: link once the public repo is created -->

---

## Versión en español

`@beebit/screen-counter` cuenta las pantallas (rutas + modales) de un
proyecto Next.js. Sirve para dos cosas:

- **Modo presupuesto (CLI)**: `npx @beebit/screen-counter` genera un
  reporte auditable para anexar a presupuestos.
- **Modo demo (plugin + badge)**: un badge flotante "X/Y pantallas" que
  ves durante el desarrollo y, opcionalmente, en demos a cliente.

### Instalación

```bash
pnpm add -D @beebit/screen-counter
```

### Uso rápido — CLI

```bash
npx @beebit/screen-counter
```

```
@beebit/screen-counter — analyzing /ruta/a/tu-app
✓ 8 routes
✓ 9 modals (radix: 3, chakra: 1, forced: 1, headlessui: 1, mui: 1, role: 1, vaul: 1)
✓ 1 component excluded manually
─────────────────
  17 screens total
```

Exportar a JSON para presupuesto:

```bash
npx @beebit/screen-counter --json --out reports/screens.json
```

### Uso rápido — Plugin

```js
import { withScreenCounter } from '@beebit/screen-counter/plugin';

export default withScreenCounter({})({
  transpilePackages: ['@beebit/screen-counter'],
});
```

### Qué cuenta

- Cada `app/**/page.tsx`.
- Cada componente con **1 señal fuerte** o **2 señales débiles** (libs
  conocidas de modales, `role="dialog"`, sufijos `Modal`/`Dialog`/…,
  `createPortal`).
- Las rutas dinámicas y los grupos `(group)` cuentan **1** vez por
  definición, no por uso.

### Qué NO cuenta

- `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`,
  `template.tsx`, `default.tsx`, `route.ts`.
- `_app`, `_document`, `_error`, `api/*`.
- Componentes con sufijo `Provider`, `Context`, `Wrapper`
  (`LoginModalProvider` **no** cuenta).
- Componentes con `data-screen-counter="disable"` en su raíz JSX.

### Compatibilidad

Next 14 y 15 sobre webpack. **Turbopack no soportado en v1** — el
plugin se desactiva con un aviso. Node `>= 20`.

### Política de versionado

Semver pragmático: cualquier cambio que **baje el conteo** de proyectos
existentes es **MAJOR** porque rompe presupuestos cerrados. Detalles en
[`documentation/SEMVER.md`](../../documentation/SEMVER.md).

### Licencia

`UNLICENSED` mientras el equipo decide. No se publica en npm hasta entonces.

### Más documentación

- Guía para PM/ventas: [`documentation/guides/01-modo-presupuesto-pm.md`](../../documentation/guides/01-modo-presupuesto-pm.md)
- Guía para desarrolladores: [`documentation/guides/02-modo-plugin-devs.md`](../../documentation/guides/02-modo-plugin-devs.md)
