# Section 3.3 Black-Box Testing

## Scope and outcome

Date: 2026-11-25. Application baseline: `c068e28`. Assignment basis: the user's supplied Section 3.3 requirements for equivalence partitioning (EP), boundary value analysis (BVA), decision tables and safe execution. The original DOCX remains unavailable; additional marking rules are unverified.

**34 distinct cases executed: 34 Pass, 0 Fail against their stated implementation-level expectations. Eleven additional case records remain Not Run.** This is a scoped result for real frontend components and real Express routes with synthetic service dependencies, not an end-to-end Supabase result or a claim that all business requirements are satisfied. One pending password case cannot receive a concrete acceptance oracle until local Auth policy is known.

The browser suite exercised existing registration/course/video form controls and the actual watch-page renderer. The API suite issued real loopback HTTP requests to the existing watch router and authentication/enrollment middleware. Assertions inspect outputs: validity, visible feedback, iframe construction, HTTP status/body and disclosure of lesson URLs. No assertion uses source-code branch counters or internal call counts. Source inspection was used to discover real rules; that does not turn the input/output tests into structural coverage tests.

Application code, database schema, manifests and lockfiles are unchanged. New test helpers are separate in [tests/black-box](../tests/black-box/). No production or test Supabase database was accessed. No real account, JWT, password, personal record or private video link was used. Synthetic IDs and fake sample URLs in evidence are test data, not usable credentials or actual playback evidence.

## Sources and verified validation rules

| Input or feature | Frontend rule actually present | API/schema rule actually present | Requirement interpretation |
| --- | --- | --- | --- |
| Registration name | Required text input; no trimming, minimum/maximum length or pattern | Auth metadata name copied to nullable profile name | Nonempty input is enforced by browser; whitespace quality is unspecified (Q03) |
| Registration/login email | Required `type=email`; no custom regex or length rule | Auth SDK handles account validity; profile email is NOT NULL | Native syntactic acceptance does not prove deliverability, uniqueness or Auth acceptance (Q01) |
| Password | Required password input; no minlength/maxlength/pattern in app | Supabase configuration, not supplied, governs password policy | No 6/8-character or complexity rule may be invented (Q01) |
| Course title | Required text input; no explicit min/max length | Required SQL TEXT; admin insert/update forwards body with no field-schema validator | Null and empty string differ; NOT NULL does not mean nonblank; title whitespace policy is Q03 |
| Thumbnail URL | Optional `type=url` | Nullable text, no URL/host CHECK | Browser syntax differs from direct API/database acceptance |
| Lesson title and URL | Required title; required `type=url` for YouTube URL | SQL title/URL NOT NULL; URL text has no host/format constraint; API passes body through | YouTube-only business policy is suggested by field label but not enforced consistently (Q03) |
| Candidate YouTube ID | Watch renderer accepts extracted candidate only when its JavaScript string length is exactly 11 | Watch API returns stored URL for authorized caller | A real equality boundary exists; it is a parser/rendering rule, not a proof of a real video |
| Video order | Calculated from existing list; first/last reorder buttons disabled; no number input | `order_index INTEGER DEFAULT 0`, nullable, no positive-range or uniqueness CHECK | Integer storage bounds exist, but minimum 1 is not a database/business validation rule |
| Duration | Optional free-text input, hint such as 12:34 | Nullable TEXT | Hint is not a validated numeric/time boundary |
| Payment/date | UI toggles Boolean; no date entry | `is_paid` nullable Boolean; `paid_at` server-created on truthy payment flag or cleared; timestamps have no business-range CHECK | No user-entered payment amount/date range to test; account-wide payment remains Q04 |
| Enrollment | Required selection of student and course in UI | Nullable UUID foreign keys; unique non-null student/course pair | Direct API null/duplicate/invalid-reference behavior needs real DB testing (Q03/Q06) |
| Role/access | UI guards and payment indicators | Token -> profile -> role; admin bypass or paid-plus-enrolled; profile role CHECK permits admin/student, nullable | Access decision rules are source-supported; production identity verification and RLS are separate tests |

Sources: [Register](../frontend/src/pages/Register.jsx), [Login](../frontend/src/pages/Login.jsx), [ManageCourses](../frontend/src/pages/admin/ManageCourses.jsx), [ManageVideos](../frontend/src/pages/admin/ManageVideos.jsx), [ManageStudents](../frontend/src/pages/admin/ManageStudents.jsx), [WatchPage](../frontend/src/pages/WatchPage.jsx), [admin API](../backend/routes/admin.js), [authentication middleware](../backend/middleware/authenticate.js), [enrollment middleware](../backend/middleware/isEnrolled.js), [schema](../database_setup.sql). Requirement IDs FR-01/03/06/09/11/13 and clarifications Q01–Q08 resolve to the [Section 3.1 plan](section-3.1-test-plan.md).

Source checks covered all current form input declarations and SQL constraints. Browser evidence additionally records the actual rendered type, required flag and absence of minlength/maxlength/min/max attributes for tested controls. CSS layout maxima and placeholder text are not validation limits. No product-level numeric/date bounds were found.

## Environment and evidence boundaries

| Component | Actual execution configuration |
| --- | --- |
| Runtime | Windows, Node v24.14.1, npm 11.11.0 |
| Dependencies | Existing lockfiles installed with `npm ci --ignore-scripts --no-audit --no-fund`; backend reported 79 packages, frontend 99; manifests/locks unchanged |
| API test | Express 5 from backend dependencies; ephemeral port bound to 127.0.0.1; actual watch router/middleware; Supabase module replaced in require cache before import |
| API fixtures | Synthetic user/course/video UUIDs; role/payment/enrollment varied independently; fake bearer marker interpreted only by in-memory Auth mock |
| Browser | Integrated desktop browser reporting Chrome 150.0.7871.250 / Electron 43.8.9 on Windows; en-US |
| Browser fixture | Vite on 127.0.0.1:5178; original app components; test-only module substitution for AuthContext, API service and Supabase service; fixed synthetic admin profile permits admin-form rendering |
| External-service isolation | Browser SDK/API stubs make no external calls; CSP blocks remote frames/connections and form actions; valid registration reaches a visible synthetic error response, not Auth; mutations are rejected by stub |
| Database availability | Neither package had a local environment file. Supabase CLI and psql were not found on PATH. Docker executable exists but `docker info` failed because the Docker Desktop Linux engine pipe was absent |
| Scope not exercised | Real signup/password verification, token signature/expiry, browser AuthContext lifecycle, persistence, SQL constraints, RLS, actual YouTube playback, production network/performance |

The browser's fixed admin context is a rendering fixture, not evidence of browser authorization correctness. The API suite retains real authentication and enrollment middleware, with only their external dependency mocked. The API mock does not reproduce PostgreSQL constraints; no database claim is based on its outputs.

Evidence files contain sanitized structured observations, not screenshots:

- [API results](evidence/black-box/api-results.json): 14 outcomes, execution timestamp and hashes of the three exercised backend source files.
- [Final browser results](evidence/black-box/browser-results.json): 20 outcomes, inputs, expected/actual outputs, browser version and timestamps.
- [Initial browser attempt](evidence/black-box/browser-attempt-1.json): retained partial run with six navigation-blocked cases marked Not Run and 14 observed passes; superseded by the final run for summary counts.

Every result-table evidence reference identifies a file and its JSON `results` entry by test ID. There is no requirement for a screenshot to fabricate: the retained JSON is the actual execution evidence. Earlier Section 3.2 cases remain their original Not Run design baseline; this report's distinct IDs and mocked scope are not silently transferred to those full-stack/manual cases.

## Equivalence Partitioning

EP divides inputs into groups expected to behave similarly at the selected boundary. Valid below means accepted by the named layer; it does not necessarily mean acceptable to Supabase, a business owner, or a real media service.

### Classes and representatives

| Feature | Class | Validity at tested boundary | Representative / cases |
| --- | --- | --- | --- |
| Registration email | E1 empty | Invalid: required | Empty string, EP-EMAIL-01 |
| Registration email | E2 malformed email syntax | Invalid: email type mismatch | qa-invalid, EP-EMAIL-02 |
| Registration email | E3 ordinary syntactic address | Valid native syntax | qa@example.test, EP-EMAIL-03 |
| Registration email | E4 single-label domain | Valid in observed browser; actual Auth acceptance unknown | qa@local, EP-EMAIL-04 |
| Course title | T1 nonempty text | Valid native required check | QA Course, EP-TITLE-01 |
| Course title | T2 empty string | Invalid native required check | Empty string, EP-TITLE-02 |
| Course title | T3 whitespace-only text | Valid current browser behavior; business acceptability unclear | Three spaces, EP-TITLE-03 |
| Lesson URL | U1 empty | Invalid required URL | Empty string, EP-URL-01 |
| Lesson URL | U2 malformed absolute URL | Invalid URL syntax | not-a-url, EP-URL-02 |
| Lesson URL | U3 non-YouTube absolute URL | Valid native URL syntax; not necessarily playable | https://example.test/lesson, EP-URL-03 |
| Lesson URL | U4 YouTube-shaped URL | Valid native URL syntax; fake sample video | https://youtu.be/abcdefghijk, EP-URL-04 |
| Watch URL parser | U5 other host with matching watch query | Accepted by current renderer despite host mismatch | https://example.test/watch?v=abcdefghijk, EP-URL-05 |
| Authorization input | A1 missing/wrong scheme | Invalid header | DT-01 and EP-AUTH-01 |
| Authorization input | A2 Bearer value rejected by Auth dependency | Invalid identity | EP-AUTH-02 |
| Authorization input | A3 valid identity with absent profile | Invalid application identity | EP-AUTH-03 |
| Authorization input | A4 recognized identity and existing profile | Authenticated; permission depends on decision table | DT-02–DT-09 |

At least three existing fields are represented: email, course title and lesson URL. Authorization is a fourth feature. EP-SUBMIT-01/02 additionally check that the actual registration form prevents malformed email submission and displays a stub response for valid syntax.

### Executed frontend EP cases

Preconditions for every row: isolated browser fixture running; tested original component rendered; synthetic admin rendering context; no real SDK/database; remote media blocked. Steps: open the stated form, fill the representative input and inspect browser validity; watch-parser cases inspect the rendered iframe/message instead; submission cases fill the actual registration form and click Create Account. Full steps and flags are in the evidence entry. A successful validity check does not assert database insertion.

| ID / description | Input | Expected result | Actual result | Status | Evidence entry |
| --- | --- | --- | --- | --- | --- |
| EP-EMAIL-01 — Empty required registration email | `""` | `{"valid":false}` | `{"value":"","valid":false,"valueMissing":true,"typeMismatch":false,"type":"email","required":true,"minLength":null,"maxLength":null,"min":null,"max":null}` | Pass | [Browser JSON](evidence/black-box/browser-results.json), EP-EMAIL-01 |
| EP-EMAIL-02 — Malformed registration email | `"qa-invalid"` | `{"valid":false}` | `{"value":"qa-invalid","valid":false,"valueMissing":false,"typeMismatch":true,"type":"email","required":true,"minLength":null,"maxLength":null,"min":null,"max":null}` | Pass | [Browser JSON](evidence/black-box/browser-results.json), EP-EMAIL-02 |
| EP-EMAIL-03 — Syntactically valid registration email | `"qa@example.test"` | `{"valid":true}` | `{"value":"qa@example.test","valid":true,"valueMissing":false,"typeMismatch":false,"type":"email","required":true,"minLength":null,"maxLength":null,"min":null,"max":null}` | Pass | [Browser JSON](evidence/black-box/browser-results.json), EP-EMAIL-03 |
| EP-EMAIL-04 — Single-label domain accepted by native email input | `"qa@local"` | `{"valid":true}` | `{"value":"qa@local","valid":true,"valueMissing":false,"typeMismatch":false,"type":"email","required":true,"minLength":null,"maxLength":null,"min":null,"max":null}` | Pass | [Browser JSON](evidence/black-box/browser-results.json), EP-EMAIL-04 |
| EP-TITLE-01 — Nonempty course title | `"QA Course"` | `{"valid":true}` | `{"value":"QA Course","valid":true,"valueMissing":false,"typeMismatch":false,"type":"text","required":true,"minLength":null,"maxLength":null,"min":null,"max":null}` | Pass | [Browser JSON](evidence/black-box/browser-results.json), EP-TITLE-01 |
| EP-TITLE-02 — Empty required course title | `""` | `{"valid":false}` | `{"value":"","valid":false,"valueMissing":true,"typeMismatch":false,"type":"text","required":true,"minLength":null,"maxLength":null,"min":null,"max":null}` | Pass | [Browser JSON](evidence/black-box/browser-results.json), EP-TITLE-02 |
| EP-TITLE-03 — Whitespace course title characterization | `"   "` | `{"valid":true}` | `{"value":"   ","valid":true,"valueMissing":false,"typeMismatch":false,"type":"text","required":true,"minLength":null,"maxLength":null,"min":null,"max":null}` | Pass | [Browser JSON](evidence/black-box/browser-results.json), EP-TITLE-03 |
| EP-URL-01 — Empty required video URL | `""` | `{"valid":false}` | `{"value":"","valid":false,"valueMissing":true,"typeMismatch":false,"type":"url","required":true,"minLength":null,"maxLength":null,"min":null,"max":null}` | Pass | [Browser JSON](evidence/black-box/browser-results.json), EP-URL-01 |
| EP-URL-02 — Malformed video URL | `"not-a-url"` | `{"valid":false}` | `{"value":"not-a-url","valid":false,"valueMissing":false,"typeMismatch":true,"type":"url","required":true,"minLength":null,"maxLength":null,"min":null,"max":null}` | Pass | [Browser JSON](evidence/black-box/browser-results.json), EP-URL-02 |
| EP-URL-03 — Generic HTTPS URL characterization | `"https://example.test/lesson"` | `{"valid":true}` | `{"value":"https://example.test/lesson","valid":true,"valueMissing":false,"typeMismatch":false,"type":"url","required":true,"minLength":null,"maxLength":null,"min":null,"max":null}` | Pass | [Browser JSON](evidence/black-box/browser-results.json), EP-URL-03 |
| EP-URL-04 — YouTube-shaped absolute URL | `"https://youtu.be/abcdefghijk"` | `{"valid":true}` | `{"value":"https://youtu.be/abcdefghijk","valid":true,"valueMissing":false,"typeMismatch":false,"type":"url","required":true,"minLength":null,"maxLength":null,"min":null,"max":null}` | Pass | [Browser JSON](evidence/black-box/browser-results.json), EP-URL-04 |
| EP-URL-05 — Actual WatchPage URL rendering | `"https://example.test/watch?v=abcdefghijk"` | `{"iframePresent":true,"invalidMessage":false}` | `{"iframePresent":true,"src":"https://www.youtube.com/embed/abcdefghijk?rel=0&modestbranding=1&fs=0","invalidMessage":false}` | Pass | [Browser JSON](evidence/black-box/browser-results.json), EP-URL-05 |
| EP-SUBMIT-01 — Browser form submit gate | `"qa-invalid"` | `{"stubResponseVisible":false}` | `{"stubResponseVisible":false,"emailValid":false}` | Pass | [Browser JSON](evidence/black-box/browser-results.json), EP-SUBMIT-01 |
| EP-SUBMIT-02 — Browser form submit gate | `"qa@example.test"` | `{"stubResponseVisible":true}` | `{"stubResponseVisible":true,"emailValid":true}` | Pass | [Browser JSON](evidence/black-box/browser-results.json), EP-SUBMIT-02 |

### Executed authentication EP cases

Preconditions: actual local Express watch route with deterministic in-memory user/profile/video/enrollment data. Steps: send one GET watch request with the stated header/profile condition; inspect status, exact error and absence of `youtube_url`. Missing header and valid-header classes are also covered by the decision table.

| ID | Input condition | Expected result | Actual result | Status | Evidence entry |
| --- | --- | --- | --- | --- | --- |
| EP-AUTH-01 | Basic scheme | HTTP 401; Missing or invalid authorization header; URL absent | HTTP 401; Missing or invalid authorization header; URL absent | Pass | [API JSON](evidence/black-box/api-results.json), EP-AUTH-01 |
| EP-AUTH-02 | Unrecognized Bearer marker | HTTP 401; Unauthorized: Invalid token; URL absent | HTTP 401; Unauthorized: Invalid token; URL absent | Pass | [API JSON](evidence/black-box/api-results.json), EP-AUTH-02 |
| EP-AUTH-03 | Recognized identity; profile absent | HTTP 401; Profile not found; URL absent | HTTP 401; Profile not found; URL absent | Pass | [API JSON](evidence/black-box/api-results.json), EP-AUTH-03 |

### Planned database and Auth EP cases

These are not satisfied by browser checks or a mocked success response. Use a verified disposable Supabase instance, synthetic admin/student data, and captured IDs. Never use production to establish the result.

| ID | Requirement / class | Preconditions and steps | Expected implementation behavior | Actual result | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| EP-DB-01 | FR-06, null title invalid under SQL | Local DB/admin; POST course with title:null; inspect response and rows | NOT NULL rejects insert; current handler maps DB error to 500, not a specified 400 | Not executed; DB unavailable | Not Run | None |
| EP-DB-02 | FR-06, empty title different from null | Local DB/admin; POST course with title:"" bypassing UI; inspect rows; cleanup by ID | Current SQL/API allow empty TEXT if no additional deployed constraint; expected 200/row, a characterization of validation gap Q03 | Not executed; DB unavailable | Not Run | None |
| EP-DB-03 | FR-13, non-null role outside enum invalid | Disposable DB; attempt profile role teacher via controlled SQL transaction on synthetic record; inspect rejection; rollback | Role CHECK rejects teacher; this tests schema, not an absent admin role-edit API | Not executed; DB unavailable | Not Run | None |
| EP-DB-04 | FR-07/13, duplicate non-null enrollment pair invalid | Local admin and existing synthetic student/course pair; POST same pair again; count rows | Unique constraint rejects duplicate; one pair remains; current API 500; desired 409 contract remains Q06 | Not executed; DB unavailable | Not Run | None |
| EP-PASS-01 | FR-01, password-policy partition unknown | Record actual local Auth minimum/complexity; then choose one compliant and one noncompliant password privately and submit separately | Expected acceptance/rejection must follow recorded service policy; no concrete minimum is asserted now | Not executed; policy and local Auth unavailable | Not Run | None |

## Boundary Value Analysis

BVA checks values at and immediately beside a real limit. The app provides no explicit numeric/date form ranges. Two usable frontend boundaries were verified: nonempty required title and the watch renderer's exact 11-character candidate ID. The SQL integer type provides a separate technical storage boundary; it is not a user-defined ordering rule.

### Exact-length video-ID boundary

Source: [WatchPage](../frontend/src/pages/WatchPage.jsx) compares extracted length with 11. Test data uses ASCII to avoid confusion between visible characters and JavaScript UTF-16 code units. Here **minimum = maximum = 11**; this is a singleton valid-length set. Minimum-plus-one is invalid, unlike a wider interval. Six requested boundary positions collapse to three unique inputs; each unique input was executed once in the final run.

| Boundary position | Length | Input URL | Expected | Execution ID |
| --- | --- | --- | --- | --- |
| Minimum minus one | 10 | https://youtu.be/abcdefghij | Invalid URL message, no iframe | BVA-VIDEO-01 |
| Minimum | 11 | https://youtu.be/abcdefghijk | Iframe with extracted ID | BVA-VIDEO-02 |
| Minimum plus one | 12 | https://youtu.be/abcdefghijkl | Invalid URL message, no iframe | BVA-VIDEO-03 |
| Maximum minus one | 10 | https://youtu.be/abcdefghij | Invalid URL message, no iframe | BVA-VIDEO-01, same execution |
| Maximum | 11 | https://youtu.be/abcdefghijk | Iframe with extracted ID | BVA-VIDEO-02, same execution |
| Maximum plus one | 12 | https://youtu.be/abcdefghijkl | Invalid URL message, no iframe | BVA-VIDEO-03, same execution |

Preconditions: real WatchPage rendered with synthetic authorized context and stubbed authorized response containing the candidate URL. Steps: open a fresh watch URL for each candidate; wait for fixture lesson heading; inspect iframe presence/src and Invalid YouTube URL text. Remote iframe loading is denied by CSP. No YouTube lookup or playback is tested.

### Required course-title boundary

The effective lower bound is one nonempty string code unit for native required validation; there is no explicit minlength attribute. Execute empty, A and AB (0/1/2). Whitespace also satisfies the native rule, as the EP case shows. **Maximum, maximum-minus-one and maximum-plus-one are not applicable because no application maximum is declared**; an arbitrary 255-character limit would be fabricated. This does not claim unlimited browser/database storage.

Preconditions: actual ManageCourses form in isolated fixture. Steps: fill title with each value and inspect native validity; do not infer persistence. Evidence confirms no maxlength/minlength/min/max attributes.

### Executed BVA results

| ID / description | Input | Expected result | Actual result | Status | Evidence entry |
| --- | --- | --- | --- | --- | --- |
| BVA-TITLE-01 — Minimum minus one: zero characters | `""` | `{"valid":false}` | `{"value":"","valid":false,"valueMissing":true,"typeMismatch":false,"type":"text","required":true,"minLength":null,"maxLength":null,"min":null,"max":null}` | Pass | [Browser JSON](evidence/black-box/browser-results.json), BVA-TITLE-01 |
| BVA-TITLE-02 — Minimum: one character | `"A"` | `{"valid":true}` | `{"value":"A","valid":true,"valueMissing":false,"typeMismatch":false,"type":"text","required":true,"minLength":null,"maxLength":null,"min":null,"max":null}` | Pass | [Browser JSON](evidence/black-box/browser-results.json), BVA-TITLE-02 |
| BVA-TITLE-03 — Minimum plus one: two characters | `"AB"` | `{"valid":true}` | `{"value":"AB","valid":true,"valueMissing":false,"typeMismatch":false,"type":"text","required":true,"minLength":null,"maxLength":null,"min":null,"max":null}` | Pass | [Browser JSON](evidence/black-box/browser-results.json), BVA-TITLE-03 |
| BVA-VIDEO-01 — Actual WatchPage URL rendering | `"https://youtu.be/abcdefghij"` | `{"iframePresent":false,"invalidMessage":true}` | `{"iframePresent":false,"src":null,"invalidMessage":true}` | Pass | [Browser JSON](evidence/black-box/browser-results.json), BVA-VIDEO-01 |
| BVA-VIDEO-02 — Actual WatchPage URL rendering | `"https://youtu.be/abcdefghijk"` | `{"iframePresent":true,"invalidMessage":false}` | `{"iframePresent":true,"src":"https://www.youtube.com/embed/abcdefghijk?rel=0&modestbranding=1&fs=0","invalidMessage":false}` | Pass | [Browser JSON](evidence/black-box/browser-results.json), BVA-VIDEO-02 |
| BVA-VIDEO-03 — Actual WatchPage URL rendering | `"https://youtu.be/abcdefghijkl"` | `{"iframePresent":false,"invalidMessage":true}` | `{"iframePresent":false,"src":null,"invalidMessage":true}` | Pass | [Browser JSON](evidence/black-box/browser-results.json), BVA-VIDEO-03 |

### Integer storage boundaries not yet executed

The supplied schema defines `videos.order_index` as PostgreSQL `INTEGER`. PostgreSQL documents its range as **-2147483648 to 2147483647**, rejecting out-of-range values. This establishes the type boundary for the supplied schema; the deployed Supabase PostgreSQL version/schema remains unverified. [PostgreSQL numeric types documentation](https://www.postgresql.org/docs/current/datatype-numeric.html).

Preconditions for each row: running disposable local Supabase with supplied schema; synthetic admin, valid course FK and otherwise valid video body; isolated row per value. Steps: POST video through admin API with the specified order_index; inspect status and stored exact value; remove only the created case row. In-range expected API 200; overflow expected DB rejection and current API 500. Do not emulate integer rejection in a mock and claim PostgreSQL evidence.

| ID | Boundary | order_index | Expected SQL/API result | Actual result | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| BVA-INT-01 | Minimum minus one | -2147483649 | Integer overflow rejected; no row; current API 500 | Not executed; local DB unavailable | Not Run | None |
| BVA-INT-02 | Minimum | -2147483648 | Stored exactly; current API 200 | Not executed; local DB unavailable | Not Run | None |
| BVA-INT-03 | Minimum plus one | -2147483647 | Stored exactly; current API 200 | Not executed; local DB unavailable | Not Run | None |
| BVA-INT-04 | Maximum minus one | 2147483646 | Stored exactly; current API 200 | Not executed; local DB unavailable | Not Run | None |
| BVA-INT-05 | Maximum | 2147483647 | Stored exactly; current API 200 | Not executed; local DB unavailable | Not Run | None |
| BVA-INT-06 | Maximum plus one | 2147483648 | Integer overflow rejected; no row; current API 500 | Not executed; local DB unavailable | Not Run | None |

No positive-only CHECK exists: negative or zero integer values are not invalid simply because the UI usually calculates indexes starting at 1. The nullable column also permits null at the schema level. No date input or payment amount input exists, duration is text, and password policy has not been configured/read. None can legitimately supply invented business boundaries.

**Lecturer-approval proposal:** accept the executed exact-length ID and required-text BVA as appropriate bounded-input alternatives, with the SQL integer six-position design as supplementary technical BVA. If the rubric specifically requires user-entered numeric/date business limits, record the feature limitation and seek approval for these alternatives or a separately approved new requirement. No such feature or limit was added to the application, and lecturer approval has not been obtained.

## Decision Table Testing

Requirement: FR-09 and the source-defined rule: an authenticated application user may retrieve an existing video's URL when their profile is admin, or when their student profile is paid and enrolled in that video's course. Sources: [watch API](../backend/routes/videos.js), [authenticate](../backend/middleware/authenticate.js) and [isEnrolled](../backend/middleware/isEnrolled.js).

**Preconditions:** target video exists; student/admin role is non-null and one of the intended roles; service lookups succeed. Authentication means the token is recognized and a profile exists. Payment and enrollment refer to that profile and requested course. The API fixture recognizes an opaque test identity; it does not validate real JWT signatures. Null/corrupt roles and returned/thrown service errors are outside this four-condition decision table and are not asserted covered.

For an unauthenticated caller, role/payment/enrollment are unknown, so the table uses “—” (not applicable), not impossible guest-plus-verified-admin combinations. For authenticated users all eight role × payment × enrollment combinations are feasible. Admin payment/enrollment are don't-care inputs in a reduced table, but all four combinations were explicitly executed here. Student enrollment alone or payment alone is insufficient.

Execution steps for each rule: set the isolated service fixture to the table's profile/payment/enrollment state; send GET watch request with or without the synthetic identity marker; compare HTTP status/error and URL presence. Allowed results must contain exactly id, title, youtube_url and description with expected fixture ID/URL; denied results must omit youtube_url.

| Rule | Authenticated | Role | Paid | Enrolled | Expected action | Actual result | Status | Evidence entry |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DT-01 | No | — | — | — | HTTP 401; Missing or invalid authorization header; URL absent | HTTP 401; Missing or invalid authorization header; URL absent | Pass | [API JSON](evidence/black-box/api-results.json), DT-01 |
| DT-02 | Yes | student | No | No | HTTP 403; Forbidden: User has not paid; URL absent | HTTP 403; Forbidden: User has not paid; URL absent | Pass | [API JSON](evidence/black-box/api-results.json), DT-02 |
| DT-03 | Yes | student | No | Yes | HTTP 403; Forbidden: User has not paid; URL absent | HTTP 403; Forbidden: User has not paid; URL absent | Pass | [API JSON](evidence/black-box/api-results.json), DT-03 |
| DT-04 | Yes | student | Yes | No | HTTP 403; Forbidden: Not enrolled in this course; URL absent | HTTP 403; Forbidden: Not enrolled in this course; URL absent | Pass | [API JSON](evidence/black-box/api-results.json), DT-04 |
| DT-05 | Yes | student | Yes | Yes | HTTP 200; lesson body with four expected fields; URL present | HTTP 200; lesson body with four expected fields; URL present | Pass | [API JSON](evidence/black-box/api-results.json), DT-05 |
| DT-06 | Yes | admin | No | No | HTTP 200; lesson body with four expected fields; URL present | HTTP 200; lesson body with four expected fields; URL present | Pass | [API JSON](evidence/black-box/api-results.json), DT-06 |
| DT-07 | Yes | admin | No | Yes | HTTP 200; lesson body with four expected fields; URL present | HTTP 200; lesson body with four expected fields; URL present | Pass | [API JSON](evidence/black-box/api-results.json), DT-07 |
| DT-08 | Yes | admin | Yes | No | HTTP 200; lesson body with four expected fields; URL present | HTTP 200; lesson body with four expected fields; URL present | Pass | [API JSON](evidence/black-box/api-results.json), DT-08 |
| DT-09 | Yes | admin | Yes | Yes | HTTP 200; lesson body with four expected fields; URL present | HTTP 200; lesson body with four expected fields; URL present | Pass | [API JSON](evidence/black-box/api-results.json), DT-09 |

### Video existence outside the main decision table

The primary table assumes an existing video so its four conditions are sufficient. Missing video has a separate action and ordering matters: an unpaid student is rejected before lookup, while a paid student reaches the video lookup. These two supplementary cases prevent incorrectly predicting 404 for every nonexistent video request.

| ID | Input condition | Expected result | Actual result | Status | Evidence entry |
| --- | --- | --- | --- | --- | --- |
| EDGE-01 | Missing video; paid=true; enrolled=true | HTTP 404; Video not found; URL absent | HTTP 404; Video not found; URL absent | Pass | [API JSON](evidence/black-box/api-results.json), EDGE-01 |
| EDGE-02 | Missing video; paid=false; enrolled=true | HTTP 403; Forbidden: User has not paid; URL absent | HTTP 403; Forbidden: User has not paid; URL absent | Pass | [API JSON](evidence/black-box/api-results.json), EDGE-02 |

## Interpreting the observed results

| Observation | Evidence and implication | Requirement disposition |
| --- | --- | --- |
| Empty/malformed email rejected, ordinary and single-label-domain syntax accepted | EP-EMAIL-01–04; observed native browser constraints only | Auth deliverability/account rules still require local Supabase/Q01 |
| Whitespace course title accepted | EP-TITLE-03; required is not trimmed nonblank validation | Confirm Q03; characterize as a validation gap if meaningful title is approved requirement, not an invented production defect |
| Generic absolute URL accepted by video form | EP-URL-03; type=url is not a YouTube allowlist | Q03 URL/host requirement unresolved; no claim that such URL plays |
| Other host with watch query produces YouTube iframe | EP-URL-05; exact 11-character extraction checks length but does not authenticate host | Narrow confirmed renderer behavior; clarify intended domain restriction before fixing |
| Exact ID length enforced | BVA-VIDEO-01–03; only 11 among 10/11/12 generated an iframe | Supports parser requirement only; fake ID/media blocked |
| Payment and enrollment jointly required for students; admins bypass | DT-02–09 in real route with mocked profile/data | Scoped access-rule evidence; real identity verification, RLS and database integration remain untested |

All executed assertions passed because expected results explicitly describe current implementation behavior. Passing a characterization test does not approve a questionable requirement or certify security. No unobserved bug, screenshot, coverage percentage, capacity measurement or real-user success has been invented.

## Results summary and limitations

| Group | Distinct case records | Pass | Fail | Not Run |
| --- | --- | --- | --- | --- |
| Frontend EP and submit checks | 14 | 14 | 0 | 0 |
| Frontend BVA | 6 | 6 | 0 | 0 |
| Authentication EP over HTTP | 3 | 3 | 0 | 0 |
| Video access decision table | 9 | 9 | 0 | 0 |
| Missing-video supplementary cases | 2 | 2 | 0 | 0 |
| Real database/Auth EP records | 5 | 0 | 0 | 5 |
| Integer BVA | 6 | 0 | 0 | 6 |
| Total current records | 45 | 34 | 0 | 11 |

Counts exclude duplicate boundary labels and earlier attempts. The first browser attempt's six blocked cases are now resolved by the final run, not added again to total Not Run. The pending password record is blocked on both environment and requirement definition. No code coverage measurement was collected. Full-system pass rate, production readiness and completion of all original rubric conditions cannot be inferred from these counts.

## Commands, execution history and changed files

All repository commands use `D:\projects\tutorial-platform` unless a package working directory is stated. No secret environment values were read or exported.

| Command / activity | Actual result |
| --- | --- |
| `git status --short`; source/manifest/schema reads; `rg` for required/type/min/max/pattern/length/order_index | Existing docs untracked; baseline source reviewed; actual validation rules above identified |
| `git log -1 --format=%h`; `node --version`; `npm --version` | c068e28; v24.14.1; 11.11.0 |
| `Test-Path` for both dependency directories and local environment files | All absent at entry |
| `npm ci --ignore-scripts --no-audit --no-fund` in backend and frontend | Both exit 0; installed 79/99 packages respectively; lifecycle scripts and audit not run; node_modules ignored |
| `Get-Command docker,supabase,psql -ErrorAction SilentlyContinue` | Docker binary found; Supabase CLI and psql not found on PATH |
| `docker info --format '{{.ServerVersion}}'` | Exit 1: Docker Desktop Linux engine named pipe absent; no running local DB established |
| `node tests/black-box/api-checks.cjs` | Exit 0; 14 executed/14 Pass/0 Fail; JSON evidence created; server closed itself |
| `node tests/black-box/browser-fixture.mjs` | Fixture started on loopback 5178; Vite reported envFile deprecation warning; no application startup/credential module invoked |
| Browser tool executes exported browser-check function with Playwright Page | Initial request-interception setup caused six 10-second navigation timeouts; those rows recorded Not Run, not product failures; remaining 14 passed after interception removed |
| Remove test-only request interceptor; preserve CSP and stub isolation; rerun browser checks | Corrected run passed 20 cases. A further capture run persisted the final raw output at 2026-11-25T12:07:46.607Z–12:07:51.162Z; do not add repeated passes to totals |
| Browser CSP console output | YouTube frames blocked as intended; expected fixture isolation event, not a product playback failure |
| `git diff --exit-code -- backend frontend database_setup.sql .gitignore` | Exit 0, no production/schema/manifest/lock changes |
| Final document/evidence checks and fixture shutdown | Recorded below after final verification |

Execution timestamps in JSON are UTC. API run timestamp: 2026-11-25T12:04:24.316Z. Initial browser attempt: 12:05:38.013Z–12:06:48.181Z. Reruns are preserved/distinguished rather than pretending the first attempt was fully successful.

Changed files for this phase: this report; the [API runner](../tests/black-box/api-checks.cjs), [browser fixture](../tests/black-box/browser-fixture.mjs), [browser checks](../tests/black-box/browser-checks.cjs); three evidence JSON files linked above; [assignment checklist](assignment-checklist.md) and [roadmap](testing-roadmap.md) progress links. The prior 143-case design CSV/Markdown is unchanged.

### Reproduction

1. Install existing dependencies with the two package commands above. No real environment variables or Supabase credentials are needed. Do not run the production backend entry for these fixtures.
2. Run the API runner from repository root. It uses an ephemeral loopback server and refuses to overwrite existing evidence. Archive an existing result to a new run-named file before intentionally rerunning; retain history.
3. Start the browser fixture. Use the existing integrated browser's Playwright tool, or a separately installed Playwright runner, to invoke the exported function from the browser-checks file with a Page at the fixture origin. It uses actual React controls, reloads state per case and returns structured results. Playwright is provided by the integrated tool in this run, not added as a project dependency.
4. Save returned JSON as a new run artifact, without copying a previous run's expected values into actual fields. Use the runner's case IDs to compare results. Do not reuse the initial request-interception setup, which was removed from the saved final runner.
5. Stop the fixture using Ctrl+C; no DB cleanup is needed because there were no DB connections/writes. Keep node_modules ignored. For the Not Run DB cases, first provision a verified disposable local Supabase and document its actual schema/auth settings.

### Final verification

Fixture shutdown: sent Ctrl+C to the specific browser-fixture process; it exited with code 1 following interruption. `Get-NetTCPConnection -LocalPort 5178 -State Listen -ErrorAction SilentlyContinue | Measure-Object | Select-Object -ExpandProperty Count` returned 0 listeners (exit 1 because no matching listener was found). The API runner had already closed its ephemeral server. No database cleanup was necessary.

Document/evidence validation used a Node script supplied through PowerShell standard input (`@' ... '@ | node`) with `fs`, `assert`, `path` and `crypto`. It read the report and three JSON files, checked unique result IDs/statuses and report-row presence, counted Not Run rows, verified three backend SHA-256 hashes and resolved relative links across the Markdown package. Final execution exited 0: **34 unique executed cases, 34 Pass, 0 Fail, 11 Not Run rows, three matching source hashes, 277 valid relative links**. Initial browser evidence independently counted 14 Pass and six Not Run. No report placeholders remain. Result tables were generated directly from the recorded expected/actual JSON objects.

Two document-check attempts failed before the final successful check: `node -e` lost JavaScript double quotes through PowerShell's native argument conversion (syntax error, exit 1); the first standard-input version converted a literal Unicode dash in a table assertion to `?` (assertion failure, exit 1). The final assertion uses the ASCII test-ID prefix. These were verifier invocation/encoding issues, not application failures; saved report/evidence contents were not changed to make a case pass.

`node --check` on each of the three test helpers completed without syntax errors. `git diff HEAD --exit-code -- backend frontend database_setup.sql .gitignore` exited 0, confirming no tracked production/configuration changes against the baseline, including staged changes. Editor diagnostics reported no errors in the three helpers and three updated Markdown documents. The existing 143-case manual design files were not edited in this phase. No full frontend build/lint, coverage, real DB, live Auth or media playback result is implied by these checks.
