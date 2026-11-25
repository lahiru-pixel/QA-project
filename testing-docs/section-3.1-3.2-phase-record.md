# Sections 3.1 and 3.2 Preparation Record

Date: 2026-11-25. Source baseline: `c068e28`. Phase: test planning and manual test design. The user's follow-up supplies the Section 3.1/3.2 headings and content; the original assignment DOCX remains unavailable.

## Deliverables and changed files

| File | Change |
| --- | --- |
| [Section 3.1 test plan](section-3.1-test-plan.md) | New introduction, objectives, scope, functional/non-functional requirements, strategy, environment, resources, schedule, risks, criteria, ISO mapping and verification/validation |
| [Section 3.2 STLC](section-3.2-stlc.md) | New project-specific lifecycle, fixture catalog, design techniques, execution/evidence and defect procedures |
| [Manual case matrix](section-3.2-manual-test-cases.md) | New 143-case matrix with 14 fields per case; source and requirement mapping |
| [CSV case matrix](section-3.2-manual-test-cases.csv) | Same 143 cases for Excel, UTF-8 BOM, quoted fields and CRLF line endings |
| [Assignment checklist](assignment-checklist.md) | Sections 3.1/3.2 map to user-supplied scope; preserve pending original-rubric and execution status |
| [Testing roadmap](testing-roadmap.md) | Link current planning/design progress without marking execution phases complete |
| [Project analysis](project-analysis.md) | Update assignment-source limitation to reflect supplied Section 3.1/3.2 scope |
| [This phase record](section-3.1-3.2-phase-record.md) | New command/result/limitation record |

No application files, database schema, package manifests, lockfiles or credentials were changed. No dependencies were installed and no server or Supabase test connection was started. The documentation directory was already untracked at entry; work preserves the initial documents and does not claim they were newly created in this phase.

## Commands and actual preparation activities

Working directory for repository commands: `D:\projects\tutorial-platform`.

| Command / activity | Actual result |
| --- | --- |
| `git status --short` | Entry status showed only untracked documentation directory |
| `git log -1 --format=%h` | Source baseline `c068e28` |
| `Get-ChildItem testing-docs` and UTF-8 `Get-Content` of existing analysis/roadmap/checklist | Reused existing source findings and phase structure; no initial tests or executed evidence existed |
| `rg --files --hidden -g AGENTS.md -g '*.docx' -g '!node_modules' -g '!.git'` | No newly available assignment DOCX or repository instruction file found |
| UTF-8 `Get-Content` on auth/login/register/middleware/admin/course/student/watch source files | Rechecked expectations, status codes, publication behavior and access order against current source |
| Official ISO catalog lookup and ISO foreword in ANSI preview | Confirmed 2011 withdrawn/eight product characteristics and 2023 nine-characteristic model; edition differences cited in plan; public ISO browser required JavaScript, so foreword preview used for revision details |
| Structured document creation through patch tool | Created planning/STLC package and matching case records; generated 143 rows across 14 feature families from one in-memory dataset; did not generate results |
| Node script via PowerShell literal here-string and `node` | Normalized CSV to UTF-8 BOM and CRLF; no test-data/result cells changed |
| Node CSV parser, Markdown-row comparison, requirement/clarification/link/fence/formula-prefix checks | First check confirmed 143 unique cases, 14 fields, matching case data, 209 local links and no formula-like cells; flagged NFR IDs combined with quality-area names in plan table. Separated IDs into their own column; final traceability recheck recorded below |
| `Import-Csv -LiteralPath testing-docs/section-3.2-manual-test-cases.csv -Encoding UTF8` | Independent PowerShell import returned 143 rows, all with status Not Run |
| Editor diagnostics for documentation directory | No errors found |
| `git diff --exit-code -- backend frontend database_setup.sql .gitignore` and `git status --short` | No production-file differences; status shows only untracked documentation directory |

Source references for standards are linked near their associated claims in the [plan](section-3.1-test-plan.md). Framework families are inherited from the existing roadmap and remain subject to installation-time compatibility checks. ISO applications and numerical quality targets in this plan are project proposals, not claims that the standard imposes those thresholds.

## Validation results

The initial structural check exposed a requirement-table formatting mismatch, not an application failure. Its Node process set a failure exit code; subsequent shell commands completed, so the combined shell's final exit code alone did not represent validation success. The report was inspected and the NFR table corrected.

Final recheck used PowerShell `Import-Csv`, per-row field/status/requirement/clarification checks and exact Markdown-row comparison, followed by a Node filesystem/link/fence check. PowerShell was configured with `$ErrorActionPreference = 'Stop'` and explicitly checked the Node exit code. Command exit code: **0**. Actual result: **143 unique cases, 14 populated fields per case, all Not Run, exact Markdown/CSV case-data parity, all 20 FR/NFR IDs and all clarification references resolved, 209 local Markdown links resolved, and no unbalanced code fences**. The earlier encoding/formula scan confirmed UTF-8 BOM, CRLF and zero formula-like cells; those CSV contents did not change during the NFR table correction. Independent PowerShell import also returned all 143 rows.

These are document integrity results. Application test execution remains Not Run; no case was passed by validating the spreadsheet structure.

## Execution and evidence status

| Measure | Actual state |
| --- | --- |
| Designed manual rows | 143 |
| Fields per row | 14, including all 10 requested fields |
| Executed application rows | 0 |
| Pass / Fail / Not Run | 0 / 0 / 143 |
| Actual-result cells | Not executed. |
| Evidence cells | None - not executed |
| Runtime screenshots, defects, coverage, performance results | None collected or measured |
| Original assignment rubric | Additional conditions unverified |

## Limitations and next step

The documents complete the requested planning/design scope, not application execution or full assignment sign-off. Before execution, provision and verify the isolated environment, implement any necessary fault stubs, review Q01–Q08 and record group decisions. Original-DOCX reconciliation and group approval are still pending. The CSV is structurally checked for Excel import but an actual Excel desktop viewing session has not been performed. No result, screenshot, bug or quality metric has been invented.
