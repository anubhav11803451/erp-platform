# Product roadmap recommendation

**Prepared:** 2026-10-14<br>
**Audience:** tuition/coaching providers and K–12 education, matching the repository's stated target.<br>
**Decision status:** recommendation for human review; not an approved delivery commitment.

## Executive recommendation

**Do not add a broad set of new features yet.** First establish that the product can safely onboard and support a real institution, then pilot the existing admin workflow with design partners. The repository already contains student/guardian records, batches, enrollment, attendance, manual payment records, user roles, and a basic dashboard. The biggest immediate risks are authentication correctness, fake-success onboarding/recovery, and the unresolved institution/tenant model—not a lack of feature names.

## Recommended sequence and gates

| Order | Outcome | Work to validate/plan | Exit gate |
| --- | --- | --- | --- |
| **P0 — Safety and business-model gates** | A safe, supportable pilot scope | Urgently validate and remediate AUTH-001 with security ownership and regression tests. Define first-admin/staff provisioning and real password recovery. Decide whether this is one deployment per institution or shared multi-tenant SaaS; if shared, establish tenant isolation before onboarding more than one institution. Select the first geography and buyer; review student-data privacy, data sharing, accessibility, support, backup, and recovery expectations. Verify or replace unsupported landing-page claims and wire a truthful demo request. Resolve the optional-guardian/schema mismatch if guardian is required. | No pilot until authentication is verified, user provisioning is real, organization data boundaries are explicit, public claims are substantiated, and a named owner accepts privacy/security/support risks. |
| **P1 — Prove the core institution workflow** | Administrators and tutors can complete learner operations reliably | Use the existing student/guardian, batch/tutor, enrollment, attendance, payment-record, and dashboard flows. Conduct design-partner walkthroughs; measure setup and operational effort. Address usability/functional defects found during the pilot rather than expanding the surface prematurely. | Pilot institutions complete agreed workflows with acceptable reliability and support burden; numeric thresholds are set from the observed baseline, not invented here. |
| **P2 — Validate the next paid workflow** | Reduce a confirmed recurring administrative burden | Test the highest-ranked customer problem among fee schedules/invoices/reconciliation, guardian communications/self-service, reporting/exports, and multi-site administration. Start with interviews/prototypes and one end-to-end slice only after willingness-to-pay and workflow owners are evidenced. | A buyer and user confirm the problem, existing workaround/cost, rollout constraints, and measurable success criteria. |
| **P3 — Scale by evidence and geography** | Expand the product without losing interoperability or trust | Add market-specific integrations, accessibility improvements, localization, and analytics according to validated segment demand. Evaluate relevant data standards or provider integrations rather than adopting them by default. | Repeatable onboarding and retention signals, support capacity, data governance, and a segment-specific expansion case. |

## Market and standards signals (not customer-demand proof)

Research reviewed on **2026-10-14**:

| Source | Evidence and boundary | Product implication |
| --- | --- | --- |
| [UNESCO 2023 Global Education Monitoring Report: technology in education](https://gem-report-2023.unesco.org/technology-in-education/) | The report discusses technology for education-system management but notes evidence on technology's impact is uneven and context-dependent; it also describes data integration/analysis challenges in education management information systems. This is system-level evidence, not proof that this product's buyers demand a specific feature. | Avoid technology/AI feature bloat. Validate an administrative data or reporting pain with local users and test outcomes in a pilot before investing. |
| [UNESCO 2026 GEM Report on access and equity](https://www.unesco.org/gem-report/en/articles/what-does-2026-gem-report-say-about-access-and-equity-education) | The report emphasizes locally grounded policy choices and sustained, long-term change; it does not assess commercial education-ERP demand. | Keep buyer, institution type, country, access constraints, and rollout context explicit. Do not generalize one market's workflow to all schools or coaching providers. |
| [Ed-Fi Data Standard documentation](https://docs.ed-fi.org/reference/data-exchange/data-standard/) | Ed-Fi defines an open K–12 education data model for secure-system interoperability; its documentation identifies Data Standard v6.1.0. This is a K–12-specific ecosystem, not a universal requirement for all tuition/coaching segments. | If US K–12 or Ed-Fi-connected institutions are selected, assess integration/export compatibility with target buyers. Otherwise validate local standards before designing integration work. |
| [W3C WCAG 2.2 announcement](https://www.w3.org/WAI/news/2023-10-05/wcag22rec/) | WCAG 2.2 is a W3C Recommendation for web accessibility. No accessibility conformance audit has been performed on this app. | Make accessibility an acceptance criterion and assess the actual users/devices; do not claim conformance without an audit. |
| [U.S. Department of Education: FERPA privacy and data sharing](https://studentprivacy.ed.gov/privacy-and-data-sharing) | U.S.-specific guidance describes protections for personally identifiable information in education records and conditions on vendor/data sharing. It is not a global legal rule and this project has no selected jurisdiction. | Identify deployment geography and data controller/processor roles; obtain jurisdiction-specific privacy/legal review before handling real student data. |

No competitor feature comparison, market-size estimate, customer interview, usage data, pricing research, or willingness-to-pay evidence was established in this baseline. A whole-product review should research relevant competitor capabilities for the selected segment/geography, cite dated sources, and label vendor claims. Competitor presence is only a signal to investigate; it is not proof of customer demand, adoption, or willingness to pay. Treat the opportunities below as hypotheses, not facts.

## Ranked opportunity hypotheses

1. **Institution-safe onboarding and administration (P0):** establish account provisioning, authentication, roles, and—if shared SaaS—organization-scoped data. This is prerequisite platform work, not optional feature polish.
2. **Reliable core learner operations (P1):** make the current student-to-guardian-to-batch-to-enrollment-to-attendance path dependable and understandable for Admin and Staff. Validate real workflows before adding adjacent modules.
3. **Fee operations (P2, validate first):** test whether fee schedules, invoices, due tracking, payment reconciliation, refunds, or provider integrations are a top buying/workflow pain. Current code only proves manual payment records and `total_fee_agreed`.
4. **Guardian/family engagement (P2, validate first):** test whether guardian notifications, payment visibility, attendance communication, or self-service solve a meaningful problem. Current Guardian records have no account or communication flow.
5. **Reporting and interoperability (P2/P3, segment-specific):** determine whether administrators need exports, cross-system integration, or richer decision reporting; start with target-system requirements.

## Rollout and measurement

1. **Discovery and readiness:** select one initial segment/geography; interview institution decision makers and day-to-day administrators/tutors; verify the P0 items; define data handling, support, and incident paths.
2. **Design-partner pilot:** deploy the existing core workflow to a small, deliberately selected cohort only after the safety gate. Instrument the agreed user journey; collect qualitative feedback and support issues. Do not claim broad product-market fit from one pilot.
3. **Evidence review:** compare measured results with the baseline, re-rank feature hypotheses, and decide whether to invest in fee operations, family engagement, or reporting/integrations.
4. **Controlled expansion:** expand by validated segment and geography, with localized privacy/accessibility/integration acceptance criteria.

Candidate metrics (targets remain **TBD** until baselines exist):

- Time from institution setup to first student enrolled in a batch.
- Percentage of pilot institutions completing student, enrollment, and attendance workflows in the agreed period.
- Attendance completion timeliness and correction rate.
- Time to reconcile recorded payments against the institution's existing process.
- Admin/tutor weekly active usage and pilot retention by role.
- Severity-weighted support issues per institution and time to resolve.
- Accessibility/usability issues identified in observed task completion.

## Decisions required from the product owner

- Which country/region and institution type is first: coaching/tutoring center, independent school, or another K–12 buyer?
- Is the commercial model shared multi-tenant SaaS, one deployment per institution, or undecided?
- Who is the economic buyer and who performs daily administration?
- Which fee/payment workflow and external systems are used in the first segment?
- What privacy, data residency, student-consent, retention, and support obligations apply?
- What customer-discovery evidence and pilot thresholds should convert these recommendations into committed roadmap work?
