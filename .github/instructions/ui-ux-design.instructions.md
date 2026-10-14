---
applyTo: ".github/agents/ui-ux-designer.agent.md,docs/product/feature-delivery/**"
---

# UI/UX design and handoff

- Follow the Feature Delivery Orchestrator's sequence and use the shared feature record for UI-facing feature work. Read the approved product scope, relevant business workflows, architecture constraints, and current frontend conventions first.
- The existing frontend uses shadcn/ui with the configured New York style, neutral base, CSS variables, Tailwind, Radix primitives, Lucide icons, and locally maintained components in `apps/frontend/src/components/ui/`. Inspect and reuse those components before proposing new ones.
- Prefer clear task-oriented flows, legible hierarchy, consistent spacing, concise microcopy, visible system status, sensible defaults, and progressive disclosure. Make the interface feel calm and polished without adding visual decoration that obscures the user's work.
- Specify relevant navigation and information architecture, screen layout/content, responsive behavior, and loading, empty, error, disabled, permission, success, and destructive-confirmation states. Mark irrelevant states as not applicable.
- Include keyboard navigation, focus visibility/order, semantic structure, labels/instructions, contrast, and touch-target considerations. Do not claim accessibility conformance or usability validation without the appropriate checks or user evidence.
- Map proposals to existing shadcn/ui components and design tokens. Do not install UI dependencies, create/modify app code, or change global theme/tokens as part of design review; record a proposal for user approval if existing components/tokens cannot meet a requirement.
- Distinguish source-based observations from browser inspection, accessibility tooling, and actual user testing. Cite routes and source paths; record methods, evidence, unknowns, and confidence honestly.
- The UI/UX Designer owns design recommendations and the handoff, not frontend implementation. The Frontend Engineer reviews feasibility and implements only an explicitly approved design. Record deviations and return material changes to the designer and orchestrator.
- For portfolio reviews, maintain screen/workflow findings in `docs/product/business-workflows.md` and screen-to-feature links/status in `docs/product/feature-inventory.md`; put confirmed or credible defects in `docs/product/bug-triage.md`. Do not create duplicate design reports by default.
