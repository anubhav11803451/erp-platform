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
| Merge authorization | pending | | No commit or merge requested. |
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
- **Database/data-contract design:** Account, platform grant, LegalEntity, Institution, Institution membership, and invitation records are expected in the initial data model. Operational rows added later carry institution ownership and tenant-aware relational constraints. Schema details and exact access patterns are implemented in small approved slices.
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

- **Stage status:** in_progress
- **Approved plan link / section:** This record, Section 4.
- **Changes by agent/profile:** None yet.
- **Files changed:** None yet.
- **Deviations or newly discovered decisions:** None.
- **Agent handoffs and remaining work:** Reconcile the approved path manifest, reset only authorized non-`.github` worktree state, then deliver Slice 1.

## 6. Verification

- **Stage status:** not_started
- **Functional acceptance results:** Not run.
- **Architecture as-built review:** Not run.
- **UI/UX conformance review:** Not run.
- **Security review:** Prior design-only review complete; implementation security review required before release readiness.
- **Validation evidence:**

| Command/check | Result | Evidence / notes |
|---|---|---|
| | Not run | |

- **Known failures, limitations, residual risks, and follow-up:** No implementation evidence yet.
- **Agent handoff:** Reviewers -> Orchestrator.

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
