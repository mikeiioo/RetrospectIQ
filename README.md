This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## RetrospectIQ Local Setup

RetrospectIQ is a Next.js and TypeScript prototype that uploads building permit PDFs to AWS S3, stores permit metadata in MongoDB, extracts PDF text, runs OpenAI-assisted building profile extraction, and displays rule-based retrofit recommendations on a permit dashboard.

To run the app locally:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), then use the landing page CTAs to upload a permit or view existing permits.

## Environment Variables

Create a local `.env.local` file with the server-side credentials below. Do not commit this file.

```bash
MONGODB_URI=
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET_NAME=
OPENAI_API_KEY=
```

`MONGODB_URI` should point to the MongoDB database used by the app. The AWS variables should allow PDF upload and download for the configured S3 bucket. `OPENAI_API_KEY` is used only by server-side analysis code.

## OpenAI API Configuration

The Phase 7 analysis route uses the OpenAI API to convert extracted permit text into a structured building profile. Configure `OPENAI_API_KEY` in `.env.local` before running AI analysis from a permit dashboard.

The app instructs the model to avoid hallucinating and to return `null` for unknown fields. The resulting profile is saved in MongoDB and then passed into the prototype TypeScript scoring logic.

## Seed Instructions

Run the deterministic demo seed whenever you want to refresh the portfolio data:

```bash
npm run seed
```

The seed process is safe to re-run. It removes and recreates the same fixed demo records, so it does not duplicate data. Seeded records include Atlanta-area buildings, scored permits, building profiles, retrofit recommendations, and one scanned PDF example.

## Demo Walkthrough

1. Visit `/` to see the RetrospectIQ landing page.
2. Open `/permits` to review seeded demo permits.
3. Open a permit dashboard to see building profile data, retrofit impact score, savings estimates, detected upgrades, and recommendations.
4. Visit `/upload` to upload a text-based PDF permit.
5. Open the uploaded permit dashboard and click `Run AI Retrofit Analysis` to exercise the S3 download, PDF extraction, OpenAI analysis, MongoDB persistence, scoring, and dashboard refresh workflow.

## Development Commands

```bash
npm run dev
npm run lint
npm run build
npm run seed
npm test
```
