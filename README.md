# Educational ERP Platform

A modular ERP platform for educational institutions, maintained as a pnpm TypeScript monorepo.

## Workspace

| Path | Purpose |
| --- | --- |
| `apps/backend` | NestJS API, authentication, domain modules, and feature services |
| `apps/frontend` | React, Vite, and Redux Toolkit web application |
| `packages/db` | Prisma schema, migrations, generated client, and database package |
| `packages/shared` | Shared Zod schemas, inferred payloads, types, and enums |
| `packages/prisma-zod-v4` | Internal Prisma-to-Zod generator |

## Prerequisites and setup

- Node.js `>=20.19.0`
- pnpm `10.18.3` (the version specified by `packageManager`)
- PostgreSQL for database-backed development

Install dependencies from the repository root:

```sh
pnpm install
```

Create a root `.env` with the required local configuration. At minimum, the backend reads `DATABASE_URL` and `CLIENT_URL`; authentication also uses `JWT_SECRET`. Keep real secrets out of source control. Generate the Prisma client and apply local migrations when a database is configured:

```sh
pnpm db:generate
pnpm db:migrate
```

Start the backend and frontend together with `pnpm dev`, or start them separately with `pnpm dev:backend` and `pnpm dev:frontend`. The API defaults to port `3000` with the `/v1/api` prefix; Vite defaults to port `5173`.

## Common commands

| Command | Purpose |
| --- | --- |
| `pnpm build` | Build all workspace packages |
| `pnpm --filter @erp/backend build` | Build the backend and its package prerequisites |
| `pnpm --filter @erp/frontend build` | Type-check and build the frontend |
| `pnpm --filter @erp/frontend lint` | Lint frontend files |
| `pnpm --filter @erp/frontend prettier-check` | Check frontend formatting |
| `pnpm db:format` | Format the Prisma schema |

The backend lint script applies ESLint fixes (`--fix`). Review its diff if you run it. Current automated test setup is limited: the tracked backend e2e spec is commented out and the frontend has no test script.

## Copilot repository guidance

- General conventions: [`.github/copilot-instructions.md`](.github/copilot-instructions.md)
- Scoped backend, frontend, and data/shared-package instructions: [`.github/instructions/`](.github/instructions/)
- Main product/feature entry point and specialized implementation, architecture, data-contracts, UI/UX design, and product-strategy agents: [`.github/agents/`](.github/agents/)
- Current architecture, feature inventory, workflows, bug triage, and roadmap: [`docs/`](docs/)

Start whole-product reviews and coordinated feature work with the [Feature Delivery Orchestrator](.github/agents/feature-delivery-orchestrator.agent.md). Use the [feature-delivery workflow](docs/product/feature-delivery/README.md), read applicable scoped instructions, and keep package boundaries in mind when changing API contracts or persisted data.
