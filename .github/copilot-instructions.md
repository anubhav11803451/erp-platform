# Repository guidance

## Project structure

- This is a pnpm workspace monorepo. `apps/backend` is the NestJS API, `apps/frontend` is the React/Vite app, and `packages/db`, `packages/shared`, and `packages/prisma-zod-v4` contain database, shared-contract, and Prisma-generator code.
- Read the complete files you intend to change and the relevant neighboring files and package configuration before editing. For repository-wide guidance work, inspect the tracked source, configuration, tests, and documentation across all workspaces.
- Preserve package boundaries and existing naming/layout patterns. For a contract or persistence change, check the database schema, shared contracts, API, and frontend call sites that depend on it.
- Make focused changes. Do not edit generated output such as `apps/frontend/src/router.generated.ts`, Prisma generated clients, or `dist` files by hand.
- When starting work from `dev`, create a fresh task-specific branch based on `dev` before editing; never make task changes directly on `dev`. Check branch and worktree state first, preserve existing uncommitted work, and do not switch or stash changes whose ownership is unclear—ask before proceeding if they cannot be safely isolated.

## Engineering practices

- Prefer the repository's existing helpers, types, and package scripts over introducing new dependencies or parallel abstractions.
- Preserve type safety and surface errors; do not replace failures with silent defaults or success-shaped responses.
- Authentication and authorization must be enforced by the backend. Frontend visibility/permission checks are not a security boundary.
- Never add secrets or real environment values to source, documentation, or committed configuration. Environment files are ignored by Git.
- Follow the applicable workspace instructions in `.github/instructions/`; lint and formatting rules differ between backend, frontend, and packages.
- Start whole-product capability/gap reviews and coordinated feature work with `.github/agents/feature-delivery-orchestrator.agent.md`. It coordinates the Product Strategist, UI/UX Designer, Architecture Analyst, and technical specialists, maintains canonical docs under `docs/`, and directs implementation only through approved handoffs.
- Keep implementation evidence, user-workflow gaps, bugs, market/competitor signals, and hypotheses distinct. Recommendations are not approvals; do not cross scope/architecture/implementation gates or merge, deploy, or release without explicit user authorization. See `docs/product/feature-delivery/`.
- For every commit containing agent-authored code changes, never include a `Co-authored-by: Copilot` trailer or any other commit attribution identifying Copilot as a co-author. This applies to every agent profile and commit tool; inspect the final commit message and remove Copilot co-author attribution before creating the commit.

## Build and validation

- Use pnpm from the repository root. The repository pins `pnpm@10.18.3` and requires Node.js `>=20.19.0`.
- `pnpm build` runs workspace builds. For focused validation, use `pnpm --filter @erp/backend build`, `pnpm --filter @erp/frontend build`, or the relevant package build.
- The backend ESLint script includes `--fix`; inspect the resulting diff if it is used. The frontend has `lint` and `prettier-check` scripts.
- Do not claim tests passed unless an applicable test suite exists and was run. Current tracked test coverage is limited to a commented-out backend e2e spec; there is no frontend test script.
- Report commands that could not be run, including missing environment or database prerequisites, rather than implying success.
