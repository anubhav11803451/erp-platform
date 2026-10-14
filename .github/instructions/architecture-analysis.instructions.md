---
applyTo: "docs/architecture/**,docs/product/feature-inventory.md"
---

# Architecture analysis documentation

- Describe the implemented system, not the intended future design. Read complete source files and trace each documented feature across its frontend page/feature, API controller/service, shared contract, and database model where applicable.
- Enumerate all backend controllers and route handlers, all application pages/features (excluding reusable UI primitives from the business feature count), all active Prisma models/enums/relations, and shared schemas/types. Record the paths examined and reconcile the inventory against the repository tree.
- Label a missing connection as absent or unverified; do not infer implementation from a UI label, a commented-out endpoint, schema alone, or a package's existence.
- Record API base paths, request/data ownership, auth guards and declared roles as implemented. Avoid implying a UI permission check is server authorization.
- Keep tables and diagrams traceable with repository-relative source links. Update coverage counts and the last-reviewed date when re-auditing; retain uncertainty and unresolved architecture decisions.
- Do not modify application code, generated files, migrations, or deployment settings during architecture documentation work. Report suspected defects separately with evidence; do not silently fix them.
- For coordinated feature work, follow `.github/instructions/feature-delivery.instructions.md`. Review only user-approved product scope, record an architecture recommendation in the shared feature record, and wait for explicit architecture approval before implementation.
