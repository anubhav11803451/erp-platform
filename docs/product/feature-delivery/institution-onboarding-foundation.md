# Institution onboarding foundation

- **ID:** `institution-onboarding-foundation`
- **Status:** implementation
- **Last updated:** 2026-10-28
- **Orchestrator:** Feature Delivery Orchestrator
- **Repository branch:** `feature/tenant-isolation-foundation`
- **Related issue/PR:** None

## Lifecycle and approvals

| Gate | Status | Decision / approver / date | Evidence or conditions |
|---|---|---|---|
| Product scope and priority | complete | User approved onboarding-first MVP; 2026-10-28 | Platform Owner creates institutions, shares first-Admin links; institution Admin manages staff. Business workflows follow in separate slices. |
| UI/UX design direction | complete | User approved design, retaining LegalEntity grouping; 2026-10-28 | Separate Owner, invitation-acceptance, and Institution Admin areas. Static review only; no browser, accessibility-tool, or user testing. |
| Architecture direction | complete | User approved the decisions below; 2026-10-28 | Shared schema, one institution/account, unified login mechanism with distinct Owner grant, bearer invitation links, no MVP RLS, legacy APIs inactive. |
| Implementation plan | complete | User approved the staged fresh-start plan; 2026-10-28 | Reset and small UI-testable slices are authorized within the stated boundaries. |
| Merge authorization | pending | | User directed that local commit `7080737` remain untouched; no additional commit or merge is authorized. |
| Deployment/release authorization | pending | | No deployment or release requested. |

## 1. Product discovery

- **Stage status:** complete
- **Target users / jobs-to-be-done:** A Platform Owner establishes institutions; an Institution Admin joins through a manually shared link and manages institution staff.
- **Problem and evidence:** Earlier onboarding/authentication designs introduced multiple privileged identity paths and per-institution schema provisioning. The user chose a simpler onboarding-first MVP. This is a product decision, not validated customer research.
- **Current product behavior and source links:** The prior implementation contains legacy auth and business APIs plus gated control/provisioning work. Current repository source presence does not establish deployment or enablement. See the prior record `tenant-isolation-foundation.md`; its uncommitted changes are in the authorized reset scope.
- **Options brainstormed:** Separate per-institution schemas and provisioning worker; shared schema with institution-scoped rows.
- **Ranked recommendation and trade-offs:** Use one shared schema and keep Platform Owner permissions separate from institution membership. This removes schema-provisioning machinery but makes server-derived institution scoping and tenant-aware constraints mandatory.
- **In scope:** Fresh onboarding foundation; password-only access; Platform Owner institution setup; first-Admin invitation; Admin-managed staff invitations, role assignment, and revocation; LegalEntity grouping metadata.
- **Out of scope:** Email delivery/verification; student, guardian, group, enrollment, attendance, payment, and dashboard workflows until separately delivered; tenant-data access or impersonation by Platform Owner; active legacy business APIs.
- **Functional outcomes / acceptance criteria:** Each slice builds and can be exercised through the UI. Tenant authorization is enforced by the backend, uses current active membership, and cannot be selected by a client-supplied institution ID. Invitation acceptance creates membership only for its fixed institution and role. Revocation blocks further tenant access. The last active Institution Admin cannot be revoked.
- **Dependencies, risks, unknowns, and validation questions:** Manual links are bearer credentials and do not verify recipient identity. Existing-account acceptance details and operational recovery procedures must be decided before the relevant slice. RLS is deferred; focused isolation tests and server-side checks remain required.
- **Success measures:** TBD; no product baseline or user study is available.
- **Agent handoff:** Product Strategist -> user for product scope decision.
- **User decision and date:** Onboarding-first scope and staged delivery approved; 2026-10-28.

## 2. UI/UX design

- **Stage status:** complete
- **Applicability:** User-facing change.
- **Target persona and primary task:** Platform Owner establishes an institution and shares an Admin link; invitee accepts; Institution Admin manages staff.
- **User flow and navigation/information architecture:** Separate Platform Owner, public invitation acceptance, and Institution Admin areas. A cold invitation link must work without first completing ordinary authenticated app refresh.
- **Screen layout and content hierarchy:** Follow existing page-group/layout conventions and shadcn/ui components; show institution setup and result, copyable invitation links, acceptance states, and a staff access roster.
- **Component mapping:** Reuse existing shadcn/ui components and CSS-variable tokens. No new UI dependency or global theme change is approved.
- **Interaction/state matrix:** Include loading, empty, invalid/expired/revoked link, error, success, disabled, permission, and revocation-confirmation states where applicable.
- **Responsive behavior:** Mobile, tablet, and desktop support; verify dense staff-roster behavior during implementation.
- **Accessibility/keyboard requirements:** Semantic forms and labels, keyboard navigation, visible focus, and accessible status/error feedback.
- **Microcopy/content and acceptance criteria:** Make the bearer-link limitation clear where links are created/shared. Do not claim recipient identity verification.
- **Evidence method and limitations:** Static source/design review only; no browser inspection, automated accessibility checks, or user testing.
- **Frontend feasibility review:** No hard component blocker found. Replace legacy `/signin` assumptions and avoid ordinary auth refresh blocking cold invitation links.
- **Agent handoff:** UI/UX Designer -> Frontend Engineer and Architecture Analyst -> user.
- **User decision and date:** Design approved with LegalEntity grouping retained; 2026-10-28.

## 3. Architecture review

- **Stage status:** complete
- **Approved product scope link / section:** This record, Section 1.
- **Approved UI/UX design link / section:** This record, Section 2; retain LegalEntity grouping.
- **Affected frontend, API, shared contracts, persistence, and integrations:** Backend identity/authorization, institution and membership persistence, shared Zod contracts, and Owner/invitation/Admin frontend routes. No email integration.
- **Data/security/privacy/tenancy/operations considerations:** Server derives institution scope from active membership. Platform Owner has a separate platform grant, no institution membership, and no operational tenant-data access. Hash invitation tokens at rest; do not log bearer tokens.
- **Options and trade-offs:** Shared schema with `institution_id` versus per-institution schemas. Shared schema is simpler for MVP and eliminates schema routing and migration workers, at the cost of requiring strict scoped data access and constraints.
- **Recommended design and source evidence:** One shared Prisma schema. `Institution` is the authorization boundary; `LegalEntity` is grouping metadata only. Each account belongs to one Institution. Use one password/session mechanism with distinct platform and institution grants.
- **Migrations, compatibility, dependencies, and rollback considerations:** Remove legacy schema families and migrations; establish a clean schema baseline for approved slices. Do not operate on any existing database. Keep legacy business source only as inactive reference and keep its APIs out of active routing/builds until rebuilt.
- **Database/data-contract design:** Slice 1 establishes only `Account`, `PlatformOwnerGrant`, and `Session`; it does not create Institution, LegalEntity, membership, invitation, or operational models. `Account.email` is globally unique; `password_hash` is the only credential field. `PlatformOwnerGrant.account_id` is both its primary key and a cascading one-to-one FK to Account, so grant presence conveys platform-owner authority without a tenant membership or legacy ADMIN/STAFF role. `Session` stores a unique refresh-token hash, required account FK with cascade delete, creation/expiry timestamps, and nullable revocation timestamp. Indexes support unique token-hash lookup, account-scoped session operations/FK deletes, and expiry-based retention cleanup. No user-agent/IP data is retained. The anticipated access pattern is lookup by unique token hash followed by account and grant reads; session revocation updates the matched row, while grant revocation is deletion of the grant row. There are no joins or tenant filters in this slice.
- **Open architecture questions:** Define existing-account invitation acceptance and controlled account recovery before implementing those flows. No open decision changes the approved topology.
- **Agent handoff:** Data Contracts Engineer and Architecture Analyst -> user for architecture decision.
- **User decision and date:** Approved: shared schema; one institution per account; one login/session mechanism with a distinct Platform Owner grant; controlled bootstrap/recovery; one-time hashed/revocable invitation links with seven-day expiry; link possession is acceptance authority, not identity proof; defer PostgreSQL RLS; protect the last active Admin; inactive legacy business APIs. 2026-10-28.

## 4. Implementation plan

- **Stage status:** complete
- **Approved architecture link / section:** This record, Section 3.
- **Acceptance criteria:** Complete each ordered slice through backend, persistence/contracts, and UI as applicable; preserve buildability; report focused validation and residual risks before moving to the next slice.
- **Sequenced work slices:**

| Order | Owner profile | Scope / files or packages | Depends on | Validation |
|---|---|---|---|---|
| 1 | Orchestrator with Data, Backend, and Frontend Engineers | Controlled non-`.github` worktree reset; clean schema/auth baseline; Platform Owner sign-in and logout UI | Approved scope, UI, and architecture | Focused package builds and UI/API verification with synthetic disposable data |
| 2 | Data Contracts, Backend, Frontend Engineers | Create institution and LegalEntity grouping; Owner form and result | Slice 1 | Persistence/API/UI checks |
| 3 | Data Contracts, Backend, Frontend Engineers | First-Admin invitation, copyable bearer link, acceptance/password setup | Slice 2 | One-time/expiry/role binding and UI checks |
| 4 | Data Contracts, Backend, Frontend Engineers | Staff invitation, role assignment, access revocation | Slice 3 | Role, tenant isolation, last-Admin, revocation checks |
| 5 | Relevant specialists | Rebuild one tenant-safe business workflow per approved slice | Slice 4 and explicit next-slice direction | Focused API/UI acceptance |

- **Feature flags, observability, rollout, and rollback plan:** Keep unbuilt legacy routes inactive. No deployment, production migration, or release is included.
- **Known risks and unverified assumptions:** Existing account acceptance and narrow recovery details remain to be designed before implementation of those flows. No customer validation or runtime production evidence exists.
- **Agent handoff:** Orchestrator -> user for implementation authorization.
- **User decision and date:** Fresh-start plan approved; architecture choices confirmed; 2026-10-28.

## 5. Implementation

- **Stage status:** complete for Slice 1 implementation and disposable-runtime acceptance
- **Approved plan link / section:** This record, Section 4.
- **Changes by agent/profile:** Data Contracts Engineer delivered the approved Account/grant/session baseline and shared contracts. Backend Engineer implemented the API/auth/bootstrap portion described below. No commit was created; local commit `7080737` was not changed.
- **Files changed:** The data/contracts changes remain as listed above: `packages/db/package.json`; `packages/db/prisma.config.ts`; `packages/db/prisma/schema.prisma`; `packages/db/prisma/migrations/20261028210927_platform_owner_identity_session_baseline/migration.sql`; `packages/shared/src/index.ts`; `packages/shared/src/schemas.ts`; `packages/shared/src/schemas/auth.ts`; `packages/shared/src/types/index.ts`; and this feature record. The backend changes are `apps/backend/package.json`; `apps/backend/nest-cli.json`; `apps/backend/tsconfig.build.json`; `apps/backend/src/app.module.ts`; `apps/backend/src/main.ts`; `apps/backend/src/core/core.module.ts`; `apps/backend/src/auth/auth.controller.ts`; `apps/backend/src/auth/auth.module.ts`; `apps/backend/src/auth/auth.service.ts`; `apps/backend/src/auth/auth.service.spec.ts`; `apps/backend/src/auth/auth.controller.spec.ts`; `apps/backend/src/auth/dto/platform-owner-sign-in.dto.ts`; `apps/backend/src/auth/guards/platform-owner-jwt-auth.guard.ts`; `apps/backend/src/auth/strategies/platform-owner-jwt.strategy.ts`; `apps/backend/src/auth/strategies/platform-owner-jwt.strategy.spec.ts`; and `apps/backend/src/commands/bootstrap-platform-owner.command.ts`. The legacy source was relocated from `apps/backend/src/domains`, `src/features`, `src/common`, and `src/utils` to the corresponding `apps/backend/legacy-reference/src/` directories. The obsolete active `src/auth` local strategy, JWT strategy, login DTO, and prior auth test were removed/replaced. Frontend changes are `apps/frontend/package.json`; `apps/frontend/tsconfig.app.json`; `apps/frontend/src/api/api-slice.ts`; `apps/frontend/src/api/base-query.ts`; `apps/frontend/src/app/root-reducer.ts`; `apps/frontend/src/components/smart-form/form-fields.tsx`; `apps/frontend/src/features/auth/auth-api-slice.ts`; `apps/frontend/src/features/auth/auth-loading.tsx`; `apps/frontend/src/features/auth/auth-slice.ts`; `apps/frontend/src/features/auth/sign-in-form.tsx`; `apps/frontend/src/hooks/use-auth.ts`; `apps/frontend/src/lib/utils.ts`; `apps/frontend/src/main.tsx`; `apps/frontend/src/pages/_app.tsx`; `apps/frontend/src/pages/page.tsx`; `apps/frontend/src/pages/(auth)/_layout.tsx`; `apps/frontend/src/pages/(auth)/signin/page.tsx`; `apps/frontend/src/pages/(owner)/_layout.tsx`; `apps/frontend/src/pages/(owner)/owner/page.tsx`; and the plugin-regenerated `apps/frontend/src/router.generated.ts`. Legacy business pages and the former marketing landing page were moved under `apps/frontend/legacy-reference/pages/`, outside `src/pages`. The old legacy Auth page group and signup/password-reset forms were deleted rather than retained.
- **Active route boundary:** The active Nest application imports only global Config, Core/Prisma, Auth, and Health. The routes are `POST /v1/api/auth/login`, `POST /v1/api/auth/refresh`, `POST /v1/api/auth/logout`, `GET /v1/api/auth/me`, and `GET /v1/api/health`; `/v1/api` is the existing global prefix. No registration, recovery, institution, membership, invitation, or legacy business routes are active. Legacy business code and legacy roles/guards/decorators/utilities remain only under `apps/backend/legacy-reference/`, outside the Nest source root and TypeScript build input.
- **Authentication and session decisions:** Login performs bcrypt verification and requires the account's current `PlatformOwnerGrant`; failures use a generic credential response. `POST /auth/login` is limited to five requests per minute per request IP using installed `@nestjs/throttler` 6.7.1; the guard is attached only to that route, not globally. A random refresh token is sent only in an HttpOnly cookie; only its SHA-256 hash is persisted. Refresh checks grant/session state and rotates the token in a database transaction with conditional revocation, so parallel reuse cannot successfully rotate the same session twice. Access JWTs carry account subject and session ID; the Passport strategy reads current persisted session and grant state on every protected request, so logout/session revocation and Owner-grant deletion deny subsequent access. `/auth/me` returns only account ID and email. No tenant membership or business-data access is introduced.
- **Cookie/CSRF decisions:** Login is exempt from CSRF validation. Refresh and logout require a constant-time match between the readable CSRF cookie and `X-CSRF-Token`. Refresh cookie options are HttpOnly, SameSite=Lax, Secure only when `NODE_ENV=production`, and path `/v1/api/auth`; CSRF cookie is JS-readable, SameSite=Lax, uses the same Secure condition, and path `/`. Cookies are cleared with matching path/security attributes. Cookie names remain configurable with the existing environment-variable names.
- **Controlled bootstrap:** `pnpm --filter @erp/backend bootstrap:owner` invokes the compiled `apps/backend/src/commands/bootstrap-platform-owner.command.ts`. It accepts `DATABASE_URL`, `PLATFORM_OWNER_EMAIL`, and `PLATFORM_OWNER_PASSWORD` only from `process.env`; it does not load dotenv or `.env`, accepts no password CLI argument, and emits no password/hash/email or database URL. It validates against the shared sign-in schema, hashes with bcrypt, creates the account and grant together, and uses a serializable transaction that refuses to proceed unless the Account table is empty. The command was exercised successfully with a synthetic Owner against a new disposable database. Package scripts now point to the actual compiled output paths.
- **Deviations or newly discovered decisions:** No scope or architecture deviation. The first backend build included inactive legacy-reference files because Nest was explicitly configured to use the broad `tsconfig.json`; the build was corrected to use `tsconfig.build.json` with `src/**/*.ts` as its input, then passed.
- **Data-contract implementation choices:** The account is deliberately minimal (`id`, unique `email`, `password_hash`, timestamps). The platform grant is explicit and one-to-one, not an account role enum. A session stores only a unique opaque refresh-token hash and lifecycle timestamps; no raw credential, IP address, user-agent, tenant ID, or business data is stored. Account deletion cascades to its grants and sessions; grant deletion revokes owner authority; setting `revoked_at` revokes a session. Indexes on `Session.account_id` and `Session.expires_at` support account-scoped operations/cascade deletes and expiry-based retention cleanup; the unique hash supports direct session lookup. Expired/revoked rows require a scheduled cleanup policy before production use; the index supports that later work, and expected session volume/retention duration remain to be established. No migration backfill is required because the legacy schema/history is intentionally replaced for a fresh environment. This baseline is not to be applied to an existing database; rollback is to restore the prior schema/history only for an environment that has not adopted this fresh-start baseline.
- **Shared-contract changes:** Active `@erp/shared` exports now contain the Platform Owner sign-in payload plus Platform Owner sign-in/logout response types; the old generic sign-up/password-management/role-based auth, legacy business schemas, and Prisma-derived business response types are no longer active exports. Their source schemas remain unused and may be reintroduced only with their approved tenant-safe slices. The Prisma Zod generator package is unchanged and is not active in the Prisma schema (there is no generator declaration).
- **Frontend implementation and routing:** The active route tree now provides `/signin`, a protected `/owner` workspace, `/` redirecting to sign-in, and the existing not-found route. The auth page group redirects signed-in Owners to `/owner`; the Owner layout waits for initial session restoration and redirects signed-out visitors to `/signin`. The Owner landing surface is intentionally limited to a clear Slice 1 status; it exposes no institution or business-data workflow. Legacy business dashboard/students/batches/users/attendance pages and the former marketing landing page were moved out of `src/pages` to `apps/frontend/legacy-reference/pages/` and remain inactive. The old legacy Auth route group (including its prior sign-in, signup, and forgot-password pages/layout) and its signup/password-reset form implementations were deleted, not archived. The remaining legacy business feature source is not routed or imported into the active page graph; the old role-permission barrel exports and payment-modal reducer were disconnected from the active app.
- **Frontend session behavior:** Login uses `platformOwnerSignInSchema` and the shared Platform Owner payload/response contracts with `POST /auth/login`. Initial app load and 401 recovery use `POST /auth/refresh`; refresh and logout requests include credentials and copy the readable CSRF cookie into `X-CSRF-Token`. Initial restoration skips the request when no CSRF cookie exists, avoiding a failed refresh on a signed-out browser. The backend HttpOnly refresh cookie remains the persistent session credential. Only the access token and account summary are held in Redux memory; no auth/session value is written to localStorage. Concurrent 401 refreshes are serialized; failed refresh clears auth state. Logout is awaited before navigation, and local auth state is cleared even if the server session has already expired. The sign-in form renders pending and inline error states, labels/autofill, and visible keyboard focus; the shell shows account identity and a pending logout control.
- **Routing/build boundary decision:** The file-route plugin regenerates `src/router.generated.ts` during `vite build`'s `buildStart`. Frontend `build` and `build-local` now run `vite build && tsc -b`, so route generation completes before TypeScript validates. `tsconfig.app.json` includes `src/main.tsx` and the generated router; their import graph includes every active route and dependency while intentionally leaving disconnected tenant-unsafe legacy features outside the active app typecheck. This narrows the project to the active graph without weakening type checks for that graph. Vite still bundles the active graph before TypeScript runs, so either check failure fails the command.
- **Deviations or newly discovered decisions:** No product or architecture deviation. The first Vite build exposed obsolete role-navigation imports pulled through the general utility barrel after shared legacy contracts were removed; those old role-feature exports and the unused legacy payment reducer were disconnected, and the active-route build then passed. A disposable migration attempt found six empty legacy migration directories that Prisma treated as incomplete migrations; those explicitly authorized, empty directories were removed, after which the new baseline deployed successfully. Runtime verification also exposed incorrect compiled paths in the Owner bootstrap and production-start package scripts; both now match the Nest build output (`dist/commands/...` and `dist/main.js`). No generated router file was edited by hand.
- **Agent handoffs and remaining work:** Frontend implementation and read-only security reviews found no session vulnerabilities. The Architecture Analyst completed a read-only as-built review and found no material mismatches or blockers. The Orchestrator exercised the sign-in/session UI against a newly created disposable database. Slice 1 is ready for user acceptance; no persistent database, migration, bootstrap account, or service remains. The next recommended slice is first-institution creation, pending user direction.

## 6. Verification

- **Stage status:** Slice 1 implementation and local disposable-runtime acceptance complete; release readiness is not assessed
- **Browser acceptance follow-up:** After the source-only review above, a browser smoke test verified sign-in, session restoration, logout, and invalid-credential feedback against a synthetic Owner in the disposable database. A later signed-out boot verified no refresh request is sent when the CSRF cookie is absent.
- **Functional acceptance results:** Focused backend tests/build and frontend build/typecheck passed. On a newly initialized loopback-only PostgreSQL cluster and database, the baseline migration and synthetic Owner bootstrap succeeded. Browser testing verified root-to-sign-in routing, valid sign-in to `/owner`, session restoration after reloading `/owner`, logout back to sign-in, and an inline invalid-credentials error. The temporary database and services were stopped and removed afterward; no existing/deployed database or `.env` was used.
- **Architecture as-built review:** The Architecture Analyst's read-only review confirmed the active Prisma schema/shared contracts, backend routes/module/build boundary, and frontend auth/session/active route tree match the approved Slice 1 architecture, with no material mismatch or blocker. No institution, membership, invitation, or business-data capability was activated.
- **UI/UX conformance review:** Source review confirms the approved simple Owner/auth page-group structure, shadcn/ui components, theme tokens, Container, loading/signed-out/signed-in/error/pending-logout states, semantic labels, and focus styling. No browser inspection, automated accessibility checks, or user testing was performed.
- **Security review:** Read-only security review of the frontend session/routing changes reported no vulnerabilities. Backend auth/session/bootstrap review also reported no findings. Residual operational risk: `Secure` is enabled only when `NODE_ENV` is exactly `production`; deployment configuration must set it accordingly.
- **Browser follow-up:** The later disposable browser smoke test supersedes the earlier source-only observation; automated accessibility tooling and user testing remain outstanding.
- **Validation evidence:**

| Command/check | Result | Evidence / notes |
|---|---|---|
| `pnpm --filter @erp/backend test -- --runInBand --runTestsByPath src/auth/auth.controller.spec.ts src/auth/auth.service.spec.ts src/auth/strategies/platform-owner-jwt.strategy.spec.ts` | Passed | 3 active Jest suites, 5 tests; includes an HTTP test confirming the sixth login request in a minute is rejected before authentication runs. No database connection. |
| `pnpm --filter @erp/backend build` | Passed | Backend Nest build and its DB/shared package prebuilds succeeded. Prisma client generation ran; no database was connected and no migration was run. The first implementation build had included inactive legacy-reference files; pointing Nest at the `src/**/*.ts` build config corrected it. |
| `pnpm --filter @erp/backend bootstrap:owner` | Passed on disposable DB | Created one synthetic Owner after updating the command path to match the compiled Nest output. No `.env` was read; the temporary database was not retained. |
| `pnpm --filter @erp/backend exec eslint src/auth` | Passed | No ESLint errors or warnings in the auth source/tests. |
| `pnpm --filter @erp/backend exec prettier --check src/auth` | Passed | Auth source and focused Jest specs are formatted. |
| `pnpm --filter @erp/backend exec prettier --check src/auth src/commands src/app.module.ts src/core/core.module.ts src/main.ts tsconfig.build.json nest-cli.json package.json` | Passed | Checked changed active backend TypeScript/config/package files. |
| `pnpm --filter @erp/backend exec eslint src/auth src/commands src/app.module.ts src/core/core.module.ts src/main.ts` | Passed with one warning | No ESLint errors. Reports the pre-existing floating-promise warning in `src/main.ts`; the auth-controller unused import found during the first lint was removed. |
| `git diff --check` | Passed | No whitespace errors. No changes were staged. |
| Read-only security review of backend auth changes | No findings | Residual risk is production `NODE_ENV` configuration for Secure cookies, as noted above. |
| `pnpm --filter @erp/db format` | Passed | Formatted the active schema; no database used. |
| `pnpm --filter @erp/db exec prisma validate --schema prisma/schema.prisma` | Passed | Prisma reports the active schema is valid. |
| `pnpm --filter @erp/db exec prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script --output prisma/migrations/20261028210927_platform_owner_identity_session_baseline/migration.sql` | Passed | Generated the fresh baseline from an empty schema; no existing datasource was used or inspected. |
| `pnpm --filter @erp/db clean:build && pnpm --filter @erp/db build` | Passed | Removed stale generated client families, regenerated the active Prisma client, and built the DB package. |
| `pnpm --filter @erp/db build` | Passed | Final schema/client/package build after adding the expiry index. |
| `pnpm --filter @erp/shared build` | Passed | Active Platform Owner contracts bundle and declaration generation succeeded. |
| `git diff --check -- packages/db packages/shared docs/product/feature-delivery/institution-onboarding-foundation.md` | Passed | Data/contracts engineer's prior check; no whitespace errors in those changes. |
| `pnpm --filter @erp/frontend exec tsc -b --clean && pnpm --filter @erp/frontend build` | Passed | Cleaned frontend TypeScript build metadata, then built DB/shared workspace dependencies, regenerated routes through Vite, built the active UI, and typechecked the active import graph. Prisma client generation ran locally; no database was connected and no migration was run. Vite emitted upstream Zod annotation warnings and the existing >500 kB chunk-size advisory. |
| `pnpm --filter @erp/frontend exec tsc -b --pretty false` | Passed | Reran after the final signed-out refresh guard and password-toggle accessibility update. |
| `pnpm --filter @erp/frontend exec eslint src/api/api-slice.ts src/api/base-query.ts src/app/root-reducer.ts src/components/smart-form/form-fields.tsx src/features/auth/auth-api-slice.ts src/features/auth/auth-loading.tsx src/features/auth/auth-slice.ts src/features/auth/sign-in-form.tsx src/hooks/use-auth.ts src/lib/utils.ts src/main.tsx 'src/pages/(auth)/_layout.tsx' 'src/pages/(auth)/signin/page.tsx' 'src/pages/(owner)/_layout.tsx' 'src/pages/(owner)/owner/page.tsx' src/pages/_app.tsx src/pages/page.tsx` | Passed | Focused ESLint command over changed active frontend source files; no errors or warnings. |
| `pnpm --filter @erp/frontend exec prettier --check src/api/api-slice.ts src/api/base-query.ts src/app/root-reducer.ts src/components/smart-form/form-fields.tsx src/features/auth/auth-api-slice.ts src/features/auth/auth-loading.tsx src/features/auth/auth-slice.ts src/features/auth/sign-in-form.tsx src/hooks/use-auth.ts src/lib/utils.ts src/main.tsx 'src/pages/(auth)/_layout.tsx' 'src/pages/(auth)/signin/page.tsx' 'src/pages/(owner)/_layout.tsx' 'src/pages/(owner)/owner/page.tsx' src/pages/_app.tsx src/pages/page.tsx package.json tsconfig.app.json` | Passed | All changed frontend TypeScript/TSX and package/TypeScript config files were formatted. |
| `git diff --check -- apps/frontend docs/product/feature-delivery/institution-onboarding-foundation.md` | Passed | No whitespace errors in frontend or this feature record. |
| Generated route tree inspection | Passed | Vite regenerated `src/router.generated.ts`; it contains `/signin`, `/owner`, `/`, and not-found only. No signup, forgot-password, or business route matched. |
| Disposable PostgreSQL baseline migration | Passed | A new local cluster/database was created for this check only; `prisma migrate deploy` applied `20261028210927_platform_owner_identity_session_baseline` after the empty legacy migration folders were removed. The cluster was stopped and deleted after UI verification. |
| Browser sign-in/session smoke flow | Passed | With a synthetic Owner in the disposable database, the browser signed in, restored the session on `/owner` reload using POST refresh/CSRF, signed out, and showed the inline generic invalid-credentials error for a wrong password. A fresh signed-out boot no longer sends refresh without a CSRF cookie. |
| Frontend test script | Not available | `apps/frontend/package.json` has no `test` script and no Vitest/Testing Library dependencies; no test tooling was added per the approved Slice 1 guardrail. |

- **Known failures, limitations, residual risks, and follow-up:** Disposable local HTTP/database and UI acceptance passed; no database or service remains. Production must configure `NODE_ENV=production` to enable Secure cookies. The default throttler storage is in-memory and tracks `req.ip`; multi-replica deployments need shared storage for cross-instance enforcement, and reverse-proxy deployments must configure trusted client IP handling. A session cleanup policy and expected session volume/retention remain to be set before production use. No automated accessibility tooling or user validation was performed. The frontend build reports an upstream Zod comment annotation warning and a large-chunk advisory; the browser smoke run also showed a React script-tag error and React Router `HydrateFallback` warning.
- **Agent handoff:** Frontend implementation/security evidence, backend implementation/security evidence, and disposable browser/API/DB acceptance -> user for Slice 1 acceptance and direction on the next slice.

## 7. Release readiness

- **Stage status:** not_started
- **Required migrations/backfills/configuration:** To be defined for a new disposable environment; no existing database is authorized.
- **Release artifacts and documentation:** TBD after slices.
- **Monitoring, alerting, staged rollout, and success/rollback thresholds:** TBD.
- **Support/readiness considerations:** TBD.
- **Remaining blockers and risks:** No release approval.
- **Readiness recommendation:** not assessed.
- **Human merge authorization and date:** Not authorized.
- **Human deployment/release authorization and date:** Not authorized.

## 8. Authorized release

- **Stage status:** not_started
- **Specific action authorized by user:** None.
- **Authorization evidence and date:** None.
- **Action performed / outcome / date:** None.
- **Tool or access blockers and handoff, if any:** Not applicable.

## 9. Post-release learning

- **Stage status:** not_started
- **Actual release date/version:** Not released.
- **Observed outcomes and metrics:** None.
- **Customer/support feedback and incidents:** None.
- **Follow-up decisions and roadmap/doc updates:** None.

## Decision and handoff log

| Date | Role | Decision / handoff | Evidence and next owner |
|---|---|---|---|
| 2026-10-28 | User | Approved onboarding-first product scope and retained LegalEntity grouping in the UI flow. | Conversation decisions; implementation remains slice-gated. |
| 2026-10-28 | Architecture Analyst / Data Contracts Engineer | Recommended a shared-schema model with server-derived membership scope and inactive legacy APIs. | Design-only handoffs; no code security test. |
| 2026-10-28 | User | Approved shared schema, one institution/account, separate Owner grant, controlled bootstrap/recovery, seven-day bearer links, deferred RLS, last-Admin protection, and inactive legacy APIs. | Conversation response to architecture-choice form; Orchestrator to execute approved Slice 1. |
| 2026-10-28 | User | Directed continuation with local commit `7080737` left untouched. | No amend, reset, or push; no further commit is authorized. |
| 2026-10-28 | Frontend Engineer | Delivered Platform Owner sign-in/session UI, protected Owner shell, and inactive legacy route relocation. | Frontend build, active-graph typecheck, focused lint/format, and read-only security review passed; handoff to Orchestrator for cross-layer acceptance review. |
| 2026-10-28 | User | Corrected the legacy Auth disposition: delete archived legacy Auth implementation; retain only inactive legacy business application source. | Deleted archived legacy Auth pages/layout/forms; business page/reference files remain under `apps/frontend/legacy-reference/`. |
| 2026-10-28 | Feature Delivery Orchestrator | Completed Slice 1 disposable runtime and browser acceptance. | Fresh local cluster/database, baseline migration, synthetic Owner bootstrap, login/refresh/logout/invalid-login browser checks; test services and database removed. |
| 2026-10-28 | Architecture Analyst | Completed Slice 1 as-built consistency review; no material mismatches or blockers found. | Read-only review of active schema/contracts, API/build boundary, frontend auth routes, and legacy separation; handoff to user for acceptance/next slice. |
