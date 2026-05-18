# screen-counter (monorepo)

[![CI](https://img.shields.io/badge/CI-pending-lightgrey)](#)
[![license](https://img.shields.io/badge/license-UNLICENSED-red)](#license)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](#requirements)

Monorepo for **`@beebit/screen-counter`** — a tool that counts screens
(routes + modals) in a Next.js project. Two consumption modes:

- **CLI**: `npx @beebit/screen-counter` — an auditable report for budgeting.
- **Plugin + badge**: a live `X/Y screens` indicator embedded in dev and
  demo builds.

> **Status**: scaffold + analyzer + CLI + plugin + badge implemented and
> tested. Not yet published to npm (license decision pending). See
> [`documentation/plan-screen-counter.md`](./documentation/plan-screen-counter.md)
> for the full roadmap (`SC-001` … `SC-113`) and
> [`documentation/progreso-screen-counter.md`](./documentation/progreso-screen-counter.md)
> for what's done.

## What lives where

| Path                                                 | Purpose                                                          |
| ---------------------------------------------------- | ---------------------------------------------------------------- |
| [`packages/screen-counter`](./packages/screen-counter) | The publishable package: analyzer, CLI, plugin, badge.         |
| [`apps/playground`](./apps/playground)                 | Next.js 15 fixtures + live demo of the badge.                  |
| [`e2e`](./e2e)                                         | Playwright suite — out of the workspace by design (see dev note 07). |
| [`documentation`](./documentation)                     | Spec, plan, open questions, dev notes, guides, SEMVER policy.  |
| [`vitest.config.ts`](./vitest.config.ts)               | Single workspace-wide vitest config.                           |
| [`eslint.config.mjs`](./eslint.config.mjs)             | Flat ESLint config shared by every package.                    |

## Requirements

- Node `>= 20`
- pnpm `>= 9`

## Quick start

```bash
pnpm install

# Build the package
pnpm build

# Type-check everything (requires `pnpm build` first — see dev note 00)
pnpm typecheck

# Run the unit + CLI E2E suite
pnpm test

# Live dev loop: watch-build the package + run the playground on :3000
pnpm dev
```

`apps/playground` depends on `@beebit/screen-counter` via `workspace:*`
(symlink). Nothing is published during development.

## Scripts (root)

| Script                       | What it does                                                              |
| ---------------------------- | ------------------------------------------------------------------------- |
| `pnpm build`                 | Build all publishable packages (`tsup`).                                  |
| `pnpm dev`                   | Watch-build the package + run the playground in parallel.                 |
| `pnpm dev:package`           | Watch-build only `@beebit/screen-counter`.                                |
| `pnpm dev:playground`        | Run the Next.js playground on :3000.                                      |
| `pnpm lint`                  | ESLint workspace-wide, `--max-warnings 0`.                                |
| `pnpm typecheck`             | TypeScript across all packages.                                           |
| `pnpm format` / `format:check` | Prettier.                                                               |
| `pnpm test`                  | Vitest single run (unit + CLI E2E).                                       |
| `pnpm test:watch`            | Vitest watch.                                                             |
| `pnpm test:cov`              | Vitest + v8 coverage + threshold check.                                   |
| `pnpm test:snapshot:update`  | Regenerate the playground integration snapshot. **Use sparingly.**        |
| `pnpm e2e:install`           | Install Playwright deps inside `e2e/` (separate, non-workspace install).  |
| `pnpm test:e2e`              | Playwright across the five projects defined in `e2e/playwright.config.ts`. |
| `pnpm clean`                 | Delete `dist`, `.next`, `.turbo`, `coverage`.                             |

## Project documentation

- [`documentation/proyecto-screen-counter.md`](./documentation/proyecto-screen-counter.md) — full spec.
- [`documentation/resumen-screen-counter.md`](./documentation/resumen-screen-counter.md) — readable summary.
- [`documentation/preguntas-screen-counter.md`](./documentation/preguntas-screen-counter.md) — open questions, several still blocking.
- [`documentation/plan-screen-counter.md`](./documentation/plan-screen-counter.md) — 75 tasks across 12 epics.
- [`documentation/entregables-screen-counter.md`](./documentation/entregables-screen-counter.md) — deliverables.
- [`documentation/SEMVER.md`](./documentation/SEMVER.md) — versioning policy.
- [`documentation/dev-notes/`](./documentation/dev-notes/) — frozen design decisions per epic.
- [`documentation/guides/`](./documentation/guides/) — usage guides for PM/sales and devs.

## License

`UNLICENSED` — pending decision (see
[`documentation/preguntas-screen-counter.md §1`](./documentation/preguntas-screen-counter.md)).
The repo is public, but no license file means **all rights reserved by
default**. Not yet published to npm.

`CONTRIBUTING.md` and `CODE_OF_CONDUCT.md` will land once the license is
chosen.

---

## Versión en español

Monorepo de **`@beebit/screen-counter`** — un paquete que cuenta las
pantallas de un proyecto Next.js (rutas + modales). Dos modos:

- **CLI** para presupuestar (`npx @beebit/screen-counter`).
- **Plugin + badge** para enseñar el conteo en vivo durante dev y demos.

### Estado

Scaffold + analizador + CLI + plugin + badge implementados y testeados.
Pendiente publicar a npm (decisión de licencia abierta). Roadmap completo
en [`documentation/plan-screen-counter.md`](./documentation/plan-screen-counter.md).

### Estructura

| Carpeta                  | Qué hay dentro                                              |
| ------------------------ | ----------------------------------------------------------- |
| `packages/screen-counter` | El paquete publicable (analyzer, CLI, plugin, badge).      |
| `apps/playground`        | Next.js 15 con fixtures + demo viva del badge.              |
| `e2e`                    | Playwright (fuera del workspace, ver dev note 07).          |
| `documentation`          | Spec, plan, preguntas, dev notes, guías, política semver.   |

### Quick start

```bash
pnpm install
pnpm build
pnpm test
pnpm dev   # watch-build paquete + playground en :3000
```

### Documentación

- Guía PM/ventas: [`documentation/guides/01-modo-presupuesto-pm.md`](./documentation/guides/01-modo-presupuesto-pm.md).
- Guía devs: [`documentation/guides/02-modo-plugin-devs.md`](./documentation/guides/02-modo-plugin-devs.md).
- Resumen ejecutivo: [`documentation/resumen-screen-counter.md`](./documentation/resumen-screen-counter.md).

### Licencia

`UNLICENSED` mientras el equipo decide. Sin `LICENSE` el repo se entiende
como "todos los derechos reservados". No publicado en npm.
