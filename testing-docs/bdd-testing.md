# Behavior-Driven Development testing with Cucumber.js

Date: 2026-11-25. Scope: executable behavior specifications for student video access and administrator-only course management, as requested by the user. No additional numbered assignment section is assumed because the original rubric remains unavailable.

## Result

**30 scenarios passed; 0 failed, skipped, pending or undefined in the final run.** Cucumber reported **266 passed step executions**, comprising **206 visible Gherkin/background steps and 60 Before/After hook executions**. Both feature files have executable JavaScript step definitions; there are no documentation-only scenarios in this suite.

The subsequent existing Jest regression suite also passed **60 tests across seven suites**. The BDD phase did not change production logic or the shared fixture helper. It uses real Express routers and authentication/authorization middleware with an in-memory Supabase adapter. No production database, real account, credential or media service was accessed.

Start with the [final HTML report](bdd/runs/2026-11-25T13-14-16-134Z-19696/cucumber.html), [per-scenario CSV](bdd/scenario-results.csv) or [decoded expected/actual results](bdd/scenario-results.json).

## What BDD means here

BDD describes behavior in examples that developers, testers and product stakeholders can discuss. Instead of starting with an internal function name, an example describes a user's situation, action and observable outcome. Cucumber reads Gherkin and maps each sentence to executable code.

- **Feature** states a capability and its purpose.
- **Scenario** is one concrete example.
- **Given** establishes the starting state.
- **When** performs an action.
- **Then** asserts its observable result.
- **And** adds another setup condition or assertion.
- **Background** supplies shared setup, executed for each scenario.
- **Scenario Outline + Examples** runs the same behavior with different data. Every Examples row becomes a separate executed scenario.

For example, the video feature contains:

```gherkin
Scenario: A paid enrolled student can access the video
  Given I am a "student"
  And my payment status is "paid"
  And I am enrolled in the video's course
  When I request the course video
  Then the response status should be 200
  And I should receive only the permitted video details
```

The Given steps create synthetic identity/payment/enrollment state. The When step sends an actual HTTP request to the local application harness. The Then/And steps compare the real route's status and JSON response with the expected video details. They do not substitute a prewritten HTTP response for the application.

These examples were derived from the user's task and existing source behavior. They are executable BDD-style specifications for the existing system; no stakeholder workshop, acceptance sign-off or prior feature-development history is claimed.

### BDD, TDD and conventional unit testing

| Approach | Main question and working style | Example in this project |
| --- | --- | --- |
| BDD | What should a user observe in a particular situation? Agree examples, then automate their acceptance checks. It can guide implementation and regression work. | Paid + enrolled student obtains a video link; a student cannot edit a course. |
| TDD | What small behavior should code gain next? Write a failing test, make the minimum correction, then refactor while tests pass. | The earlier [genuine TDD cycle](tdd-demonstration.md) changed missing identity data from an internal exception/500 to a 401 rejection. |
| Conventional unit testing | Does an isolated function produce the right outputs and calls for specified inputs? Tests may be written before or after existing code. | The [Jest suite](unit-testing.md) directly invokes middleware with response/next spies and verifies branches. |

BDD and TDD can be used together: a behavior scenario can guide an implementation task, while smaller TDD tests guide the code inside it. A framework does not by itself establish the process used. This BDD suite was added to existing behavior; its first mock-adapter failures are not presented as a new TDD demonstration. Cucumber scenarios here run across the HTTP/router/middleware boundary, while the Jest unit suite invokes functions directly.

## Implemented files and configuration

| File | Responsibility |
| --- | --- |
| [student-video-access.feature](../backend/tests/bdd/features/student-video-access.feature) | 10 executed examples for authentication, payment, enrollment ownership, admin preview and a missing video. |
| [admin-course-management.feature](../backend/tests/bdd/features/admin-course-management.feature) | 20 executed examples: four successful operations, twelve denied operations and four repository-failure cases. |
| [tutorial.steps.cjs](../backend/tests/bdd/steps/tutorial.steps.cjs) | Executable Given/When/Then definitions using Node assertions; And sentences reuse the corresponding step definitions. |
| [world.cjs](../backend/tests/bdd/support/world.cjs) | Fresh scenario context, ephemeral local HTTP server, guarded requests, response evidence and cleanup hooks. |
| [platform.cjs](../backend/tests/bdd/support/platform.cjs) | In-memory SDK adapter registered before production imports; mounts the real video/admin routers. |
| [cucumber.cjs](../backend/cucumber.cjs) | CommonJS feature/support paths, serial execution, no retry, no publishing, and HTML/JSON/message formatters. |
| [run.cjs](../backend/tests/bdd/run.cjs) | Launches Cucumber, creates a unique report directory and records actual output, exit code, versions and source hashes. |
| [package.json](../backend/package.json), [lockfile](../backend/package-lock.json) | Pinned development dependency and npm run test:bdd command. |

Installed `@cucumber/cucumber@13.3.0`. Its published engine requirement is `22 || 24 || >=26`; the actual Node version is `v24.14.1`, with npm `11.11.0`. Installation used:

```powershell
# Repository root
npm install --prefix backend --save-dev --save-exact @cucumber/cucumber@13.3.0 --ignore-scripts --no-audit --no-fund
```

It exited 0 and added 79 packages. The [installation log](bdd/evidence/dependency-install.log) is retained. No lifecycle scripts or dependency audit ran. Jest remains installed and its scripts still work.

CommonJS configuration and built-in report formatters are supported by the official [Cucumber.js configuration documentation](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md) and [formatter documentation](https://github.com/cucumber/cucumber-js/blob/main/docs/formatters.md). Those web pages describe the main branch; the installed version and actual successful execution are recorded in this report. An attempted read of a documentation file inside the installed npm package found that the package did not include that file; this inspection did not affect execution.

### Run the suite

From the [backend directory](../backend/):

```powershell
npm run test:bdd
```

A fresh checkout first needs `npm ci --ignore-scripts --no-audit --no-fund` in that directory. No environment file, server started by hand, browser or Supabase instance is needed.

Each invocation creates a new time/process-named directory under [bdd/runs](bdd/runs/) containing `cucumber.html`, `cucumber.json`, `messages.ndjson`, `stdout.log`, `stderr.log` and `execution.json`. Earlier runs are retained. Reports are local; Cucumber publishing is disabled. The checked-in summary/CSV describe the final recorded run below and are not automatically rewritten by a later invocation.

Optional focused runs use Cucumber arguments through the npm wrapper:

```powershell
npm run test:bdd -- --tags @video-access
npm run test:bdd -- --tags @admin-courses
```

These focused commands are usage examples, **Not Run** in this phase. All final results below came from the unfiltered full-suite command. The configuration runs sequentially (`parallel: 0`); the active-fixture adapter is designed for that mode.

## Isolation, reuse and boundaries

The BDD support imports the existing synthetic UUIDs and plain-data `profile()`/`enrollment()` builders from [unit fixture utilities](../backend/tests/helpers/fixtures.cjs). Those exports do not execute Jest functions. Jest-specific response spies and query mocks are not called outside Jest.

The adapter also reuses the pre-import `require.cache` replacement technique demonstrated by the [black-box HTTP runner](../tests/black-box/api-checks.cjs). It resolves the SDK module's path, asserts that it has not already been imported, and substitutes the in-memory client before importing the real routers. The credential-reading Supabase module is never evaluated.

Every scenario starts with its own World, profile, course/video records, enrollment list, query audit and initial catalogue snapshot. A Before hook starts an Express server bound to `127.0.0.1` on an OS-assigned port. Global fetch and socket guards restrict outgoing connections to that scenario's exact host/port; each Before hook also verifies that an external fetch is rejected before transport. Requests disable redirects. These are test-process guards for this harness, not a claim of a universal OS network sandbox.

The After hook attaches sanitized method/path/body/response observations and before/after course state, then closes connections, awaits server closure, restores guards and clears the active fixture even if assertions fail. Final hook results passed. No database cleanup is necessary because all writes/deletes affect memory only.

Attachments omit Authorization headers and identity markers. Fake video URLs are only strings returned by the route; no video is played or requested from YouTube. The reports contain synthetic data, not student records.

The real components exercised are [authenticate](../backend/middleware/authenticate.js), [isAdmin](../backend/middleware/isAdmin.js), [isEnrolled](../backend/middleware/isEnrolled.js), [video routing](../backend/routes/videos.js), and the course-management handlers in [admin routing](../backend/routes/admin.js). The harness does not import the production listener or prove production bootstrap/CORS parity.

The mock supports only the calls needed here. It is not a PostgreSQL engine: no RLS, database constraints, transactions, cascades, persistence, real JWT signatures, real Supabase acceptance rules or media access are established by these scenarios.

## Feature-to-behavior traceability

| Feature group | Executed examples | Expected behavior | Key assertions |
| --- | --- | --- | --- |
| Student video access | Guest and invalid identity (2) | 401; no private URL | Exact authorization error and absence of youtube_url/link value |
| Student video access | Paid + enrolled (1) | 200; permitted video details | Exact body fields/value; course_id not exposed |
| Student video access | Unpaid with/without enrollment (2) | 403 payment denial | Enrollment alone does not bypass payment |
| Student video access | Paid but unenrolled; enrollment belongs to another course/student (3) | 403 enrollment denial | Both authenticated student and target course must match |
| Student video access | Admin unpaid and unenrolled (1) | 200 preview | Existing admin bypass is preserved |
| Student video access | Paid/enrolled requester, missing video (1) | 404 | Exact missing-video error; no private link |
| Admin course management | Admin view/create/edit/delete (4) | 200 per existing API | Catalogue includes unpublished course; create/update/delete body and in-memory state match |
| Admin course management | Guest, student, invalid identity × four operations (12) | 401 guest/invalid identity; 403 student | Exact error; catalogue unchanged; no courses query reaches the adapter |
| Admin course management | Injected returned repository error × four operations (4) | 500 with current handler message | No false success and unchanged fixture state |

Create uses 200 because that is the current route behavior; a 201 requirement was not invented. Failure cases use an injected SDK-style error object rather than an actual database outage. Deleting the fixture course does not test real SQL cascade behavior.

Example-table tags may label several rows. The fully expanded scenario name plus feature source line and Cucumber scenario ID identify individual executions; a shared tag is not a claim that an outline ran only once.

## Actual execution and retained history

| Run | UTC start/end | Scenarios | Steps including hooks | Exit | Evidence |
| --- | --- | --- | --- | --- | --- |
| Initial | 2026-11-25T13:13:40.046Z / 2026-11-25T13:13:41.046Z | 28 Pass, 2 Fail | 262 passed, 2 failed, 2 skipped; 0 undefined | 1 | [console](bdd/runs/2026-11-25T13-13-40-040Z-2084/stdout.log), [JSON](bdd/runs/2026-11-25T13-13-40-040Z-2084/cucumber.json), [metadata](bdd/runs/2026-11-25T13-13-40-040Z-2084/execution.json) |
| Final | 2026-11-25T13:14:16.138Z / 2026-11-25T13:14:17.039Z | 30 Pass, 0 Fail | 266 passed; 0 failed/skipped/undefined | 0 | [console](bdd/runs/2026-11-25T13-14-16-134Z-19696/stdout.log), [JSON](bdd/runs/2026-11-25T13-14-16-134Z-19696/cucumber.json), [metadata](bdd/runs/2026-11-25T13-14-16-134Z-19696/execution.json) |
| Existing Jest regression | Recorded in linked metadata | 60 unit tests passed in seven suites | Not a Cucumber step count | 0 | [results](unit-testing/evidence/bdd-regression/jest-results.json), [metadata](unit-testing/evidence/bdd-regression/execution.json), [log](unit-testing/evidence/bdd-regression/stderr.log) |

Both BDD runs used `npm run test:bdd` from backend. The initial failures were admin creation and editing: actual HTTP 500 versus expected 200. The test adapter's `select(fields)` set an undefined projection when the real routes called `.select()`. The adapter then attempted to split that undefined projection. Correcting the adapter to `select(fields = '*')` implemented the required “all fields” behavior; no production handler or expected outcome was changed. Both failed assertions and the two resulting skipped assertions remain in the first report. They are not hidden, counted as passing, or described as application defects.

The final expanded scenario results are available in [CSV](bdd/scenario-results.csv) and [JSON](bdd/scenario-results.json). Every row contains the expected HTTP/error, actual status/body, execution status and source identity; JSON also includes decoded scenario attachments. The CSV can be opened in Excel. The [execution summary](bdd/execution-summary.json) records both runs, versions, source hashes and verification.

The final run contains 10 video scenarios and 20 admin scenarios. A successful negative scenario is a **Pass** when the application correctly denies access. Earlier runs are not added to the distinct-scenario count.

## Verification and changed files

A Node verification script read both Cucumber JSON files, decoded their actual attachments, counted visible steps separately from hooks, and checked expected status/errors against actual HTTP observations. It exited 0 with 30 final passing scenarios, 206 visible steps, 60 passing hook executions, zero undefined steps, and 30 request/response attachments. It checked that attachments omit headers/identity markers and that every final recorded source/configuration hash matches the current files.

Middleware, route and reused-helper hashes also match the earlier unit-phase snapshot. Thus **no production logic or shared Jest utility changed in this BDD phase**. The previous authentication TDD correction remains intact. Adding Cucumber changes package/lockfile hashes; it does not invalidate the historical unit report's stated source/run scope.

Changed files:

- Backend package manifest/lockfile: Cucumber dev dependency and test:bdd script.
- New Cucumber configuration and [BDD test directory](../backend/tests/bdd/): two features, executable steps, World/hooks, adapter and evidence runner.
- This report, [BDD reports/results](bdd/), and the additional Jest regression evidence linked above.
- [Assignment checklist](assignment-checklist.md) and [testing roadmap](testing-roadmap.md): progress references.

Editor diagnostics found no errors in the Cucumber configuration, runner, adapter, World/hooks or step-definition files.

Final consistency verification used a Node script supplied through PowerShell standard input (`@' ... '@ \| node`) and exited 0. It confirmed 30 scenario-result rows (10 video, 20 admin), 30 finished scenarios and 266 PASSED step/hook records in the independent NDJSON stream, 60 passing Jest regression tests, a UTF-8 BOM CSV with 30 data rows, 440 valid relative Markdown links and balanced code fences. Every final recorded source/configuration hash still matched. The generated HTML, JSON, NDJSON, execution metadata and console report existed and were nonempty; visual browser rendering of the HTML was not separately tested. These are deliverable checks, not additional scenario passes.

## Limitations and next work

This suite verifies behavior at a mocked-service HTTP boundary. Browser forms/UI, real Supabase Auth, RLS, production data, actual persistence and playback remain **Not Run by this BDD suite**. No new coverage measurement was collected or merged with the earlier Jest coverage report. Passing BDD scenarios do not establish complete security or whole-system acceptance.

The user-requested BDD scope is implemented and executed. Stakeholder review of the feature language and original assignment-section mapping remain separate activities. A later integration layer can reuse the feature intent against a verified disposable Supabase environment, with appropriately separate fixtures and reports.

