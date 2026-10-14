# Feature delivery: <Feature name>

- **ID:** `<feature-id>`
- **Status:** `discovery`
- **Last updated:** YYYY-MM-DD
- **Orchestrator:** Feature Delivery Orchestrator
- **Repository branch:** `<branch>`
- **Related issue/PR:** None

## Lifecycle and approvals

Use `not_started`, `in_progress`, `blocked`, `complete`, or `not_applicable` for stage status. Only explicit user decisions count as approvals.

| Gate | Status | Decision / approver / date | Evidence or conditions |
|---|---|---|---|
| Product scope and priority | pending | | |
| UI/UX design direction (user-facing features) | pending | | |
| Architecture direction | pending | | |
| Implementation plan | pending | | |
| Merge authorization | pending | | |
| Deployment/release authorization | pending | | |

## 1. Product discovery

- **Stage status:** not_started
- **Target users / jobs-to-be-done:**
- **Problem and evidence:**
- **Current product behavior and source links:**
- **Options brainstormed:**
- **Ranked recommendation and trade-offs:**
- **In scope / out of scope:**
- **Functional outcomes / acceptance criteria:**
- **Dependencies, risks, unknowns, and validation questions:**
- **Success measures:** Include baseline and target only when supported; otherwise mark `TBD`.
- **Agent handoff:** Product Strategist -> User for scope/priority decision.
- **User decision and date:**

## 2. UI/UX design

- **Stage status:** not_started
- **Applicability:** user-facing change / not applicable (explain)
- **Target persona and primary task:**
- **User flow and navigation/information architecture:**
- **Screen layout and content hierarchy:**
- **Component mapping:** Existing shadcn/ui components and CSS-variable tokens; list any new component/token proposal separately.
- **Interaction/state matrix:** loading, empty, error, disabled, permission, success, and destructive confirmation states as relevant.
- **Responsive behavior:** mobile, tablet, desktop, and dense-data behavior as relevant.
- **Accessibility/keyboard requirements:** semantic structure, labels, focus order/visibility, contrast, and touch targets.
- **Microcopy/content and acceptance criteria:**
- **Evidence method and limitations:** source review / browser inspection / automated checks / user testing; do not claim checks not run.
- **Frontend feasibility review:** Frontend Engineer's reuse/implementation constraints.
- **Agent handoff:** UI/UX Designer -> Frontend Engineer and Architecture Analyst -> User for design approval.
- **User decision and date:**

## 3. Architecture review

- **Stage status:** not_started
- **Approved product scope link / section:**
- **Approved UI/UX design link / section, if applicable:**
- **Affected frontend, API, shared contracts, persistence, and integrations:**
- **Data/security/privacy/tenancy/operations considerations:**
- **Options and trade-offs:**
- **Recommended design and source evidence:**
- **Migrations, compatibility, dependencies, and rollback considerations:**
- **Database/data-contract design (when applicable; owner: Data Contracts Engineer):** entities/fields, relation cardinality and join shape, constraints, indexes, query/join patterns, migration/backfill/rollback, compatibility, and privacy/tenancy/performance considerations.
- **Open architecture questions:**
- **Agent handoff:** Architecture Analyst and Data Contracts Engineer (when applicable) -> User for architecture decision.
- **User decision and date:**

## 4. Implementation plan

- **Stage status:** not_started
- **Approved architecture link / section:**
- **Acceptance criteria:**
- **Sequenced work slices:**

| Order | Owner profile | Scope / files or packages | Depends on | Validation |
|---|---|---|---|---|
| 1 | | | | |

- **Feature flags, observability, rollout, and rollback plan:**
- **Known risks and unverified assumptions:**
- **Agent handoff:** Orchestrator -> User for implementation authorization.
- **User decision and date:**

## 5. Implementation

- **Stage status:** not_started
- **Approved plan link / section:**
- **Changes by agent/profile:**
- **Files changed:**
- **Deviations or newly discovered decisions:**
- **Agent handoffs and remaining work:**

## 6. Verification

- **Stage status:** not_started
- **Functional acceptance results:**
- **Architecture as-built review:**
- **UI/UX conformance review:** compare implementation with the approved UI/UX design and acceptance criteria, or explain why not applicable.
- **Security review:** status, reviewer, scope, and findings, or reason not applicable.
- **Validation evidence:**

| Command/check | Result | Evidence / notes |
|---|---|---|
| | Not run | |

- **Known failures, limitations, residual risks, and follow-up:**
- **Agent handoff:** Reviewers -> Orchestrator for release-readiness assessment.

## 7. Release readiness

- **Stage status:** not_started
- **Required migrations/backfills/configuration:**
- **Release artifacts and documentation:**
- **Monitoring, alerting, staged rollout, and success/rollback thresholds:**
- **Support/readiness considerations:**
- **Remaining blockers and risks:**
- **Readiness recommendation:** not assessed
- **Human merge authorization and date:**
- **Human deployment/release authorization and date:**

## 8. Authorized release

- **Stage status:** not_started
- **Specific action authorized by user:**
- **Authorization evidence and date:**
- **Action performed / outcome / date:**
- **Tool or access blockers and handoff, if any:**

## 9. Post-release learning

- **Stage status:** not_started
- **Actual release date/version:** Not released
- **Observed outcomes and metrics:**
- **Customer/support feedback and incidents:**
- **Follow-up decisions and roadmap/doc updates:**

## Decision and handoff log

Append chronologically. For every handoff identify the sending role, receiving role, artifact sections/evidence, and any decision needed.

| Date | Role | Decision / handoff | Evidence and next owner |
|---|---|---|---|
