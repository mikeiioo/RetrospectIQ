# RetrospectIQ Phases 6–8 Design

## Overview

Phases 6–8 transform RetrospectIQ from a permit storage app into a real retrofit intelligence platform. A user uploads a permit PDF, clicks "Run AI Retrofit Analysis," and receives a structured building profile, a retrofit impact score, and prioritized recommendations — all derived from the permit's actual text.

---

## Approach

- **Trigger**: Client Component button calls `POST /api/permits/[id]/process` via `fetch`
- **Dashboard**: Remains a Server Component; refreshes via `router.refresh()` after successful analysis
- **Pipeline**: extract → analyze → score, all orchestrated by `/process`
- **Re-runnable**: Every run overwrites previous results; all timestamps update

---

## Data Layer

### Permit document extensions

Added to the existing `permits` collection document:

```ts
rawText?: string                  // extracted text, capped at 100,000 chars
textExtraction?: {
  status: "completed" | "failed" | "scanned_pdf"
  characterCount: number
  extractedAt: Date
  error?: string
}
```

`PermitStatus` expands to:

```ts
type PermitStatus =
  | "uploaded"
  | "text_extracted"
  | "scanned_pdf"
  | "analyzed"
  | "scored"
```

The `status` field always reflects the highest pipeline stage successfully reached. If extraction finds a scanned PDF, status becomes `"scanned_pdf"` and processing halts.

### `building_profiles` collection

One document per permit. Overwritten on every run.

```ts
{
  permitId: string
  buildingYear: number | null
  buildingType: string | null
  squareFootage: number | null
  hvacSystem: string | null
  lightingType: string | null
  electricalService: string | null
  detectedUpgrades: {
    type: "HVAC" | "Lighting" | "Electrical" | "Envelope" | "Controls" | "Other"
    description: string
    year: number | null
  }[]
  confidenceScores: Record<string, number>
  extractedAt: Date
}
```

### `predictions` collection

One document per permit. Overwritten on every run.

```ts
{
  permitId: string
  retrofitImpactScore: number           // 0–100
  priority: "Low" | "Moderate" | "High" | "Critical"
  estimatedEnergyReductionPercent: number
  estimatedAnnualSavings: number
  estimatedCarbonReductionTons: number
  recommendations: {
    name: string
    category: "Lighting" | "HVAC" | "Controls" | "Automation" | "Audit"
    priority: "Low" | "Medium" | "High"
    reason: string
  }[]
  modelType: "prototype_rule_based"
  generatedAt: Date
}
```

---

## API Routes

Three route files. The extract and analyze routes are independently callable per the spec. The button only ever calls `/process`.

### `POST /api/permits/[id]/extract`

1. Load permit from MongoDB
2. Download PDF bytes from S3 via `GetObjectCommand`
3. Run `pdf-parse` on the buffer
4. If stripped character count < 100 → return `{ outcome: "scanned_pdf" }`, store `textExtraction` with `status: "scanned_pdf"`, set `permit.status = "scanned_pdf"`
5. Otherwise store `rawText` (truncated to 100k), store `textExtraction` with `status: "completed"`, set `permit.status = "text_extracted"`
6. Returns typed result: `{ outcome: "completed" | "scanned_pdf" | "failed"; error?: string }`

Throws only for unexpected server errors (S3 unreachable, MongoDB write failure, etc.).

### `POST /api/permits/[id]/analyze`

1. Load permit, verify `textExtraction.status === "completed"`; return `{ outcome: "skipped" }` if not
2. Call OpenAI `gpt-4o-mini` with a structured JSON prompt against `rawText`
3. Prompt instructs: extract only facts present in the text, `null` for unknowns, detect upgrades with year where stated
4. Upsert result into `building_profiles` (overwrite on re-run using `permitId` as key)
5. Set `permit.status = "analyzed"`
6. Returns typed result: `{ outcome: "completed" | "skipped" | "failed"; error?: string }`

### `POST /api/permits/[id]/process`

Orchestrator. Runs all three stages in sequence.

1. Run extraction logic
2. If `outcome === "scanned_pdf"` → return `{ status: "scanned_pdf" }` immediately
3. Run analysis logic
4. Run scoring logic (pure computation — no separate route)
5. Upsert into `predictions`, set `permit.status = "scored"`, stamp `generatedAt`
6. Returns `{ status: "scored" }` on success, `{ status: "failed"; error: string }` on error

**Idempotent**: every invocation overwrites previous `building_profiles` and `predictions` records for the same `permitId`.

---

## Library Modules

Logic lives in `lib/`, routes are thin wrappers.

| File | Responsibility |
|---|---|
| `lib/extraction.ts` | Download from S3, run pdf-parse, store rawText + textExtraction |
| `lib/analysis.ts` | Call OpenAI, parse response, upsert building profile |
| `lib/scoring.ts` | Rule-based scoring, generate prediction document |
| `lib/building-profiles.ts` | MongoDB CRUD for `building_profiles` |
| `lib/predictions.ts` | MongoDB CRUD for `predictions` |

`lib/env.ts` gains `openaiApiKey()`.

---

## Scoring Algorithm

Pure function: `BuildingProfile → Prediction`. No external calls.

### Base score from building age

| Year built | Base score |
|---|---|
| ≥ 2015 | 10 |
| 2000–2014 | 25 |
| 1985–1999 | 40 |
| 1970–1984 | 55 |
| < 1970 | 65 |
| Unknown | 40 |

### HVAC adjustment

- Old RTU / packaged unit: **+15**
- Boiler / vintage chiller: **+10**
- Heat pump / VRF / mini-split: **−10**
- Unknown: **0**

### Controls penalty (applied independently)

Apply **+10** only if controls are explicitly absent or no Controls/Automation upgrade is detected in `detectedUpgrades`. Do not apply if HVAC system is simply old and controls are unknown — avoids double-penalizing.

### Lighting adjustment

- Fluorescent / incandescent / HID: **+10**
- LED: **−15**
- Unknown: **0**

### Recent upgrade reduction

For each `detectedUpgrade` where `year >= 2015`: **−8 points**, capped at **−30** total. Upgrades with `year: null` receive no reduction (recency unverifiable).

### Final score

Clamped to **0–100**.

| Score | Priority |
|---|---|
| 0–30 | Low |
| 31–60 | Moderate |
| 61–80 | High |
| 81–100 | Critical |

### Estimated outputs (prototype)

All labeled as prototype estimates — not certified energy audits.

- **Energy reduction %**: `score × 0.4` (e.g. score 75 → 30%)
- **Annual savings**: `squareFootage × 1.20 × (score / 100)` — falls back to `score × 400` if sqft unknown
- **Carbon reduction (tons/yr)**: `annualSavings / 180`

### Recommendations

Generated from profile gaps:

| Condition | Recommendation | Category | Priority |
|---|---|---|---|
| Lighting is fluorescent/incandescent/HID | LED Lighting Conversion | Lighting | High |
| HVAC is old RTU/boiler | High-Efficiency HVAC Upgrade | HVAC | High |
| No Controls upgrade detected | Smart Occupancy Controls | Controls | Medium |
| No Automation upgrade detected | Building Automation System | Automation | Medium |
| Multiple null fields | Professional Energy Audit | Audit | High |

---

## Dashboard UI

The page stays a Server Component. It fetches permit + building profile + prediction in parallel at render time.

### Status badges (always visible)

Displayed as a horizontal badge row at top of dashboard:

| Permit status | Badges shown |
|---|---|
| `uploaded` | Uploaded |
| `scanned_pdf` | Uploaded · Scanned PDF (yellow) |
| `text_extracted` | Uploaded · Text Extracted |
| `analyzed` | Uploaded · Text Extracted · AI Analyzed |
| `scored` | Uploaded · Text Extracted · AI Analyzed · Scored |

### Scanned PDF banner

Shown when `status === "scanned_pdf"`:

> "This PDF appears to be scanned or image-based. RetrospectIQ currently supports text-based permits only. OCR support is planned for a future release."

### Analysis button (`components/AnalysisButton.tsx`, `'use client'`)

- No prior run: `[ Run AI Retrofit Analysis ]`
- Prior run exists (`generatedAt` is set): `[ Re-Run Analysis ]` + "Last analyzed: \<timestamp\>"
- During request: button disabled, text "Analyzing…"
- On error: inline error message below button
- On success: `router.refresh()` re-renders server component with fresh data
- Shown even when status is `scanned_pdf` (allows retry)

### Retrofit Intelligence section

**When `status !== "scored"`** — greyed-out with empty values:

```
Impact Score:      —
Energy Reduction:  —
Annual Savings:    —
Carbon Reduction:  —
Recommendations:   Not available until analysis runs
```

**When `status === "scored"`** — full results:

- Impact score card, energy reduction, estimated savings†, carbon reduction†
- AI Building Profile: year, type, sqft, HVAC, lighting, electrical
- Detected upgrades: type + description + year
- Recommendations: name, category, priority, reason
- †  *"Prototype estimate generated from permit text. Not a certified energy audit."*

---

## New packages

```
pdf-parse
@types/pdf-parse
openai
```

---

## Files created / modified

**New:**
- `lib/extraction.ts`
- `lib/analysis.ts`
- `lib/scoring.ts`
- `lib/building-profiles.ts`
- `lib/predictions.ts`
- `app/api/permits/[id]/extract/route.ts`
- `app/api/permits/[id]/analyze/route.ts`
- `app/api/permits/[id]/process/route.ts`
- `components/AnalysisButton.tsx`

**Modified:**
- `lib/permits.ts` — extend `Permit`, `PermitView`, `PermitStatus`, add `updatePermit`
- `lib/env.ts` — add `openaiApiKey()`
- `app/permits/[id]/dashboard/page.tsx` — fetch real data, new layout
- `lib/retrofit.ts` — deleted (replaced by real scoring)
- `package.json` — add `pdf-parse`, `openai`

---

## Out of scope (future phases)

- OCR for scanned permits
- FastAPI / Python ML pipeline
- Authentication / user accounts
- PDF report export
- Vector search
