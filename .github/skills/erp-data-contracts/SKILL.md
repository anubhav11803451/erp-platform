---
name: erp-data-contracts
description: Use for Prisma persistence, migrations, relations, query access patterns, shared Zod contracts, inferred types, and the internal Prisma-Zod generator.
---

# ERP data contracts and persistence

Before acting, read `.github/instructions/data-contracts.instructions.md`, the complete active Prisma schema, relevant migrations and package scripts, generator configuration, and every affected shared/API/frontend consumer. For coordinated feature work, provide the design-only data handoff before architecture approval and follow the orchestrator's feature record.

## Repository patterns

- `packages/db/prisma/schema.prisma` is the persistence source of truth. Use its field naming, relation, constraint, and index conventions; create migrations with Prisma rather than hand-editing generated clients.
- `packages/shared` is the browser-safe cross-app contract boundary. Keep shared Zod request/response schemas and inferred TypeScript types together; frontend forms and RTK Query contracts should consume those exports.
- Prefer reusable canonical schemas and Zod composition (`.omit()`, `.pick()`, `.extend()`) over repeated object definitions. Keep validation semantics and wire shape stable unless the approved scope explicitly changes them. Use `.strict()` for request payloads when rejecting unknown fields is part of the contract.
- Keep the separation intact: shared schemas/types live in `@erp/shared`; NestJS DTO wrappers live in the relevant backend `<controller>-controller.dto.ts` file and use `createZodDto` from `nestjs-zod/dto`.
- Check the schema's actual `generator` block before assuming `packages/prisma-zod-v4` generates active contracts. The current schema uses the Prisma client generator; the internal Zod generator is separate unless the active configuration changes.
- Never edit generated Prisma clients, generated schema output, or package `dist` output by hand. Use owning package scripts and inspect generated diffs.
- For tenancy or authorization-sensitive persistence, read the latest approved architecture and feature record; distinguish LegalEntity grouping from the Institution tenant boundary only as those records currently approve. Never claim isolation from schema structure alone: trace server-derived ownership through queries and tests.
- Preserve error visibility, compatibility, nullability/cardinality guarantees, and transaction/integrity behavior. Do not add migration backfills, weaken constraints, or alter database topology without explicit approval.

## Design and verification

- Document affected entities/fields, cardinality, ownership, foreign-key and uniqueness rules, delete/update behavior, indexes, query shapes, migration/backfill/rollback, compatibility, and relevant tenant/privacy/performance risks.
- Check backend and frontend consumers before changing a shared contract. Prefer focused tests for meaningful validation, relation, tenant-isolation, and persistence invariants.
- Use package scripts from the repository root, for example `pnpm --filter @erp/shared build`, `pnpm --filter @erp/db build`, and focused backend tests. Check environment prerequisites before invoking Prisma commands.
- Do not run `pnpm db:migrate` or another database mutation without explicit authorization and confirmation of the intended disposable database. Do not read or expose secret environment values.
- Report exactly which packages, consumers, generated outputs, and validations changed or ran.

