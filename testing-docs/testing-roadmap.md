# Phased testing implementation roadmap

Date: 2026-11-25. Baseline: `c068e28`. Read with [project analysis](project-analysis.md) and [assignment checklist](assignment-checklist.md).

## Requirement mapping status

The assignment document is unavailable. **P0–P8 below are proposed engineering phases, not assignment section numbers.** The user's follow-ups supply Sections 3.1–3.4: [Section 3.1 plan](section-3.1-test-plan.md) maps to P0/planning; [Section 3.2 STLC](section-3.2-stlc.md) and [manual matrix](section-3.2-manual-test-cases.md) map to P2 design; [Section 3.3](black-box-testing.md) records scoped black-box execution; [Section 3.4](white-box-testing.md) maps to P2 structural design and future P3 coverage execution. Sections 3.5–3.10 and additional rubric rules remain pending in the [checklist](assignment-checklist.md). Reconcile the original document's mandatory tools, techniques, minimum counts, coverage targets, report format, group contributions and demonstrations when available.

**Latest progress:** [BDD testing](bdd-testing.md) adds two executable Cucumber features with 30 passing mocked-service HTTP scenarios; the Jest regression still passes 60 tests. The earlier [unit report](unit-testing.md) retains its measured coverage and [TDD evidence](tdd-demonstration.md). BDD introduced no production change or new coverage measurement. Full phase exit gates have not passed. Estimated effort below remains provisional team effort, not elapsed work or an assignment promise. Roles are suggested responsibilities, not assigned people.

## Safety and evidence rules for every phase

1. Preserve existing behavior while adding infrastructure. First characterize current behavior; agree intended behavior before changing logic. Keep any later app-export refactor or bug fix small and separately reviewable.
2. Keep test code outside production source directories. Unit/component tests use synthetic data and mocks. Mock Supabase before application imports; fail unexpected HTTP/fetch/WebSocket access. Dummy credentials alone do not prevent outbound traffic.
3. Use a disposable local Supabase instance for writes, constraint/cascade checks, auth registration and RLS tests. A separate nonproduction project is an alternative only after its identity is verified and access limited. Never fall back to developer/production environment variables.
4. Require an explicit test-mode flag and allowlisted target before integration/E2E setup or teardown. Check frontend, API and Supabase targets, not only `NODE_ENV`. Proposed guard must reject missing/unknown/production targets, redirects outside the allowed target, and wrong database marker/project identity. Test guard rejection itself with mocks before any database writes.
5. Isolate fixtures by run/worker; capture created IDs. Clean up only that run's records in foreign-key-safe order. No broad table deletes, production reset, or production account reuse. Cascades/reset demonstrations belong exclusively in a verified disposable local instance.
6. Use generated names and reserved example-domain emails; no copied real users, payments or private lesson links. Supabase sign-up tests use local email capture so no messages reach real recipients.
7. Never commit secrets, tokens, cookies, browser storage state or sensitive payloads. Extend ignore rules before creating test env files. Redact authorization headers, auth responses, screenshots, traces and logs before evidence is shared. Limit trace collection on auth flows; sanitizing a screenshot alone does not sanitize its trace/network archive.
8. Mock YouTube and remote thumbnails in automated suites. A separately recorded manual playback check may use permitted sample content; no performance/security scan targets third-party media.
9. Report unexecuted tests as **Not Run**, not pass, fail or zero percent coverage. A missing prerequisite can be recorded separately as a blocker while execution remains Not Run. Record actual failures even when inconvenient; do not manufacture defects or metrics to meet an assumed quota.
10. After every phase append a record containing date, baseline, changed files, environment, exact commands/cwd, exit codes, test counts, evidence locations, defects and limitations. Do not discard failed runs when documenting a successful rerun.

## Proposed directory boundaries

Most test-code paths below remain proposals. The Section 3.1/3.2 planning package exists; see its [phase record](section-3.1-3.2-phase-record.md). Section 3.3 added [test-only helpers](../tests/black-box/) and [sanitized runtime evidence](evidence/black-box/). No production source was changed.

```text
backend/
  tests/
    unit/                 # middleware and isolated handler dependencies
    api/                  # routers through Supertest, mocked Supabase
    integration/          # explicitly gated real test-Supabase checks
    helpers/              # test-only Express harness, mock query builders
    fixtures/             # synthetic data
frontend/
  tests/
    unit/
    components/
    helpers/
    mocks/
tests/
  e2e/                    # Playwright suites and role contexts
  performance/            # bounded k6 scenarios
  database/               # test schema assertions / seed definitions
  helpers/                # safety guards and fixture lifecycle
testing-docs/
  project-analysis.md
  testing-roadmap.md
  assignment-checklist.md
  test-cases/             # future case specifications
  defects/                # future verified defect records
  evidence/               # sanitized real run evidence only
```

Keep generated raw reports, coverage, auth state and local secrets ignored. Commit only sanitized evidence needed for the assignment. Choose root test-tool ownership in P1 (a small root tooling package if needed) without moving the existing application packages.

## P0 — Requirements and baseline review

**State:** source review/documents complete; assignment extraction and mapping pending. **Suggested owner:** QA lead. **Remaining effort:** about half a day once the document is supplied.

- Obtain and read the actual document, including tables and marking/submission notes. Record document filename/version and exact section wording with page or paragraph/table references. Read embedded images if they contain requirements.
- Fill all ten section entries and map each acceptance criterion to the phase and planned case/evidence that will satisfy it. Explicitly document any requirement not applicable to this platform, with a justified alternative only if the assignment allows it.
- Confirm intended draft visibility, enrollment/payment policy, auth confirmation behavior, supported browsers, and numerical quality criteria. Preserve uncertain items as questions, not invented requirements.
- Snapshot source baseline and agreed scope. Assign group members and contribution recording only once membership is known.

**Exit gate:** assignment traceability is verified against the actual document; no requirement is left with an invented title or assumed threshold. Independent test-environment planning may proceed while mapping is pending, but do not declare assignment completion.

## P1 — Safe environment and test infrastructure

**State:** Partial: existing dependencies plus pinned Jest installed; mocked black-box and unit harnesses executed; real database guards/environment and the full gate remain pending. **Depends on:** source review; exact rubric may change tooling. **Suggested owner:** infrastructure/test automation. **Effort:** 1–2 team days.

- Pin a supported Node/npm setup and choose compatible test tool versions. Inspect installed peer/engine constraints for Vite 8, React 19, jsdom, Vitest and Jest before claiming compatibility.
- Install existing dependencies using each committed lockfile. Add frontend Vitest/RTL tooling and backend Jest/Supertest as dev dependencies with lockfile updates; add Playwright in a clearly documented tooling package.
- Set up test-only Express harness with the same middleware/router mounts. Register the Supabase mock before requiring modules; retain real authentication middleware in API permission tests, mocking its external calls rather than bypassing authorization.
- Mock auth event subscription, session retrieval, user verification and fluent query operations. Provide separate success, returned-error and rejected-promise fixtures. Freeze time where payment timestamps/year matter. Clear mocks and state after every case.
- Add a deny-by-default network policy for mocked tests. Add explicit target guards and a protected local database seed lifecycle before enabling real integration tests.
- Create ignored local test config, synthetic roles, local email capture, browser dependencies and environment documentation. Verify startup on test-only ports.
- Run the existing frontend lint/build baseline and new harness smoke tests. Record pre-existing failures without fixing application logic silently.

**Exit gate:** repeatable commands, no real credentials needed for mocked tests, an intentional stray network call fails, an unsafe database target fails before writes, local fixtures are deterministic, and production sources remain unchanged or any necessary infrastructure refactor is explicitly reviewed.

Potential later production refactor: export an Express app separately from the listener to validate real wiring directly. It is **not implemented now** and is not required for initial router-level tests. The harness alone cannot prove production bootstrap parity.

## P2 — Test design and manual baseline

**State:** Partial: 143 manual cases designed; Section 3.3 scoped execution recorded; Section 3.4 adds 39 structural cases and CFG/complexity analysis. **Depends on:** P0 for assignment techniques/counts; P1 for execution. **Suggested owner:** QA/test design. **Effort:** 1–2 team days.

- Convert FLOW-01–FLOW-12 and OBS-01–OBS-15 from [analysis](project-analysis.md) into individual cases with setup, exact steps, expected result, priority and requirement IDs.
- Apply equivalence partitioning: valid/invalid token, admin/student/guest, paid/unpaid, enrolled/not enrolled, valid/invalid UUID, required/optional fields, published/draft.
- Apply boundary analysis where a boundary actually exists: first/last/only video in ordering; zero/one/many courses; 10/11/12-character candidate video IDs. Do not invent a password-length or title-length limit; derive it from confirmed auth settings or approved requirements.
- Use the payment × enrollment × role decision table and account-state transitions (signed out -> signed in -> expired/logged out; unpaid -> paid -> revoked; unenrolled -> enrolled -> removed).
- Use white-box branch cases for each early return and exception in middleware. Record criterion-to-case coverage independently from runtime code coverage.
- Perform exploratory/manual flows on synthetic data; include mobile widths, keyboard operation, deep-link refresh, slow/offline errors and cancellation. Record actual screenshots only when executed.

**Exit gate:** all confirmed assignment criteria have case/evidence plans; expected behavior is justified; manual executions have actual results; unexecuted cases remain Not Run. A proposed case count is never presented as an assignment minimum.

## P3 — Unit and component automation

**State:** Partial: Jest unit suites implemented; 60 tests pass, requested middleware measured 100% statements/branches; configured backend scope measured 41.86% statements/56.04% branches. Remaining admin/video handlers and frontend unit tests are backlog. **Depends on:** P1; case design from P2. **Suggested owner:** frontend/backend test authors. **Effort:** 2–3 team days.

Backend priority: authentication header/token/profile branches; admin decisions; enrollment payment/bypass/video lookup/course-ID resolution; thrown vs returned SDK errors; timestamp creation/revocation with controlled clock. Cover missing request-user and missing course-ID branches even when normal router wiring avoids them.

Frontend priority: guards and auth event lifecycle, SDK form submission/errors, token interceptor, homepage load/retry/abort, enrollment search/mutations/duplicate protection, course/video management forms, payment visibility, URL parsing through rendered watch behavior, failed fullscreen and delayed route requests. Exercise business behavior rather than testing implementation details such as exact hook counts.

Use React Testing Library queries by role/name and user-event. Where inaccessible markup prevents such queries, record the accessibility observation; do not silently change production markup or fill every component with test IDs. Test local helpers through visible behavior until extracting a helper is approved.

**Exit gate:** repeatable offline tests, no external calls, meaningful positive/negative branches and genuine coverage reports with source inclusion/exclusions. Numerical gates are set from the assignment or documented team agreement, not invented here.

## P4 — API, database and integration testing

**State:** Partial: Section 3.3 mocked watch checks and 30 Cucumber video/course-management HTTP scenarios passed; real DB/Auth/RLS and broader API tests remain Not Run. **Depends on:** P1 guards; P2 contracts; P3 core permissions. **Suggested owner:** backend/data QA. **Effort:** 2–3 team days.

- Supertest: all 18 endpoint combinations; correct filters, ordering, field exclusion, status/body, JSON parsing, missing/invalid bodies, failed queries and missing records. For every admin endpoint, include unauthorized/forbidden access and authorized operation. Verify a denied request does not reach mutation code.
- Test student ownership and watch access using separate user IDs and multiple courses. Attempt to substitute another student's identifiers; assert the server uses the authenticated profile.
- In local Supabase, verify registration trigger/defaults, non-null/check/unique/FK constraints, cascade deletes, nullable edge cases, actor set-null behavior and query joins. Mocked API results cannot prove any of these database rules.
- Test RLS with anonymous and real signed-in student/admin clients. Use a service-role client solely for controlled provisioning/cleanup; it cannot validate RLS because it bypasses policies.
- Exercise service-role-backed API permissions against that same isolated environment, including revocation after an existing session. Inspect draft/publication decisions against the agreed requirement.
- If required, create a parameterized Postman/Newman collection using synthetic accounts and untracked secrets. Sanitize all exported request/response evidence.

**Exit gate:** real schema/RLS and mocked API results clearly separated, all method/path cases linked to requirements, cleanup restricted to created IDs, and schema/cascade execution documented as local only.

## P5 — Browser/system and acceptance testing

**State:** Partial: 20 isolated Section 3.3 browser checks passed; real system and acceptance tests Not Run. **Depends on:** P4 for real-stack flows; mocked UI browser tests may start after P3. **Suggested owner:** system/UAT QA. **Effort:** 2–3 team days.

- Playwright roles: guest, unpaid enrolled student, paid unenrolled student, paid enrolled student, second student and admin. Keep authentication storage isolated and ignored.
- Run complete synthetic journeys: register/login; admin creates/publishes course and lesson; admin marks paid and enrolls; student sees own course and can open lesson; admin revokes/removes and next access is denied; logout prevents protected access.
- Cover both enrollment interfaces, CRUD cancellation, video order boundaries/partial errors, list retries, draft handling, session refresh and deep links.
- Run a deterministic mocked-browser suite for UI failures and a separately labeled real test-stack suite for integration. An intercepted response is not evidence that backend/database permissions work.
- Start with Chromium; add Firefox/WebKit and mobile viewport coverage if required/agreed. These engines/viewports do not substitute for actual-device claims. Check actual playback manually using permitted sample content when necessary.
- Perform user acceptance tasks with synthetic accounts, named participant roles and recorded feedback if required by the rubric. Do not invent participant responses.

**Exit gate:** real system and mocked UI runs clearly identified; evidence includes browser/viewport/build/data assumptions; acceptance results signed/recorded only by actual participants.

## P6 — Security, accessibility, performance and reliability

**State:** Not Run. **Depends on:** P1 guards and stable isolated environment; P0 determines mandatory categories. **Suggested owner:** quality attributes/security QA. **Effort:** 1–3 team days.

- Security: verify auth bypass resistance, object ownership, role checks, unpublished content policy, field allowlisting needs, direct RLS access, error leakage, input handling, CORS/header expectations, dependency advisories and secret exclusions. Review scanner findings manually. Run ZAP active checks only within a verified local target and allowlist.
- Accessibility/usability: automated axe plus keyboard-only navigation, labels/names, focus, announcements, contrast, touch controls, responsive tables, text zoom and language rendering. Separate automated findings from manual results.
- Performance: agree load, data volume, duration and acceptance thresholds before running. Suggested local workload is a small ramp over published-course reads, course-detail reads and controlled own-course/watch requests. Measure p50/p95/p99, throughput and errors with dataset, hardware and dependency mode. Set stop limits and no production/third-party targets. Mock-auth timings characterize the mock setup, not live Supabase latency.
- Reliability: simulate auth/profile/database outage, network timeout, duplicate submissions, simultaneous enrollment and partial video reorder. Use mocked failures first; real fault injection only in the disposable environment.

**Exit gate:** reproducible measurements and actual raw/sanitized evidence; no unsupported claim of security, WCAG compliance, production capacity or availability.

## P7 — Defect confirmation, fixes and regression

**State:** Partial: one isolated authentication defect confirmed and corrected through a recorded TDD cycle; final regression suite passes. Broader defect review remains open. **Depends on:** executed findings from P2–P6 and authorization for application fixes. **Suggested owner:** developer plus independent reviewer if available. **Effort:** depends on actual defects; not estimated as a fixed bug count.

- Confirm observations against an agreed requirement and reproduce them. Log environment, exact synthetic steps, expected/actual result, severity/priority rationale and evidence.
- Keep each future fix small and record production files changed. Preserve functionality; do not combine dependency upgrades or redesign with unrelated fixes.
- Re-run the reproducer and appropriate regression suites, preserving both failed and passed evidence. Recheck permission decisions after any auth/enrollment change.
- A missing specification may be a clarification item rather than a bug. Do not treat every static observation as a confirmed defect.

**Exit gate:** every confirmed defect has a current disposition and evidence; known limitations remain visible; no mandatory high-priority acceptance criterion is silently waived.

## P8 — Final quality report and submission audit

**State:** Not Run. **Depends on:** all required criteria, executed tests and resolved/disclosed findings. **Suggested owner:** QA lead and group editor. **Effort:** about one team day.

- Fill each Section 3.1–3.10 acceptance criterion with specific implementation, case, run and evidence links. Audit exact required counts/tools/formats against the real assignment.
- Report pass/fail/Not Run totals from actual runs. Compute coverage and pass rates with explicit denominators and scope. Do not combine frontend/backend percentages by simple averaging or count Not Run as passed.
- Include test plan/design, environments, scripts/commands, actual results, defects and retest history, quality conclusions, limitations, contributions and demonstration material as required.
- Reproduce required checks from the lockfiles and documented setup in a clean test environment. Verify all document links and sanitize evidence before packaging.

**Exit gate:** each requirement is satisfied with evidence or clearly identified as incomplete; final claims can be traced to a real command/run/manual record. Missing assignment text means this gate cannot pass.

## Command plan (not executed)

Existing baseline commands can be run in P1 after safe configuration. These are instructions for later work, not results:

| Working directory | Command | Purpose / current status |
| --- | --- | --- |
| Backend package | `npm ci` | Install committed dependencies; Not Run |
| Frontend package | `npm ci` | Install committed dependencies; Not Run |
| Frontend package | `npm run lint` | Existing static baseline; Not Run |
| Frontend package | `npm run build` | Existing build baseline; Not Run |
| Backend package | `node server.js` | Existing startup entry; only after isolated environment guard; Not Run |
| Frontend package | `npm run dev -- --host 127.0.0.1` | Local UI; isolated test settings required; Not Run |

Proposed future scripts: `test:unit`, `test:api`, `test:integration`, `test:coverage`, `test:e2e`, and `test:performance`, owned by the relevant package/tooling directory. **These scripts do not exist yet.** P1 must add exact commands, compatible versions, config and setup instructions; only then can later run records refer to them as executable. Do not use the backend's current placeholder `npm test` as an application test suite.

## Per-phase record template

Latest design phase: [Section 3.4](white-box-testing.md) records the three middleware control flows, primary complexity values 2/4/9 with explicit alternative conventions, independent paths and 39 Not Run cases. Implement these isolated tests and retain an instrumented report before claiming statement or branch coverage. This documentation phase does not change the earlier Section 3.3 results or complete the P3 exit gate.

```text
Phase / requirement IDs:
Date/time and tester role:
Source commit and changed files:
Environment and synthetic dataset/run ID (no secrets):
Prerequisites and target guard result:
Exact command(s) and working directory:
Start/end, exit code, raw result location:
Cases planned / executed / passed / failed / Not Run:
Expected result and actual result:
Sanitized evidence links:
Defects and reproduction / retest links:
Cleanup performed and verified:
Limitations, deviations, blocked criteria:
Next phase entry decision:
```

Current record: source analysis and Section 3.1/3.2 planning/design are prepared. Inspection commands are in [project analysis](project-analysis.md); planning checks are in the [Section 3.1/3.2 phase record](section-3.1-3.2-phase-record.md). The [Section 3.3 report](black-box-testing.md) is the latest execution record: 14 real-route HTTP checks and 20 real-component browser checks passed with external services mocked; 11 database/Auth records remain Not Run. Existing lockfile dependencies are installed; the original command plan and full-phase states above describe remaining work, not an absence of these scoped checks. Next: obtain disposable local Supabase and its actual Auth policy for the pending cases, confirm Q03 input rules and lecturer acceptance of the BVA alternative, and reconcile the original assignment rubric. No logic fix or additional phase completion is implied.
