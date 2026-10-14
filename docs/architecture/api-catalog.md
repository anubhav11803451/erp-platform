# API catalog

**Last reviewed:** 2026-10-14<br>
**Base prefix:** `/v1/api` (`apps/backend/src/main.ts`)<br>
**Coverage:** all 38 route handlers in the 10 tracked controllers under `apps/backend/src`.

`ADMIN` and `STAFF` are the role names in the current Prisma enum. `Public` means the controller does not declare the JWT/role guards; it does not imply that an operation has no other credential checks. DTOs are validated through the global Zod pipe configured in `AppModule`.

| Method | Path (after base prefix) | Access in controller | Behavior / source |
| --- | --- | --- | --- |
| GET | `/health` | Public | Health status, timestamp and uptime — `apps/backend/src/health.controller.ts` |
| POST | `/auth/login` | Local credentials; login throttle | Login and issue tokens/cookies — `apps/backend/src/auth/auth.controller.ts` |
| GET | `/auth/refresh` | Refresh-token cookie | Rotate refresh/access tokens — `apps/backend/src/auth/auth.controller.ts` |
| POST | `/auth/logout` | Refresh-token cookie when present | Revoke refresh token and clear cookies — `apps/backend/src/auth/auth.controller.ts` |
| POST | `/domains/users` | ADMIN | Create user — `apps/backend/src/domains/users/users.controller.ts` |
| GET | `/domains/users` | ADMIN | List users |
| GET | `/domains/users/:id` | ADMIN | Read one user |
| PATCH | `/domains/users/:id` | ADMIN | Update user |
| DELETE | `/domains/users/:id` | ADMIN | Delete user |
| POST | `/domains/students` | ADMIN | Create student with optional embedded guardian data — `apps/backend/src/domains/students/students.controller.ts` |
| GET | `/domains/students` | ADMIN, STAFF | List students |
| GET | `/domains/students/:id` | ADMIN, STAFF | Read one student |
| PATCH | `/domains/students/:id` | ADMIN | Update student |
| DELETE | `/domains/students/:id` | ADMIN | Delete student |
| POST | `/domains/guardians` | ADMIN | Create guardian — `apps/backend/src/domains/guardians/guardians.controller.ts` |
| GET | `/domains/guardians` | ADMIN, STAFF | List guardians |
| GET | `/domains/guardians/:id` | ADMIN, STAFF | Read one guardian |
| PATCH | `/domains/guardians/:id` | ADMIN | Update guardian |
| DELETE | `/domains/guardians/:id` | ADMIN | Delete guardian |
| POST | `/domains/batches` | ADMIN | Create batch — `apps/backend/src/domains/batches/batches.controller.ts` |
| PATCH | `/domains/batches/:id` | ADMIN | Update batch |
| DELETE | `/domains/batches/:id` | ADMIN | Delete batch |
| GET | `/domains/batches` | ADMIN, STAFF | List batches |
| GET | `/domains/batches/my-batches` | STAFF | List batches assigned to the current tutor |
| GET | `/domains/batches/:id` | ADMIN, STAFF | Read one batch |
| POST | `/features/enrollment` | ADMIN, STAFF | Enroll a student — `apps/backend/src/features/enrollment/enrollment.controller.ts` |
| GET | `/features/enrollment/batch/:batchId` | ADMIN, STAFF | List students enrolled in a batch |
| GET | `/features/enrollment/student/:studentId` | ADMIN, STAFF | List a student's batch enrollments |
| DELETE | `/features/enrollment/disenroll` | ADMIN | Remove one or more student enrollments |
| POST | `/features/payments` | ADMIN | Record a payment — `apps/backend/src/features/payments/payments.controller.ts` |
| GET | `/features/payments/student/:studentId` | ADMIN, STAFF | List a student's payment records |
| GET | `/features/payments/:id` | ADMIN, STAFF | Read a payment |
| PATCH | `/features/payments/:id` | ADMIN | Update a payment record |
| DELETE | `/features/payments/:id` | ADMIN | Delete a payment record |
| GET | `/features/attendance/batch/:batchId` | ADMIN, STAFF | Get attendance for a batch and date — `apps/backend/src/features/attendance/attendance.controller.ts` |
| POST | `/features/attendance/mark` | ADMIN, STAFF | Mark attendance for multiple students |
| GET | `/features/dashboard/stats` | ADMIN, STAFF | Student/batch counts; revenue is returned for ADMIN — `apps/backend/src/features/dashboard/dashboard.controller.ts` |
| GET | `/features/dashboard/activity` | ADMIN, STAFF | Recent payment and enrollment activity |

## Frontend/API mismatches and absent routes

- The frontend API slice declares `/auth/register` and `/auth/forgot-password`, but no backend controller route implements either path. The sign-up form currently does not call the registration mutation, and the forgot-password page sets a local success state without calling the API. See [bug triage](../product/bug-triage.md).
- No public guardian/student portal, invoice/fee-plan, export/reporting, notification, or payment-provider route appears in the controller inventory. This is an implementation inventory, not a judgment that each route is required.
