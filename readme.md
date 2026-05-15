# screen-counter

Monorepo for **`@beebit/screen-counter`** — a tool to count screens (routes + modals) in a Next.js project.

Two modes:

- **CLI** (`npx @beebit/screen-counter`): auditable report of routes + modals for budgeting.
- **Plugin + badge**: live `X/Y screens` indicator embedded in dev and demo builds.

> Status: **WIP** — scaffold only. See planning docs (kept in `~/Escritorio/beebit/ideal-fruits/docs/screen-counter/` for now) for full scope.

## Structure

```
screen-counter/
├── packages/
│   └── screen-counter/    # publishable package
│       ├── src/
│       ├── package.json
│       └── tsup.config.ts
├── apps/
│   └── playground/        # Next.js app used as fixtures + live demo
│       ├── app/
│       └── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── package.json
```

## Requirements

- Node `>= 20`
- pnpm `>= 9`

## Quick start

```bash
pnpm install

# Build the package in watch mode (terminal 1)
pnpm dev:package

# Start the playground (terminal 2)
pnpm dev:playground
```

`apps/playground` consumes `@beebit/screen-counter` via `workspace:*` (symlink). No publishing needed during development.

## Scripts (root)

| Script                | What it does                              |
| --------------------- | ----------------------------------------- |
| `pnpm build`          | Build all publishable packages            |
| `pnpm dev`            | Watch packages + run apps in parallel     |
| `pnpm dev:package`    | Watch-build only `@beebit/screen-counter` |
| `pnpm dev:playground` | Run the Next.js playground                |
| `pnpm typecheck`      | TypeScript check across all packages      |
| `pnpm format`         | Prettier write                            |
| `pnpm format:check`   | Prettier check (CI)                       |
| `pnpm clean`          | Delete `dist`, `.next`, `.turbo`          |

## License

UNLICENSED — license decision pending (see planning docs §1).
