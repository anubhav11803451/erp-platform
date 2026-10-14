---
applyTo: "packages/db/**,packages/shared/**,packages/prisma-zod-v4/**"
---

# Database and shared-contract conventions

- Treat `packages/db/prisma/schema.prisma` as the database model source of truth. Follow its existing field naming and enum conventions, and use Prisma migrations for persisted schema changes rather than editing generated client files.
- `@erp/shared` is the cross-app contract boundary. Keep Zod schemas, inferred request payloads, shared response types, and enum exports there where both API and UI need them; avoid maintaining duplicate definitions in app packages.
- Backend code imports server-side Prisma types from `@erp/db/client`. Frontend code should prefer shared contracts and browser-safe exports; do not introduce imports of server-only Prisma client code into the browser bundle.
- The repository has a `@erp/prisma-zod-v4` generator package. Read its implementation and the active Prisma generator configuration before changing generator behavior or generated schema outputs; do not assume an output is generated unless the schema/configuration confirms it.
- Generated Prisma clients, package `dist` output, and generated source must not be edited by hand. Use the owning package scripts to regenerate them, and review any generated diff.
- Use the package-local formatting configuration. The shared/db packages use four-space indentation, single quotes, semicolons, a 100-column print width, and `es5` trailing commas.
- Useful commands from the repository root include `pnpm --filter @erp/shared build`, `pnpm --filter @erp/db generate`, `pnpm --filter @erp/db build`, `pnpm db:format`, and `pnpm db:migrate`. Database generation/migration commands require the repository's environment configuration; do not run migrations without the required database and task authorization.
- Read the full schema, package scripts, generator configuration, and affected shared schemas/types before changing cross-package contracts.
