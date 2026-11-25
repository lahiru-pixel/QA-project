# Section 3.1 Introduction and Test Planning

## Document control

| Item | Value |
| --- | --- |
| Project | Online Tutorial Platform |
| Plan | TP-OTP-01, version 1.0, 2026-11-25 |
| Source baseline | `c068e28`; React/Vite frontend, Express backend and Supabase schema |
| Preparation status | Planning deliverable complete for the scope supplied in the user's request; ready for group review |
| Execution status | All application tests Not Run; no environment or quality result is implied |
| Review roles | QA lead, frontend/backend developers, group representative; individuals to be assigned |
| Assignment basis | User supplied Section 3.1 and 3.2 titles and requested content; original DOCX remains unavailable, so additional rubric conditions are unverified |

This plan defines how the group will evaluate the actual platform safely and produce traceable evidence. It builds on [project analysis](project-analysis.md) and [implementation roadmap](testing-roadmap.md). The companion [STLC guide](section-3.2-stlc.md), [manual matrix](section-3.2-manual-test-cases.md) and [Excel-compatible CSV](section-3.2-manual-test-cases.csv) provide the procedure and designed cases. No application logic changes are part of this delivery.

## Project introduction

The platform lets students register, sign in, browse published courses and view lessons after an administrator approves account payment and enrolls them in the relevant course. Administrators maintain courses and YouTube lesson metadata, manage student payment flags and enrollment, and view summary counts. Payment is a manually maintained account status; the system does not process money.

The React single-page application uses Vite, React Router and Axios. Supabase Auth provides accounts and sessions, while PostgreSQL stores profiles, courses, videos and enrollments. The browser reads its own profile through Supabase; application data otherwise passes through Express. The backend uses a service-role client that bypasses database row-level security, so server authentication and authorization must be tested independently of browser redirects. Authorized lessons are embedded from YouTube. The [analysis](project-analysis.md) contains the complete 18-endpoint inventory and schema relationships.

Primary stakeholders are students who need dependable access, administrators who must maintain the correct access state, developers who need reproducible defects, and the university assessors who need authentic evidence.

## Testing objectives

1. Verify that actual registration, login, browsing, administration and learning flows behave according to the source-supported rules and clarified requirements.
2. Demonstrate that unauthorized callers cannot retrieve restricted lesson URLs, alter payment/enrollment or use admin APIs, including direct requests that bypass the UI.
3. Check data consistency across profile creation, enrollment uniqueness, payment timestamps, course deletion and video ordering in a disposable database.
4. Identify failures in error handling, usability, accessibility, browser compatibility and performance, using explicit conditions and measurable criteria.
5. Establish reproducible test data, case-to-requirement links, execution records and a defect/retest history without exposing credentials or personal information.
6. Preserve application behavior while planning future automation; distinguish an existing behavior from an approved business requirement when they differ.

## Scope

| In scope | Boundary |
| --- | --- |
| Registration, login, session restore and logout | Supabase integration and UI, synthetic accounts, local confirmation email capture |
| Authentication and admin authorization | Browser guards, Bearer token validation, profile lookup, every admin endpoint |
| Catalog and course details | Published list, ordering, metadata, missing/empty/error states and draft visibility characterization |
| Course administration | Create/edit/publish/unpublish/delete, cancellation and local cascade checks |
| Student enrollment | Both management screens, searching, duplicate handling, removal, ownership and concurrent requests |
| Payment status | Mark/revoke paid, timestamps, account-wide effect and next-request access enforcement |
| Video administration and viewing | Metadata CRUD/order, payment-plus-enrollment checks, embed URL handling, fullscreen and denial paths |
| Student/admin dashboards | Own-course isolation, empty states, summary counts and failures |
| Database integration | Supplied schema, trigger, constraints and role-based RLS checks in isolated Supabase |
| Quality attributes | Scoped security, accessibility, responsiveness, supported browser proposal, reliability and bounded performance measurements |

Out of scope: real payment settlement/refunds, quizzes/exams/grading, attendance/progress tracking, native mobile apps, video upload/transcoding, password reset or email-change UI, DRM, exhaustive testing of Supabase/YouTube internals, production penetration/load testing, disaster recovery of the provider, and legal/compliance certification. These are absent features or external service responsibilities. Failure handling at their actual integration boundaries remains in scope. Automation implementation, application fixes and execution belong to later roadmap phases; this delivery contains planning and test design.

## Functional requirement register

These IDs are project test requirements for traceability, not invented university subsection IDs. **Source** means expected current behavior inferred from code; it is not proof of execution. **Proposed** quality expectations require review before acceptance decisions. Q IDs identify unresolved policy questions.

| ID | Testable requirement and basis | Primary source |
| --- | --- | --- |
| FR-01 | Register through Supabase with name/email/password; create a student/unpaid profile; display returned SDK errors. Confirmation, duplicate-email and password policy depend on configuration (Q01). | [Register](../frontend/src/pages/Register.jsx), [schema](../database_setup.sql) |
| FR-02 | Valid login navigates to My Courses; returned auth error remains visible; logout returns to login and clears the browser session when sign-out succeeds. | [Login](../frontend/src/pages/Login.jsx), [Navbar](../frontend/src/components/Navbar.jsx) |
| FR-03 | Protected APIs verify Bearer token and profile; reject missing/invalid identity; frontend restores session and attaches token. Proposed: stale auth responses must not show another account's role (Q07). | [authenticate](../backend/middleware/authenticate.js), [AuthContext](../frontend/src/context/AuthContext.jsx), [API client](../frontend/src/services/api.js) |
| FR-04 | All admin APIs require an authenticated admin profile; student/guest admin navigation is redirected home. | [admin routes](../backend/routes/admin.js), [AdminRoute](../frontend/src/components/AdminRoute.jsx) |
| FR-05 | Public catalog contains published courses, newest first; detail returns ordered lesson metadata without YouTube URLs. Draft detail and guest/API differences need policy confirmation (Q02). | [course routes](../backend/routes/courses.js), [HomePage](../frontend/src/pages/HomePage.jsx), [App](../frontend/src/App.jsx) |
| FR-06 | Admin creates, updates, publishes and deletes courses; deletion cascades to lessons/enrollments. Input validation and no-match status policy are unclear (Q03/Q06). | [ManageCourses](../frontend/src/pages/admin/ManageCourses.jsx), [admin routes](../backend/routes/admin.js), [schema](../database_setup.sql) |
| FR-07 | Admin enrolls/removes a profile in a course; non-null student/course pairs are unique; actor is authenticated admin. Both enrollment UIs must reflect changes. Student-only targets and null input need clarification (Q03). | [ManageStudents](../frontend/src/pages/admin/ManageStudents.jsx), [CourseStudents](../frontend/src/components/CourseStudents.jsx), [admin routes](../backend/routes/admin.js) |
| FR-08 | Admin toggles account-wide paid flag; marking paid sets timestamp and revoking clears it. Enrollment and payment are independent; live UI refresh policy is unclear (Q04). | [admin routes](../backend/routes/admin.js), [ManageStudents](../frontend/src/pages/admin/ManageStudents.jsx) |
| FR-09 | Watch API allows admin, or a paid student enrolled in that video's course; denies other callers without exposing the URL. | [isEnrolled](../backend/middleware/isEnrolled.js), [video routes](../backend/routes/videos.js) |
| FR-10 | My Courses uses authenticated user's enrollments, including unpaid accounts; empty list has a visible empty state; other students' courses must not leak. | [student routes](../backend/routes/students.js), [StudentDashboard](../frontend/src/pages/StudentDashboard.jsx) |
| FR-11 | Admin manages video metadata by course and order; watch UI parses supported URLs. Proposed: failed reorder must not silently corrupt ordering; atomic behavior is unspecified (Q05). | [ManageVideos](../frontend/src/pages/admin/ManageVideos.jsx), [WatchPage](../frontend/src/pages/WatchPage.jsx) |
| FR-12 | Admin statistics count student-role profiles, paid students and all courses; returned query errors currently become zero counts (Q07). | [admin routes](../backend/routes/admin.js), [AdminDashboard](../frontend/src/pages/admin/AdminDashboard.jsx) |
| FR-13 | Own-profile RLS protects profile reads; student direct-table access is restricted; registration role is fixed to student; SQL constraints govern relations. Verify with user clients, not service-role assertions. | [schema](../database_setup.sql) |

## Non-functional requirements and acceptance proposals

These are proposed project acceptance criteria, not already agreed rubric thresholds. Record baseline measurements first; Q08 must be resolved before capacity or compatibility sign-off.

| ID | Quality area | Requirement / proposed acceptance condition | Measurement and evidence |
| --- | --- | --- | --- |
| NFR-01 | Security/privacy | Every designed unauthorized mutation is denied without changing fixtures; denied watch responses omit lesson URL; no real secrets/personal data in reports | Role-matrix API results and before/after fixture checks, RLS results, sanitized artifact review |
| NFR-02 | Reliability/recovery | No wrong-user access; recoverable request failures permit recovery without silent data loss; partial writes are detected and disclosed | Controlled timeout/returned-error/rejection scenarios, state comparison and regression evidence; Q05/Q07 |
| NFR-03 | Interaction/accessibility | Core flows operable by keyboard, controls have accessible names and focus, feedback is understandable, no essential clipping at agreed viewport/zoom | Manual keyboard/zoom checks and axe findings; propose WCAG 2.2 AA as future review target, not a compliance claim |
| NFR-04 | Performance efficiency | Proposal: local read-only catalog/detail workload, ramp 1 to 5 virtual users over 30 seconds then hold 60 seconds, p95 under 2 seconds and HTTP failure rate under 1%; stop on any unexpected mutation or >5% errors over a 10-second window | k6 request timings with hardware, test-data volume (propose 20 courses and 100 lessons), dependency mode and thresholds recorded. Not measured; Q08 approval required |
| NFR-05 | Compatibility/flexibility | Core flows on agreed browser matrix and viewport sizes; clean environment setup and deep links function | Proposal: current locally available Chromium/Firefox/WebKit; record exact versions; 390x844, 768x1024, 1440x900; engines/viewports do not prove physical-device support |
| NFR-06 | Maintainability/testability | Separate tests from app logic, reproducible install from locks, deterministic mocks, traceable fixes and meaningful coverage | Review test boundaries and repeat runs; numerical code coverage threshold pending rubric, no invented minimum |
| NFR-07 | Data integrity | No duplicate non-null enrollment pair or unintended cross-course change; local cascade deletes only designated fixture records | SQL/API comparisons, run-scoped IDs, partial-write checks; Q03/Q05 |

## Testing strategy

Testing will proceed by risk. Authentication, authorization, lesson access, payment and enrollment have highest priority because a failure can expose content or change access. Course/video management and own-course visibility follow, then error states and presentation. P1/P2/P3 in the case matrix mean high/normal/lower execution priority, not confirmed defect severity.

| Level/type | Approach and purpose | Dependency |
| --- | --- | --- |
| Static verification | Review requirement clarity, routes, middleware, SQL, test cases and configuration; run existing lint later | Source and design documents |
| Unit/component | Jest backend; Vitest/RTL frontend; isolate Supabase and HTTP; assert branches and user-visible behavior | Later test setup, no external services |
| API integration with mocks | Supertest against actual routers/middleware, controlled SDK errors; direct manual requests for role matrix | Test-only Express harness; no bypass of permission middleware |
| Real DB/auth integration | Apply supplied schema to disposable local Supabase; test trigger, RLS, uniqueness and cascades | Verified local target and synthetic accounts |
| System/manual acceptance | Execute the manual matrix and complete admin-to-student journeys; later Playwright regression | Local complete stack or explicitly labeled stub mode |
| Non-functional | Accessibility/manual usability, bounded performance, scoped security and failure recovery | Approved scope/thresholds and safe target |
| Regression/confirmation | Re-run the failing case after each authorized fix and related security/data flows | Actual defect and changed-source baseline |

Black-box techniques: valid/invalid input partitions, payment/enrollment decision tables, session/payment/enrollment state transitions and end-to-end scenarios. Boundaries include zero/one/many courses and first/last lesson order. Password boundaries use the recorded local Auth policy; there is no assumed application password minimum. White-box branch design covers early returns and exceptions in middleware. Exploratory testing supplements scripted cases; it does not replace required evidence.

The case **Expectation basis** separates Source, Characterization and Proposed acceptance. Characterization records a code behavior that may be undesirable (for example, public draft detail). Passing that case does not approve the behavior as safe. Proposed acceptance cases with unresolved Q IDs remain Not Run until clarified; simulated-error cases cannot run until a controlled test stub is available.

## Test environment and configuration

Baseline recorded in the analysis: Node v24.14.1, npm 11.11.0; no installed package dependencies and no local environment files. Locked Vite 8.2.0 and Supabase JS 2.111.0 require a compatible Node runtime (installed Node meets the inspected constraints). Recheck versions when provisioning. No test environment was started in this phase.

| Component | Planned configuration |
| --- | --- |
| Workstation | Existing Windows/PowerShell; Docker-capable workstation for local Supabase; record OS, CPU/RAM and runtime versions at execution |
| Frontend | Local Vite server, proposed port 5173; `VITE_API_BASE_URL` points to isolated API origin; `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to isolated Supabase |
| Backend | Local Express, proposed `PORT=5000`; test `SUPABASE_URL` and server-only `SUPABASE_SERVICE_ROLE_KEY` |
| Database/auth | Disposable local Supabase; [schema](../database_setup.sql) applied only there; recorded email-confirmation/password settings, local mail capture; no production identifiers |
| Manual browsers | Separate guest/student/admin profiles or private contexts; exact versions and extensions recorded; reset state per case |
| Fault simulation | Future local test-only stub/proxy controls specific returned errors, delay/rejection or response bodies; do not edit production handlers to inject failures |
| Data | Run-prefixed synthetic accounts/courses/videos; fixture catalog and reset rules in [STLC guide](section-3.2-stlc.md) |

Use explicit allowlisted frontend/API/Supabase targets and a test-mode guard before fixture writes. Reject unknown/production destinations; do not use developer configuration as a fallback. Keep service-role credentials out of all browser builds. Add ignores for test environment files and browser storage before writing them. Do not record tokens in screenshots, requests exported for submission, traces or logs. Unit tests must reject unexpected network calls, not merely use fake keys. Cleanup is by captured run-specific IDs; broad deletes are prohibited. Destroy/recreate schema only in the verified disposable local instance.

## Tools and resources

| Resource | Purpose and preparation |
| --- | --- |
| Browser + DevTools; Postman or equivalent local HTTP client | Manual UI/API execution, status/body inspection; retain secret headers only in untracked local variables |
| Excel or LibreOffice | Open UTF-8 CSV with comma delimiter, all columns as text, wrap text, filter by ID/status/requirement |
| Supabase CLI/Docker and SQL client | Isolated auth/data, local email capture, controlled setup and read-only assertion queries |
| Jest/Supertest; Vitest/RTL/user-event/jsdom/MSW | Future automation per roadmap; verify peer/engine compatibility before pinning dev dependencies |
| Playwright, axe-core; k6; optional ZAP | Future browser, accessibility, bounded load and scoped security work; not installed/executed here |
| Git and Markdown editor | Baseline, change review, case versioning, traceability and sanitized defect records |
| People | QA lead owns plan/traceability; frontend tester owns UI/interaction; backend tester owns API/data; reviewer checks cases/evidence; roles may be combined in a small group |
| Inputs | Original assignment, clarification decisions, isolated target and credentials, permitted sample video, locally generated passwords, deadline and group membership |

The reviewed tool families are inherited from the existing roadmap. No new dependency selection, installation or claim of verified runtime compatibility is made in this phase.

## Proposed testing schedule

Relative working days start when the group confirms scope and can provision a safe environment. This is a proposed sequence, not a fixed university deadline or completed timesheet. Team members and calendar dates remain to be assigned.

| Day | Activity | Milestone / roadmap mapping |
| --- | --- | --- |
| 1 | Review this plan, original rubric when supplied, Q decisions and matrix | Reviewed Section 3.1/3.2 design; P0/P2 |
| 2–3 | Provision isolated environment, guards, tools, fixtures and baseline lint/build | Safe reproducible setup; P1 |
| 4–5 | Unit/component infrastructure and manual registration/auth checks | Early identity/access evidence; P3 |
| 6–7 | API permissions, enrollment/payment, DB constraints/RLS | Data and access evidence; P4 |
| 8–9 | Browser/system flows, CRUD, dashboard, media and compatibility | Functional regression baseline; P5 |
| 10–11 | Accessibility, scoped security, failure recovery and agreed load | Non-functional evidence; P6 |
| 12–13 | Authorized fixes, confirmation and regression; repeat as needed | Defect dispositions; P7 |
| 14 | Submission audit, quality summary, contributions and demo preparation | Evidence-linked report; P8 |

Prioritize P1 cases if time is constrained. Reduce optional breadth only through a recorded scope decision; never label unexecuted work passed. Allocate contingency by shifting dates after real blockers, rather than inventing results to preserve the schedule.

## Risks and mitigation

| Risk | Likelihood / impact assessment | Mitigation and owner |
| --- | --- | --- |
| Service-role test hits production | Possible / critical | Explicit target guard, local-only destructive cases, ID-limited cleanup; environment owner |
| Missing DOCX or unclear expected behavior | Current / high | User scope is current basis; Q register and later rubric reconciliation; QA lead |
| False confidence from UI-only or mocked tests | Likely / high | Direct API role tests and real RLS/constraint tests; backend tester |
| SDK/Vite/test-runner incompatibility | Possible / medium | Verify engines/peers, lock versions, record install failure; automation owner |
| Async auth races or stale payment display | Possible / high | Delayed auth/profile cases and fresh server-request checks; frontend tester |
| Partial video reorder or concurrent enrollment | Possible / high | Controlled failures, unique constraints, before/after checks; backend/frontend testers |
| Shared fixtures make later cases invalid | Likely / medium | Reset per case, capture IDs, isolate actors/contexts; all testers |
| External media or email nondeterminism | Likely / medium | Block/stub media, local mail capture, separate real playback check; environment owner |
| Secrets/personal data in evidence | Possible / high | Synthetic accounts, header/trace redaction, reviewer check; evidence owner |
| Tight deadline or unavailable group members | Possible / medium | Risk-ordered schedule, role backup and transparent Not Run list; group lead |

## Entry and exit criteria

**Design entry:** source baseline and requested scope available. This is met for the current planning task. **Design exit:** all requested plan headings, STLC phases, case fields, source links, ambiguity records and matching CSV are present and structurally validated; review approval remains a group action.

**Execution entry:** safe target proven; dependencies/build smoke viable; required fixtures and accounts prepared; tester can distinguish stub vs real stack; scenario's expected behavior approved or explicitly a characterization; secrets/evidence controls in place. If any entry condition fails, keep the affected case Not Run and record the blocker separately.

**Functional exit proposal:** all approved P1 cases executed and passed; remaining approved in-scope cases executed with actual outcomes; no unresolved critical/high access or data-integrity defect; lower-risk findings dispositioned by the group; required rubric criteria met. An exception must identify the affected cases and owner and cannot be called an unconditional pass.

**Non-functional exit proposal:** agreed thresholds and browser/accessibility checks evaluated with evidence; actual failures and limitations disclosed; no claim for unmeasured load or unavailable browsers. Numerical thresholds remain provisional until Q08 is resolved.

Suspend execution on an unknown target, sensitive-data exposure, environment failure that invalidates results, or unexpected broad data mutation. Resume only after the environment owner restores a verified baseline, reviews affected evidence and identifies which cases need rerun. Close the test cycle with results, defects, residual risks, cleanup confirmation and source version, not merely with a percentage.

## ISO 25010 quality characteristics

ISO/IEC 25010:2011 defines eight product-quality characteristics; ISO lists that edition as withdrawn. ISO/IEC 25010:2023 defines a nine-characteristic product model. The course's required edition is not supplied, so this plan names the familiar 2011 categories and explicitly notes the 2023 changes rather than combining editions silently. Sources: [ISO 2011 catalog](https://www.iso.org/standard/35733.html), [ISO 2023 catalog](https://www.iso.org/standard/78176.html).

The following application examples are this project's QA interpretation, not quotations or a certification assessment.

| 2011 characteristic | Relevance to this project | Evidence plan |
| --- | --- | --- |
| Functional suitability | Correct catalog, enrollment/payment rules and permitted lesson access | FR-01–FR-13 cases; complete student/admin journeys |
| Performance efficiency | Useful response times and controlled resource consumption as course volume grows | NFR-04 timings with workload and environment |
| Compatibility | Browser/API/SDK integration and coexistence with browser settings | NFR-05 browser matrix and API contracts |
| Usability | Students understand access state; admins can operate forms with keyboard and clear feedback | NFR-03 manual and accessibility checks |
| Reliability | Recover after failed requests; avoid partial ordering changes and misleading successful states | NFR-02/07 failure and integrity cases |
| Security | Verify identity, roles, ownership, RLS and credential confidentiality | FR-03/04/09/13, NFR-01 |
| Maintainability | Tests are isolated, repeatable and useful when source changes | NFR-06 review and future regression/coverage evidence |
| Portability | Repeatable installation/configuration and intended browser/device operation | NFR-05 clean setup and viewport checks |

The 2023 revision replaces usability with interaction capability and portability with flexibility, and adds safety. Retain the other six categories when using that edition. Safety has limited direct applicability here because no physical control or safety-critical workflow was found; assess plausible harms and safe operational constraints without claiming safety certification. Preventing accidental production mutations is also an explicit project testing control. The edition changes are documented in the [ISO standard foreword published by ANSI](https://webstore.ansi.org/preview-pages/ISO/preview_ISO%252BIEC%252B25010-2023.pdf). Security, data integrity and usability remain the main practical risks for this platform.

## Verification and validation

Verification asks whether work products conform to their specified rules. Validation asks whether the system meets the user's intended needs. They overlap across the lifecycle; verification is not exclusively static, and a passing code-based test alone does not validate a business policy.

| Activity | Project example | Evidence |
| --- | --- | --- |
| Verification through review | Check all admin routes use authentication and role middleware; inspect schema and matrix completeness | Source/checklist references and review findings |
| Verification through execution | Assert 403 for a paid but unenrolled caller, or compare returned profile fields with schema defaults | Case result, sanitized response and DB assertion |
| Validation with user tasks | A synthetic student can find an enrolled lesson after admin approval and understand a denied-access message | Actual task observation and feedback, not fabricated participant quotes |
| Validation of assumptions | Confirm whether a draft must be private and whether payment applies to all enrolled courses | Recorded Q02/Q04 decisions and updated expected results |

## Open requirements and decisions

| ID | Question / conflict | Current source behavior and decision needed |
| --- | --- | --- |
| Q01 | Which auth settings and messages apply? | Confirmation, password minimum/complexity and duplicate-email responses depend on Supabase configuration. Record settings before cases; do not promise one message or session outcome across configurations |
| Q02 | Are drafts private, and may guests view details? | List filters published, public detail does not; client detail requires login and student enrolled list includes drafts. Agree policy before security acceptance |
| Q03 | Which inputs/targets are valid? | Admin course/video APIs accept whole bodies; nullable relations and non-student targets may be accepted. Agree field allowlist, student-only rules, blank/length/URL limits and validation response |
| Q04 | What is payment scope and refresh timing? | Flag is account-wide; existing browser profile may be stale. Confirm intended account-wide policy, when UI refreshes, and whether revocation concerns subsequent requests only (already obtained URLs cannot be recalled) |
| Q05 | What consistency guarantee applies to reorder/edit? | Two separate updates and retained editing state can produce partial/cross-course effects. Proposed: no silent corruption or unintended move; exact atomic/rollback requirement needs agreement |
| Q06 | What HTTP contract applies? | Creates/deletes use 200; duplicate enrollment and many input errors use 500; nonexistent delete may succeed. Characterize now; decide future 201/400/404/409 contract separately |
| Q07 | What failure/recovery UX is required? | Some pages log errors and show empty/default/stale state; auth races possible. Proposed explicit recoverable feedback and no wrong-user state need review |
| Q08 | Which quality targets and ISO edition are mandated? | Browser/device matrix, performance/accessibility/coverage targets, group deadline and required edition not specified. This plan supplies proposals, not inferred rubric mandates |

Document clarification owner/date/decision and update affected cases before accepting a changed rule. Unknown requirements do not prevent executing unrelated, source-supported cases. See the [STLC guide](section-3.2-stlc.md) for case states, fixture definitions and execution records.
