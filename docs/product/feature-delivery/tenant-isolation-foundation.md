# Shared Multi-Tenant Institution Foundation

- **ID:** `tenant-isolation-foundation`
- **Status:** `discovery`
- **Last updated:** 2026-10-14
- **Orchestrator:** Feature Delivery Orchestrator
- **Repository branch:** `dev`
- **Related issue/PR:** None

## Lifecycle and approvals

Use `not_started`, `in_progress`, `blocked`, `complete`, or `not_applicable` for stage status. Only explicit user decisions count as approvals.

| Gate | Status | Decision / approver / date | Evidence or conditions |
|---|---|---|---|
| Product scope and priority | pending | User approved Option 1 scope and deferred priority on 2026-10-14. | Scope approved; roadmap priority remains pending. Per workflow, do not begin downstream design until priority is explicitly decided. |
| UI/UX design direction (user-facing features) | pending | | Applicability to be determined after product scope. |
| Architecture direction | pending | | No schema, isolation strategy, or architecture approved. |
| Implementation plan | pending | | No implementation authorized. |
| Merge authorization | pending | | |
| Deployment/release authorization | pending | | |

## 1. Product discovery

- **Stage status:** complete — discovery recommendation recorded; Option 1 scope approved, priority decision pending, and no downstream stage authorized.
- **Target users / jobs-to-be-done:** The product's documented audience is tuition/coaching providers and K–12 institutions; geography and initial customer segment are unspecified ([feature inventory](../feature-inventory.md)). Candidate users to validate are the person deciding to adopt the service and the people maintaining learner, teaching-group, enrollment, attendance, payment-record, and staff workflows. Candidate jobs are (a) operate those workflows for the correct institution, (b) give the right people access to the institution(s) they are meant to work with, and (c) onboard or support an institution without mixing its records with another's. These are discovery hypotheses, not validated personas. `ADMIN` and `STAFF` are current code roles, not an approved future tenant-role model.
- **Problem and evidence:** The user confirmed on 2026-10-14 that shared multi-tenant SaaS is the product direction. Reconciliation of the current same-day architecture/product inventory with tracked source confirms an implementation gap: the active product does not represent institution ownership or demonstrate institution-level data isolation. This is evidence of a gap against the user's chosen direction, not evidence that customers have validated the workflow, urgency, or willingness to pay. No customer interviews, usage data, or pilot evidence were found in the reviewed canonical docs.
- **Current product behavior and source links (repository evidence, not runtime proof):**
  - Coverage recorded in [system overview](../../architecture/system-overview.md), [API catalog](../../architecture/api-catalog.md), [data model](../../architecture/data-model.md), and [feature inventory](../feature-inventory.md) was reconciled against tracked source: 10 backend controllers / 38 handlers; 15 frontend page/layout files; 8 frontend business feature folders plus the standalone bug-report form; 8 active Prisma models / 3 enums; and 9 shared schema modules. The catalog/inventory and source coverage agree for the reviewed scope.
  - The active persistence definitions in `packages/db/prisma/schema.prisma` include `User`, `RefreshToken`, `Guardian`, `Student`, `Batch`, `StudentBatch`, `Payment`, and `Attendance`; none represents an institution/tenant or carries an institution identifier. `UserRole` currently has only `ADMIN` and `STAFF`.
  - The API surface is defined across `apps/backend/src/auth/auth.controller.ts`, `apps/backend/src/domains/{users,students,guardians,batches}/*.controller.ts`, `apps/backend/src/features/{enrollment,payments,attendance,dashboard}/*.controller.ts`, and `apps/backend/src/health.controller.ts`; the feature inventory/API catalog describe no organization setup, membership, or tenant boundary in these routes. Existing student, guardian, batch, enrollment, payment, attendance, and dashboard journeys are documented in [business workflows](../business-workflows.md).
  - Shared input contracts are in `packages/shared/src/schemas/`; frontend routes and feature modules are under `apps/frontend/src/pages/` and `apps/frontend/src/features/`. The current documented feature surface has no institution onboarding or tenant-selection journey.
  - This was a static repository/document reconciliation only. It does not establish production behavior, runtime exploitability, deployed controls, or the absence of behavior outside tracked source.
- **Options brainstormed and trade-offs:**
  1. **Focused institution-isolation foundation (recommended):** define the product outcomes needed to operate the existing core education workflows for more than one institution, including institution onboarding/access administration and consistent separation across records and aggregates. Keep hierarchy, role design, onboarding channel, and technical isolation method open for validation and gated downstream review. This addresses the stated SaaS direction while limiting unsupported assumptions; it still has broad cross-workflow dependencies.
  2. **Narrow first-workflow slice:** scope a first release to one validated institution workflow or a small subset of existing records. This could reduce initial user-facing scope, but partial separation can leave other routes, records, or dashboard outputs outside the customer-visible boundary and would not by itself establish a complete multi-institution foundation. Only reconsider if customer discovery identifies a genuinely separable pilot workflow and downstream reviewers can define safe boundaries.
  3. **Expanded organization-management suite:** include multi-level campus/group structures, cross-site rollups, configurable roles, enterprise identity, institution billing, and support delegation. This could serve more complex operating models but assumes hierarchy, user roles, buyer needs, and willingness to pay that are not evidenced; it increases scope and decision dependencies. Defer these as separate hypotheses unless discovery shows they are prerequisites for the selected audience.
- **Ranked recommendation and trade-offs:** Rank **Option 1** first as the narrowest coherent product outcome for the user-approved shared-SaaS direction: institution-aware setup/access and consistent separation for the existing core learner and operations workflows. Rank Option 2 second only if validation justifies a safely bounded pilot subset; rank Option 3 third pending evidence of multi-site or enterprise needs. This recommendation does not choose database topology, schema, authorization design, product roles, or release priority relative to other business commitments. It accepts more cross-surface work than a narrow slice in exchange for avoiding a partial boundary that could be mistaken for institution-safe operation.
- **Proposed scope boundaries (unapproved):**
  - **In:** product requirements for distinguishing institutions; a validated way to onboard an institution and authorize its users; institution-consistent handling of the existing student/guardian, batch, enrollment, attendance, payment-record, and dashboard workflows; and a clear resolution path for any current records if they are carried into a multi-institution deployment. Exact personas, institution identity, access relationships, and workflows require validation.
  - **Out for this feature unless separately approved:** campus/subsidiary hierarchy and cross-campus rollups; student/guardian portals; fee plans, invoicing, payment processing, communications, reporting expansion, institution billing/packaging, custom role systems, single sign-on, and integrations. Geography-specific legal or regulatory requirements are not determined here. UI design, schema, tenancy topology, authorization/security architecture, migration design, implementation, and release decisions are downstream gated work, not part of this discovery recommendation.
- **Proposed functional outcomes / acceptance criteria (not approved):**
  1. An institution can be distinguished as a product customer, and an authorized operator can complete the agreed onboarding/provisioning workflow without ambiguous ownership of its operational records.
  2. A person using the service can work only with the institution(s) they are authorized to serve; institution records and derived totals/activity—including dashboard outputs—are not exposed or changed across an unauthorized institution boundary through any included workflow.
  3. The included existing workflows for learners/guardians, teaching groups, enrollment, attendance, payment records, and staff operations consistently operate in the correct institution context. Any exception or shared-contact behavior (for example, a guardian associated with learners at different institutions) is explicitly validated and specified rather than assumed.
  4. If existing deployment data is carried into a multi-institution pilot, it has a documented, reviewable institution assignment outcome; ambiguous or unassigned records are not silently treated as belonging to an arbitrary institution.
  5. Where validation confirms that one person may work with multiple institutions, the product behavior makes the institution context clear and prevents accidental work in the wrong one. If that need is not validated, do not assume multi-institution membership.
- **Dependencies, risks, unknowns, and validation questions:**
  - No initial geography, institution segment within the documented education audience, economic buyer, daily operator, tenant hierarchy, or future role model is selected. Customer validation is still required; the user's SaaS-direction decision is not customer evidence.
  - Validate whether target customers consider an institution, legal entity, campus, coaching center, or another boundary their unit of administration; whether they operate multiple sites; whether users serve one or several institutions; and whether family contacts may legitimately span institutions.
  - Validate the minimum onboarding/provisioning and support workflow, how existing records would be assigned, expected separation for every listed core journey, and acceptable operational/support access. Ask about actual workarounds, consequences of data mix-ups, current organization structure, and pilot willingness.
  - Existing active models have globally unique user, guardian, and optional student email fields in `packages/db/prisma/schema.prisma`; whether the selected product needs the same email/contact identity to exist in different institutions is an unresolved product rule for downstream data-contract review, not a schema proposal here.
  - Cross-cutting routes and aggregates make a partial implementation risky. Before a pilot, the appropriate downstream security review must evaluate the approved boundary and verify that all included access paths honor it; this discovery record is not a security assessment.
  - AUTH-001 in [bug triage](../bug-triage.md) was confirmed by an independent security review as a high-severity authentication defect and has been fixed. On 2026-10-14, the user reported successful manual verification, supplied passing focused Jest results (1 suite, 3 tests), and reported the backend was built and deployed on another laptop; deployment environment/version were not specified. First-admin provisioning and the incomplete sign-up/recovery flows are also current product gaps; this feature must not silently absorb their full remediation scope.
  - Select geography and intended student-data use before obtaining jurisdiction-specific privacy/legal review; no legal or compliance determination is made here.
- **Success measures:** Establish baselines during customer discovery/pilot planning; numerical targets remain **TBD**. Candidate measures: institution setup completion and time-to-first-core-workflow; completion of the included learner/enrollment/attendance journeys; support burden and confusion about institution context; correctly attributed records in the approved migration; and observed unauthorized cross-institution access attempts/findings during downstream verification. The no-cross-boundary-access acceptance outcome is a proposed safety invariant, not a baseline-derived numeric performance target.
- **Agent handoff:** Product Strategist -> User for explicit approval, rejection, or revision of the proposed scope and priority. User approved Option 1 scope but deferred priority on 2026-10-14. Do not begin UI/UX, architecture, data-contract, security-review, implementation, or release work until the required priority decision is made.
- **User decision and date:** Product direction: shared multi-tenant SaaS, confirmed 2026-10-14. Option 1 scope: approved 2026-10-14. Roadmap priority: deferred and pending. Geography, initial customer segment within the documented education audience, hierarchy, and future roles remain open and must not be inferred.

## 2. UI/UX design

- **Stage status:** not_started
- **Applicability:** Pending the product scope/priority gate; if resumed, determine whether institution setup, tenant selection, or membership workflows are included.
- **Target persona and primary task:** Pending product scope.
- **User flow and navigation/information architecture:** Pending.
- **Screen layout and content hierarchy:** Pending.
- **Component mapping:** Pending; use existing shadcn/ui components and CSS-variable tokens by default.
- **Interaction/state matrix:** Pending.
- **Responsive behavior:** Pending.
- **Accessibility/keyboard requirements:** Pending.
- **Microcopy/content and acceptance criteria:** Pending.
- **Evidence method and limitations:** Not assessed.
- **Frontend feasibility review:** Pending approved design scope.
- **Agent handoff:** If user-facing scope is approved, UI/UX Designer -> Frontend Engineer and Architecture Analyst -> User for design approval.
- **User decision and date:** Pending.

## 3. Architecture review

- **Stage status:** not_started
- **Approved product scope link / section:** Product Discovery, Option 1; scope approved, but architecture work remains blocked until priority is decided.
- **Approved UI/UX design link / section, if applicable:** Pending applicability and design approval.
- **Affected frontend, API, shared contracts, persistence, and integrations:** To be confirmed by Data Contracts Engineer and Architecture Analyst after approved scope.
- **Data/security/privacy/tenancy/operations considerations:** Tenant isolation is central. Evaluate authorization context, every API/query path, background and operational access, logs, cache keys, uniqueness constraints, data migration, support access, privacy, and isolation testing. No design is approved.
- **Options and trade-offs:** Pending design-only reviews.
- **Recommended design and source evidence:** Pending.
- **Migrations, compatibility, dependencies, and rollback considerations:** Pending.
- **Database/data-contract design (when applicable; owner: Data Contracts Engineer):** Not started; must include entities/fields, relation cardinality and join shape, constraints, indexes, query access patterns, migration/backfill/rollback, compatibility, and privacy/tenancy/performance considerations.
- **Open architecture questions:** Tenant boundary and hierarchy; tenancy topology; user membership and role semantics; tenant context propagation and enforcement; migration/backfill of existing records; administrative/support access; isolation verification and operational controls.
- **Agent handoff:** After product and applicable UI gates, Data Contracts Engineer -> Architecture Analyst -> User for architecture/data-design decision.
- **User decision and date:** Pending.

## 4. Implementation plan

- **Stage status:** not_started
- **Approved architecture link / section:** Pending.
- **Acceptance criteria:** Pending approved scope and design.
- **Sequenced work slices:**

| Order | Owner profile | Scope / files or packages | Depends on | Validation |
|---|---|---|---|---|
| 1 | | Not planned; implementation remains gated. | Product, applicable UI, and architecture approvals | |

- **Feature flags, observability, rollout, and rollback plan:** Pending architecture and implementation planning.
- **Known risks and unverified assumptions:** See Product Discovery and Architecture Review.
- **Agent handoff:** Orchestrator -> User for implementation-plan approval.
- **User decision and date:** Pending.

## 5. Implementation

- **Stage status:** not_started
- **Approved plan link / section:** None.
- **Changes by agent/profile:** None.
- **Files changed:** None.
- **Deviations or newly discovered decisions:** None.
- **Agent handoffs and remaining work:** Implementation is not authorized.

## 6. Verification

- **Stage status:** not_started
- **Functional acceptance results:** Not run.
- **Architecture as-built review:** Not applicable; no implementation.
- **UI/UX conformance review:** Not applicable yet.
- **Security review:** Required before release readiness because tenant isolation and student data are in scope; not started.
- **Validation evidence:**

| Command/check | Result | Evidence / notes |
|---|---|---|
| Tenant feature checks | Not run | No tenant-foundation application changes have been authorized or implemented. |

- **Known failures, limitations, residual risks, and follow-up:** The user reported successful manual verification, passing focused Jest tests for AUTH-001 (1 suite, 3 tests), and backend build/deployment on another laptop on 2026-10-14; deployment environment/version were not specified. This is context for the separate authentication fix, not a release of the tenant-foundation feature. See [bug triage](../bug-triage.md).
- **Agent handoff:** After implementation, technical reviewers -> Orchestrator for release-readiness assessment.

## 7. Release readiness

- **Stage status:** not_started
- **Required migrations/backfills/configuration:** Pending architecture and implementation decisions.
- **Release artifacts and documentation:** Pending.
- **Monitoring, alerting, staged rollout, and success/rollback thresholds:** Pending; thresholds require baselines.
- **Support/readiness considerations:** Pending.
- **Remaining blockers and risks:** No approved feature scope, design, architecture, implementation plan, or security review.
- **Readiness recommendation:** not assessed.
- **Human merge authorization and date:** Pending.
- **Human deployment/release authorization and date:** Pending.

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
| 2026-10-14 | User | Confirmed shared multi-tenant SaaS as the intended product direction. | Business-model direction only; Product Strategist to recommend scope and priority. No schema, architecture, implementation, merge, deployment, or release approved. |
| 2026-10-14 | Feature Delivery Orchestrator | Opened design-only feature discovery record. | Current docs-only merged baseline; Product Strategist is next owner. |
| 2026-10-14 | Product Strategist | Completed discovery recommendation: prioritize the focused institution-isolation foundation for validated core workflows; leave expanded hierarchy/roles and technical design undecided. | Static source/doc reconciliation found no institution/tenant model or boundary across the inventoried current surface; this is not customer validation. Exact scope and roadmap priority remain pending. Next owner: User to approve, reject, or revise Option 1 and decide whether to prioritize it now; preserve geography, segment, hierarchy, and future roles as unknown unless explicitly decided. No downstream stage authorized. |
| 2026-10-14 | User | Approved the Option 1 product scope and deferred its roadmap priority. | Scope is approved; the combined scope/priority gate remains pending. No downstream design may start until priority is decided. Next owner: User to decide when this feature should be prioritized. |
