# RetrospectIQ Phase 2-5 Audit Summary

Date: June 16, 2026

This document summarizes the review of the RetrospectIQ Next.js + TypeScript MVP after implementation of Phases 2-5. The review focused on testing, auditing, and fixing only what was necessary to satisfy the stated phase requirements.

No OpenAI, ML, FastAPI, PDF parsing, or authentication work was added.

## Overall Status

Phases 2-5 are passing after small fixes to the landing page copy and permit dashboard metadata display.

The core flow was tested end to end:

1. Landing page loads.
2. User can navigate to `/upload`.
3. A small PDF can be submitted to `POST /api/upload`.
4. The API uploads the PDF to S3 under `permits/`.
5. The API creates a MongoDB permit record.
6. `/permits` lists the uploaded permit.
7. `/permits/[id]/dashboard` loads the permit and shows placeholder retrofit intelligence.

Test upload result:

- Permit id: `6a31d9677eabc3b432620c56`
- S3 key: `permits/8256eecb-65e6-45bd-8c99-bfb271de1090.pdf`
- Original filename: `retrospectiq-upload-test.pdf`

## Phase Status Summary

| Phase | Goal | Status | Summary |
| --- | --- | --- | --- |
| Phase 2 | Infrastructure Layer | Pass | MongoDB and S3 helper files exist, required dependencies are installed, and server-side env validation is present. |
| Phase 3 | Upload Pipeline | Pass | Upload page and API route exist. PDF upload, validation, S3 storage, and MongoDB metadata creation were verified. |
| Phase 4 | Permit Management | Pass | Permit list and dashboard exist. Dashboard loads by ObjectId, returns 404 for invalid or missing permits, and shows permit data plus placeholder retrofit intelligence. |
| Phase 5 | Product Experience | Pass | Landing page, navigation, upload page, permit history, and dashboard form a complete product demo flow. |

## Phase 2: Infrastructure Layer

Status: Pass

Required files:

- `lib/mongodb.ts`: present.
- `lib/s3.ts`: present.
- `lib/env.ts`: present and validates required environment variables server-side.

Dependencies verified in `package.json`:

- `mongodb`
- `@aws-sdk/client-s3`

Environment handling:

- `.env.local` exists locally but is ignored by `.gitignore`.
- `.env.local` is not tracked by git.
- No `NEXT_PUBLIC_*` secret references were found.
- Live environment access was verified indirectly through the successful upload flow.

How Phase 2 is doing:

The infrastructure layer is in good shape for the MVP. MongoDB and S3 clients are centralized and reusable. The main remaining concern is operational: missing or incorrect `.env.local` values will still break runtime upload/list/dashboard behavior, which is expected for this phase.

## Phase 3: Upload Pipeline

Status: Pass

Required files and routes:

- `app/upload/page.tsx`: present.
- `app/api/upload/route.ts`: present.

Upload form fields verified:

- `buildingName`
- `address`
- PDF file input

API validation verified:

- Missing file returns `400`.
- Non-PDF file returns `400`.
- File larger than 25 MB returns `413`.
- Missing `buildingName` returns `400`.
- Missing `address` returns `400`.

Successful upload verified:

- Uploaded a small PDF.
- API returned a permit id.
- Dev server logged `POST /api/upload 200`.
- Dashboard and permit list were able to read the created MongoDB record.

How Phase 3 is doing:

The upload pipeline is working end to end. The validation coverage matches the requested MVP scope. The implementation intentionally does not parse PDFs or run AI/ML.

## Phase 4: Permit Management

Status: Pass

Required routes:

- `app/permits/page.tsx`: present.
- `app/permits/[id]/dashboard/page.tsx`: present.

Permit list verified:

- `/permits` lists the uploaded permit.
- Listed data includes building name, address, upload date, and original filename.
- List item links to `/permits/[id]/dashboard`.

Dashboard verified:

- Loads permit by MongoDB ObjectId.
- Invalid id returns `404`.
- Valid but missing ObjectId returns `404`.
- Shows `buildingName`.
- Shows `address`.
- Shows `originalFilename`.
- Shows `s3Key`.
- Shows `status`.
- Shows placeholder Retrofit Impact Score.
- Shows estimated energy reduction.
- Shows estimated savings.
- Shows carbon reduction.
- Shows recommended upgrades.

How Phase 4 is doing:

Permit management is working and meets the MVP goal. The only issue found was that `s3Key` and `status` were stored but not displayed on the dashboard. That has been fixed.

## Phase 5: Product Experience

Status: Pass

Landing page verified:

- `/` exists.
- Product name appears as `RetrospectIQ`.
- CTA to `/upload` exists.
- CTA to `/permits` exists.
- Page explains the flow: upload -> S3 permit storage -> MongoDB metadata -> retrofit dashboard.

Navigation verified:

- Header links to `/`, `/upload`, and `/permits`.
- Product name in navigation appears as `RetrospectIQ`.

How Phase 5 is doing:

The product demo flow is complete enough for the MVP. The main issue found was product-name casing: the app used `RetrospectiQ` in several places instead of `RetrospectIQ`. That has been fixed.

## Bugs Found

1. Local `node_modules/.bin` launcher files were broken, causing `npm run lint` and `npm run build` to fail before app code ran.
2. macOS quarantine attributes blocked native Next.js/Tailwind compiler packages.
3. Product name was displayed as `RetrospectiQ` instead of `RetrospectIQ`.
4. Landing page did not explicitly mention the upload -> S3 -> MongoDB -> dashboard flow.
5. Dashboard did not visibly display `s3Key` or `status`.

## Bugs Fixed

1. Repaired local package launcher links with `npm rebuild`.
2. Cleared quarantine attributes from installed native packages with `xattr -dr com.apple.quarantine node_modules`.
3. Updated product name to `RetrospectIQ`.
4. Added explicit flow copy to the landing page.
5. Added a permit metadata section to the dashboard showing:
   - Building name
   - Address
   - Original filename
   - S3 key
   - Status

## Files Changed During Audit

- `app/page.tsx`
- `app/layout.tsx`
- `components/Nav.tsx`
- `app/permits/[id]/dashboard/page.tsx`

This summary file was also added:

- `docs/Phase2-5-Audit-Summary.md`

## Verification Commands Run

```bash
npm run lint
npm run build
npm run dev
```

Additional local API checks were run against the dev server:

```bash
curl -sS -X POST \
  -F 'buildingName=Codex Phase 2-5 Test' \
  -F 'address=123 Retrofit Lane, Testville, NY 10001' \
  -F 'file=@/private/tmp/retrospectiq-upload-test.pdf;type=application/pdf' \
  http://127.0.0.1:3000/api/upload

curl -sS -o /dev/null -w '%{http_code}' \
  http://127.0.0.1:3000/permits/not-a-valid-id/dashboard

curl -sS -o /dev/null -w '%{http_code}' \
  http://127.0.0.1:3000/permits/000000000000000000000000/dashboard
```

## Current Known Risks

1. `next build` warns that Next.js inferred the workspace root from a parent `/Users/michaela./package-lock.json`. The build still passes, but this could be cleaned up by removing the parent lockfile if unneeded or setting `turbopack.root`.
2. The audit created a real test S3 object and a real MongoDB permit record.
3. The app depends on valid local environment variables in `.env.local`.
4. There is no automated test suite yet for upload validation, permit listing, or dashboard rendering.
5. No authentication exists, by design for this MVP phase.

## Recommended Local Commands

Use these commands to reproduce the current verified state:

```bash
npm install
npm rebuild
xattr -dr com.apple.quarantine node_modules
npm run lint
npm run build
npm run dev
```

Then open:

- `http://localhost:3000`
- `http://localhost:3000/upload`
- `http://localhost:3000/permits`

