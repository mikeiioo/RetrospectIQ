import { beforeEach, describe, expect, it, vi } from 'vitest'

const m = vi.hoisted(() => ({
  requireApiUser: vi.fn(),
  consumeRateLimit: vi.fn(),
  createPermit: vi.fn(),
  send: vi.fn(),
}))

vi.mock('@/lib/session', () => ({ requireApiUser: m.requireApiUser }))
vi.mock('@/lib/rate-limit', () => ({
  consumeRateLimit: m.consumeRateLimit,
  rateLimitResponse: () => Response.json({ error: 'rate limited' }, { status: 429 }),
  limits: { analysis: { limit: 30, windowMs: 3_600_000 }, upload: { limit: 20, windowMs: 3_600_000 } },
}))
vi.mock('@/lib/permits', () => ({ createPermit: m.createPermit }))
vi.mock('@/lib/s3', () => ({ getS3Client: () => ({ send: m.send }), getS3Bucket: () => 'test-bucket' }))

import { POST } from './route'

const user = { id: 'user-a', name: 'A', email: 'a@example.com' }

function upload(content: string, fields: Record<string, string> = {}) {
  const form = new FormData()
  form.set('file', new File([content], 'permit.pdf', { type: 'application/pdf' }))
  form.set('buildingName', fields.buildingName ?? 'Tower')
  form.set('address', fields.address ?? '1 Main St')
  return POST(new Request('http://localhost/api/upload', { method: 'POST', body: form }))
}

beforeEach(() => {
  vi.clearAllMocks()
  m.requireApiUser.mockResolvedValue({ user })
  m.consumeRateLimit.mockResolvedValue({ ok: true, retryAfterSeconds: 0 })
  m.createPermit.mockResolvedValue('new-permit-id')
})

describe('POST /api/upload', () => {
  it('rejects signed-out uploads', async () => {
    m.requireApiUser.mockResolvedValue({ response: Response.json({ error: 'Unauthorized' }, { status: 401 }) })
    const res = await upload('%PDF-1.7')
    expect(res.status).toBe(401)
    expect(m.send).not.toHaveBeenCalled()
  })

  it('returns 429 once the upload limit is reached', async () => {
    m.consumeRateLimit.mockResolvedValue({ ok: false, retryAfterSeconds: 60 })
    const res = await upload('%PDF-1.7')
    expect(res.status).toBe(429)
    expect(m.consumeRateLimit).toHaveBeenCalledWith('upload:user-a', 20, 3_600_000)
    expect(m.send).not.toHaveBeenCalled()
  })

  it('rejects a non-PDF file that claims to be a PDF', async () => {
    const res = await upload('<html>definitely not a pdf</html>')
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'File is not a valid PDF' })
    expect(m.send).not.toHaveBeenCalled()
    expect(m.createPermit).not.toHaveBeenCalled()
  })

  it('requires building name and address', async () => {
    const res = await upload('%PDF-1.7', { buildingName: '   ' })
    expect(res.status).toBe(400)
    expect(m.send).not.toHaveBeenCalled()
  })

  it('stores a valid PDF and records the uploader as owner', async () => {
    const res = await upload('%PDF-1.7\nreal content', { buildingName: '  Tower  ' })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ id: 'new-permit-id' })
    expect(m.send).toHaveBeenCalledTimes(1)
    expect(m.createPermit).toHaveBeenCalledWith(
      expect.objectContaining({ ownerId: 'user-a', buildingName: 'Tower', contentType: 'application/pdf' }),
    )
  })
})
