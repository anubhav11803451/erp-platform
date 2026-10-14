---
applyTo: "apps/frontend/**"
---

# Frontend conventions

- Keep pages under `src/pages` and feature code under `src/features`; reuse the existing `src/components`, `src/hooks`, `src/api`, and `src/lib` layers. The `@/` alias points to `src`.
- Routes are generated from the page tree by `vite-plugin-file-routes.ts`. Edit page/layout files to change routing; do not hand-edit `src/router.generated.ts`.
- Add API endpoints by injecting them into the shared RTK Query `apiSlice`; use the existing base-query/authentication behavior and tag invalidation patterns.
- Use shared request/response contracts from `@erp/shared`. For forms, follow existing `SmartForm`, Zod schema, and feature-specific form-hook patterns rather than duplicating validation or API state in page components.
- Use the typed Redux hooks exported from `src/app/hooks.ts`. Use `src/lib/utils/formatters.ts` for date formatting instead of the restricted `date-fns` imports noted in ESLint. Prefer `type` declarations and type-only imports as enforced by the frontend ESLint rules.
- Frontend role checks may shape navigation and visibility, but must not replace backend authorization.
- For user-facing feature work coordinated through the Feature Delivery Orchestrator, follow the approved UI/UX Design section in the feature record. Reuse the existing shadcn/ui components and CSS-variable theme tokens before proposing new patterns; do not add a UI dependency or change global theme tokens without approval. Implement and validate the specified responsive layouts, interaction states, keyboard/focus behavior, and accessibility acceptance criteria.
- Follow the frontend ESLint and Prettier configuration: four-space indentation, single quotes, semicolons, 100-column print width, `es5` trailing commas, and the Tailwind Prettier plugin. Keep source files within the configured 500-line ESLint limit.
- Useful commands from the repository root: `pnpm --filter @erp/frontend start:dev`, `pnpm --filter @erp/frontend build`, `pnpm --filter @erp/frontend lint`, and `pnpm --filter @erp/frontend prettier-check`. There is no frontend test script currently.
- Read the complete impacted files and relevant feature siblings before editing; do not introduce a new frontend state, form, or routing pattern without a concrete need.
