---
name: erp-backend-engineering
description: Use for changes to the NestJS API, authentication, authorization, backend services, controller contracts, and persistence access in this ERP monorepo.
---

# ERP backend engineering

Before acting, read `.github/instructions/backend.instructions.md` and the complete target files with their relevant module, controller, service, DTO, guard, and test siblings. For coordinated feature delivery, also follow `.github/instructions/feature-delivery.instructions.md` and the approved feature record.

## Repository patterns

- Keep active NestJS code in `apps/backend/src` and follow the existing module boundaries (`auth`, `common`, `core`, `domains`, and `features`).
- Controllers own HTTP concerns; put application and database operations in injectable services. Use the injected `PrismaService`; map fields explicitly and preserve generated Prisma types.
- Keep shared runtime contracts in `packages/shared`. Wrap request and response schemas in backend DTO classes using `createZodDto` from `nestjs-zod/dto`. Use `@ZodResponse` for endpoint response serialization and documentation.
- Keep all DTOs for one active controller in one `<controller>-controller.dto.ts` file. Do not duplicate schema fields in DTOs or recreate shared request/response types in the backend.
- Keep active guards, strategies, and filters under `apps/backend/src/common/`; register providers in the owning Nest module and keep global filter setup in the application bootstrap.
- Preserve backend-enforced authentication, authorization, and tenant/data-ownership checks. A frontend route or visibility check is never the security boundary.
- Never return password hashes, refresh tokens, secrets, or other credential material. Surface failures through the established Nest exception/error handling; do not convert failures into success-shaped responses.
- Treat `apps/backend/legacy-reference/` as inactive reference. Do not route or modify it unless the assigned task explicitly includes that scope.

## Tests and validation

- Use the existing TypeScript Jest `*.spec.ts` setup for focused behavior and regression coverage. Prioritize authentication, authorization, tenant isolation, and persistence invariants affected by the change.
- Check the current package scripts and environment prerequisites before running tests or database commands. Do not apply migrations to an unintended database or run a database-backed check without explicit authorization.
- Prefer focused checks such as `pnpm --filter @erp/backend build` and `pnpm --filter @erp/backend test -- --runInBand <spec-path>`. The backend lint script applies `--fix`; inspect any diff it creates.
- Report exact commands and results. Do not claim that a build, test, migration, or runtime path passed unless it was actually run.

