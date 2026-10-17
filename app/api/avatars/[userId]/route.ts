import { GetObjectCommand, NoSuchKey } from "@aws-sdk/client-s3";
import { avatarKey } from "@/lib/avatars";
import { getS3Bucket, getS3Client } from "@/lib/s3";
import { requireApiUser } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { user, response } = await requireApiUser();
  if (response) return response;

  // Without teams, the only avatar a user ever needs to load is their own.
  const { userId } = await params;
  if (userId !== user.id) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const object = await getS3Client().send(
      new GetObjectCommand({ Bucket: getS3Bucket(), Key: avatarKey(userId) }),
    );
    if (!object.Body) return new Response("Not found", { status: 404 });

    return new Response(object.Body.transformToWebStream(), {
      headers: {
        "Content-Type": object.ContentType ?? "application/octet-stream",
        // URLs are versioned (?v=) on every upload, so they can be cached long-term.
        "Cache-Control": "private, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    if (err instanceof NoSuchKey) return new Response("Not found", { status: 404 });
    throw err;
  }
}
