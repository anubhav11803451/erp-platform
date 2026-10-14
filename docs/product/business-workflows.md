# Current business workflows

**Last reviewed:** 2026-10-14<br>
**Evidence boundary:** workflows below are reconstructed from current pages, API handlers/services, shared schemas, and Prisma relations. They are not validated customer journeys.

## Current roles and actors

| Actor | Established in code | Current workflow surface |
| --- | --- | --- |
| Admin | `UserRole.ADMIN` | Manage users, students/guardians, batches, enrollment, and payment records; view dashboard including revenue. |
| Staff/tutor | `UserRole.STAFF` | View assigned batches, enroll students, view student/guardian records and payment history, mark attendance, and view dashboard. Exact role access is in the [API catalog](../architecture/api-catalog.md). |
| Student | Student record only | No login account or student-facing route is modeled. |
| Guardian/parent | Guardian contact record only | Captured as a contact during student creation; no guardian login, portal, notification, or communication workflow is modeled. |
| Institution owner/operator | No explicit organization role/model | The product description targets educational organizations, but the data model does not identify an institution or tenant. |

## Implemented workflow paths

1. **Administer staff and tutors:** an Admin uses `/users` to create, edit, and delete accounts. `User.role` is `ADMIN` or `STAFF`; a Batch may reference a tutor.
2. **Maintain a learner record:** an Admin uses `/students` to create or edit a Student. Student creation includes guardian contact fields; the service finds or creates a Guardian by email and links the Student.
3. **Organize instruction:** an Admin creates or edits a Batch, optionally assigning a tutor. Staff can request their assigned batches. Batch dates exist, but scheduled sessions/timetables do not.
4. **Enroll a learner:** Admin or Staff adds a Student to a Batch with an agreed total fee. The join record prevents duplicate student/batch pairs. Admin can disenroll one or more students.
5. **Take attendance:** Staff or Admin selects one of their batches in the attendance UI, selects a date, and marks student statuses. The API upserts records per student/batch/date.
6. **Record a payment:** an Admin records a payment linked to a student and batch after enrollment. Staff can read payment history. The current flow stores a record; it does not establish that money was processed by a provider.
7. **Review activity:** Admin and Staff see student and batch counts plus recent payments and enrollments. Admin receives the revenue aggregate.

## Incomplete or absent journeys

- **First institution/admin setup:** no organization creation or institution onboarding flow is modeled. The checked-in Prisma seed is commented out; a supported first-admin provisioning path is not established.
- **Sign-up:** the page currently accepts form input, shows a success toast, and navigates without calling a registration API. The API endpoint is absent.
- **Password recovery:** the page changes to a success message locally; no backend request or reset-token model/route exists.
- **Family self-service:** students and guardians have no account, portal, notification, consent, or communication workflow in the inspected routes/models.
- **Fees lifecycle:** the current payment path is a manually entered payment record. Fee schedules, invoices, due reminders, partial-payment rules, refunds, and reconciliation are not established.
- **Issue reporting:** the bug report form is not connected to a backend service or persisted store.
- **Marketing/demo request:** the public landing page advertises generic ERP modules, integrations, AI assistance, testimonials, and a demo request, but the reviewed backend/API has no demo lead workflow. These claims and actions are unverified by this repository and should not be treated as delivered education-ERP capability or customer evidence.

These gaps may be intentional for an early MVP. Validate them with institution owners, administrators, tutors, and families before treating them as committed requirements.

## UI/UX review evidence

The workflows above are reconstructed from source and are not evidence that real users can complete them easily. During a portfolio UI/UX review, record navigation and screen-level findings here with route/source links and label the evidence as static source review, browser inspection, automated accessibility check, or user testing. Do not claim usability or accessibility validation when those methods were not used. Route specific implementation defects to [`bug-triage.md`](bug-triage.md) and track screen-to-feature coverage in [`feature-inventory.md`](feature-inventory.md).
