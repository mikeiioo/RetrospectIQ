import { headers } from "next/headers";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/lib/auth";
import { AVATAR_MAX_BYTES, avatarKey, detectImageType } from "@/lib/avatars";
import { consumeRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getS3Bucket, getS3Client } from "@/lib/s3";
import { requireApiUser } from "@/lib/session";

const HOUR = 60 * 60 * 1000;

export async function POST(request: Request) {
  const { user, response } = await requireApiUser();
  if (response) return response;

  const rate = await consumeRateLimit(`avatar:${user.id}`, 20, HOUR);
  if (!rate.ok) return rateLimitResponse(rate);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Missing image" }, { status: 400 });
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return Response.json({ error: "Image must be 2 MB or smaller" }, { status: 413 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const contentType = detectImageType(bytes);
  if (!contentType) {
    return Response.json({ error: "Use a PNG, JPEG, or WebP image" }, { status: 400 });
  }

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: getS3Bucket(),
      Key: avatarKey(user.id),
      Body: bytes,
      ContentType: contentType,
    }),
  );

  // Version the URL so browsers fetch the new image instead of a cached one.
  const image = `/api/avatars/${user.id}?v=${Date.now()}`;
  await auth.api.updateUser({ body: { image }, headers: await headers() });

  return Response.json({ image });
}

export async function DELETE() {
  const { user, response } = await requireApiUser();
  if (response) return response;

  await getS3Client().send(
    new DeleteObjectCommand({ Bucket: getS3Bucket(), Key: avatarKey(user.id) }),
  );
  await auth.api.updateUser({ body: { image: null }, headers: await headers() });

  return Response.json({ image: null });
}
