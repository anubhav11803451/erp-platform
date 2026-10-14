# Project documentation

These documents describe the currently implemented ERP and the product decisions still to validate. Source-backed implementation facts are linked to the repository; research claims are dated and cited.

## Architecture

- [System overview and audit coverage](architecture/system-overview.md)
- [API catalog](architecture/api-catalog.md)
- [Database model](architecture/data-model.md)

## Product

- [Feature inventory and cross-layer traceability](product/feature-inventory.md)
- [Business workflows](product/business-workflows.md)
- [Bug and functional-gap triage](product/bug-triage.md)
- [Market-informed roadmap](product/roadmap.md)
- [Coordinated feature delivery workflow and record template](product/feature-delivery/README.md)
- [UI/UX Designer](../.github/agents/ui-ux-designer.agent.md)

Start a whole-product review or feature request with the [Feature Delivery Orchestrator](../.github/agents/feature-delivery-orchestrator.agent.md). It coordinates the Architecture Analyst to verify what is implemented, the Product Strategist to assess documented workflow gaps and research market/competitor signals, and the UI/UX Designer to review screens and interaction evidence. It consolidates findings in these living documents. Distinguish repository facts, user evidence, competitor claims, and hypotheses.

For a specific feature, use the [coordinated feature-delivery workflow](product/feature-delivery/README.md).

For persistence or data-access changes, the [Data Contracts Engineer](../.github/agents/data-contracts-engineer.agent.md) designs the schema, relations/joins, constraints, indexes, and migration approach before implementation planning; see the feature-delivery workflow for its approval gate.
