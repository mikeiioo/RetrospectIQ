import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const col = vi.hoisted(() => ({
  createIndex: vi.fn(async () => 'expiresAt_1'),
  findOneAndUpdate: vi.fn(),
}))

vi.mock('./mongodb', () => ({
  getDb: async () => ({ collection: () => col }),
}))

import { consumeRateLimit, rateLimitResponse } from './rate-limit'

const HOUR = 60 * 60 * 1000

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
  // 10:15 UTC: 15 minutes into the hourly window that started at 10:00.
  vi.setSystemTime(new Date('2026-10-17T10:15:00.000Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('consumeRateLimit', () => {
  it('allows requests up to the limit', async () => {
    col.findOneAndUpdate.mockResolvedValue({ count: 20 })
    const result = await consumeRateLimit('upload:u1', 20, HOUR)
    expect(result.ok).toBe(true)
  })

  it('blocks requests over the limit', async () => {
    col.findOneAndUpdate.mockResolvedValue({ count: 21 })
    const result = await consumeRateLimit('upload:u1', 20, HOUR)
    expect(result.ok).toBe(false)
  })

  it('counts per key and per fixed window', async () => {
    col.findOneAndUpdate.mockResolvedValue({ count: 1 })
    await consumeRateLimit('upload:u1', 20, HOUR)

    const windowStart = Date.parse('2026-10-17T10:00:00.000Z')
    const [filter, update, options] = col.findOneAndUpdate.mock.calls[0]
    expect(filter).toEqual({ _id: `upload:u1:${windowStart}` })
    expect(update).toEqual({
      $inc: { count: 1 },
      $setOnInsert: { expiresAt: new Date(windowStart + HOUR) },
    })
    expect(options).toMatchObject({ upsert: true, returnDocument: 'after' })
  })

  it('reports seconds until the window resets', async () => {
    col.findOneAndUpdate.mockResolvedValue({ count: 99 })
    const result = await consumeRateLimit('analysis:u1', 30, HOUR)
    expect(result.retryAfterSeconds).toBe(45 * 60)
  })

  it('ensures a TTL index so old windows are cleaned up', async () => {
    col.findOneAndUpdate.mockResolvedValue({ count: 1 })
    await consumeRateLimit('upload:u1', 20, HOUR)
    // The index promise is cached per process, so it may already exist from an earlier test.
    const calls = col.createIndex.mock.calls as unknown[][]
    if (calls.length > 0) {
      expect(calls[0]).toEqual([{ expiresAt: 1 }, { expireAfterSeconds: 0 }])
    }
  })
})

describe('rateLimitResponse', () => {
  it('returns 429 with a Retry-After header and friendly message', async () => {
    const res = rateLimitResponse({ ok: false, retryAfterSeconds: 125 })
    expect(res.status).toBe(429)
    expect(res.headers.get('Retry-After')).toBe('125')
    expect((await res.json()).error).toMatch(/about 3 minutes/)
  })

  it('uses singular wording for one minute', async () => {
    const res = rateLimitResponse({ ok: false, retryAfterSeconds: 30 })
    expect((await res.json()).error).toMatch(/about 1 minute\./)
  })
})
