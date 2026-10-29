---
name: erp-frontend-engineering
description: Use for React/Vite pages, feature UI, RTK Query endpoints, forms, routing, authentication state, and responsive interactions in this ERP monorepo.
---

# ERP frontend engineering

Before acting, read `.github/instructions/frontend.instructions.md` and the complete target files with their relevant feature, API, hook, layout, and component siblings. For coordinated user-facing feature delivery, follow `.github/instructions/ui-ux-design.instructions.md` and implement only the approved design in the shared feature record.

## Repository patterns

- Keep route/page files under `apps/frontend/src/pages` and feature behavior under `src/features`; reusable UI belongs under `src/components`. The `@/` alias targets `src`.
- The root `src/pages/page.tsx` is the public landing page. Keep ERP application pages under `src/pages/(app)/`; preserve the established app sidebar/layout and auth layout unless the user approves a design change. Do not move product content into the root landing page.
- Routes come from `vite-plugin-file-routes.ts`. Change page/layout files to change routes; never hand-edit `src/router.generated.ts`. Avoid changing `tsconfig.app.json` or its aliases to mask unrelated errors.
- Inject endpoint definitions into the shared RTK Query `apiSlice`. Preserve the existing base-query reauthentication, cookie/CSRF behavior, and tag invalidation conventions; do not add a competing API client.
- Use typed Redux hooks from `src/app/hooks.ts`. Build forms with shared `@erp/shared` Zod schemas, `SmartForm`, existing form fields, and feature hooks instead of duplicating validation or API state in page components.
- Reuse local shadcn/ui New York/neutral components, Radix primitives, Lucide icons, and CSS-variable theme tokens. Do not add a UI dependency or change global tokens without explicit approval.
- Preserve established feedback behavior. Feature hooks use Sonner success/error toasts; sign-in and some setup flows use inline alerts and explicit loading/focus states. Do not silently remove notifications or replace an established feedback pattern unless requested.
- Accessibility and interaction are part of the implementation: preserve keyboard/focus behavior, labels, semantic structure, loading/empty/error/success states, responsive layouts, and destructive confirmation where applicable.
- Frontend permission checks may shape navigation only. Backend authorization remains authoritative.

## Tests and validation

- Read `apps/frontend/package.json` before selecting a test command. At the time this skill was authored, the package has no `test` script and no declared Vitest/Testing Library dependencies; do not claim frontend tests ran or invent a test command. If test tooling is later added, use its configured runner and focused user-visible coverage.
- `pnpm --filter @erp/frontend build` runs TypeScript project checks and Vite. `pnpm --filter @erp/frontend exec vite build` checks bundling only and is not a substitute for type-checking.
- Use `pnpm --filter @erp/frontend lint` and `pnpm --filter @erp/frontend prettier-check` when applicable. Check current scripts and report exact outcomes, including unrelated baseline failures.

