# India initial user-problem discovery

- **ID:** `india-initial-user-problem-discovery`
- **Status:** Product Discovery desk research, interview-guide preparation, and recruitment-kit drafting are complete; no customer validation has occurred. Candidate problem/scope and priority remain recommendations only. No feature scope, design, architecture, implementation plan, or release is approved.
- **Last updated:** 2026-11-02
- **Geography:** India (user-selected)
- **Segments in scope:** K–12 schools and coaching providers (both must be considered)
- **Discovery authorization:** Assess whether the delivered Owner/Admin onboarding addresses a validated user problem and compare candidate first daily operational workflows. This authorizes desk research and documentation only—not customer outreach, product/design/code changes, external work items, or technical downstream stages.
- **Source baseline:** The current [feature inventory](../feature-inventory.md) was reconciled to source on 2026-11-02. Do not repeat the technical inventory absent a specific inconsistency. The inventory and [business workflows](../business-workflows.md) describe onboarding as implemented in source and the Institution Admin overview as partial; they do not establish deployment, user acceptance, or customer need. The existing [institution onboarding foundation](institution-onboarding-foundation.md) retains its prior approved scope and decisions; this discovery does not amend them.
- **Canonical context:** [Bug triage](../bug-triage.md) and [roadmap](../roadmap.md) reflect the 2026-11-02 portfolio review. Preserve their existing decisions and evidence boundaries.

## Product discovery

**Owner:** Product Strategist<br>
**Stage boundary:** Compare India K–12 and coaching-provider context, investigate onboarding pain hypotheses and candidate daily jobs, and recommend one next problem to validate. Do not select or approve a feature. Do not begin UI/UX design, architecture/data design, implementation planning, or application-code work.

### Questions to resolve

- Does the delivered Owner → manual first-Admin invitation → claim → Owner review → separate sign-in flow address a real, consequential onboarding problem for either segment? Who experiences the problem, what do they do today, and what outcome would matter?
- Which first recurring operational job, if any, is the strongest candidate to validate in each segment?
- Who are plausible economic buyers and daily users, and what India-specific context could change the problem?

### Evidence and method

Distinguish repository facts; dated first-party vendor claims; independent research; actual customer evidence; and hypotheses. Cite credible sources with publication date (or “not displayed”) and access date. Record customer interviews, telemetry, pilot outcomes, willingness-to-pay, and local buyer validation as unavailable unless directly evidenced. Do not treat desk research, competitor presence, or repository absence as customer validation.

No external outreach is authorized. Do not make legal or compliance determinations; if citing India policies or regulations, use current official sources, explain only the bounded relevance, and identify any specialist/legal review needed.

### Product Strategist findings — desk discovery only

#### Evidence classes and method

- **Repository facts (source inventory dated 2026-11-02):** The current [feature inventory](../feature-inventory.md), [business workflows](../business-workflows.md), [system overview](../../architecture/system-overview.md), [API catalog](../../architecture/api-catalog.md), and [data model](../../architecture/data-model.md) describe the active baseline. Relevant sections were reviewed; the inventory was not re-audited because its stated source baseline is fresh and no specific inconsistency affecting this discovery was found.
- **Approved product direction preserved:** The [institution onboarding foundation](institution-onboarding-foundation.md) remains authoritative for existing approved scope and security decisions. This record neither changes that scope nor reopens its approvals. In particular, Owner verification is out of band, approval is explicit, and approval does not create an Admin session.
- **Independent/official India context:** Government publications and ASER's rural household survey were reviewed for education-system context, school/coaching overlap, and state variation. These sources describe student/school context and policy—not institutional software demand or the daily pain of a school/coaching operator.
- **Vendor claims:** First-party Indian school/coaching software pages were reviewed only to observe vendor-described workflow categories and onboarding claims. Vendor language (including pain and benefit statements) is not independently verified evidence.
- **Actual customer evidence:** None is available in this record. No customer interviews, external outreach, observed use, telemetry, pilot outcomes, support data, local buyer validation, pricing research, or willingness-to-pay evidence was collected. The limited technical/browser acceptance described in the existing onboarding record is not customer discovery.
- **Method and date:** Bounded desk research only; public sources accessed **2026-11-02**. No prototype was created or tested. No external work item, customer contact, or legal/compliance assessment was undertaken.

#### India segment comparison and user hypotheses

These are **personas and jobs-to-be-done hypotheses**, not confirmed roles or buying behavior. “Platform Owner” is a platform-side provisioning role in current source; do not assume that it is the institute's proprietor, principal, economic buyer, or daily operator. Likewise, an Institution Admin account is not proof that its holder buys software or performs every administrative job.

| Dimension | K–12 schools in India | Coaching / tuition providers in India |
| --- | --- | --- |
| Segment is not uniform | Government, aided, and private unaided schools; rural/urban settings; and school levels/boards can imply different budgets, procurement authority, calendars, and data practices. The 2025 MoSPI survey reports substantial government/private differences in enrolment and household course-fee expenditure; it does not explain school software purchasing. | Includes local tuition centres, subject/test-prep coaching, and multi-centre operators. These should not be treated as one operating model. Student/family demand for coaching is not the same as a provider's need or budget for software. |
| Plausible economic buyer | **Hypothesis:** For an independent private school, proprietor, trust/management representative, or school director; for a group, central operations/finance or management. In government settings, a school head may be a user while authority/budget may sit elsewhere. The actual buying/procurement locus is unverified. | **Hypothesis:** Founder/proprietor or centre director for a single centre; owner/group management or operations/finance lead for a multi-centre provider. The person approving software may differ from the tutor or coordinator using it daily. |
| Plausible daily users | **Hypothesis:** Principal/head teacher, school office/registrar, class teacher, attendance clerk, accounts staff, and possibly a parent-facing coordinator. Which role owns each step may vary by school type and size. | **Hypothesis:** Batch coordinator/front office, tutor/faculty, admissions counsellor, and fee/accounts staff. In small centres, the proprietor may also do these jobs. |
| Candidate recurring jobs to investigate | Class/section roster changes; marking daily class attendance and following up exceptions; admissions/withdrawals; timetable/substitution; fee records in fee-charging schools; parent updates and exams/reporting. Do not infer equal relevance across public and private schools. | Preparing the expected learner list for a batch/session; recording session attendance and follow-up; new enrolment/batch placement; instalment dues and receipts; tests/results and learner/parent updates; timetable or room/faculty coordination. Do not infer equal relevance for small tuition and large exam-prep centres. |
| Contextual evidence and limit | The latest published UDISE+ report reviewed, 2025–26 (released 2026-08-17), reports about 14.67 lakh schools and 24.72 crore students nationally. This establishes school-system context, not this product's addressable market, the operator's daily burden, or a requirement to store/copy UDISE+ fields. | MoSPI's 2025 household survey reports 27.0% of students were taking or had taken private coaching (urban 30.7%, rural 25.5%). ASER 2024 reports rural paid-tuition participation by grade band and school type (e.g., 30.4%/28.5% in Std I–V and 32.9%/24.5% in Std VI–VIII for government/private schools). These measure students/households, not provider counts, operator workflows, software adoption, buyer roles, or willingness to pay. |

#### Assessment of delivered Owner/Admin onboarding

**Repository status and boundary:** The source inventory rates workspace authentication and the Owner setup/first-Admin claim-and-review journey **implemented in source**, while the Institution Admin workspace overview is **partial**. The first-Admin link is manually shared; claim leads to pending Owner review; approval grants membership, after which the Admin signs in separately. The `/institution` landing page is an account/Institution overview, not an operational setup or daily-work screen. Source is not evidence of deployment, broad usability, or user acceptance. See the [feature inventory](../feature-inventory.md), [business workflows](../business-workflows.md), [API catalog](../../architecture/api-catalog.md), and `institution-onboarding-foundation.md`.

**Product assessment (hypotheses; not customer validation):**

1. The flow plausibly addresses a **platform access-control/provisioning job**: establish an Institution, nominate an initial Admin, obtain a claim, and keep access pending until a Platform Owner makes an explicit decision. Whether this is a consequential problem for an Indian school or coaching provider—or whether the platform-side Owner is even the buyer—is unknown.
2. The manual hand-off, out-of-band identity check, Owner review, and separate sign-in may create delays, coordination work, uncertainty, or support requests. These are **specific pain hypotheses to investigate**, not observed problems. The steps may instead be acceptable or deliberately valuable to the intended buyer.
3. There may be a **post-access setup gap**: after the first Admin signs in, source shows an overview but does not support entering an operational learner roster, school class/section or coaching batch, staff, or attendance. A new Admin might be unsure what to do next or unable to reach a first operational outcome. This is a source-supported capability boundary, not evidence that users want a specific module.
4. The current flow is better described as **workspace and first-Admin access onboarding** than as complete institute operational onboarding. It does not establish account activation-to-first-value, data migration, initial school-year/cohort setup, or training needs.

**Precise uncertainties to validate:** Who invites whom in the actual institution? Is the “Owner” an ERP360/platform operator or an institution's economic buyer? What happened the last time the institute provisioned an administrator? How are invite links delivered and identity checked today? Where does the process stall, if at all, and what measurable consequence follows? After sign-in, what is the first task the Admin expects to complete? What systems, spreadsheets, or registers must carry over? Are needs different for a rural/urban school, public/private school, small tuition centre, or multi-centre coaching provider?

#### Ranked candidate first daily operational workflows

This is a **qualitative discovery ranking**, based on plausible recurrence, clarity of the user outcome, and fit to the existing baseline—not customer evidence, a numerical score, an approved roadmap, or an implementation sequence. Rank is provisional within each segment; a selected state, school type, or provider size could change it.

| Segment rank | Candidate job/outcome to investigate | Why it is a plausible first workflow | Trade-offs, alternatives, and dependencies to validate |
| --- | --- | --- | --- |
| K–12 — 1 | **Daily class/section attendance and exception follow-up:** a responsible school user knows which enrolled learners belong to a class on that day, records attendance, and resolves absences or corrections. | Recurs on school days, has a recognizable operator/outcome, and is adjacent to student tracking in official school-system context. UDISE+/NEP references are policy/data context only; they do not prove a school's local pain or demand for this ERP. | Depends on a trustworthy roster/class structure and role clarity. Needs discovery of who marks attendance, timing, corrections, offline/paper coexistence, and what follow-up is actually done. Student/minor data and institution-level isolation are later critical risks. |
| K–12 — 2 | **Admission/withdrawal and class/section roster maintenance:** keep a usable current list as learners join, leave, or move. | May unlock attendance and is a plausible first setup task for a new school workspace. | Often seasonal rather than daily; data import, duplicate records, guardian data, school-year/grade structure, and current-system migration may dominate. Validate which school type and who owns the process. |
| K–12 — 3 | **Fee due/receipt reconciliation** (only where relevant to the school type). | Financial records may be salient to some private-school buyers and office users. | Not a fit for all K–12 institutions; current source has no fee model or payment integration. Accounting/receipts, reconciliation, refunds, and local processes increase scope. Do not infer software budget from household education spending. |
| K–12 — 4 | **Timetable/substitution or assessment/reporting.** | Could be a high-coordination job for some schools and is commonly described in vendor product pages. | School calendar/board/grade rules and staff/subject structures may make it broad; no local workflow evidence was collected. Do not choose based on vendor menus alone. |
| Coaching — 1 | **Batch/session roster and attendance:** a coordinator or tutor can identify expected learners for a scheduled session, record who attended, and follow up on relevant exceptions. | Coaching is commonly organized around cohorts/sessions; the job can recur each teaching day and is distinct from school class/section routines. First-party vendor pages list batch/timetable and attendance, a competitive observation only. | Requires an accurate learner-to-batch roster and an agreed definition of attendance across in-person/online or changing batches. Needs to learn whether attendance drives parent contact, retention, safety, or simply a register. |
| Coaching — 2 | **Enrolment-to-batch placement and cohort roster changes.** | Could produce the roster needed for daily session operations and is close to the initial “first useful setup” after admin access. | May be episodic, and course/batch start dates, transfers, sibling/family records, discounts, and branches vary. Existing source has no learner/batch/staff operations; migration and initial setup effort are unknown. |
| Coaching — 3 | **Installment dues, receipts, and follow-up** (where operators identify it as a recurring burden). | Could have direct business relevance for some fee-funded centres; both official context and first-party vendors reference fee-related requirements/capabilities. | Vendor problem statements are not independent validation. No fee ledger, settlement, or payment-provider flow exists in active source; refund/fee practices and state-specific rules need local review. Do not assume online payments are required. |
| Coaching — 4 | **Tests/results and learner/parent updates.** | May connect recurring instruction with student progress and parent questions. | Requires assessment definitions, content/results workflows, and communications; this can expand beyond a first operational slice. Presence on vendor pages does not establish priority or outcomes. |

**Cross-segment comparison:** Attendance has a plausible high-frequency analogue in both segments, but its unit differs (school day/class/section versus coaching session/batch) and may conceal distinct jobs. It is not a recommendation to build one generic attendance feature. Another credible alternative is to start with first-day roster import/setup rather than attendance. Fees may be more consequential for some private schools and coaching businesses, but not for every school and not necessarily the daily operator. Customer discovery must decide whether any of these is more important than onboarding friction or another job.

#### Source-grounded constraints, dependencies, and risks

- **No active operational foundation yet:** The current baseline has no active Student, Guardian, Batch, Enrollment, Attendance, or Payment model, and no active institution-scoped operational business controller/query. The Institution Admin guard/membership exists but is not consumed by an operational workflow. Relevant paths: [system overview](../../architecture/system-overview.md), [API catalog](../../architecture/api-catalog.md), [data model](../../architecture/data-model.md), and [feature inventory](../feature-inventory.md). This is an implementation boundary, not customer-demand evidence.
- **Operational tenant boundary is unproven:** Before any real student or institution operation is considered, institution scoping, role access, and data isolation require approved architecture and security review. This is a later release risk/gate, not a proposed design here.
- **Existing onboarding is limited to the first Admin:** The current invitation is manually delivered; there is no active email delivery or staff/tutor provisioning. An Admin account is associated with one Institution in the current data shape. Validate whether a single-branch pilot is representative, especially for school groups or coaching networks. No adjustment to the already approved onboarding decisions is proposed.
- **Roster and workflow dependencies:** Attendance depends on a current learner roster and the relevant grouping concept (school class/section or coaching batch/session). Fee tracking depends on institute-specific fee/receipt practices; tests/parent updates depend on the result definitions and communication channels users already rely on. These are discovery dependencies only; no data design is being proposed.
- **India school data context:** The latest published UDISE+ 2025–26 report reviewed is an official national school-system context source, not a feature requirement or demand signal. If a later, approved workflow handles student records or identifiers, data minimization and privacy/security questions require appropriate specialist review; this discovery makes no determination about what ERP360 should collect or integrate.
- **Coaching jurisdiction/context:** The Ministry's January 2024 coaching-centre guidelines were circulated to States/UTs for consideration; the Ministry's August 2026 response lists later state/UT instruments. This signals that the chosen location and provider type matter. It is not a determination that a given provider is covered or that a software feature is legally required. Obtain jurisdiction-specific legal/compliance review if product scope later depends on regulation; no legal advice is given here.
- **Operational and adoption risks:** Manual record migration or parallel registers could make setup burdensome; teaching schedules may be disrupted by changing processes; a workflow that fits a multi-branch coaching chain may be unsuitable for a local tutor or a school. Language, connectivity, device access, accessibility, data retention, payments, and integrations were not investigated at user level.
- **Decision-quality risk:** National or rural household indicators, first-party product pages, prior browser acceptance, and repository absence can all be mistaken for demand. Keep them separate from direct buyer/operator evidence.

#### Interview guide — prepared, not conducted

**Purpose:** Understand how an institution currently provisions an administrator, what that person needs to accomplish first, and how a recent roster/attendance task actually works. Explore K–12 schools and coaching providers in separate interviews; do not assume their group, attendance, or follow-up workflows are interchangeable.

**Status and boundary:** The user authorized preparation of this guide for both segments across India. No participant has been contacted, no interview or prototype test has occurred, and no external outreach is authorized by this guide. This is a research instrument, not a feature specification, design handoff, or product-scope approval.

**Sampling notes:** India-wide scope is not a representative sample. Record the state/city and urban/rural context where known, institution type and ownership, approximate size band, delivery mode, participant role, and whether the participant buys, approves, administers, or performs the daily work. For each segment, speak separately with decision makers and daily operators where practical; do not assume these roles are the same person. Compare relevant school types and coaching models without claiming that a few interviews represent either segment nationally.

**Facilitator opening:** “We are trying to understand how your current work happens, not sell a particular feature. Please use a recent real example. You can skip any question. We do not need student names, contact details, account credentials, or identifiable records; please do not share them.”

**Suggested conversation flow (adapt as needed):**

1. **Context and role:** “What is your role? Which decisions do you make, and which tasks do you personally perform?” “What kind of institution is this, where does it operate, and how is teaching organized?”
2. **Recent administrator onboarding:** “Think of the most recent time an administrator or staff member needed access. Please walk me through what happened, from the request until they could do useful work.” “Who initiated each step? How were the invitation and identity handled? Where did it pause, need help, or work smoothly?” “What did the person do first after access, and what did they still need?”
3. **Open workflow recall:** “Think about the most recent ordinary teaching day. What did you personally do or coordinate?” “Which task required the most attention, and what made it easy or difficult?” Ask for a recent example before naming attendance or fees.
4. **Roster and attendance episode:** “Tell me about the last time you needed to know who was expected in a teaching group and who was present. How did you get the list, record what happened, correct mistakes, and decide whether to follow up?” “What happened the last time the list was late, missing, or disagreed with another record?” “Who noticed, and what was the consequence?”
5. **Current process and alternatives:** “What tools, registers, messages, or people support this work today?” “What works well enough that you would want to keep it?” “What have you tried changing?” If a participant offers to show a process artifact, ask them to redact or describe it instead of sharing identifiable student or family information.
6. **Buyer and adoption:** “Who would decide whether to adopt a different process or tool?” “Who controls the budget, who would use it, and whose routine would change?” “What would make you keep the current approach or reject a new one?”
7. **Close and disconfirm:** “Which important task did I not ask about?” “If this workflow became easier, what would actually change?” “When is this not a problem?” Record evidence against the attendance and onboarding hypotheses as carefully as supporting examples.

**K–12 school probes (use only where relevant):**

- “Which class or section was involved, and how was its current learner list maintained?”
- “Who marked attendance, when, and how were late arrival, absence, correction, transfer, or a changed class handled?”
- “Was follow-up expected after an absence? Who decided, who acted, and what happened?”
- “How does the process differ by school level, ownership, or location? Which parts use paper, spreadsheets, or an existing system?”
- “What other job—such as admissions, timetable changes, fees, or assessment—would take priority over this one, if any?”

**Coaching-provider probes (use only where relevant):**

- “Which batch or session was involved, and how did you know which learners were expected?”
- “How were attendance, late arrival, make-up sessions, batch transfers, or online/in-person differences handled?”
- “Did anyone use attendance to contact a learner or family, make a teaching decision, or maintain a record? What actually happened?”
- “How do enrolment and placement change the batch list? Does this work differently across branches or course types?”
- “What other job—such as enrolment, instalment records, scheduling, tests, or parent updates—would take priority over this one, if any?”

**Onboarding-specific follow-up:** Ask only after the open workflow discussion: “Based on the process you described, where would administrator access fit? What would need to happen before the administrator could complete the first useful task?” If later testing an approved concept, first ask what the participant thinks the invitation/approval flow means and what remains to be done; do not explain the intended design before observing their interpretation. No prototype currently exists.

**Research notes template:** For each interview, record the segment/context and participant role; the recent episode and steps; tools/workarounds; frequency as described by the participant; delay, effort, or consequence with their own example; who owns and approves the work; what worked well; counterexamples; onboarding-to-first-task relationship; and unresolved questions. Use de-identified notes and distinguish direct observations/quotes from facilitator interpretation. Do not invent scores or extrapolate prevalence from a small qualitative sample.

**Synthesis rule:** Compare K–12 class/section attendance and coaching batch/session attendance separately. Look for repeated recent examples, counterexamples, role differences, and alternative higher-priority jobs. Do not treat agreement with a feature idea, a vendor claim, a single interview, or the absence of an existing ERP workflow as validated demand. Return evidence and uncertainty for an explicit user scope/priority decision before design or technical stages.

These prompts are a prepared guide only. No customer evidence, approved feature, or authorization for external outreach is implied.

#### Recruitment kit — draft for review, not sent

**Sampling caveat:** “Pan-India” is the requested scope, not a representative sampling claim. Record each participant's state/city, urban/rural context if known, institution type/ownership, operating model, and role. Keep school and coaching interviews separate; seek variation across contexts and both decision-making and daily-operating roles where practical. Do not set or imply a statistically representative sample from this qualitative study.

**Invitation draft:**

> **Subject:** Short conversation about school/coaching operations
>
> Hello [name],
>
> I’m learning how education providers in India handle administrator access and day-to-day work such as class or batch rosters and attendance. I’m looking to understand your current process and recent examples—not to sell a product or ask you to evaluate a feature.
>
> Would you be open to a [30–45 minute] conversation? You can skip any question. We do not need student or family names, contact details, account credentials, or identifiable records; please do not share them. Before the conversation, I can explain how notes will be used.
>
> If interested, please share your role, institution type, state/city, and a convenient time. Participation is voluntary.
>
> Thank you, [Your name / organization]

Personalize the sender, purpose, duration, and note-use explanation before sending. Do not promise confidentiality, compensation, or product access unless those terms are accurate and approved. This draft has not been sent.

**Brief screener (ask before scheduling):**

1. Is your current work mainly with a K–12 school, a coaching/tuition provider, or another type of institution?
2. Which state/city is the institution in? Is its context primarily urban, rural, or mixed (if known)?
3. For a school: what ownership/type and school levels are relevant? For coaching: is it local tuition, exam preparation, single-centre, multi-centre, or another model?
4. What is your role? Do you make or influence adoption decisions, perform daily administrative work, teach, or cover more than one of these?
5. Have you personally handled administrator onboarding/access, class or batch rosters, or attendance recently? Which process can you describe from a real example?
6. Are you comfortable discussing the process without sharing identifiable student/family information or confidential records?

Use the answers to label context and ensure both buyer/decision-maker and daily-operator perspectives are represented. Do not exclude a participant solely because they have no onboarding experience; record that boundary and focus their interview on work they actually perform.

**Before any interview:** Confirm voluntary participation and the intended use of notes. Ask permission before recording; if recording is not needed, take de-identified notes. Do not request or retain student names, IDs, phone numbers, records, credentials, or screenshots containing identifiable information. Stop or redirect if such information is offered.

**After interviews:** Share de-identified notes grouped separately by school and coaching context. Include contradictory examples and where a participant had no problem. Do not send contact details or identifiable student/family data into the product analysis.

This recruitment kit is for the user's review and use. No invitation has been sent and no external outreach is authorized by this record.

#### Recommended next discovery problem — unapproved

**Recommendation:** First validate, separately with one clearly defined K–12 school type and one clearly defined coaching-provider type, whether maintaining a reliable current teaching-group roster and recording/following up attendance is a consequential recurring job—and how the current Owner/Admin access flow affects getting to that first useful task. Start with recent real episodes, not feature reactions. Compare frequency, existing workaround, consequence, role ownership, data needed, and buyer authority qualitatively; numeric thresholds remain **TBD** until evidence exists.

This is a **problem to investigate**, not a feature choice, segment decision, scope approval, prototype/design handoff, or implementation authorization. The same discovery should explicitly test whether current onboarding solves an access problem, creates friction, or is simply unrelated to the operator's primary need. The user retains the later scope/priority decision. No outreach is authorized by this recommendation.

**Measures to establish only if discovery proceeds:** Current time/steps from admin access to the first completed operational task; frequency and recovery effort for roster/attendance exceptions; reported consequences; setup/support burden; and, only after an appropriate baseline, task-success measures. Numeric targets and willingness-to-pay remain **TBD**.

#### Research sources and limits

All sources below were accessed **2026-11-02**. Publication dates are shown where the source displays them; undated vendor pages are labeled accordingly.

| Source / evidence class | Publication date; geography/segment | What it supports | What it cannot establish |
| --- | --- | --- | --- |
| [UDISE+ Report 2025–26 (NEP Structure) — Ministry of Education / PIB](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2300408&lang=1&reg=48) — official administrative/reporting context | Report released **2026-08-17**; India school education | The Ministry reports 14.67 lakh schools, 1.03 crore teachers, and 24.72 crore students nationally. This is system context only. | ERP market size, school buyers' software spend, local operator pain, or a requirement for this product to store UDISE+ fields. |
| [Comprehensive Modular Survey: Education, 2025 — MoSPI press note](https://www.mospi.gov.in/sites/default/files/press_release/25082025_press%20release_CMS_E-Final_N.pdf) — official household survey | **2025-08-26**; India, currently enrolled school students/households | National school-type context and that 27.0% of students were taking or had taken private coaching during the year (urban 30.7%, rural 25.5%). The note itself cautions that state estimates require attention to sample size/RSE. | Number of coaching providers, daily provider workflows, software adoption, provider revenue, or buyer willingness to pay. Household education expenditure is not a software budget. |
| [ASER 2024 Rural — ASER Centre / Pratham](https://asercentre.org/wp-content/uploads/2022/12/ASER_2024_Final-Report_13_2_24.pdf) — independent household research | Published **2025-01-28**; rural India | Rural household survey context and paid-tuition-by-school-type patterns (2024 estimates in its annexure). | Urban patterns, provider operations, causality, software need, or willingness to pay. |
| [Guidelines for Regulation of Coaching Center — Ministry of Education](https://www.education.gov.in/sites/upload_files/mhrd/files/document-reports/Guideliens_Coaching_Centres_en.pdf) — official policy context | Dated **2024-01-16**; India, coaching centres | The central guidelines were sent to States/UTs for consideration; they discuss registration, records, fee-related issues, and other center operations. | Whether a specific provider or feature is covered under current local law; no legal conclusion is drawn. |
| [Parliament Question: Regulation and Oversight of Private Coaching Institution — PIB / Ministry of Education](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2298513&lang=1&reg=1) — official current context | Posted **2026-08-12**; India, private coaching | The Ministry reports that multiple States/UTs have since issued local measures, reinforcing the need to identify the jurisdiction if regulation becomes relevant. | A complete legal inventory, provider applicability analysis, or compliance advice. |
| [School management software for Indian schools — EduOps](https://www.eduops.co/student-information-system) — first-party vendor claim | Publication date **not displayed**; India, schools; accessed **2026-11-02** | Vendor describes student records, timetable, fees, assessment, attendance, and setup/migration services as product capabilities. | Independent verification of capability, adoption, unmet need, buyer demand, or comparative product quality. |
| [Coaching institute management — CoachPlus](https://coachplusapp.com/solutions/coaching) — first-party vendor claim | Publication date **not displayed**; India, coaching; accessed **2026-11-02** | Vendor describes batch/timetable, fees/installments, attendance/parent communications, and data import as its offer. | Independent verification of its pain statements, market adoption, demand, willingness to pay, or the right priority for this product. |

**Exact research performed:** Reviewed the current supplied discovery record; relevant current product/architecture inventory and onboarding/workflow context; official Ministry of Education UDISE+ material; MoSPI's CMS Education 2025 press note; ASER 2024 Rural; the Ministry of Education's coaching-centre guidelines and the August 2026 PIB response; and first-party EduOps and CoachPlus pages. Search was limited to India school/coaching context, coaching participation, state-regulatory context, and vendor-described workflow categories.

**Remaining unverified:** Actual user/buyer identities; school type, state/city, board, institution size, and purchasing authority; onboarding success/friction and first useful outcome; daily work frequency and consequences; current tools, process artifacts, migration readiness, language/accessibility/connectivity needs; product fit versus existing solutions; provider counts, competitive adoption/pricing; willingness to pay; real product deployment/use; applicable jurisdiction-specific legal requirements; and the suitability of any operational workflow. No external outreach or prototype validation was performed or authorized.

## User decision and next gate

- **Feature scope/priority decision:** Pending. This desk research does not validate customer demand or provide a sufficiently evidenced feature scope for approval.
- **Interview-guide and recruitment-kit decision:** On 2026-11-02, the user requested a guide and invitation/screener draft comparing K–12 school types and coaching-provider types across India. Both are prepared for the user's review; this did not authorize sending messages, interviews, prototype testing, or implementation.
- **Immediate next step:** The user may personalize and send the invitation to selected participants, then share de-identified interview notes for synthesis. No outreach has occurred.
- **Later gate:** After direct customer evidence is obtained (or the user explicitly accepts the evidence limitation), the Product Owner must explicitly approve, reject, or revise a specific product scope and priority. Until then, UI/UX design, architecture/data design, implementation planning, and application-code changes remain out of scope.

## Decision and handoff history

| Date | Actor | Record |
| --- | --- | --- |
| 2026-11-02 | User | Authorized India-focused desk discovery comparing K–12 schools and coaching providers, assessing the delivered onboarding and possible first operational workflows. Explicitly did not authorize feature scope/priority, design, architecture, implementation, release, or external outreach. |
| 2026-11-02 | Product Strategist | Completed bounded public-source desk research only. Recommends (unapproved) validating roster/attendance work and onboarding-to-first-value separately with a defined K–12 school type and coaching-provider type. No customer validation, user scope/priority decision, outreach, prototype, or downstream handoff occurred. |
| 2026-11-02 | User / Product Strategist | User authorized preparation of an interview guide comparing school and coaching types across India. The guide was added to this record; no outreach or interviews were authorized or conducted. |
| 2026-11-02 | User / Product Strategist | User selected comparison across K–12 school and coaching types with state/city context recorded, without claiming national representativeness, and requested an invitation/screener draft. Recruitment materials were added for user review only; they were not sent. |
