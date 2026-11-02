# Current business workflows

**Last reviewed:** 2026-11-02<br>
**Evidence boundary:** Static review of active frontend routes/features, backend route inventory, shared contracts, active persistence, and prior documented verification. These are source-supported journeys, not evidence of deployment, customer use, or usability. The Architecture Analyst's current counts and cross-layer evidence are in the [feature inventory](feature-inventory.md).

## Current actors and active journeys

| Actor | Established in active source | Current workflow |
| --- | --- | --- |
| Prospective institution representative | Static landing page at `/`; no lead API/model | Can view marketing content. Demo/explore calls to action do not submit a lead or navigate to an active workflow. Claims on the page are not proof of delivered capabilities. |
| Platform Owner | `PLATFORM_OWNER` identity and persisted `PlatformOwnerGrant` | Signs in at `/signin`; provisions LegalEntity groups and Institutions; creates a first-Admin invitation; reviews, approves/rejects, revokes, or replaces an invitation/claim. Bootstrap account creation is a separate command requiring an empty Account table, not public registration. |
| First Institution Admin / claimant | Addressed invitation and `InstitutionAdminMembership` | Receives a manually shared one-time link, submits a claim, waits for Owner approval, then separately signs in. Claim alone grants no membership or workspace session. |
| Institution Admin after approval | `INSTITUTION_ADMIN` identity and one Institution membership | Signs in through the shared `/signin` flow and reaches `/institution`, which displays identity and Institution details. There are no active operational ERP tasks or institution-scoped business-data endpoints in this workspace. |
| Staff/tutor, learner, guardian/family | No corresponding active role, route, or account workflow | No current active staff management, learner operations, or family self-service. Retained legacy source is not an active journey. |

### Implemented source journeys

1. **Workspace sign-in and session:** Platform Owners and approved Institution Admins use the shared sign-in endpoint. The server derives the resulting identity and workspace; invitation continuation uses an explicit non-session flow. Refresh/logout and current identity have active API paths.
2. **Owner setup:** The Owner creates a coded LegalEntity group, then creates an Institution and its addressed first-Admin invitation in one transaction. LegalEntity creation is a separate operation. The one-time bearer URL is returned for manual sharing; no invitation email is sent.
3. **First-Admin claim and review:** An invitee exchanges the link, claims using an eligible existing or new account, and sees pending/review outcomes. The Owner performs the separately approved identity check out of band and explicitly decides. Approval grants membership but not a session; the claimant signs in separately. Rejection, revocation, and expiry do not grant access.
4. **Institution overview:** An approved Admin sees account and Institution context. This is an onboarding/account surface, not a student-management, attendance, finance, or dashboard workflow.

The current inventory describes these capabilities as implemented in source, except the limited Institution overview, which is **partial**. This does not establish that the code is deployed or available to users. The exact routes, guards, contracts, models, and source evidence are in the [API catalog](../architecture/api-catalog.md), [data model](../architecture/data-model.md), and [feature inventory](feature-inventory.md).

## Outcomes not supported by active source

The earlier 2026-10-14 workflow descriptions for Admin/Staff users, students/guardians, batches, enrollment, attendance, manual payment records, and dashboard summaries describe retained legacy-reference source, not current active application journeys. The current active schema has no operational education-data models, and the active API does not expose those workflows.

The following are absent or incomplete in the repository; absence alone is not evidence of customer demand or a committed requirement:

- Daily education operations (staff/tutor management, learner/guardian records, groups/classes, enrollment, attendance, operational reporting).
- Additional Institution Admin staff provisioning and role/action management.
- Student/guardian accounts, portals, communications, or self-service.
- Fee schedules, invoices, payment processing, settlement/reconciliation, refunds, or provider integrations.
- Public registration and password recovery. Bootstrap is controlled/out-of-band; first-Admin account creation is invitation-only.
- Automated invitation delivery/notifications; first-Admin link sharing is manual.
- A working demo-lead capture or support/bug-reporting workflow (the standalone report form is a disconnected stub).
- SIS/LMS or other external system integration.

## Portfolio UI/UX review

**Method:** UI/UX Designer static source review dated 2026-11-02 against the verified routes and documented workflows. No browser session, automated accessibility evaluation, or user testing was performed for this review.

- On `/`, the “Request a Demo” and “Explore Features” controls have no active submission/navigation behavior in source. The page also advertises generic business modules/integrations and displays a hard-coded AI-demo response not substantiated by the active product inventory. Customer impact and any services outside this repository are unverified. See [bug triage](bug-triage.md).
- On `/owner`, “Generate claim / Add Campus” leads to Institution creation and an invitation; source explicitly says it does not create a Campus record or send email. The label is inconsistent with the action.
- On the `*` route, the not-found page presents a search affordance without a source-wired action and a “Contact support” link to `#`.
- The invite/approval journey communicates pending review and keeps claim separate from grant, but relies on out-of-band manual delivery, verification, and separate post-approval sign-in. Whether this works for the intended Owner/Admin is unvalidated.
- The sign-in, Owner, invitation, and Institution routes include loading, empty/error, decision, confirmation, and/or status states in source. Labels, focus/live-region, and responsive patterns are visible source cues only—not accessibility conformance.

The feature record reports a **limited prior browser smoke on 2026-11-02** (390×844 overflow and mobile sidebar keyboard behavior, plus the described invitation/approval flow). This was not repeated for this review and is not user testing. Screen-reader, contrast, zoom, automated accessibility, and replaced-link replay remain unverified. The feature record also reports React script-tag and React Router `HydrateFallback` console observations; neither was independently reproduced or root-caused here.

## Evidence and validation still needed

No customer interviews, pilot outcomes, user research, target geography, buyer, or initial segment were established in this review. Validate the Owner/Admin setup journey and identify the first recurring operational job separately for tuition/coaching and K–12 contexts before treating any absent module as required. Record browser checks, accessibility tooling, and observed-user testing as distinct methods. Do not claim usability, accessibility conformance, deployment, or release from static source review.
