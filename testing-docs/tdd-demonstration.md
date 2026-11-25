# Genuine TDD: reject absent authenticated identity safely

Date: 2026-11-25. See [unit-testing results](unit-testing.md) for setup, all commands, broader tests and coverage. This is one focused Red–Green–Refactor example. The other unit tests characterize pre-existing functions and are **not** described as retrospective TDD.

## Justification and acceptance rule

Before this change, [authenticate.js](../backend/middleware/authenticate.js) evaluated `data.user` after calling Supabase. With a resolved `{data:null,error:null}` or `{data:undefined,error:null}`, this property read threw and the catch returned 500. There was no authenticated identity to attach.

The approved task permits a small justified improvement. The regression requirement is: **if the dependency supplies no identity data, deny access with 401 and the existing “Unauthorized: Invalid token” response; do not query a profile, assign req.user, call next, or log an internal exception.** A rejected dependency promise remains 500. This is fail-closed error handling, not a bypass or a claim that the real SDK normally returns this envelope.

## Red — test written and executed before the correction

The [regression test](../backend/tests/unit/authenticate-null-user.test.cjs) supplies null and undefined as two parameterized inputs and asserts 401 plus the absence of profile lookup, user attachment, next and exception logging.

Command from backend:

```powershell
npm run test:record -- red test --runTestsByPath tests/unit/authenticate-null-user.test.cjs
```

Actual run: 2026-11-25T12:51:35.073Z–12:51:36.185Z; **2 Fail, 0 Pass, exit 1**. Both failures show **Expected: 401; Received: 500**. The application had not yet been edited.

Evidence: [failure log](unit-testing/evidence/red/stderr.log), [Jest results](unit-testing/evidence/red/jest-results.json), [metadata](unit-testing/evidence/red/execution.json), [original source snapshot](unit-testing/evidence/red/authenticate.js.txt), [test snapshot](unit-testing/evidence/red/authenticate-null-user.test.cjs.txt).

Original check:

```js
if (error || !data.user) {
  return res.status(401).json({ error: 'Unauthorized: Invalid token' });
}
```

No defect was artificially inserted. This unsafe dereference existed in the original source, whose recorded SHA-256 was `2dec2af3abf78cdde1733d4d1e6b40f2c13c7992d1efbdf95578ea0b302d44fb`.

## Green — minimum correction

Changed only the predicate to safely read an absent envelope:

```js
if (error || !data?.user) {
  return res.status(401).json({ error: 'Unauthorized: Invalid token' });
}
```

Optional chaining gives undefined when data is null/undefined; the missing-user test then rejects the request normally. It does not make the user authenticated.

```powershell
npm run test:record -- green test --runTestsByPath tests/unit/authenticate-null-user.test.cjs
```

Actual run: 2026-11-25T12:51:53.891Z–12:51:54.993Z; **2 Pass, 0 Fail, exit 0**. Evidence: [log](unit-testing/evidence/green/stderr.log), [results](unit-testing/evidence/green/jest-results.json), [metadata](unit-testing/evidence/green/execution.json), [minimum-change source](unit-testing/evidence/green/authenticate.js.txt).

Broader regression tests were then completed. Their first run exposed a course-test parameterization mistake (59 Pass, 1 Fail), retained in [green-regression evidence](unit-testing/evidence/green-regression/). Correcting that test's input-row format produced **60 Pass, 0 Fail before refactoring**, recorded in [green-regression-fixed evidence](unit-testing/evidence/green-regression-fixed/). The original TDD test was unchanged.

## Refactor — name and reuse the verified identity

After the Green results, replaced repeated access with a local named value:

```js
const { data, error } = await supabase.auth.getUser(token);
const verifiedUser = data?.user;

if (error || !verifiedUser) {
  return res.status(401).json({ error: 'Unauthorized: Invalid token' });
}

// The existing profile query now uses:
.eq('id', verifiedUser.id)
```

The fragment's `.eq` line belongs to the existing query chain; it is not standalone executable code. Naming the identity makes the profile lookup clearly depend on the validated user and avoids repeating the nested property read. Normal header, auth error, profile and permission checks stay in place. The two authorization middleware files were not modified.

```powershell
npm run test:record -- refactor test
npm run test:record -- final-coverage test:coverage
```

Refactor run: 12:54:55.462Z–12:54:56.965Z UTC; **60 Pass, 0 Fail, exit 0**. Instrumented run: 12:54:57.391Z–12:54:59.093Z UTC; **60 Pass, 0 Fail, exit 0**. Evidence: [refactor log](unit-testing/evidence/refactor/stderr.log), [refactor JSON](unit-testing/evidence/refactor/jest-results.json), [final source snapshot](unit-testing/evidence/refactor/authenticate.js.txt), [coverage results](unit-testing/evidence/final-coverage/jest-results.json) and [HTML coverage](unit-testing/coverage/index.html).

## Integrity of the demonstration

All stages have UTC start/end, exit code, exact inner npm command, Node/Jest versions, source/test hashes and preserved stdout/stderr. Each stage's source and regression-test snapshot matches its recorded hash. The regression test SHA-256 is identical across all six runs:

`0946793b80c0a37ea58c2e33b7498b3e7062981591fda6ef0a84fbe9780b2093`.

The final authentication source SHA-256 is:

`b50f2f8e686329583ebb7d02c74529d54a2a484165154b940a7e5d49ec8cf401`.

The [verification record](unit-testing/evidence/verification.json) confirms chronological ordering and unchanged tested files during each run. Source archives are ordinary text snapshots for review; Jest reported zero snapshot tests. Earlier failed runs were retained and are not counted as current failures.

The earlier [white-box design](white-box-testing.md) WB-AUT-11 expected the original 500 characterization. That historical expectation is explicitly superseded by this 401 regression requirement. Its old exception path cannot be claimed as a still-applicable passing test. The full coverage figures and their scope are in the [unit report](unit-testing.md).

Production change: only the null-safe identity read and named-variable reuse in authentication. No credentials, tokens, database access, test-only success condition or weakened authorization rule were added.

