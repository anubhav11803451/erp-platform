# API catalog

**Last reviewed:** 2026-10-29<br>
**Base prefix:** `/v1/api` ([`main.ts`](../../apps/backend/src/main.ts))<br>
**Scope:** controllers wired from `apps/backend/src`; legacy-reference controllers are not active routes.

The active Nest application has two controllers and five route handlers. The routes below preserve the controller-declared methods and paths. `Public` means there is no JWT guard on the handler; cookie/CSRF requirements are stated separately. No `ADMIN`/`STAFF` role guard is active in the current app.

| Method | Full path | Access / guard behavior | Behavior and source |
| --- | --- | --- | --- |
| POST | `/v1/api/auth/login` | No JWT guard; validates Platform Owner credentials. `ThrottlerGuard` is attached to this handler and `AuthModule` configures 5 requests per 60 seconds. | Issues access token and auth cookies — [`auth.controller.ts`](../../apps/backend/src/auth/auth.controller.ts), [`auth.module.ts`](../../apps/backend/src/auth/auth.module.ts), [`auth.service.ts`](../../apps/backend/src/auth/auth.service.ts). |
| POST | `/v1/api/auth/refresh` | No JWT guard; requires a valid refresh-token cookie and a matching CSRF cookie / `X-CSRF-Token` header. | Rotates persisted refresh session and returns a new access-token response — [`auth.controller.ts`](../../apps/backend/src/auth/auth.controller.ts), [`auth.service.ts`](../../apps/backend/src/auth/auth.service.ts). |
| POST | `/v1/api/auth/logout` | No JWT guard; requires matching CSRF cookie/header. A refresh cookie, if present, is used to revoke the session. | Revokes the matching session and clears cookies — [`auth.controller.ts`](../../apps/backend/src/auth/auth.controller.ts), [`auth.service.ts`](../../apps/backend/src/auth/auth.service.ts). |
| GET | `/v1/api/auth/me` | `PlatformOwnerJwtAuthGuard`; the Passport strategy validates the current persisted, unrevoked, unexpired session and active `PlatformOwnerGrant`. | Returns the authenticated Owner account summary — [`auth.controller.ts`](../../apps/backend/src/auth/auth.controller.ts), [`platform-owner-jwt-auth.guard.ts`](../../apps/backend/src/auth/guards/platform-owner-jwt-auth.guard.ts), [`platform-owner-jwt.strategy.ts`](../../apps/backend/src/auth/strategies/platform-owner-jwt.strategy.ts). |
| GET | `/v1/api/health` | Public; no controller guard. | Returns health status, timestamp, and uptime — [`health.controller.ts`](../../apps/backend/src/health.controller.ts). |

`AppModule` imports global configuration, `CoreModule`, and `AuthModule`, and mounts `HealthController`. `CoreModule` provides the shared `PrismaService`; `AuthModule` registers the throttler module and Platform Owner JWT strategy. Global Zod validation/serialization is configured in [`app.module.ts`](../../apps/backend/src/app.module.ts); the API prefix and middleware are configured in [`main.ts`](../../apps/backend/src/main.ts).

## Route/build boundary and inactive source

- The active application does not import institution, membership, invitation, user-management, student, guardian, batch, enrollment, payment, attendance, or dashboard controllers. No Institution or LegalEntity route is present.
- Older business controller/module source is retained under `apps/backend/legacy-reference/src/`; it is not wired by `AppModule` and is not included in this active-route table.
- There is a build configuration discrepancy: [`nest-cli.json`](../../apps/backend/nest-cli.json) selects `tsconfig.json`, while [`tsconfig.build.json`](../../apps/backend/tsconfig.build.json) contains exclusions for legacy-reference, tests, and specs. A read-only `tsc --project tsconfig.json --listFilesOnly` check listed legacy-reference files, current specs, and the e2e test source. The user reports `pnpm --filter @erp/backend run build-local` passed and `pnpm dev` returned HTTP 200 for backend health and Owner login. These results establish successful backend build/runtime behavior as reported; they do not establish that the legacy inputs were excluded. The config discrepancy remains.
- The frontend [`tsconfig.app.json`](../../apps/frontend/tsconfig.app.json) includes `src`; a read-only `tsc --project tsconfig.app.json --listFilesOnly` check listed inactive legacy business feature files. The user reports `pnpm --filter @erp/frontend exec vite build` passed. Vite bundling follows the active import graph, but this command does not run the full `build` script's `tsc -b` step; the user confirms the full frontend build/typecheck was not run. Thus frontend TypeScript inclusion and successful typecheck remain unresolved.
- Frontend RTK Query calls only the active auth endpoints in the active auth feature. The app also contains a static landing page and Owner placeholder; no institution setup request or demo-lead request is connected. See [`auth-api-slice.ts`](../../apps/frontend/src/features/auth/auth-api-slice.ts) and the [feature inventory](../product/feature-inventory.md).

## Request/data ownership and auth boundary

Platform Owner authority is represented by the presence of a `PlatformOwnerGrant` related to an `Account`; it is not an institution membership or a role selected by the browser. The JWT strategy loads the persisted `Session` and current Owner grant on each protected request. No active API currently accepts an Institution ID or returns institution-owned business data. The active routes therefore do not yet demonstrate institution-level data isolation.

`POST /auth/login` uses the shared `platformOwnerSignInSchema`; the current public shared response types are Platform Owner account/sign-in/logout responses. The active package exports no institution or LegalEntity request/response contract. See [`packages/shared/src/schemas.ts`](../../packages/shared/src/schemas.ts), [`packages/shared/src/schemas/auth.ts`](../../packages/shared/src/schemas/auth.ts), and [`packages/shared/src/types/index.ts`](../../packages/shared/src/types/index.ts).

## Coverage

| Area | Coverage |
| --- | --- |
| Controllers and handlers | 2 controllers, 5 route handlers in `apps/backend/src`. |
| Modules | `AppModule`, `AuthModule`, and `CoreModule`; no other active application module. |
| Auth/role metadata | Login throttle guard; Owner JWT guard on `/auth/me`; refresh/logout CSRF validation; no active role-decorator policy. |
| Missing onboarding APIs | Institution create/read, LegalEntity grouping, first-Admin invitation, invitation acceptance, and staff management are absent from active controllers. |
| Runtime/deployment | Route inventory is source-based. No deployed API, environment, database, or live migration state was checked. |
