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

## Vercel Preview testing

The repository has separate Vercel configurations for `apps/frontend` and `apps/backend`. Configure the two Vercel projects with those respective root directories, and confirm `dev` is not configured as the Production Branch before using it for testing. A `dev` deployment should use Preview settings and a dedicated non-production database.

Use branch-specific Preview variables for the `dev` branch:

- **Backend project:** `DATABASE_URL` using Prisma Postgres's pooled endpoint for application traffic, a Preview-only `JWT_SECRET`, `CLIENT_URL` set to the frontend's stable `dev` Preview origin, and `INSTITUTION_ADMIN_COOKIE_SAME_SITE` selected for the deployed origin/cookie topology.
- **Backend project, only while running migrations/bootstrap:** `DIRECT_URL` using Prisma Postgres's direct endpoint. Keep the deployed application's `DATABASE_URL` pooled. Preserve the provider's `sslmode=require` query option in both URLs.
- **Frontend project:** `VITE_API_BASE_URL` set to the backend's stable `dev` Preview URL followed by `/v1/api`.
- **Backend project, only while provisioning:** `PLATFORM_OWNER_EMAIL` and `PLATFORM_OWNER_PASSWORD` for a dedicated test Owner. These are not used by normal sign-in.

Apply the reviewed Prisma migrations to the dedicated Preview database before provisioning an Owner. From the linked backend project directory, pull the Preview variables for `dev` to a new temporary file. The file contains secrets, so restrict its permissions, do not print or commit it, and remove it when finished:

```sh
umask 077
vercel env pull /tmp/erp-platform-preview.env --environment=preview --git-branch=dev
```

Check the target's migration status first:

```sh
pnpm --filter @erp/db exec dotenv -e /tmp/erp-platform-preview.env -- \
    sh -c 'DATABASE_URL="$DIRECT_URL" prisma migrate status'
```

Only if that reports pending migrations, apply them and check the status again:

```sh
pnpm --filter @erp/db exec dotenv -e /tmp/erp-platform-preview.env -- \
    sh -c 'DATABASE_URL="$DIRECT_URL" prisma migrate deploy'
pnpm --filter @erp/db exec dotenv -e /tmp/erp-platform-preview.env -- \
    sh -c 'DATABASE_URL="$DIRECT_URL" prisma migrate status'
```

The bootstrap runs the compiled command. If the current checkout has not been built yet, run `pnpm --filter @erp/backend build` from the workspace before proceeding. Then create the Owner once. This invokes the compiled command directly so the repository's local `.env` wrapper cannot change the selected Preview database:

```sh
pnpm --filter @erp/backend exec dotenv -e /tmp/erp-platform-preview.env -- \
    sh -c 'DATABASE_URL="$DIRECT_URL" node dist/src/commands/bootstrap-platform-owner.command.js'
```

The bootstrap refuses to proceed unless the database's Account table is empty. It is not part of the Vercel build or deployment command and must not be added to an automatic deployment step. After it succeeds, remove the temporary file and the temporary `DIRECT_URL`, `PLATFORM_OWNER_EMAIL`, and `PLATFORM_OWNER_PASSWORD` Preview variables, then redeploy that project; the created account remains available for `/signin`. Never point this procedure at a production database.

Vercel environment changes apply to new deployments, so redeploy after changing Preview settings. Keep the frontend API URL and backend client origin aligned with the stable branch Preview URLs; review the cookie SameSite setting against the actual deployed domains before testing sign-in.

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
