# Coordinated feature delivery

The [Feature Delivery Orchestrator](../../../.github/agents/feature-delivery-orchestrator.agent.md) is the required main entry point for both whole-product reviews and individual feature delivery. It directs a full portfolio audit to the Architecture Analyst first, then to the Product Strategist and UI/UX Designer for business/workflow gaps, market/competitor research, and current-screen review; findings are consolidated in canonical product docs. For user-facing features, the UI/UX Designer prepares an approved design handoff before frontend implementation. Use this workflow when a specific feature needs product discovery, architecture review, cross-layer implementation, or coordinated verification.

## How to start

1. Invoke the [Feature Delivery Orchestrator](../../../.github/agents/feature-delivery-orchestrator.agent.md) with the portfolio-review or feature request.
2. The orchestrator creates one durable record from [the feature record template](template.md) at `docs/product/feature-delivery/<feature-id>.md`.
3. Each specialist reads the latest approved upstream sections, updates its own stage in that record, and hands it to the next named role.
4. For user-facing features, the UI/UX Designer records the flow, screen/state behavior, shadcn/ui component mapping, responsive/accessibility requirements, and acceptance criteria. The Frontend Engineer reviews feasibility; a human approves the design before implementation planning/code.
5. A human explicitly approves product scope, architecture direction, and implementation plan before the next stage starts. The orchestrator must stop at any pending gate.
6. The team completes implementation and verification, then prepares release readiness. Merge, deployment, and release always require explicit human authorization for each action.
7. After explicit authorization, the orchestrator performs only the authorized release action if tools and access permit; otherwise it provides a precise handoff. After a human confirms release, capture real outcomes in the record and update the roadmap and canonical docs where appropriate.

Custom agent profiles do not automatically share context. The orchestrator coordinates them when agent delegation is available; otherwise it provides a copy-ready handoff and waits at that boundary. Canonical docs carry portfolio-review findings; the feature record, not assumptions about agent memory, is the shared source of truth for an individual delivery.

When a feature changes database persistence or data access, the Data Contracts Engineer is a required design reviewer before the architecture decision: it plans the schema, relations/cardinality and joins, constraints/indexes, query patterns, migrations, and relevant data risks in the feature record. The Architecture Analyst integrates that proposal into the cross-layer review. Schema implementation remains blocked until the architecture and implementation plan are approved.

## Lifecycle

`Product discovery -> Product approval -> UI/UX design (when applicable) -> UI approval -> Architecture review -> Architecture/data design approval -> Implementation plan -> Plan approval -> Implementation -> Verification -> Release readiness -> Human-authorized release action -> Post-release learning`

A stage may return to an earlier stage when evidence or implementation changes scope. Preserve previous decisions and record why they changed. Never infer approval from silence.

## Records

Create one `<feature-id>.md` per feature using the template. Keep findings, decisions, and validation evidence in that record rather than producing disconnected agent reports. Link issue/PR references when they exist; do not create external work items unless requested.
