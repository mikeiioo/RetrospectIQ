import { getDb } from "./mongodb";

interface RateLimitDoc {
  _id: string;
  count: number;
  expiresAt: Date;
}

export interface RateLimitResult {
  ok: boolean;
  retryAfterSeconds: number;
}

let indexReady: Promise<string> | undefined;

async function collection() {
  const db = await getDb();
  const col = db.collection<RateLimitDoc>("rate_limits");
  // TTL index cleans up expired windows automatically.
  indexReady ??= col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await indexReady;
  return col;
}

/** Fixed-window counter stored in MongoDB so it holds across serverless instances. */
export async function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const windowEnd = windowStart + windowMs;

  const col = await collection();
  const doc = await col.findOneAndUpdate(
    { _id: `${key}:${windowStart}` },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(windowEnd) } },
    { upsert: true, returnDocument: "after" },
  );

  return {
    ok: (doc?.count ?? 1) <= limit,
    retryAfterSeconds: Math.ceil((windowEnd - now) / 1000),
  };
}

export function rateLimitResponse(result: RateLimitResult): Response {
  const minutes = Math.max(1, Math.ceil(result.retryAfterSeconds / 60));
  return Response.json(
    { error: `Rate limit reached. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.` },
    { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } },
  );
}

const HOUR = 60 * 60 * 1000;

export const limits = {
  upload: { limit: 20, windowMs: HOUR },
  analysis: { limit: 30, windowMs: HOUR },
} as const;
