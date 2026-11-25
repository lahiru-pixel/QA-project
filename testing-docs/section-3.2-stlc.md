# Section 3.2 STLC and Test Case Design

## Purpose and current stage

The Software Testing Life Cycle (STLC) organizes testing from understanding requirements to reporting results and closing the work. The activities can overlap and repeat as defects or changed requirements are discovered. For this platform, source analysis, test planning and manual case design have been prepared. Environment setup, application execution, defect confirmation and closure have not occurred. The Section 3.2 title and content are based on the user's supplied scope; the original DOCX's additional marking rules remain unverified.

Related deliverables: [test plan](section-3.1-test-plan.md), [manual test case matrix](section-3.2-manual-test-cases.md), [CSV matrix](section-3.2-manual-test-cases.csv), [roadmap](testing-roadmap.md) and [assignment checklist](assignment-checklist.md).

## STLC phases applied to the platform

| Phase | Inputs and project activities | Outputs | Entry / exit and present state |
| --- | --- | --- | --- |
| 1 Requirement analysis | Read requested features, source, schema and assignment; identify role/payment/enrollment rules, public-vs-protected routes and Q01–Q08 ambiguities | FR/NFR register, risks, source references and clarification log | Entry: source/scope available. Exit: every in-scope rule has a testable condition or explicit question. Source analysis prepared; original rubric reconciliation pending |
| 2 Test planning | Select risk priorities, levels, tools, people, schedule, test data policy, entry/exit rules and evidence controls | Section 3.1 plan and staged roadmap | Entry: initial requirements/risks. Exit: reviewable plan; owner approval recorded later. Plan prepared for review, not claimed approved |
| 3 Test analysis and design | Partition valid/invalid tokens and inputs; build role/payment/enrollment decision table; identify boundary and state-transition cases; derive each expected result from source or mark proposal | Manual matrix, requirement-to-case links, fixture catalog and Q references | Entry: scope and baseline. Exit: unique IDs and all required fields, repeatable steps and no fabricated actual result. Design prepared; execution Not Run |
| 4 Test implementation and environment setup | Provision disposable Supabase, install dependencies, prepare local Auth/mail settings, synthetic roles and data, configure browsers/client, build future mocks and guards; do smoke checks | Verified environment record, protected local config, fixture ID map, automation/harness later | Entry: safe target policy and tools. Exit: smoke/guard checks documented and prerequisites reproducible. Not Run |
| 5 Test execution | Execute cases on reset fixtures, capture actual UI/API/DB observations, compare with the appropriate oracle, classify outcome and sanitize evidence | Run records, actual results, case status and evidence links | Entry: case prerequisites and required Q decisions satisfied. Exit: planned cases executed or explicitly Not Run with blockers. Not Run |
| 6 Defect reporting and confirmation testing | Reproduce a deviation, tie it to requirement, assess impact, developer implements authorized fix, retest exact scenario and surrounding permissions/data flows | Defect and fix history, failed-run evidence, confirmation and regression records | Entry: observed deviation. Exit: verified resolution or documented disposition. Not Run; source observations are not confirmed defects |
| 7 Test completion and closure | Compare actual outcomes against exit criteria, compute genuine metrics, review residual risks, reconcile assignment evidence, clean fixtures and archive sanitized outputs | Test summary, requirement disposition, lessons learned, contribution record and cleanup confirmation | Entry: execution/defect information exists. Exit: reviewed completion decision with limitations. Not Run |

Monitoring and control occur throughout: compare progress with the proposed schedule, investigate blockers, adjust scope with a recorded decision, maintain traceability and preserve each source/run version. A serious environment or credential problem suspends affected testing. A changed access rule returns the affected cases to analysis/design before regression.

## Test design techniques

| Technique | Concrete application | Case families |
| --- | --- | --- |
| Equivalence partitioning | Valid/invalid/missing tokens; guest/student/admin; required vs empty email; published/draft courses | REG, LOG, AUTH, ADM, BRW |
| Boundary value analysis | Zero/one/many lessons, first/last order positions, YouTube ID length around 11; password boundary derived only after local policy is recorded | BRW, VID, VDM, REG |
| Decision table | Admin bypass versus student requiring both paid status and enrollment in the requested course | VID; see table below |
| State transitions | Logged out -> logged in -> logged out; unpaid -> paid -> revoked; unenrolled -> enrolled -> removed; draft -> published -> draft | LOG, PAY, ENR, CRS |
| Use-case/scenario testing | Admin creates/publishes course, enrolls and approves student, student views lesson; revoke and retry next request | CRS, ENR, PAY, VID, DASH |
| Error guessing/exploration | Double click, malformed UUID, duplicate request, dropped response, delayed profile, partial reorder | AUTH, ENR, VDM, QUAL |
| White-box-informed design | Each middleware early return, order of payment/video/enrollment checks, ordinary SDK error versus thrown exception | AUTH, VID; automate detailed internal branches later |

Use each matrix row as an independently reset scenario. Where a row states multiple input variants, record one subrun per variant (for example `TC-REG-02/name`); the parent cannot pass until every required variant has been executed and passed. Failure of one variant makes the parent Fail; partial execution without a failure leaves it Not Run with the completed subruns recorded separately. A proposed policy with no agreed oracle is not a valid pass/fail decision.

## Video access decision table

All outcomes below are source-derived expected responses for an existing video unless explicitly stated. No row is an execution result.

| Identity | Paid | Enrolled in requested course | Watch API expectation |
| --- | --- | --- | --- |
| Guest / invalid identity | Any | Any | 401; no restricted URL |
| Student | No | No | 403 payment denial |
| Student | No | Yes | 403 payment denial |
| Student | Yes | No | 403 enrollment denial |
| Student | Yes | Only a different course | 403 enrollment denial |
| Student | Yes | Yes | 200 with selected lesson fields |
| Admin | Any | Any | 200 for existing video, independent of enrollment/payment |
| Paid student or admin | As above | As above | Nonexistent video gives 404 at lookup |
| Unpaid student | No | Any | Nonexistent video still gives payment 403 because that check runs first |

## Shared fixture catalog

These are specifications for future synthetic data, not accounts or records created now. **E0** means a verified isolated local environment with the plan's safety checks, captured fixture IDs and separate browser contexts. Every case requires E0. Run IDs must be unique; aliases below are replaced with actual locally captured UUIDs, never sent literally as API IDs. Password alias `PW_VALID` means a locally generated test password meeting the recorded policy, stored privately; it is never put in the matrix or evidence.

| Alias | Required fixture |
| --- | --- |
| A1 | Confirmed admin profile, no course enrollment needed; synthetic email `qa-admin-{run}@example.test` |
| S1 | Confirmed paid student enrolled in C1 only; `qa-paid-enrolled-{run}@example.test` |
| S2 | Confirmed unpaid student enrolled in C1; `qa-unpaid-enrolled-{run}@example.test` |
| S3 | Confirmed paid student with no enrollments; `qa-paid-new-{run}@example.test` |
| S4 | Confirmed unpaid student with no enrollments; `qa-unpaid-new-{run}@example.test` |
| S5 | Confirmed paid student enrolled in C2 only, not C1; `qa-other-{run}@example.test` |
| NEW | Unique unregistered email `qa-new-{run}-{case}@example.test`, name `QA Student {run}`, `PW_VALID` |
| C1 | Published `QA Course One {run}`, description `QA fixture`, known oldest creation timestamp, videos V1/V2/V3 |
| C2 | Published `QA Course Two {run}`, known newer timestamp than C1, video V4 |
| C3 | Draft `QA Draft {run}`, initially no enrollment, video V5 |
| C0 | Published empty course `QA Empty {run}` with no videos; create only for cases requiring it |
| V1/V2/V3 | C1 lessons `QA Lesson 1/2/3`, order indexes 1/2/3, duration `05:00`, synthetic description |
| V4/V5 | Lessons in C2/C3 respectively; known titles and order 1 |
| URL_VALID | For embed construction only: `https://youtu.be/abcdefghijk`; fake 11-character ID, not evidence of playback. Block/intercept the remote iframe. Real manual playback needs separately approved sample content |
| ID_NONE | Well-formed UUID verified absent from local tables; `00000000-0000-4000-8000-000000000099` is a candidate, verify before use |
| BAD_ID | `not-a-uuid`, distinct from a well-formed but missing ID |
| AUTH_USER_NO_PROFILE | Local authenticated user whose profile is temporarily absent in a disposable fixture or controlled SDK stub; never delete a production profile |
| FAIL | Controlled local response/delay/rejection via test-only stub or proxy; unavailable until implemented. Does not prove behavior of real Supabase |

Create auth users through the local Auth service so the profile trigger can be exercised. Provision A1 through a controlled local admin setup step; do not enable user self-promotion in application code. Record auth settings and profile fixtures; use independent contexts for roles. Base data has five student profiles, two paid enrolled students plus one paid unenrolled student, and an unpaid enrolled/unenrolled pair; derive dashboard counts from the actual fixture inventory, including additions made for a case.

Before each row restore its specified fixture state. After mutation checks, remove only case-created records or restore changed fields by captured ID. Cascade cases use an extra disposable course and known children. RLS assertions use anon/user clients; a service-role client can provision fixtures but bypasses RLS and cannot prove denial. A failed cleanup is a blocker for dependent cases, not permission to reset an unknown database.

## Manual execution conventions

1. Record the case ID, source commit, date/time, tester, exact environment/browser versions, local data/run aliases and execution mode. Validate E0 before writes. When switching users, use a separate context or verified logout/session reset.
2. Browser mode means operate the UI manually. API mode means use a local HTTP client with actual captured UUIDs and appropriate token in a protected local variable; JSON request bodies require `Content-Type: application/json`. Read-only SQL checks use the isolated DB only. No token value appears in evidence.
3. Fault mode means manually exercise a response from a controlled local stub/proxy; record precisely which boundary was simulated. Mark the test Not Run if the stub has not been built. Such a result is not a full-stack result.
4. Execute numbered steps. Check both visible behavior and specified server/data effects. Denial requires no mutation as well as the right response. For denied reads, verify restricted data is absent.
5. Record actual observations in **Actual result**, not a copy of Expected result. Use Pass only when all expected assertions pass, Fail on a reproducible mismatch, and Not Run when unexecuted or blocked. Add a blocker to the run record without inventing a fourth status.
6. Evidence reference starts as `None - not executed`. After execution use a sanitized file/run reference such as `evidence/RUN-YYYYMMDD-01/TC-VID-01-response-redacted.txt`. This is a future naming convention, not an existing evidence file. Retain failed and retest runs separately.
7. Preserve the delivered design baseline. Record executed results in a versioned run copy of the CSV/Markdown or maintain both together. Do not overwrite history or claim the original design matrix was executed.

The CSV is UTF-8 with a byte-order mark and quoted comma-separated fields so Excel can open it. If locale settings place everything in one column, use **Data > From Text/CSV**, select UTF-8/comma, set columns to Text, then enable Wrap Text. Do not paste secrets into a spreadsheet. Test text is data; never enable macros or evaluate formula-like content. Fields are checked for formula prefixes during document validation.

## Test result and defect records

Each matrix row includes the ten requested columns: Test ID, requirement, description, preconditions, test data, execution steps, expected result, actual result, status and evidence reference. Extra columns specify priority, execution mode, expectation basis and clarification reference. Requirement IDs resolve to the [plan](section-3.1-test-plan.md); family summaries in the matrix provide source links.

For an actual failure, create a defect with ID, related requirement/case/run, source version, environment, synthetic input, exact steps, expected/actual result, sanitized evidence, reproduction frequency, severity/priority rationale, owner and disposition. Follow the lifecycle New -> Triaged -> Assigned -> Fixed -> Retest -> Closed; reopen if retest fails. Rejected/deferred decisions need an explanation and owner. No defect record is created merely to turn a static observation into a reported bug.

Severity describes impact (for example unauthorized lesson access); priority describes scheduling urgency. Neither is determined by the number of failing assertions. A code-characterization pass can coexist with an unresolved requirement concern. Do not count static observations as confirmed defects.

## Traceability and reporting

Traceability chain: user-supplied section scope -> FR/NFR and Q decision -> case ID -> run/environment -> actual evidence -> defect/fix/retest -> completion decision. The detailed family/requirement mapping is in the [matrix](section-3.2-manual-test-cases.md). Link new cases to the same chain when requirements change; do not reuse retired IDs for different behavior.

At execution, report planned rows, executed rows, Pass/Fail/Not Run counts and blocker list. Executed = Pass + Fail; execution progress = executed / planned; pass rate = Pass / executed (undefined if nothing executed). For variant rows retain subrun counts separately. Code coverage is a separate instrumented measure and cannot be inferred from manual case counts. This delivery has no application executions and therefore no measured pass rate, coverage, defects, response times or screenshots.

The [phase record](section-3.1-3.2-phase-record.md) records document preparation/validation commands and limitations. These document checks do not count as executing any matrix case. Section 3.1/3.2 planning deliverables can be reviewed now; full assignment compliance still requires the original rubric and later genuine execution evidence where mandated.
