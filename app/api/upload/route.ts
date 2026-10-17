import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { createPermit } from "@/lib/permits";
import { consumeRateLimit, limits, rateLimitResponse } from "@/lib/rate-limit";
import { getS3Bucket, getS3Client } from "@/lib/s3";
import { requireApiUser } from "@/lib/session";

const MAX_BYTES = 25 * 1024 * 1024;

export async function POST(request: Request) {
  const { user, response } = await requireApiUser();
  if (response) return response;

  const rate = await consumeRateLimit(
    `upload:${user.id}`,
    limits.upload.limit,
    limits.upload.windowMs,
  );
  if (!rate.ok) return rateLimitResponse(rate);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = form.get("file");
  const buildingName = form.get("buildingName");
  const address = form.get("address");

  if (!(file instanceof File)) {
    return Response.json({ error: "Missing file" }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return Response.json({ error: "Only PDF files are accepted" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json(
      { error: `File exceeds the ${MAX_BYTES / 1024 / 1024} MB limit` },
      { status: 413 },
    );
  }
  if (typeof buildingName !== "string" || !buildingName.trim()) {
    return Response.json({ error: "Building name is required" }, { status: 400 });
  }
  if (typeof address !== "string" || !address.trim()) {
    return Response.json({ error: "Address is required" }, { status: 400 });
  }

  const s3Key = `permits/${randomUUID()}.pdf`;
  const bytes = Buffer.from(await file.arrayBuffer());

  // The browser-reported MIME type is client-controlled; confirm the PDF signature.
  if (bytes.subarray(0, 5).toString("latin1") !== "%PDF-") {
    return Response.json({ error: "File is not a valid PDF" }, { status: 400 });
  }

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: getS3Bucket(),
      Key: s3Key,
      Body: bytes,
      ContentType: file.type,
    }),
  );

  const id = await createPermit({
    ownerId: user.id,
    buildingName: buildingName.trim(),
    address: address.trim(),
    s3Key,
    originalFilename: file.name,
    sizeBytes: file.size,
    contentType: file.type,
  });

  return Response.json({ id });
}
