# RetrospectIQ

RetrospectIQ turns building permit PDFs into retrofit intelligence. Upload a permit, and the app extracts its text, uses OpenAI to build a structured building profile, and applies a rule-based model to produce a retrofit impact score, savings and carbon estimates, and prioritized recommendations.

> Prototype: scores and estimates come from a rule-based model (`lib/scoring.ts`), not a certified energy audit.

## Stack

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- MongoDB for permits, building profiles, and predictions
- AWS S3 for permit PDF storage
- OpenAI (`gpt-4o-mini`) for building profile extraction
- `pdf-parse` for text extraction, Vitest for tests

## How it works

1. **Upload** (`/upload` → `POST /api/upload`): validates the PDF (max 25 MB), stores it in S3 under `permits/`, and creates a permit record.
2. **Process** (`POST /api/permits/[id]/process`), triggered by "Run AI Retrofit Analysis":
   - **Extract** (`lib/extraction.ts`): downloads the PDF and extracts text. Image-only PDFs are marked `scanned_pdf` (OCR is not supported).
   - **Analyze** (`lib/analysis.ts`): sends the text to OpenAI and saves a building profile.
   - **Score** (`lib/scoring.ts`): computes the retrofit score, estimates, and recommendations.

Permit status moves through `uploaded` → `text_extracted` | `scanned_pdf` → `analyzed` → `scored`.

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Portfolio dashboard |
| `/buildings`, `/buildings/[id]` | Building cards and detail |
| `/permits`, `/permits/[id]/dashboard` | Permit inventory and per-permit analysis |
| `/recommendations` | Portfolio-wide recommendation queue |
| `/upload` | Permit intake |

## Local setup

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run seed                 # optional: load the Atlanta demo portfolio
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string, including the database name |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | Credentials with read/write access to the bucket |
| `AWS_S3_BUCKET_NAME` | Bucket for permit PDFs |
| `OPENAI_API_KEY` | Server-side building profile extraction |

`.env.local` is gitignored. Never commit real credentials.

### Seed data

`npm run seed` removes and recreates a fixed set of demo records (Atlanta-area buildings, scored permits, profiles, recommendations, and one scanned PDF example), so it is safe to re-run.

## Commands

```bash
npm run dev     # development server
npm run build   # production build
npm run lint    # ESLint
npm test        # Vitest
npm run seed    # reset demo data
```

## Deployment

Deployed on Vercel. Set the environment variables above in the Vercel project settings.
