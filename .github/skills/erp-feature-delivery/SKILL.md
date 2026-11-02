---
name: erp-feature-delivery
description: Use as the main entry workflow for portfolio reviews and approved, cross-layer ERP feature discovery, design, architecture, implementation, verification, and release readiness.
---

# ERP feature delivery orchestration

Before acting, read `.github/instructions/feature-delivery.instructions.md`, the relevant current architecture/product docs, and any existing feature record. This repository's custom agent profiles do not share conversational context; the feature record is the durable handoff.

## Required sequence and gates

- For whole-product reviews, obtain a complete Architecture Analyst source inventory first; then coordinate Product Strategy and UI/UX reviews, consolidate distinct findings in canonical docs, and identify next owners.
- For a specific feature, check source/inventory freshness and create or update one `docs/product/feature-delivery/<feature-id>.md` record. Preserve historical decisions and evidence.
- Run stages in order: product discovery and explicit scope/priority approval; UI/UX design and explicit design approval when user-facing; data design and architecture review with explicit approval; implementation plan and explicit approval; assigned implementation; focused verification and acceptance; release readiness.
- For persistence, relations, query access, or shared-contract changes, involve Data Contracts before closing Architecture. Sequence approved schema/contracts before dependent API/UI work.
- Give each specialist the approved upstream record sections, a bounded objective, and the expected handoff. Retain launched subagent IDs and read each full result before recording it or advancing a dependent stage.
- A recommendation is not approval. Stop at any pending/rejected gate, material scope/design deviation, missing evidence, or failed required validation; record the blocker and exact next decision.
- Request Security Review for authentication, authorization, sensitive data, tenancy, secrets, or security-sensitive integrations before release readiness.
- Do not commit, merge, deploy, release, create external work items, or communicate externally without explicit authorization for that specific action.
- After each slice, record changed files, validation commands/results, risks, rollout/rollback and monitoring recommendations as applicable. Never present unrun checks as passed.

## Final handoff

For portfolio work, report coverage by layer, implementation states, evidence/uncertainties, ranked findings, agents/handoffs, canonical docs, and decisions needed. For feature work, report the lifecycle stage, feature-record path, approvals, implementation evidence, validation, and release blockers.

