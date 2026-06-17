# Context Handoff

## Goal
Continue subagent-driven development of RetrospectIQ Phases 6–8, starting at Task 4 (PDF extraction module and route). Tasks 1–3 are complete and reviewed.

## Project Context
- **Repository**: RetrospectIQ at `/Users/michael.abraham/Projects/Retro`
- **Branch**: `main` (5 commits ahead of origin, not pushed)
- **Plan file**: `docs/superpowers/plans/2026-06-16-phases-6-8.md`
- **Design spec**: `docs/superpowers/specs/2026-06-16-phases-6-8-design.md`
- **SDD progress ledger**: `.git/sdd/progress.md`
- **Key lib files**: `lib/permits.ts`, `lib/building-profiles.ts`, `lib/predictions.ts`, `lib/scoring.ts`, `lib/env.ts`, `lib/s3.ts`, `lib/mongodb.ts`

## Current State
Phases 6–8 planning and design are complete (design spec committed, implementation plan committed). Subagent-driven development started using the `superpowers:subagent-driven-development` skill. Tasks 1–3 are fully implemented and reviewed. Task 4 is next.

Current HEAD: `7c57dea`

## Completed Work
- **Brainstorming + design** — Full design for Phases 6–8 approved and committed to `docs/superpowers/specs/2026-06-16-phases-6-8-design.md`
- **Implementation plan** — 8-task plan at `docs/superpowers/plans/2026-06-16-phases-6-8.md`
- **Task 1** (commits `85a325f..838abff`): Installed `pdf-parse`, `openai`, `@types/pdf-parse`, `vitest`. Added test scripts to `package.json`. Created `vitest.config.ts` (env: node, passWithNoTests: true). Added `serverExternalPackages: ['pdf-parse']` to `next.config.ts`.
- **Task 2** (commits `838abff..4522621`): Extended `lib/permits.ts` with new `PermitStatus` types, `TextExtraction` interface, `rawText`/`textExtraction` fields, and `updatePermit()`. Added `openaiApiKey()` to `lib/env.ts`. Created `lib/building-profiles.ts` (upsert/get with replaceOne). Created `lib/predictions.ts` (upsert/get with replaceOne).
- **Task 3** (commits `4522621..7c57dea`): Implemented `lib/scoring.ts` with `computeRetrofitScore()` and `lib/scoring.test.ts` with 24 passing tests. **Note**: `hasControlsUpgrade()` checks only `type === 'Controls'` — `'Automation'` was removed because it's not a valid `DetectedUpgrade.type` (that union is `"HVAC"|"Lighting"|"Electrical"|"Envelope"|"Controls"|"Other"`).

## Remaining Work
- **Task 4**: Create `lib/extraction.ts` and `app/api/permits/[id]/extract/route.ts` — PDF extraction via pdf-parse, S3 download
- **Task 5**: Create `lib/analysis.ts` and `app/api/permits/[id]/analyze/route.ts` — OpenAI gpt-4o-mini building profile extraction
- **Task 6**: Create `app/api/permits/[id]/process/route.ts` — orchestrator (extract → analyze → score)
- **Task 7**: Create `components/AnalysisButton.tsx` — `'use client'` component that calls `/process`, shows loading/error, calls `router.refresh()` on success
- **Task 8**: Replace `app/permits/[id]/dashboard/page.tsx` with real data; delete `lib/retrofit.ts`

## Key Decisions & Rationale
- **Client fetch + router.refresh()**: Dashboard stays Server Component; only the button is a Client Component. Button calls `POST /api/permits/[id]/process` via `fetch()`, then calls `router.refresh()` on success. No Server Actions, no server redirects.
- **Re-runnable pipeline**: Every run fully overwrites `building_profiles` and `predictions` records using `replaceOne(..., { upsert: true })`. Button shows "Re-Run Analysis" if a prior run exists, along with "Last analyzed: <timestamp>".
- **Scanned PDF handling**: If `pdf-parse` extracts < 100 non-whitespace chars, set `permit.status = "scanned_pdf"`, store `textExtraction.status = "scanned_pdf"`, return early from process. Dashboard shows yellow warning banner, button stays available for retry.
- **Typed result objects**: `extractPermitText()` and `analyzePermit()` return typed result objects (`{ outcome: 'completed' | 'scanned_pdf' | 'failed'; error?: string }`) for expected states. Only throw for unexpected server errors (S3 down, MongoDB write failure, etc.).
- **Controls penalty logic**: Apply +10 controls penalty ONLY if `hvacAdj <= 0` AND no Controls upgrade in `detectedUpgrades`. This prevents double-penalizing old HVAC systems whose controls status is unknown.
- **`serverExternalPackages: ['pdf-parse']`**: Already in `next.config.ts` — pdf-parse reads test fixtures at require-time which breaks bundling.

## Code Changes (Tasks 1–3)

Key files modified/created:
- `package.json`: added pdf-parse, openai, @types/pdf-parse, vitest; added test scripts
- `next.config.ts`: added `serverExternalPackages: ['pdf-parse']`
- `vitest.config.ts`: new file, `environment: 'node'`, `passWithNoTests: true`
- `lib/permits.ts`: replaced with extended version adding `PermitStatus` union, `TextExtraction` interface, `rawText`/`textExtraction` on `Permit`/`PermitView`, and `updatePermit()`
- `lib/env.ts`: added `openaiApiKey()`
- `lib/building-profiles.ts`: new — `BuildingProfile`, `DetectedUpgrade` types, `upsertBuildingProfile`, `getBuildingProfile`
- `lib/predictions.ts`: new — `Prediction`, `Recommendation` types, `upsertPrediction`, `getPrediction`
- `lib/scoring.ts`: new — `computeRetrofitScore(profile): Omit<Prediction, 'permitId' | 'generatedAt'>`
- `lib/scoring.test.ts`: new — 24 tests, all passing

`lib/retrofit.ts` still exists (fake data generator, to be deleted in Task 8).

## SDD Workflow to Follow
Use `superpowers:subagent-driven-development` skill. The SDD scripts are at:
`/Users/michael.abraham/.claude/plugins/cache/claude-plugins-official/superpowers/284be5905ed5/skills/subagent-driven-development/scripts/`

For each task:
1. Run `scripts/task-brief PLAN_FILE N` to extract the brief (Task 4 brief already extracted to `.git/sdd/task-4-brief.md`)
2. Record current HEAD as BASE before dispatching implementer
3. Dispatch implementer subagent with brief path + report path
4. After implementer reports DONE, run `scripts/review-package BASE HEAD` to get diff file path
5. Dispatch reviewer subagent with brief + report + diff paths
6. If approved, append to `.git/sdd/progress.md` and mark task complete
7. Repeat for Tasks 5–8

After all tasks, dispatch final whole-branch reviewer using:
`scripts/review-package <merge-base> HEAD` where merge-base = `3d482e1` (last commit before this feature work began, i.e. `git merge-base main HEAD` from before these commits — actually use `git merge-base 3d482e1 HEAD`).

## Next Steps
1. Record current HEAD (`7c57dea`) as BASE for Task 4
2. Dispatch Task 4 implementer using brief at `.git/sdd/task-4-brief.md`, report to `.git/sdd/task-4-report.md`
3. After DONE: run `review-package 7c57dea <new-HEAD>`, dispatch reviewer
4. Continue through Tasks 5–8
5. After Task 8: dispatch final whole-branch reviewer, then invoke `superpowers:finishing-a-development-branch`
