# Current feature inventory

**Last reviewed:** 2026-10-14<br>
**Market context:** tuition/coaching providers and K–12 institutions, matching the project description. Geography and buyer segment are not specified.

This inventory tracks what is visible in the current repository, not production deployment, customer adoption, or market demand. The Architecture Analyst should reconcile this table against every controller, page/feature folder, active Prisma model, and shared schema on each full review.

The [Feature Delivery Orchestrator](../../.github/agents/feature-delivery-orchestrator.agent.md) is the main entry point for a whole-product review. The Architecture Analyst verifies implementation coverage; the Product Strategist compares that inventory with target-user workflows and product goals, then researches relevant market/competitor signals. Keep the classifications below separate—source absence alone does not establish a user need.

## Portfolio review classifications

| Classification | Meaning | Evidence and next action |
| --- | --- | --- |
| Implementation gap | A capability already documented as intended is absent, partial, or stubbed in the repository. | Link source and intended workflow; Architecture Analyst confirms technical coverage; route to Product Strategist if scope/intent is unclear. |
| Workflow/product gap | A target user's documented job or outcome is not supported end to end. | Link the relevant business workflow and implementation evidence; Product Strategist validates user impact and required discovery. |
| Defect or risk | Existing behavior may fail, create harm, violate an invariant, or block a workflow. | Record reproduction/source evidence, severity, confidence, and owner in `bug-triage.md`; distinguish static candidates from runtime-confirmed defects. |
| Market/competitor opportunity hypothesis | Dated external or competitor evidence suggests a capability may merit investigation. | Cite the source, date, geography, and whether it is a vendor claim; validate customer value independently before prioritizing delivery. |
| UI/UX finding | A source-backed screen/navigation concern or a usability/accessibility observation. | Link the route and UI sources; identify whether evidence is static review, browser inspection, automated check, or user testing; route workflow-level findings to `business-workflows.md` and defects to `bug-triage.md`. |

Every full review must reconcile the coverage register below to repository scope, state exclusions/unknowns, record the review date, update the relevant canonical docs, and leave implementation recommendations subject to user approval.

## Cross-layer feature map

| Feature | Frontend | API | Persistence/contracts | Current status and evidence |
| --- | --- | --- | --- | --- |
| Public landing/marketing | `/` static landing page | No demo-request route found | Static content only | Marketing copy describes generic HR/finance/CRM/inventory capabilities, an AI copilot, integrations, and testimonials; these are not substantiated by the tracked product implementation and need factual/market review before external use. |
| Authentication/session | `/signin`; auth API slice; access state | `POST /auth/login`, `GET /auth/refresh`, `POST /auth/logout` | `User`, `RefreshToken`; auth/user schemas | Login/session flow exists, but password validation has a high-severity code-path defect candidate; see `bug-triage.md`. |
| Account registration | `/signup`; `SignUpForm` | No registration controller route. An unused API mutation names `/auth/register`. | User create schema and `User` model exist | Stub only: submit currently reports success without calling the mutation or creating an account. |
| Password recovery | `/forgot-password`; forgot-password form | No password-recovery controller route. API slice names `/auth/forgot-password`. | Recovery schema exists; no reset-token model | Stub only: page reports local success without sending a request. |
| Admin/staff management | `/users`; create/edit/delete table and dialog | Admin-only user create/list/read/update/delete | `User`, `UserRole`, user schemas | Basic administrative user CRUD exists. No self-service invitation/bootstrap workflow is established. |
| Student and guardian records | `/students`, `/students/:id`; student form embeds guardian details | Student CRUD; guardian CRUD | `Student`, `Guardian`, their schemas | Basic record management exists. Guardian is a contact linked to students, not a login/portal user; no standalone guardian page was found. The shared create schema marks guardian optional although the service dereferences it; see `bug-triage.md`. |
| Batches and tutor assignment | `/batches`, `/batches/:id`; batch form | Batch CRUD, list, details, staff `my-batches` | `Batch` optionally relates to `User` tutor; batch schema | Basic batch management and tutor assignment/read paths exist. No scheduled class-session model is present. |
| Enrollment | Batch detail page; enroll/disenroll dialogs and tables | Enroll, query by batch/student, admin disenroll | `StudentBatch`; enrollment schemas | Basic enrollment lifecycle exists, including `total_fee_agreed`; no invoice or fee-plan lifecycle is modeled. |
| Payments | Student detail payment history and payment form | Admin create/update/delete; admin/staff read payment records | `Payment`, `PaymentMethod`; payment schema | Manual payment record keeping exists. No gateway processing, invoice, recurring collection, refund, settlement, or reconciliation integration is established by the inspected code. |
| Attendance | `/attendance`; batch/date selection and marking form | Query batch/date; mark attendance in bulk | `Attendance`, `AttendanceStatus`; attendance schemas | Basic batch/date attendance marking and reading exist. |
| Dashboard | `/dashboard`; counts and recent activity | Stats and recent activity | Student, batch, payment, enrollment data | Basic totals, last five payments/enrollments, and admin revenue aggregate exist; this is not a reporting/analytics suite. |
| Bug report | `SmartBugReportForm` component; no page/API integration found | No bug-report route | Local form schema only; no persistence | Prototype only: submit displays a toast and logs form data in the browser; no report is stored or sent. |

## Coverage register

| Inventory area | Reviewed scope | Recorded count/status |
| --- | --- | --- |
| Backend controllers/routes | `apps/backend/src` controllers | 10 controllers; 38 route handlers |
| Frontend routes | `apps/frontend/src/pages` | 15 page/layout files |
| Frontend business feature folders | `apps/frontend/src/features` | 8 folders plus standalone bug-report form |
| Active persistence | `packages/db/prisma/schema.prisma` | 8 models; 3 enums |
| Shared input schemas | `packages/shared/src/schemas` | 9 schema modules |

Generated route/client output and reusable UI primitives are not counted as business features. Unknown functionality outside tracked application source must be re-audited before asserting it exists.

## Explicitly unverified

- Customer usage, adoption, retention, current operational pain, willingness to pay, and pricing.
- Production deployment, data protection controls, backups, observability, uptime, and support process.
- Target country/region, applicable privacy/education regulations, payment providers, and required school-system integrations.
- Whether the intended deployment is single-institution or multi-tenant SaaS.
