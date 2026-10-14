# ERP Backend

NestJS API for the ERP platform. The backend uses Prisma through `@erp/db`, shared Zod contracts from `@erp/shared`, and module boundaries for authentication, domains, and application features.

## Development

Run these commands from the repository root:

```sh
pnpm --filter @erp/backend start:dev
pnpm --filter @erp/backend build
pnpm --filter @erp/backend start:prod
```

The API defaults to port `3000` and uses the `/v1/api` prefix. Swagger is configured by the application bootstrap. The root `.env` must provide the database URL and client URL; authentication configuration also uses a JWT secret. Do not commit environment files or secrets.

## Validation

```sh
pnpm --filter @erp/backend lint
```

The `lint` script runs ESLint with `--fix`, so inspect its changes. Test scripts are present. Tracked active backend Jest coverage currently consists of `src/auth/auth.service.spec.ts` (3 test cases); `test/app.e2e-spec.ts` remains commented out. On 2026-10-14, the user reported a passing focused Jest run (1 suite, 3 tests), successful manual verification, and backend build/deployment on another laptop; deployment environment/version were not supplied, and those actions were not independently verified in this audit.

## Project conventions

- Controllers define HTTP routes and delegate operations to services.
- Domain modules live under `src/domains`; cross-domain features live under `src/features`; shared guards, decorators, filters, and Prisma access live under `src/common` and `src/core`.
- Request DTOs wrap shared Zod schemas with `createZodDto`. Keep cross-app request and response contracts in `packages/shared`.
- Protect API operations with backend guards and role metadata. Frontend permission checks do not authorize API access.
- Read the repository-wide and backend-specific Copilot guidance in the root README before making changes.
