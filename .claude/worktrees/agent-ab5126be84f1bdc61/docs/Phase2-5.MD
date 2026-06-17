# RetrospectIQ MVP Roadmap

You are implementing the first functional version of RetrospectIQ.

The MVP is divided into phases.

---

PHASE 2: Infrastructure Layer

Goal:
Create reusable connections to AWS S3 and MongoDB.

Deliverables:

- lib/mongodb.ts
- lib/s3.ts

Success Criteria:

- Application can connect to MongoDB Atlas.
- Application can connect to AWS S3.
- Environment variables are validated.
- Connections are reusable.

---

PHASE 3: Upload Pipeline

Goal:
Allow users to upload permit PDFs.

Deliverables:

- Upload page
- Upload API route

Flow:

User uploads PDF
↓
PDF stored in S3
↓
Permit metadata stored in MongoDB

Success Criteria:

- PDF appears in S3 bucket.
- MongoDB permit record is created.
- User is redirected to dashboard.

---

PHASE 4: Permit Management

Goal:
Allow viewing uploaded permits.

Deliverables:

- Permit list page
- Permit dashboard page

Success Criteria:

- User can view all permits.
- User can open a permit dashboard.
- Permit information loads from MongoDB.

Dashboard should show placeholder retrofit intelligence:

- Retrofit Impact Score
- Estimated Energy Reduction
- Estimated Savings
- Carbon Reduction
- Recommended Upgrades

No AI or ML yet.

---

PHASE 5: Product Experience

Goal:
Create a complete user journey.

Deliverables:

- Landing page
- Navigation
- Upload page
- Permit history page
- Dashboard page

Success Criteria:

A user can:

Landing Page
↓
Upload Permit
↓
Store Permit
↓
View Dashboard

without touching code.

This should feel like a complete product demo.