# RetrospectIQ Phase 6–8

## Product Vision

RetrospectIQ transforms historical building permits into retrofit intelligence.

Today, cities and building owners sit on decades of permit records that contain valuable information about building systems, renovations, upgrades, HVAC equipment, lighting systems, electrical infrastructure, and modernization history.

The problem is that this information is locked away inside PDF documents.

RetrospectIQ extracts that information and converts it into actionable sustainability insights.

The long-term user journey is:

Upload Permit PDF

↓

Extract Permit Data

↓

Analyze Building Systems

↓

Estimate Retrofit Opportunity

↓

Recommend Modernization Actions

↓

Prioritize Buildings for Net-Zero Goals

---

# Current State

Phases 2–5 are complete.

Current flow:

Landing Page

↓

Upload Permit

↓

Store PDF in AWS S3

↓

Store Permit Metadata in MongoDB

↓

Permit List

↓

Permit Dashboard

The dashboard currently shows placeholder retrofit intelligence.

The application does NOT yet understand the permit contents.

---

# Goal of Phase 6

## PDF Text Extraction

The goal of Phase 6 is to teach RetrospectIQ how to read permit PDFs.

Current state:

PDF stored in S3

↓

No understanding of contents

Target state:

PDF stored in S3

↓

Text extracted

↓

Raw text stored in MongoDB

---

## Required Capability

Create extraction pipeline:

Permit PDF

↓

Download from S3

↓

Extract text using pdf-parse

↓

Store extracted text

---

## New Route

POST

/app/api/permits/[id]/extract

---

## Permit Updates

Permit document should gain:

```ts
{
  rawText: string,
  textExtraction: {
    status: "completed" | "failed" | "scanned_pdf",
    characterCount: number,
    extractedAt: Date,
    error?: string
  }
}
```

Limit stored text to:

```text
100,000 characters
```

If no meaningful text is found:

```text
status = scanned_pdf
```

---

# Goal of Phase 7

## OpenAI Building Profile Extraction

Phase 6 gives us text.

Phase 7 gives us understanding.

Convert permit text into structured building intelligence.

Example:

Input:

```text
Building Area: 42,000 sq ft

Lighting:
Fluorescent Fixtures

HVAC:
Rooftop Package Units

Built:
1978
```

Output:

```json
{
  "buildingYear": 1978,
  "buildingType": "Office",
  "squareFootage": 42000,
  "hvacSystem": "Rooftop Package Unit",
  "lightingType": "Fluorescent"
}
```

---

## New Route

POST

/app/api/permits/[id]/analyze

---

## OpenAI Requirements

Use official OpenAI SDK.

Use environment variable:

```env
OPENAI_API_KEY=
```

The model should:

* Extract only facts present in permit
* Use null for unknown values
* Avoid hallucination
* Detect modernization history
* Detect recent upgrades

---

## Building Profile Collection

Create:

```text
building_profiles
```

Document:

```ts
{
  permitId: string,

  buildingYear: number | null,

  buildingType: string | null,

  squareFootage: number | null,

  hvacSystem: string | null,

  lightingType: string | null,

  electricalService: string | null,

  detectedUpgrades: [],

  confidenceScores: {},

  extractedAt: Date
}
```

---

# Goal of Phase 8

## Prototype Retrofit Intelligence Engine

The question we are answering:

"How much retrofit opportunity remains in this building?"

---

## Important Principle

Old buildings are not automatically bad.

Example:

Built 1975

BUT

HVAC replaced in 2022

LED conversion completed in 2021

Building Automation System installed in 2023

Result:

Low retrofit opportunity

---

Example:

Built 1980

Fluorescent lighting

Original RTU system

No controls

Result:

High retrofit opportunity

---

## Scoring Inputs

Use:

* buildingYear
* buildingType
* squareFootage
* hvacSystem
* lightingType
* electricalService
* detectedUpgrades

---

## Retrofit Impact Score

Range:

```text
0–100
```

Meaning:

```text
0–30
Low Opportunity

31–60
Moderate Opportunity

61–80
High Opportunity

81–100
Critical Opportunity
```

---

## Outputs

Generate:

```ts
{
  retrofitImpactScore,

  priority,

  estimatedEnergyReductionPercent,

  estimatedAnnualSavings,

  estimatedCarbonReductionTons,

  recommendations
}
```

---

## Recommendation Examples

Lighting:

```text
LED Lighting Conversion
```

HVAC:

```text
High-Efficiency HVAC Upgrade
```

Controls:

```text
Smart Occupancy Controls
```

Automation:

```text
Building Automation System
```

Unknown systems:

```text
Professional Energy Audit
```

---

## New Collection

```text
predictions
```

Document:

```ts
{
  permitId,

  retrofitImpactScore,

  priority,

  estimatedEnergyReductionPercent,

  estimatedAnnualSavings,

  estimatedCarbonReductionTons,

  recommendations,

  modelType: "prototype_rule_based",

  generatedAt
}
```

---

# Processing Pipeline

Create:

POST

/app/api/permits/[id]/process

This route should execute:

Extract

↓

Analyze

↓

Score

---

# Dashboard Updates

Current dashboard:

Permit Metadata

↓

Placeholder Metrics

New dashboard:

Permit Metadata

↓

Extraction Status

↓

AI Building Profile

↓

Retrofit Impact Score

↓

Recommendations

↓

Estimated Savings

↓

Estimated Carbon Reduction

---

## New Dashboard Action

Button:

```text
Run AI Retrofit Analysis
```

Behavior:

```text
POST /api/permits/[id]/process
```

After completion:

Refresh dashboard

Display extracted results

---

# UI Requirements

Add status badges:

```text
Uploaded

Text Extracted

AI Analyzed

Scored
```

Add disclaimer:

```text
Prototype estimate generated from permit text.

Not a certified energy audit.
```

---

# Do Not Build Yet

Do NOT implement:

* FastAPI
* Synthetic ML training
* Authentication
* User accounts
* PDF report export
* OCR for scanned permits
* Vector search

Those belong to later phases.

---

# Success Criteria

A user can:

Upload Permit

↓

Open Dashboard

↓

Click Run AI Retrofit Analysis

↓

Permit Text Extracted

↓

Building Profile Generated

↓

Retrofit Score Generated

↓

Recommendations Displayed

↓

Savings & Carbon Reduction Displayed

At that point RetrospectIQ becomes a true retrofit intelligence platform rather than a permit storage application.
