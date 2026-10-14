---
applyTo: ".github/agents/**,docs/product/feature-delivery/**"
---

# Coordinated feature delivery

Use this protocol for whole-product portfolio reviews and for new features or material changes spanning product intent, architecture, or implementation. The `feature-delivery-orchestrator` is the required main entry point; canonical docs hold portfolio-review findings and the per-feature record is the shared source of truth for delivery because custom agents do not implicitly share conversation state.

## Handoffs and authority

- Read the feature record and the latest approved decisions before acting. Record conclusions, evidence, open questions, and the next handoff in that same file; do not create parallel untracked plans.
- A recommendation is not an approval. Only explicit user approval satisfies a gate. Record the approving user, date, decision, and the approval evidence. Never infer approval from silence, urgency, or a request to brainstorm.
- Do not start downstream work while a required approval is pending or rejected. Return the blocking decision and the exact next decision needed.
- If specialist delegation is available, the orchestrator assigns the named agent the relevant stage and feature-record path, then incorporates its result. If delegation is unavailable, provide a precise handoff for that profile and stop at the stage boundary; do not claim other agents acted.
- Specialists must stay within their stage and remit. They may identify blockers or recommend changes, but must not silently override an approved product or architecture decision.
- If evidence, scope, dependencies, or implementation materially diverge from an approved decision, mark the record `blocked`, describe the variance, and return it to the appropriate approval gate.

## Whole-product portfolio review

- The orchestrator coordinates `architecture-analyst` first to verify the implementation inventory across frontend journeys, API/modules, shared contracts, persistence, and integration boundaries. Reconcile coverage counts and record `implemented`, `partial`, `stubbed`, `absent from repository`, or `unverified`; do not infer runtime/production capability from source names.
- The orchestrator then coordinates `product-strategist` to assess the verified inventory against documented target users, business workflows, and product goals, and to research relevant market and competitor capabilities.
- The orchestrator also coordinates `ui-ux-designer` to review the current navigation, screen/feature coverage, responsive behavior, accessibility cues, consistency, and interface states against the verified routes and documented workflows. Keep source inspection, browser inspection, automated checks, and actual user testing distinct.
- Report separately: implementation gaps against documented capabilities; product/workflow gaps against user outcomes; bugs/risks; and market/competitor opportunity hypotheses. Absence in the repository alone is not evidence of customer demand or a committed requirement.
- Market/competitor claims require dated citations and geography/segment context. Label vendor-published claims as vendor claims; competitor feature presence is a signal to investigate, not proof of value, adoption, or demand. Mark customer evidence and geography unknown when not verified.
- Update canonical docs in place: `docs/product/feature-inventory.md` for cross-layer and screen coverage/gaps, `docs/product/bug-triage.md` for defect candidates, `docs/product/business-workflows.md` for workflow and UI findings, and `docs/product/roadmap.md` for prioritized recommendations. Do not create duplicate reports by default.
- The orchestrator consolidates the review and proposes the next specialist owner for each approved follow-up. No technical agent starts feature implementation based only on a ranked recommendation.

## Required stage order

1. **Product discovery:** Product Strategist researches and brainstorms options, validates current feature coverage, defines target user/problem and functional outcomes, and makes a ranked recommendation. User approves, rejects, or revises scope and priority.
2. **UI/UX design (when user-facing):** After product scope is approved, `ui-ux-designer` records the flow, screens, component mapping, states, responsive behavior, accessibility requirements, and acceptance criteria. `frontend-engineer` reviews feasibility. User explicitly approves the design before the implementation plan and frontend code. Mark the gate not applicable, with a reason, when no UI is affected.
3. **Architecture review:** Architecture Analyst evaluates the approved scope and UI handoff across UI, API, contracts, persistence, security, operations, and migration needs. When persistence, relations/joins, query patterns, or shared data contracts change, `data-contracts-engineer` must provide a design-only review in the feature record covering entities/fields, cardinality/join shape, constraints, indexes, query access patterns, migration/backfill/rollback, compatibility, and relevant tenancy/privacy/performance concerns. Architecture Analyst integrates that specialist design into the cross-layer recommendation. User approves the architecture and data-design direction.
4. **Implementation plan:** Orchestrator and relevant technical specialists create sequenced work items, ownership by agent role, dependencies, affected packages, acceptance criteria, tests, observability, rollout, and rollback. For database changes, sequence approved schema/contracts/migrations before dependent API/UI work. User approves the implementation plan before code changes.
5. **Implementation:** Backend, frontend, and data-contract specialists implement approved slices. Frontend Engineer follows the approved UI handoff and records deviations for review. Sequence dependent changes (for example, schema/shared contract before API and UI); parallelize only independent work. Record changed files, decisions, and validation per slice.
6. **Verification:** Run applicable tests, builds, lint, and checks; report exact commands and outcomes. Architecture Analyst checks as-built consistency; Product Strategist checks functional acceptance; UI/UX Designer checks conformance to approved interaction/design criteria. Request the security-review agent for authentication, authorization, sensitive data, tenancy boundaries, secrets, or security-sensitive integrations, as well as when the user requests it. Record failures and residual risks; never represent unrun checks as passed.
7. **Release readiness:** Record deployment prerequisites, migrations/backfills, flags, monitoring, staged rollout and rollback plan, support readiness, and remaining risks. Obtain explicit human authorization before merge, deployment, production release, or external communications.
8. **Authorized release:** Once the user explicitly authorizes a specific release action, carry out only that action when tools and access permit, record the exact outcome, and stop if blocked. If the environment cannot perform the action, provide a precise release handoff rather than claiming completion.
9. **Post-release learning:** Only after the user confirms a release, record the actual release date, observed metrics/feedback, incidents, and follow-up decisions; update the canonical roadmap and product docs as appropriate.

## Stop conditions

- Scope/priority, UI/UX design when applicable, architecture, and implementation plan each require explicit approval before the next stage.
- Unclear material business constraints, unresolved architecture blockers, failed required validation, or a mismatch with approved acceptance criteria blocks progression.
- Agents may prepare release recommendations but must not merge, deploy, release, or claim launch authority without explicit user authorization.
- Do not commit unless the user explicitly asks for a commit.
