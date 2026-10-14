---
applyTo: "apps/backend/**"
---

# Backend conventions

- Keep NestJS code in the existing `src/auth`, `src/common`, `src/core`, `src/domains`, and `src/features` boundaries. Keep controllers focused on HTTP concerns and put application/data operations in injectable services.
- Reuse the shared Zod schemas from `@erp/shared` for request contracts. Backend DTO classes are created with `createZodDto` from `nestjs-zod/dto`; global validation/serialization is configured in `AppModule`.
- Use the injected `PrismaService` for database access. Use the generated Prisma types from `@erp/db/client` where appropriate, and map input fields explicitly when needed rather than weakening types.
- Preserve the existing authentication and authorization flow: backend guards and `@Roles` declarations protect endpoints. Never rely on frontend permission filtering to authorize an operation.
- Do not return password hashes or other credential material. Keep secrets in environment configuration and handle authentication failures explicitly.
- Follow the backend ESLint and Prettier configuration: TypeScript, four-space indentation, single quotes, semicolons, 100-column print width, and trailing commas. Backend `lint` runs ESLint with `--fix`.
- Useful commands from the repository root: `pnpm --filter @erp/backend start:dev` and `pnpm --filter @erp/backend build`. Test scripts exist, but the currently tracked e2e spec is commented out; check for active tests before describing test coverage.
- Read the entire impacted files and relevant module, DTO, guard, and service siblings before changing behavior. Do not copy a neighboring defect merely for consistency.
