# System overview

**Last reviewed:** 2026-11-02<br>
**Repository state:** `feature/institution-operations-staff-access` at HEAD `8facaab`; implementation source is uncommitted and unmerged. This snapshot does not establish deployment or release.<br>
**Scope:** active tracked frontend/backend source, workspace manifests/configuration, active Prisma schema and tracked migrations, shared-contract source/barrels, tests, and documented integration/deployment boundaries. No build, test, or database command was run for this review. Generated output, dependencies, and reusable UI primitives are excluded from business-feature counts.

## Runtime and package map

```mermaid
flowchart LR
    Browser[React/Vite browser app]
    Shared[packages/shared<br/>Zod schemas and inferred types]
    API[NestJS API<br/>/v1/api]
    DBPkg[packages/db<br/>Prisma schema/client]
    Generator[packages/prisma-zod-v4<br/>not selected by active schema]
    Postgres[(PostgreSQL)]

    Browser -->|RTK Query and invitation fetch| API
    Browser -. public contracts .-> Shared
    API --> Shared
    API --> DBPkg
    DBPkg --> Postgres
    Generator -. separate, inactive generator .-> Shared
```

| Workspace                | Active implementation and boundary                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/frontend`          | React/Vite SPA, file-derived routes, Redux/RTK Query, session state, and feature pages/components. Route source is `src/pages`; four active feature directories are `auth` (cross-cutting), `owner`, `institution-admin-invitation`, and `institution`. [`vite-plugin-file-routes.ts`](../../apps/frontend/vite-plugin-file-routes.ts) generates `src/router.generated.ts`; generated output is excluded from counts. |
| `apps/backend`           | NestJS application. [`AppModule`](../../apps/backend/src/app.module.ts) imports Core, Auth, Owner, and Institution Operations modules, and mounts `HealthController`. Active source has eight controller classes and 47 controller-declared handlers.                                                                                                                                                                 |
| `packages/db`            | Shared PostgreSQL Prisma schema, six tracked SQL migrations, Prisma client generation, and the PostgreSQL adapter used by [`PrismaService`](../../apps/backend/src/core/prisma.service.ts). The new Institution operations migration is present but unapplied.                                                                                                                                                        |
| `packages/shared`        | Active public Zod contracts and inferred types. The root barrel exports five schema modules; other business-schema files remain source but are not part of the active root exports.                                                                                                                                                                                                                                   |
| `packages/prisma-zod-v4` | A separate generator implementation. The active Prisma schema selects `prisma-client`, not this generator; package presence does not indicate generated public contracts.                                                                                                                                                                                                                                             |

## Request, identity, and persistence flow

- The frontend API base defaults to `http://localhost:3000/v1/api` and may be configured with `VITE_API_BASE_URL` ([`base-query.ts`](../../apps/frontend/src/api/base-query.ts)). RTK Query handles workspace auth and Owner directory/status calls; invitation continuation uses the active invitation client.
- The backend bootstrap applies Helmet, cookie parsing, configured CORS, the Prisma exception filter, `/v1/api`, and Swagger at `/v1/api/docs` ([`main.ts`](../../apps/backend/src/main.ts)). Global Zod validation and response serialization are configured in [`AppModule`](../../apps/backend/src/app.module.ts).
- CORS source contains `http://localhost:5173`, `https://erp-platform-frontend.vercel.app`, `https://erp-platform-frontend-anubhav11803451s-projects.vercel.app`, plus configured `CLIENT_URL` ([`main.ts`](../../apps/backend/src/main.ts)). Actual production origin/cookie topology is not established by this repository review. Auth and invitation routes additionally compare the request's exact Origin with configured `CLIENT_URL`.
- [`PrismaService`](../../apps/backend/src/core/prisma.service.ts) connects through `@prisma/adapter-pg` and `DATABASE_URL`. The active schema contains 16 identity/onboarding/operations models. It adds Institution-owned Groups, Students, Staff memberships/assignments, and daily Attendance; it does not define Guardian self-service, enrollment, payments, or external education integrations.
- One `/signin` UI and `POST /v1/api/auth/login` serve Platform Owner, approved Institution Admin, and Institution Staff sessions. The server derives identity from the Account identity and persisted Owner/Admin/Staff grant or membership. Invitation continuation uses an explicit login intent on the same endpoint and does not create a workspace session ([`AuthController`](../../apps/backend/src/auth/auth.controller.ts), [`AuthService`](../../apps/backend/src/auth/auth.service.ts), [`auth.ts`](../../packages/shared/src/schemas/auth.ts)).
- Owner provisioning is an out-of-band [`bootstrap:owner` command](../../apps/backend/src/commands/bootstrap-platform-owner.command.ts), not public sign-up. It requires the Account table to be empty and creates the Account plus Owner grant transactionally.
- A Platform Owner creates a coded LegalEntity, then separately creates an Institution and its addressed first-Admin invitation in one transaction ([`OwnerService`](../../apps/backend/src/owner/owner.service.ts)). The bearer is returned once in a URL fragment for manual sharing; active source has no invitation email delivery.
- A claimant may use an existing eligible account or establish a new account through the addressed first-Admin invitation. Claim records `PENDING_APPROVAL`, not membership. A separate Owner decision transaction grants the Institution Admin identity and membership on approval. Staff invitations are email-bound and manually shared; acceptance activates the Staff membership and selected groups but does not create a session.
- Admin and Staff operations controllers enforce membership guards and derive Institution scope server-side. Staff operations additionally recheck active group assignments. Composite constraints enforce same-Institution relations, but do not protect reads from an unscoped query; database-backed isolation/concurrency is unverified.
- `AuthModule` starts an in-process continuation cleanup service that sweeps hourly after startup and deletes unconsumed expired/revoked continuations after a 24-hour retention delay. Consumed continuation rows are excluded by its query; longer-term retention/cleanup policy is not established here.

## Active frontend journeys

There are **20 tracked page/layout source files** under `apps/frontend/src/pages`, yielding **15 route paths**:

| Path                      | Active source behavior                                                                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/`                       | Static marketing page (`pages/page.tsx`); demo CTAs have no active demo-submission API. Marketing claims are not evidence of delivered integrations or AI functionality. |
| `/signin`                 | Shared workspace sign-in (`pages/(auth)/signin/page.tsx`). Role-specific destination follows the backend-returned identity. Public registration is not exposed.          |
| `/owner`                  | Authenticated Platform Owner LegalEntity/Institution directory, Institution creation, first-Admin invitation, and claim review controls.                                 |
| `/institution`            | Authenticated Institution Admin account/Institution overview with profile, groups, roster, attendance, and Team navigation.                                              |
| `/institution/groups`     | Admin-managed Institution groups.                                                                                                                                        |
| `/institution/students`   | Admin-managed roster and group membership.                                                                                                                               |
| `/institution/attendance` | Admin daily attendance; unavailable until an Institution timezone is configured.                                                                                         |
| `/institution/profile`    | Admin Institution name and timezone settings.                                                                                                                            |
| `/institution/team`       | Admin Staff invitation, group assignment, and revocation workflow.                                                                                                       |
| `/staff`                  | Staff workspace context and assigned-group navigation.                                                                                                                   |
| `/staff/students`         | Staff roster view and limited updates within assigned groups.                                                                                                            |
| `/staff/attendance`       | Staff daily attendance within assigned groups.                                                                                                                           |
| `/invite/admin`           | Invitation bearer exchange, existing/new-account claim, claim-status resumption, and outcome states.                                                                     |
| `/invite/staff`           | Staff invitation context and acceptance; acceptance does not create a session.                                                                                           |
| `*`                       | Not-found page.                                                                                                                                                          |

The other five page-tree files are `_app.tsx` and the `(auth)`, `(app)`, Institution, and Staff layouts. Parenthesized groups are layout-only route groups; route generation behavior is defined in [`vite-plugin-file-routes.ts`](../../apps/frontend/vite-plugin-file-routes.ts). The active `src/features` tree has **4 feature directories** and 37 source files. `bug-report-form.tsx` is a standalone disconnected file, not a feature directory or routed capability. Reusable `src/components/ui` primitives are excluded.

## Backend, legacy source, and coverage boundary

The active Nest tree has **5 modules counting `AppModule`** (`AppModule`, `AuthModule`, `CoreModule`, `OwnerModule`, `InstitutionOperationsModule`), **8 controller classes**, and **47 handlers**. [`api-catalog.md`](api-catalog.md) lists every active controller route with method and access behavior.

`apps/backend/legacy-reference/` contains **43 retained files**, including eight old business controllers/modules for Batches, Guardians, Students, Users, Attendance, Dashboard, Enrollment, and Payments. `apps/frontend/legacy-reference/` contains **38 retained files**, including old business pages/features. They are excluded from active route/feature counts unless active imports or module wiring prove otherwise; current root `AppModule` does not import those legacy modules. The active tree's four feature directories are separate from these reference sources.

Count reconciliation inspected `apps/frontend/src/pages`, `src/features`, route generation/configuration and active imports; active backend modules/controllers/handlers and guard/strategy wiring; the full active Prisma schema and migration directory; shared source modules and public barrels; package/test/config files; and tracked Vercel/environment examples. `node_modules`, `dist`, generated Prisma client output, generated router output, and reusable UI primitives were excluded from source/business counts. The detailed feature-by-feature status and evidence are in [`docs/product/feature-inventory.md`](../product/feature-inventory.md).

## Integrations, deployment, tests, and unresolved facts

- Active persistence uses PostgreSQL. Repository configuration references `DATABASE_URL`, `CLIENT_URL`, `JWT_SECRET`, `BACKEND_PORT`, and frontend `VITE_API_BASE_URL`; cookie names and SameSite behavior have environment configuration. [`.env.example`](../../.env.example) contains placeholders only.
- [`apps/backend/vercel.json`](../../apps/backend/vercel.json) and [`apps/frontend/vercel.json`](../../apps/frontend/vercel.json) describe repository deployment build/rewrite configuration. They do not prove a deployment, its current source/version, environment, database, or release status.
- No active source/client or workspace dependency for external identity, email delivery, payment processing, SIS/LMS, or webhook integration was found. The landing page's AI/integration copy is not evidence that such a service is connected.
- Active backend test source has **17 unit `*.spec.ts` files / 84 `it`/`test` cases**. Two separate PostgreSQL integration specs contain **8 cases** and require a verified disposable database; the schema-routing prototype covers a fixed-schema topology, not shared-table isolation. `apps/backend/test/app.e2e-spec.ts` is commented out. The frontend declares no test script and has no test source in this scope.
- The feature-delivery record reports focused mocked Jest tests, source builds/type checks, Prisma validation/generation, scoped lint, and formatting. No shared-schema migration application, PostgreSQL concurrency validation, browser/mobile/accessibility acceptance, or live application test was performed. No database state was inspected.
- Migration application to any shared or production database, runtime configuration, deployment state, production rate-limit topology, external/proxy logging, backups, monitoring, operator recovery, customer use, geography, and regulatory requirements remain unverified. The feature record reports a local database with a removed migration recorded in its ledger; that database was not inspected here.
- The Institution operations/Staff source is uncommitted and unmerged on this feature branch. Source presence does not establish deployment, release, feature enablement, or user validation.

## Coverage summary

| Area                         | Audited source scope                                              | Reconciled count                                                                                              |
| ---------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Frontend routes/pages        | `apps/frontend/src/pages`, Vite route plugin/config               | 20 page/layout files; 15 paths                                                                                |
| Frontend feature directories | `apps/frontend/src/features` and active page imports              | 4 directories; 37 source files; standalone bug-report form excluded                                           |
| Backend routes/modules       | `apps/backend/src` controller/module wiring                       | 8 controller classes; 47 handlers; 5 modules including root                                                   |
| Legacy reference             | `apps/backend/legacy-reference`, `apps/frontend/legacy-reference` | 43 backend files; 38 frontend files; not active capability counts                                             |
| Active persistence           | `packages/db/prisma/schema.prisma`, migration tree                | 16 models; 5 enums; 33 explicit relation annotations; 6 SQL migrations (latest unapplied)                     |
| Shared contracts             | `packages/shared/src`, active root/schema barrels                 | 14 schema modules; 5 publicly re-exported modules; 81 exported inferred type aliases                          |
| Automated test source        | Backend Jest unit/integration specs and frontend package/scripts  | 17 unit spec files / 84 cases; 2 separate integration specs / 8 cases; commented e2e; no frontend test runner |
