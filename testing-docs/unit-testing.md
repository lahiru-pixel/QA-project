# Automated unit testing and measured coverage

Date: 2026-11-25. Starting source baseline: `c068e28`; final working-tree changes are listed below and hashed in the run metadata. This fulfils the user's unit-testing/TDD request. No unprovided assignment section number or marking threshold is assumed.

## Outcome

**60 tests passed, 0 failed, 0 pending, across seven Jest suites in the final instrumented run.** Of these, 55 test application functions and five verify the isolation harness. The three requested middleware modules each achieved measured 100% statements, branches, functions and lines in this run. The broader configured middleware-and-routes scope measured **90/215 statements (41.86%) and 51/91 branches (56.04%)**, because admin/video route functions remain untested by this Jest suite.

A genuine [TDD demonstration](tdd-demonstration.md) changed only [authenticate.js](../backend/middleware/authenticate.js): absent identity data now returns 401 instead of causing an internal exception and 500. Token verification, profile lookup and authorization checks remain required. No production Supabase instance was contacted.

## Installation and configuration

- Windows; Node `v24.14.1`; npm `11.11.0`; Jest `30.5.2` pinned as a development dependency in [backend package.json](../backend/package.json) with [lockfile](../backend/package-lock.json).
- `npm view jest version engines --json` reported 30.5.2 and support for Node `^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0`. Installed Node 24 meets that declaration; successful runs demonstrate compatibility for this project.
- From repository root: `npm install --prefix backend --save-dev --save-exact jest@30.5.2 --ignore-scripts --no-audit --no-fund` exited 0, adding 276 packages. [Installation log](unit-testing/evidence/dependency-install.log) retains a transitive glob deprecation warning and PowerShell's rendering of npm stderr. This was not an installation failure. Lifecycle scripts/audit were intentionally not run; no dependency-security assessment is claimed.
- [jest.config.cjs](../backend/jest.config.cjs) uses the Node environment, existing CommonJS exports, explicit `*.test.cjs` discovery and Babel/Istanbul coverage instrumentation. No TypeScript setup, jsdom, React runner or production transpilation was needed.
- Existing CommonJS modules can be required directly in Jest; configuration supports selectable coverage reporters. See the official [Jest getting-started guide](https://jestjs.io/docs/getting-started) and [coverage reporter configuration](https://jestjs.io/docs/configuration#coveragereporters-arraystring--string-options).

### Commands

Run from the [backend directory](../backend/):

```powershell
npm test
npm run test:coverage
```

These invoke Jest in-band, making the fixture lifecycle simple and deterministic. The coverage command creates HTML, LCOV, raw coverage JSON and summary JSON under [coverage](unit-testing/coverage/).

For a fresh checkout, install the backend lockfile using `npm ci --ignore-scripts --no-audit --no-fund` before running. No environment file, Supabase key, account or browser server is needed.

To preserve a new run's execution metadata and test-result JSON:

```powershell
npm run test:record -- new-run-name test
npm run test:record -- new-coverage-name test:coverage --coverageDirectory=../testing-docs/unit-testing/coverage-new-run
```

The [evidence recorder](../backend/tests/helpers/capture-run.cjs) invokes the actual npm script without shell-built commands, records stdout/stderr, UTC timestamps, exit code, tool versions and source/test hashes, and archives the authentication source and unchanged TDD test. It refuses an existing stage directory. The standard coverage command overwrites its generated coverage directory; use a new coverageDirectory when preserving this submitted run. No production source needs to be reverted to rerun the final passing suite. The stored Red source is historical evidence, not a file to deploy.

## Isolation and assertions

[setup.cjs](../backend/tests/setup.cjs) registers a Jest mock for the Supabase client before importing dependent production modules. The real credential-reading client is never evaluated. Authentication and fluent database methods are Jest functions with synthetic results; unexpected queries throw. Fresh fixtures and mocks are established for every test and restored afterwards.

The harness blocks global fetch, Node HTTP/HTTPS requests and TCP connections before network operations begin. Five harness assertions verify replacement of the SDK and rejection of these network entry points. This is scoped protection for the tested Node modules, not a universal operating-system network sandbox.

[Fixture helpers](../backend/tests/helpers/fixtures.cjs) create chainable response spies and query mocks. Tests distinguish resolved `{data,error}` failures from rejected promises, assert exact status and response body, and check whether `next()` is called exactly once or never. Success tests ensure middleware sends no response. Query assertions verify user/course filters, selected fields, and that early denials do not proceed to later queries. Exceptions use synthetic errors and a restored console spy; no real error payload or credential is logged.

The course and student suites invoke **existing route handler functions directly** from the exported router. They test function behavior without sockets. They do not establish HTTP serialization, route mounting, real authentication or database integration correctness.

## Test inventory and actual execution

| Suite | Tests | Covered behavior | Final status |
| --- | --- | --- | --- |
| [isAdmin](../backend/tests/unit/isAdmin.test.cjs) | 5 | Missing user, student, absent/wrong-case role, valid admin | Pass |
| [authenticate](../backend/tests/unit/authenticate.test.cjs) | 11 | Header, auth/profile returned errors and missing rows, successful profile attachment, rejected promises, empty bearer value, malformed direct-call header | Pass |
| [missing identity regression](../backend/tests/unit/authenticate-null-user.test.cjs) | 2 | Null and undefined identity data return 401 without profile query/next/logged exception | Pass |
| [isEnrolled](../backend/tests/unit/isEnrolled.test.cjs) | 22 | Admin bypass, payment, explicit/video/fallback course IDs, missing/invalid data, returned errors, rejected promises and precedence | Pass |
| [course handlers](../backend/tests/unit/course-handlers.test.cjs) | 10 | Published-list filter, empty/nonempty data, detail lookup, safe video field projection, missing rows and errors | Pass |
| [student handler](../backend/tests/unit/student-handler.test.cjs) | 5 | Own-user filter, empty enrollments, null joined courses, returned/rejected failures and malformed collection | Pass |
| [isolation harness](../backend/tests/unit/isolation.test.cjs) | 5 | SDK replacement and denied fetch/HTTP/HTTPS/TCP | Pass |

The [Excel-readable result CSV](unit-testing/test-results.csv) contains all 60 final test names, suite, actual Jest status, duration and evidence reference. It was generated from [final Jest JSON](unit-testing/evidence/final-coverage/jest-results.json), not manually assigned outcomes.

### Run history, including failures

All times below are UTC; full start/end times and commands are in metadata. Repeated runs are not summed into a larger distinct-test count.

| Run | Start (UTC) | Actual result | Exit | Evidence |
| --- | --- | --- | --- | --- |
| red | 2026-11-25T12:51:35.073Z | 0 Pass / 2 Fail / 0 pending | 1 | [metadata](unit-testing/evidence/red/execution.json), [results](unit-testing/evidence/red/jest-results.json), [log](unit-testing/evidence/red/stderr.log) |
| green | 2026-11-25T12:51:53.891Z | 2 Pass / 0 Fail / 0 pending | 0 | [metadata](unit-testing/evidence/green/execution.json), [results](unit-testing/evidence/green/jest-results.json), [log](unit-testing/evidence/green/stderr.log) |
| green-regression | 2026-11-25T12:54:09.252Z | 59 Pass / 1 Fail / 0 pending | 1 | [metadata](unit-testing/evidence/green-regression/execution.json), [results](unit-testing/evidence/green-regression/jest-results.json), [log](unit-testing/evidence/green-regression/stderr.log) |
| green-regression-fixed | 2026-11-25T12:54:37.246Z | 60 Pass / 0 Fail / 0 pending | 0 | [metadata](unit-testing/evidence/green-regression-fixed/execution.json), [results](unit-testing/evidence/green-regression-fixed/jest-results.json), [log](unit-testing/evidence/green-regression-fixed/stderr.log) |
| refactor | 2026-11-25T12:54:55.462Z | 60 Pass / 0 Fail / 0 pending | 0 | [metadata](unit-testing/evidence/refactor/execution.json), [results](unit-testing/evidence/refactor/jest-results.json), [log](unit-testing/evidence/refactor/stderr.log) |
| final-coverage | 2026-11-25T12:54:57.391Z | 60 Pass / 0 Fail / 0 pending | 0 | [metadata](unit-testing/evidence/final-coverage/execution.json), [results](unit-testing/evidence/final-coverage/jest-results.json), [log](unit-testing/evidence/final-coverage/stderr.log) |

The first broad regression run's one failure was an incorrectly shaped `test.each` dataset: an empty array was interpreted as an argument list and the callback waited for a completion callback. The course test definition was corrected to object rows, preserving an actual empty array as data. The failed log remains available; this was a test-harness defect, not a newly confirmed course-handler defect. Production code was not changed to solve it. The corrected full suite passed before the production refactor.

## Measured coverage and limits

Source: [coverage-summary.json](unit-testing/coverage/coverage-summary.json), produced by the final Jest run; counts below are copied from its covered/total values.

| Scope / file | Statements | Branches | Functions | Lines |
| --- | --- | --- | --- | --- |
| Configured total | 90/215 (41.86%) | 51/91 (56.04%) | 8/23 (34.78%) | 85/197 (43.14%) |
| [authenticate.js](../backend/middleware/authenticate.js) | 19/19 (100%) | 12/12 (100%) | 1/1 (100%) | 19/19 (100%) |
| [isAdmin.js](../backend/middleware/isAdmin.js) | 5/5 (100%) | 4/4 (100%) | 1/1 (100%) | 5/5 (100%) |
| [isEnrolled.js](../backend/middleware/isEnrolled.js) | 26/26 (100%) | 25/25 (100%) | 1/1 (100%) | 26/26 (100%) |
| [admin.js](../backend/routes/admin.js) | 0/111 (0%) | 0/36 (0%) | 0/14 (0%) | 0/98 (0%) |
| [courses.js](../backend/routes/courses.js) | 23/23 (100%) | 8/8 (100%) | 2/2 (100%) | 21/21 (100%) |
| [students.js](../backend/routes/students.js) | 17/17 (100%) | 2/2 (100%) | 3/3 (100%) | 14/14 (100%) |
| [videos.js](../backend/routes/videos.js) | 0/14 (0%) | 0/4 (0%) | 0/1 (0%) | 0/14 (0%) |

Configured inclusion is all `middleware/**/*.js` and `routes/**/*.js`, including files not imported by tests. Exclusions are deliberate: bootstrap/listener code, real Supabase client initialization, test/helpers, node_modules and the entire frontend. This is not whole-project coverage. The admin and video route files' zero values are measured by this run's configured instrumentation, not fabricated “Not Run = 0%” estimates. Earlier black-box HTTP tests were not merged into these coverage numbers.

Istanbul's branch counter includes logical-expression instrumentation; its denominator is different from the one-if-one-decision CFG convention in [Section 3.4](white-box-testing.md). Even 100% instrumented branch coverage does not establish MC/DC, every possible input/path, RLS, token-signature verification or production security. No numeric acceptance threshold was invented.

Reports:

- [HTML coverage index](unit-testing/coverage/index.html): interactive file-by-file source highlighting.
- [LCOV](unit-testing/coverage/lcov.info): tool integration.
- [Raw JSON](unit-testing/coverage/coverage-final.json): machine-readable statement/function/branch hit counts.
- [Summary JSON](unit-testing/coverage/coverage-summary.json): covered/total figures.
- [Evidence verification](unit-testing/evidence/verification.json): run chronology, unchanged TDD-test hash, final input hashes and totals.

## Traceability to the white-box design

- WB-ADM-01 through 05: all five implemented and passed.
- WB-AUT-01 through 10 and WB-AUT-12: eleven implemented and passed.
- WB-ENR-01 through 22: all 22 implemented and passed.
- **WB-AUT-11 is superseded**, not retroactively marked passed: the prior design characterized 500 on null identity data. TDD-AUTH-01's two parameterized cases now require and pass 401 for null/undefined data. The earlier failing Red run confirmed the old behavior before correction.
- Therefore, 38 earlier design IDs ran with their stated expectations, plus two new TDD executions replacing one old design. The remaining 20 tests cover additional handlers (15) and harness safeguards (5).

The previous design document remains a historical baseline with a dated update linking here. Its original authentication null-data exception edge is no longer part of the corrected flow. The normal collapsed decision count remains three decisions plus one = V4; the added assignment is straight-line work. Do not reuse the old exception-overlay graph for the corrected function without this qualification.

## Changed files and rationale

| Files | Change and purpose |
| --- | --- |
| [package.json](../backend/package.json), [package-lock.json](../backend/package-lock.json) | Pin Jest as dev dependency and provide test, test:coverage and evidence-recording scripts |
| [jest.config.cjs](../backend/jest.config.cjs) | CommonJS test discovery, isolated Node execution and explicit coverage scope/reporters |
| [tests/setup.cjs](../backend/tests/setup.cjs), [fixtures](../backend/tests/helpers/fixtures.cjs) | Synthetic dependency/response fixtures and network prevention |
| [capture-run.cjs](../backend/tests/helpers/capture-run.cjs) | Preserve genuine per-stage logs, result JSON, source/test snapshots and metadata |
| [unit test directory](../backend/tests/unit/) | Seven suites covering requested middleware, existing course/student functions and harness safety |
| [authenticate.js](../backend/middleware/authenticate.js) | Only production logic change: safely read missing identity data and reuse a named verified user for profile lookup |
| [this report](unit-testing.md), [TDD report](tdd-demonstration.md), [result CSV](unit-testing/test-results.csv) | Execution explanation, genuine TDD sequence and per-test results |
| [coverage](unit-testing/coverage/), [evidence](unit-testing/evidence/) | Actual generated reports/logs; source snapshots contain only reviewed application code and synthetic tests |
| [white-box report](white-box-testing.md), [checklist](assignment-checklist.md), [roadmap](testing-roadmap.md) | Record new measured execution without rewriting historical results |

The frontend, schema, other production middleware, route logic and real SDK client are unchanged. Earlier staged work and existing black-box evidence are preserved.

## Limitations and next work

No real Supabase, RLS, JWT-signature/expiry service, persistence, live registration, browser flow, load, security scanner, frontend test, build or lint was executed in this phase. Those remain **Not Run for this phase**, not implicitly passed. The user-supplied unit/TDD scope is implemented; mapping it to an additional numbered assignment section still requires the missing rubric.

The enrollment characterization tests still demonstrate acceptance of a truthy non-Boolean payment value and a paid unexpected role at the isolated function boundary. They document existing logic; this change does not approve those as business requirements or claim production exploitability. Only the absent-identity defect was corrected.

Coverage leaves the admin/video handlers as the next backend unit backlog. Actual database/Auth integration still requires a verified disposable environment.

## Final verification record

The Node evidence validator exited 0: all six run directories have matching source/test snapshots and metadata; Red precedes Green and Refactor; the TDD test hash is identical throughout; all final tested input hashes still match; final results contain 60 passing tests; 38 original white-box IDs are present. Four required coverage formats exist. Editor diagnostics reported no errors in the checked configuration and middleware. Further document/report consistency checks are recorded in the completion note below.

Completion checks also exited 0. A Node script supplied through PowerShell standard input (`@' ... '@ \| node`) recomputed SHA-256 values for every final recorded source/test/configuration input, compared raw Istanbul coverage with its summary, counted seven LCOV source files, checked the CSV's UTF-8 BOM/60 result rows, and resolved 399 relative Markdown links with balanced code fences. All matched. Editor diagnostics found no errors in the seven test suites, setup, both helpers and the two new reports. `git diff HEAD --exit-code -- frontend database_setup.sql backend/routes backend/middleware/isAdmin.js backend/middleware/isEnrolled.js backend/server.js backend/supabaseClient.js .gitignore` exited 0, confirming those production files stayed unchanged. These final checks validate the deliverables; they are not additional application-test passes.

