# EC4206 assignment checklist and traceability

Date: 2026-11-25. Baseline: `c068e28`. Supporting documents: [project analysis](project-analysis.md) and [testing roadmap](testing-roadmap.md).

## 1. Assignment source status

Requested source: `EC4206_Group_Assignment_Task_List.docx`.

**Original DOCX not available in the workspace.** The user has supplied requirements for Sections 3.1–3.4, unit testing/TDD and BDD; section numbers for the latter tasks are not specified. Additional rubric rules, required case counts, mark allocations and Sections 3.5–3.10 remain unverified. Section 3.3 retains 34 passing isolated checks and 11 Not Run records. The [Jest report](unit-testing.md) records 60 passing tests and measured coverage; the [BDD report](bdd-testing.md) adds 30 passing scenarios. These do not establish real Supabase/full-stack correctness.

Do not confuse roadmap phases P0–P8 with assignment sections 3.1–3.10. Populate each row from the actual document before claiming requirement coverage. One assignment section may require several phases and evidence items.

## 2. Section-by-section mapping register

| Section | Exact title / requirement and source location | Phase mapping | Cases / evidence | Execution | Completion |
| --- | --- | --- | --- | --- | --- |
| 3.1 | Introduction and Test Planning; scope supplied by user follow-up | P0 and planning | [Test plan](section-3.1-test-plan.md), [phase record](section-3.1-3.2-phase-record.md) | Application tests Not Run | Requested planning deliverable prepared; group review and original-rubric reconciliation pending |
| 3.2 | STLC and Test Cases; scope supplied by user follow-up | P2 design; STLC describes P0–P8 | [STLC](section-3.2-stlc.md), [143-case matrix](section-3.2-manual-test-cases.md), [CSV](section-3.2-manual-test-cases.csv) | All 143 cases Not Run | Requested design deliverables prepared; execution and original-rubric reconciliation pending |
| 3.3 | Black-Box Testing: EP, BVA, video-access decision table; user-supplied scope | P2 design; scoped P1/P3/P4/P5 execution | [Black-box report and evidence](black-box-testing.md) | 34 Pass, 0 Fail, 11 Not Run | Requested techniques documented and safe checks executed; real DB/Auth tests, lecturer approval of BVA alternatives and original-rubric reconciliation pending |
| 3.4 | White-Box Testing of isAdmin, authenticate and isEnrolled; user-supplied scope | P2 structural design; P3 measured execution | [White-box analysis](white-box-testing.md), [Jest report](unit-testing.md) | 38 original design IDs passed; WB-AUT-11 superseded by two passing TDD cases; each selected middleware measured 100% statements/branches | Analysis and scoped instrumented execution prepared; original-rubric reconciliation pending; historical auth exception graph qualified after fix |
| 3.5 | Pending original document | Unverified; P0 must map | Not specified | Not Run | Incomplete — requirement unknown |
| 3.6 | Pending original document | Unverified; P0 must map | Not specified | Not Run | Incomplete — requirement unknown |
| 3.7 | Pending original document | Unverified; P0 must map | Not specified | Not Run | Incomplete — requirement unknown |
| 3.8 | Pending original document | Unverified; P0 must map | Not specified | Not Run | Incomplete — requirement unknown |
| 3.9 | Pending original document | Unverified; P0 must map | Not specified | Not Run | Incomplete — requirement unknown |
| 3.10 | Pending original document | Unverified; P0 must map | Not specified | Not Run | Incomplete — requirement unknown |

For each section, add subcriterion IDs such as `REQ-3.1-a` only after extracting its actual text. Record:

- Exact wording, page/paragraph/table location, mandatory tool/technique and minimum quantity if any.
- Test objective and source module/user flow; cases with inputs, steps and justified expected outcomes.
- Implementation file, phase, owner, dependency and acceptance condition.
- Run ID, actual result, sanitized evidence and defects/retest outcome.
- Final satisfied/incomplete/not-applicable decision with explanation; do not self-exempt mandatory criteria.

## 3. Current requested deliverables

These checkboxes describe this analysis request, not completion of the university assignment.

- [x] Locate the application and establish a clean source baseline.
- [x] Review application modules, schema script, routing and configuration.
- [x] Describe architecture, features, auth and permissions.
- [x] Inventory all 18 API method/path combinations.
- [x] Identify testable modules and flows with source references.
- [x] Inspect existing test infrastructure and local prerequisites.
- [x] Recommend compatible tool families, with version compatibility checks required before installation.
- [x] Record static observations separately from reproduced defects.
- [x] Propose staged implementation, environment safeguards and evidence rules.
- [x] Create [project-analysis.md](project-analysis.md), [testing-roadmap.md](testing-roadmap.md) and [assignment-checklist.md](assignment-checklist.md).
- [ ] Read the missing assignment document.
- [ ] Verify exact mappings for Sections 3.1–3.10, including all counts/thresholds and submission rules.
- [x] Implement and execute scoped Section 3.3 checks separately from production code; see [phase report](black-box-testing.md). Full-stack execution remains pending.

## 4. Technical coverage backlog

Each entry is a project-derived candidate, not a claim about an assignment section. Flow/observation IDs refer to [analysis](project-analysis.md).

| Candidate requirement | Coverage plan | Proposed phase | Current status |
| --- | --- | --- | --- |
| Published catalog, retries, images and navigation | FLOW-01; homepage components/browser | P2, P3, P5 | Not Run |
| Registration defaults and confirmation | FLOW-02, OBS-08; SDK mock plus real local trigger/auth | P3, P4, P5 | Not Run |
| Session, token headers and profile lifecycle | FLOW-03, OBS-04/14; ordered async failures and logout | P3, P5 | Not Run |
| Server auth and all admin endpoint protection | FLOW-04; full role matrix and middleware branches | P3, P4 | Middleware unit checks and course-management BDD authorization passed; other admin endpoint integration remains pending |
| Payment and revocation | FLOW-05; flag/timestamp, stale UI, subsequent server enforcement | P3, P4, P5 | Not Run |
| Enrollment isolation and duplicate handling | FLOW-06; both UIs, API and DB uniqueness | P3, P4, P5 | Not Run |
| Course CRUD, publication and cascades | FLOW-07, OBS-01/02; agreed visibility contract, local deletion | P4, P5 | Mocked HTTP course CRUD passed in BDD; real publication policy/DB cascades remain Not Run |
| Video CRUD and order consistency | FLOW-08, OBS-05; partial failure and course-switch tests | P3, P4, P5 | Not Run |
| Lesson access and media behavior | FLOW-09, OBS-03/12; role matrix, embed/fullscreen | P3, P4, P5 | Scoped access matrix and parser checks passed in [Section 3.3](black-box-testing.md); real identity/media/fullscreen Not Run |
| Accurate statistics and load errors | FLOW-10, OBS-06/07; returned-error injection | P3, P4 | Not Run |
| Schema, trigger, RLS and direct access | FLOW-11, OBS-09; user-role clients and disposable DB | P4, P6 | Not Run |
| Accessibility/responsive/browser support | FLOW-12, OBS-10; axe + manual + browser matrix | P5, P6 | Not Run |
| Security, load and failure recovery | OBS-02/11/15; guarded scans, bounded load, dependency review | P6 | Not Run |
| Safe reproducible test harness | OBS-13/15; mock import order, no-network policy and target guard | P1 | Not Run |
| Defect lifecycle and regression | Reproduced findings only, requirement and evidence links | P7 | Not Run |
| Final traceability and quality report | Actual results and assignment-specific submission audit | P8 | Not Run |

## 5. Environment and data prerequisites

- [x] Record installed Node `v24.14.1` and npm `11.11.0`.
- [x] Read both package manifests/lockfiles and environment variable names without values.
- [x] Install existing locked dependencies; isolated Section 3.3 runners executed. Proposed Vitest/Jest/Playwright package additions and compatibility checks remain pending.
- [ ] Establish isolated local Supabase, schema, auth settings and synthetic role provisioning.
- [ ] Add test-only guards that fail before contacting unknown/production targets.
- [ ] Implement/mock external services and reject unhandled network traffic.
- [ ] Create per-run/worker fixture IDs and restricted cleanup; test cleanup failure handling.
- [ ] Configure ignored local secrets, auth state and raw reports before generating any.
- [ ] Install browser binaries and any required database/performance/security tools.
- [ ] Agree supported browser/device matrix and measurable quality criteria from rubric/product requirements.

## 6. Evidence and results register

| Activity | Status | Actual evidence / limitation |
| --- | --- | --- |
| Source/infrastructure review | Completed | Referenced source files and command record in [analysis](project-analysis.md); source baseline `c068e28` |
| Assignment document review | Pending original document | User supplied Section 3.1–3.4 scope; additional original-rubric requirements unavailable |
| Initial documentation validation | Completed | Initial three-document package: 95 relative Markdown links resolved; all ten section rows existed; code fences balanced; editor reported no errors |
| Section 3.1/3.2 preparation | Prepared | Plan, STLC, 143 designed cases in Markdown/CSV; [phase record](section-3.1-3.2-phase-record.md) records current validation |
| Section 3.4 white-box design and follow-up execution | Prepared and measured | Three CFGs and 39 historical designs in [white-box report](white-box-testing.md); current execution/superseded-case mapping in [Jest report](unit-testing.md) |
| Unit testing and TDD follow-up | Implemented; 60 Pass, 0 Fail | Seven Jest suites; [genuine Red–Green–Refactor evidence](tdd-demonstration.md); numbered assignment mapping unverified |
| BDD follow-up | Implemented; 30 scenarios Pass, 0 Fail | Two executable features; 206 Gherkin/background steps and 60 hooks passed; [BDD report](bdd-testing.md); Jest regression also 60 Pass; numbered mapping unverified |
| Dependency installation | Completed for existing locks | Backend/frontend npm ci with scripts/audit/funding disabled; exit 0; 79/99 packages; no manifests/lock changes |
| Frontend lint/build | Not Run | Existing scripts inspected only |
| Isolated black-box HTTP checks | 14 Pass, 0 Fail | Real watch router/middleware with mocked Supabase; [results](evidence/black-box/api-results.json); no database/RLS assertion |
| Local Supabase/database/RLS | Not Run | No isolated environment provisioned; no database accessed |
| Isolated browser black-box checks | 20 Pass, 0 Fail | Real components with Auth/API stubs; [results](evidence/black-box/browser-results.json); full-system/manual/UAT Not Run; no screenshots |
| Security/accessibility/performance | Not Run | No scans or load; no results or scores |
| Jest coverage | Measured for configured middleware/routes | [Coverage report](unit-testing/coverage/index.html): statements 90/215 (41.86%), branches 51/91 (56.04%); each requested middleware 100%; frontend/bootstrap/real SDK excluded |
| Confirmed defect in isolated authentication | Corrected and regression-tested | Missing identity data returned 500 in genuine Red run; now 401. [TDD evidence](tdd-demonstration.md). Other OBS entries remain separate static findings |

### Analysis-phase change and verification record

- Changed files: the three Markdown documents linked at the top. Application code, schema, manifests and lockfiles were not modified.
- Commands and actual inspection results: recorded in [analysis](project-analysis.md), including the failed PowerShell lockfile parse and successful Node fallback.
- Final verification (2026-11-25): `git status --short` reported only the new documentation directory; `git diff --stat` was empty because the new files are untracked; `git diff --exit-code -- backend frontend database_setup.sql .gitignore` reported no changes. A Node validation script using `fs.readFileSync`, `fs.existsSync`, a Markdown link regex and section-row checks passed: 95 relative links resolve, all ten section rows exist, all three documents are nonempty and their code fences are balanced. The source inventory has 54 tracked baseline files. Editor diagnostics reported no errors for the three Markdown files. These are documentation checks, not application tests.
- Limitations: missing assignment text; no installed dependencies; no configured local test backend; no executed tests, screenshots, coverage or quality measurements; deployed schema/auth settings unverified.

## 7. Completion criteria for future phases

- [ ] Every actual assignment subcriterion has requirement, implementation, case and evidence links.
- [ ] Required commands have actual dates, cwd, environment, exit codes and sanitized logs.
- [ ] Every case has Pass, Fail or Not Run; blockers are separate explanations.
- [ ] Test totals and coverage are computed from actual runs with disclosed scope/exclusions.
- [ ] Defects have reproducible evidence, severity rationale, fix/disposition and retest history.
- [ ] Failed runs remain traceable after reruns; known limitations are disclosed.
- [ ] Production Supabase was never used for destructive tests and external services were mocked for unit tests.
- [ ] Credentials, tokens, browser auth state, private URLs and personal data are absent from submissions.
- [ ] Group contributions, presentation/demo and submission formats match the supplied assignment.
- [ ] Final report distinguishes measured results from expectations and static observations.

**Current decision:** the original 143 manual cases remain Not Run; earlier black-box and unit/TDD records remain historical evidence. The [BDD follow-up](bdd-testing.md) is implemented with 30 passing scenarios and a passing 60-test Jest regression. No production code changed in that phase. Real DB/Auth execution, broader route/frontend testing, BVA alternative approval, group review and original-rubric reconciliation remain outstanding. Section numbering for unit/TDD/BDD and Sections 3.5–3.10 remain unverified. Historical phase records describe their own dates/scopes, not the current environment; no overall assignment completion is claimed.
