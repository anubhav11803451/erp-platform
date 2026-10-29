---
name: erp-architecture-analysis
description: Use for source-backed architecture maps, cross-layer feature tracing, implementation inventories, architecture verification, and technical documentation updates.
---

# ERP architecture analysis

Before acting, read `.github/instructions/architecture-analysis.instructions.md`, `.github/copilot-instructions.md`, and the existing architecture/product documents. For coordinated feature work, follow `.github/instructions/feature-delivery.instructions.md` and review only the approved scope.

## Evidence method

- Trace relevant capabilities across the frontend page/feature, backend controller/route/module/service, `@erp/shared` contract, and active Prisma model/query where applicable.
- Reconcile against the current tree: enumerate active frontend routes/pages and feature folders, backend controllers/handlers/modules, active Prisma models/enums/relations, shared exports, and integration/config boundaries. State counts and the inspected scope.
- Use `implemented`, `partial`, `stubbed`, `absent from repository`, or `unverified` only for source implementation status. A label, mock, comment, schema, or retained legacy source is not proof of an active end-to-end capability.
- Cite repository-relative files and line locations for material claims. Separate source facts from runtime/deployment behavior, approvals, release status, customer evidence, and unknowns.
- Treat `apps/backend/legacy-reference/` and `apps/frontend/legacy-reference/` as retained reference unless active imports/module wiring prove otherwise. Do not count them as active capabilities or reactivate them.
- Identify suspected defects separately and hand them off with evidence; architecture analysis is not authorization to fix code.

## Documentation and authority

- Maintain `docs/architecture/system-overview.md`, `docs/architecture/api-catalog.md`, `docs/architecture/data-model.md`, and technical evidence in `docs/product/feature-inventory.md` in place.
- Keep feature inventory institute/workflow contextual: explain which user job a capability supports and trace the relevant layers. Distinguish code in the repository from gated, merged, enabled, deployed, or user-validated behavior.
- Record architecture constraints, integration boundaries, unresolved choices, and coverage gaps as facts or questions, not approved designs.
- Do not edit application code, generated output, migrations, or deployment settings during architecture analysis. Do not direct implementation before the user's approval gates.

