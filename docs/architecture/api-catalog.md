# API catalog

**Last reviewed:** 2026-11-02<br>
**Base prefix:** `/v1/api` ([`main.ts`](../../apps/backend/src/main.ts))<br>
**Source state:** `review/delivered-feature-portfolio` at merge commit `ac672771194f7c96892ba73ff56d4b1ba8ad684d`. Route inventory is source-based; no API runtime was started for this review.

The active Nest application wires four controllers with 18 controller-declared route handlers. Methods and paths below combine each controller decorator with the global prefix. Swagger is configured separately at `/v1/api/docs` and is not included in the controller-handler count.

## Active routes

| Method | Full path | Access behavior implemented in source |
| --- | --- | --- |
| `POST` | `/v1/api/auth/login` | No JWT guard; throttled. Requires exact configured `Origin`. Workspace intent verifies an eligible account and creates a session. Invitation intent also requires the continuation CSRF cookie/header and returns a continuation, not a workspace session. |
| `POST` | `/v1/api/auth/refresh` | No JWT guard; throttled. Requires exact `Origin`, matching CSRF cookie/header, and refresh cookie; rotates the persisted session. |
| `POST` | `/v1/api/auth/logout` | No JWT guard; throttled. If an auth context cookie is present, requires exact `Origin` and matching context CSRF; rejects simultaneous workspace and continuation contexts. Revokes/clears the corresponding context. |
| `GET` | `/v1/api/auth/me` | `AccountSessionJwtAuthGuard`; requires a valid bearer access token backed by a current persisted session. Returns current account identity derived from persisted state. |
| `POST` | `/v1/api/auth/invitations/exchange` | No JWT guard; throttled; exact `Origin`. Exchanges the one-time invitation bearer for an HttpOnly continuation context. |
| `POST` | `/v1/api/auth/invitations/resume` | No JWT guard; throttled; exact `Origin`; continuation cookie required by service. |
| `POST` | `/v1/api/auth/invitations/claim` | No JWT guard; throttled; exact `Origin`; continuation cookie and CSRF header required and verified against the continuation's stored CSRF hash. Existing eligible account claim. |
| `POST` | `/v1/api/auth/invitations/claim/new-account` | No JWT guard; throttled; exact `Origin`; continuation cookie and CSRF validation. Establishes an unassigned account and submits its claim. |
| `POST` | `/v1/api/auth/invitations/status` | No JWT guard; throttled; exact `Origin`; separate status-only HttpOnly credential cookie required by service. |
| `GET` | `/v1/api/owner/legal-entities` | Class-level `PlatformOwnerJwtAuthGuard`; current Platform Owner session/identity/grant required. |
| `POST` | `/v1/api/owner/legal-entities` | Class-level `PlatformOwnerJwtAuthGuard`; unsafe-method Origin and double-submit CSRF validation. Creates one LegalEntity. |
| `POST` | `/v1/api/owner/legal-entities/:legalEntityId/institutions` | Platform Owner guard, throttled, security headers; creates an Institution and addressed invitation transactionally. |
| `GET` | `/v1/api/owner/legal-entities/institutions/:institutionId/admin-invitation` | Platform Owner guard, throttled, security headers; reads latest first-Admin invitation status. |
| `GET` | `/v1/api/owner/legal-entities/institutions/:institutionId/admin-invitation/claims` | Platform Owner guard, throttled, security headers; reads pending first-Admin claims. |
| `POST` | `/v1/api/owner/legal-entities/institutions/:institutionId/admin-invitations/:invitationId/decision` | Platform Owner guard (including unsafe-method Origin/CSRF), throttled, security headers; approves, rejects, or revokes the addressed claim. Approval grants the fixed membership but does not issue a session. |
| `POST` | `/v1/api/owner/legal-entities/institutions/:institutionId/admin-invitations/:invitationId/revoke` | Platform Owner guard (including unsafe-method Origin/CSRF), throttled, security headers; revokes an unclaimed invitation. |
| `POST` | `/v1/api/owner/legal-entities/institutions/:institutionId/admin-invitations/:invitationId/replace` | Platform Owner guard (including unsafe-method Origin/CSRF), throttled, security headers; explicitly replaces/reissues an invitation. |
| `GET` | `/v1/api/health` | Public; no JWT or role guard. Returns health status, timestamp, and uptime. |

Controller declarations and service ownership: [`AuthController`](../../apps/backend/src/auth/auth.controller.ts), [`InstitutionAdminInvitationController`](../../apps/backend/src/auth/institution-admin-invitation.controller.ts), [`OwnerController`](../../apps/backend/src/owner/owner.controller.ts), and [`HealthController`](../../apps/backend/src/health/health.controller.ts). The global prefix, CORS, cookie parser, security headers, and Swagger setup are in [`main.ts`](../../apps/backend/src/main.ts).

## Modules, identity, and authorization boundary

- Active modules are root `AppModule`, `AuthModule`, `CoreModule`, and `OwnerModule`. `AuthModule` configures a five-request/60-second throttler and registers the account-session, Owner, and Institution Admin guards/strategies. `OwnerModule` mounts the Owner controller; `AppModule` mounts the public health controller.
- There is no active `@Roles` policy/decorator declaration in `apps/backend/src`. Authorization is enforced by guards: Owner routes use `PlatformOwnerJwtAuthGuard`, which checks current account-session validity, `PLATFORM_OWNER` identity, and a persisted `PlatformOwnerGrant`; unsafe methods also check exact `Origin` and matching CSRF cookie/header ([guard](../../apps/backend/src/common/guards/platform-owner-jwt-auth.guard.ts)).
- `InstitutionAdminJwtAuthGuard` checks `INSTITUTION_ADMIN` identity and current membership, then attaches the server-derived Institution ID. It is registered by `AuthModule` but no active business controller applies it. UI `Access` and role-based navigation in `apps/frontend/src/config/permissions.ts` are visibility controls, not API authorization.
- `/auth/me` is protected by `AccountSessionJwtAuthGuard`, then resolves the current identity. The account-session strategy checks the access-token subject/session pairing and current session expiry/revocation; Owner/Admin privileges are then read from current persisted identity/grant/membership state.
- Invitation controllers do not use workspace JWT guards. They use exact-Origin checks, throttling, one-purpose cookies, service-level token/CSRF checks, and security response headers as described per handler.
- No active route accepts an Institution-selected client role or exposes operational Student/Guardian/Batch/Enrollment/Attendance/Payment data. No institution-scoped operational isolation is demonstrated by the active routes.

## Contracts, validation, and inactive source

The active public root `@erp/shared` barrel exports schemas from `auth`, `health`, `institution-admin-onboarding`, and `institution-onboarding`; those modules define 48 exported inferred TypeScript type aliases in total. Backend DTOs use the shared Zod schemas and `AppModule` installs global Zod validation/serialization. The shared contract source and active barrel are cataloged in [`data-model.md`](data-model.md).

Business controllers/modules retained in `apps/backend/legacy-reference/` are not imported by the active `AppModule` and are excluded from these routes. The separate active Prisma schema does not contain operational business models for those retained workflows.

## Coverage and execution status

| Area | Coverage |
| --- | --- |
| Active controllers/handlers | 4 controllers, 18 controller-declared handlers in `apps/backend/src`. |
| Active modules | `AppModule`, `AuthModule`, `CoreModule`, `OwnerModule`. |
| Auth/role policy | Current Account session, Owner grant, and Institution Admin membership guards; no `@Roles` policy found. |
| Throttling | Module configured to 5 requests/60 seconds; guards are attached at handler level, not to every route. |
| Unavailable operations | Staff/tutor management, student/family self-service, education operations, payment processing, email delivery, and external education integrations have no active controller route. |
| Legacy boundary | Eight legacy business controllers/modules are retained but inactive. |
| Runtime/deployment | No build, tests, live database, or runtime/API request was performed for this architecture review. Prior disposable migration/integration and isolated browser results are recorded in the feature-delivery record and are not represented as newly run. |
