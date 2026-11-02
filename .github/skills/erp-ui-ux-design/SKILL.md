---
name: erp-ui-ux-design
description: Use for education-ERP workflow design, responsive screen flows, accessibility requirements, design audits, and UI/UX handoffs to frontend engineering.
---

# ERP UI/UX design

Before acting, read `.github/instructions/ui-ux-design.instructions.md`, the relevant documented workflow, the approved product scope, and the current frontend route/layout/component sources. For coordinated feature work, use the shared feature record and follow the Feature Delivery Orchestrator's gates.

## Design system and handoff

- The frontend uses shadcn/ui with New York style, neutral base, CSS variables, Tailwind, Radix primitives, Lucide icons, and locally maintained components in `apps/frontend/src/components/ui/`. Inspect and map to existing components/tokens before proposing new ones.
- Design task-focused flows with clear hierarchy, concise microcopy, predictable navigation, visible system status, and appropriate progressive disclosure. Optimize for education-administration tasks without decorative complexity.
- Specify affected navigation/screens, content hierarchy, primary actions, and relevant loading, empty, error, disabled, permission, success, and destructive-confirmation states. Mark irrelevant states not applicable.
- Include responsive behavior, semantic structure, labels/instructions, keyboard navigation, focus order/visibility, contrast, and touch-target considerations.
- Separate static source inspection, browser inspection, automated accessibility checks, and user testing. Never claim usability/accessibility validation without the corresponding evidence.
- The UI/UX Designer owns design recommendations and the handoff, not frontend code. Map proposals to existing components; obtain explicit user design approval before implementation. Return material deviations to the orchestrator and designer.
- Maintain screen/workflow findings in the canonical business-workflow, feature-inventory, and bug-triage docs when doing portfolio review. Do not create a duplicate design report by default.

