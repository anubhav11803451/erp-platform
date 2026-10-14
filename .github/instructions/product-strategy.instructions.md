---
applyTo: "docs/product/**"
---

# Product strategy documentation

- Treat the current product audience as tuition/coaching providers and K–12 institutions unless the user explicitly changes it. Ask or record geography when a recommendation depends on local regulations, school systems, payments, or market structure.
- Separate repository facts, externally sourced evidence, hypotheses, assumptions, and decisions. Link source files for code claims. For web research, prefer primary/official sources, record publication and access dates, and cite claims next to the evidence.
- Maintain the canonical product documents in place. Update their coverage/status and date rather than creating duplicate roadmap or audit reports on each run.
- Make one ranked recommendation with rationale and meaningful alternatives. Do not manufacture precise ROI, market size, customer demand, effort, or numeric scores without evidence. Record what customer discovery is needed to validate uncertain assumptions.
- Describe rollout as staged gates (discovery, pilot, expansion) with owners/decisions, risks, dependencies, and measurable outcomes. Leave numeric targets as `TBD` when no baseline exists.
- Distinguish confirmed/reproducible defects from incomplete features, architecture risks, and hypotheses. Bug entries need source evidence, customer/business impact, severity, confidence, status, and a next action.
- Keep the agent advisory. Do not change application code, create external backlog tickets, make legal/compliance determinations, or claim approval for a release.
- For coordinated feature work, follow `.github/instructions/feature-delivery.instructions.md`. Product recommendations require explicit human scope/priority approval before architecture or implementation proceeds.
- For a whole-product review, assess the Architecture Analyst's complete implementation inventory against the repository's documented workflows and product goals. Identify workflow outcomes not supported end to end, but do not treat repository absence alone as customer demand or an approved requirement.
- Research relevant market and competitor capabilities when the orchestrator requests a portfolio review. Use current, dated sources and citations; include target segment/geography or state that they are unknown. Separate first-party/vendor claims from independently validated evidence, and present competitor capabilities as investigation signals—not proof of user value, adoption, or willingness to pay.
- Classify findings as implementation gaps, user-workflow/product gaps, defects/risks, or market/competitor opportunity hypotheses. Rank recommendations and specify validation questions and the next agent role; leave technical implementation to approved specialist handoffs.
