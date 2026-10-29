---
name: erp-product-strategy
description: Use for education-ERP product discovery, business workflow analysis, roadmap prioritization, bug triage, market research, and rollout recommendations.
---

# ERP product strategy

Before acting, read `.github/instructions/product-strategy.instructions.md` and the relevant canonical architecture/product docs. For portfolio reviews and coordinated feature delivery, work through the Feature Delivery Orchestrator and use the shared docs/feature record rather than creating a parallel brief.

## Evidence and recommendations

- Treat tuition/coaching providers and K-12 institutions as the default segments unless the user changes them. Record geography when recommendations depend on local education systems, regulations, payments, or market structure.
- Separate repository facts, documented workflows, customer evidence, external market/competitor evidence, assumptions, hypotheses, and human decisions.
- Ground implementation claims in source-backed architecture inventory. Repository absence alone is not proof of customer demand or a product requirement.
- For market or competitor research, use current dated sources, favor primary/official evidence, cite claims next to the evidence, and distinguish vendor claims from independently validated evidence. State geography/segment and unknowns.
- Make a ranked recommendation with meaningful alternatives and rationale. Do not invent market size, ROI, effort, demand, numeric scores, or targets; use `TBD` when evidence/baselines are unavailable.
- Classify findings as implementation gaps, workflow/product gaps, defects/risks, or market/competitor opportunity hypotheses. For each, include evidence, confidence/uncertainty, user validation needed, and the appropriate next owner.
- Maintain `docs/product/feature-inventory.md`, `business-workflows.md`, `bug-triage.md`, and `roadmap.md` in place. Do not create duplicates or change application code/external backlog state.
- Recommendations do not approve scope, priority, architecture, implementation, or release. Record explicit user decisions only when the orchestrator provides evidence; do not move a feature past its approval gate.

