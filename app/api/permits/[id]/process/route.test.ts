import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const m = vi.hoisted(() => ({
  requireApiUser: vi.fn(),
  getPermit: vi.fn(),
  updatePermit: vi.fn(),
  consumeRateLimit: vi.fn(),
  extractPermitText: vi.fn(),
  analyzePermit: vi.fn(),
  getBuildingProfile: vi.fn(),
  upsertPrediction: vi.fn(),
}))

vi.mock('@/lib/session', () => ({ requireApiUser: m.requireApiUser }))
vi.mock('@/lib/permits', () => ({ getPermit: m.getPermit, updatePermit: m.updatePermit }))
vi.mock('@/lib/rate-limit', () => ({
  consumeRateLimit: m.consumeRateLimit,
  rateLimitResponse: () => Response.json({ error: 'rate limited' }, { status: 429 }),
  limits: { analysis: { limit: 30, windowMs: 3_600_000 }, upload: { limit: 20, windowMs: 3_600_000 } },
}))
vi.mock('@/lib/extraction', () => ({ extractPermitText: m.extractPermitText }))
vi.mock('@/lib/analysis', () => ({ analyzePermit: m.analyzePermit }))
vi.mock('@/lib/building-profiles', () => ({ getBuildingProfile: m.getBuildingProfile }))
vi.mock('@/lib/predictions', () => ({ upsertPrediction: m.upsertPrediction }))

import { POST } from './route'

const user = { id: 'user-a', name: 'A', email: 'a@example.com' }

function call(id = 'permit-1') {
  return POST(new NextRequest(`http://localhost/api/permits/${id}/process`, { method: 'POST' }), {
    params: Promise.resolve({ id }),
  })
}

const profile = {
  permitId: 'permit-1',
  buildingYear: 1975,
  buildingType: 'Office',
  squareFootage: 20000,
  hvacSystem: 'RTU',
  lightingType: 'Fluorescent',
  electricalService: null,
  detectedUpgrades: [],
  confidenceScores: {},
  extractedAt: new Date(),
}

beforeEach(() => {
  vi.clearAllMocks()
  m.requireApiUser.mockResolvedValue({ user })
  m.consumeRateLimit.mockResolvedValue({ ok: true, retryAfterSeconds: 0 })
  m.analyzePermit.mockResolvedValue({ outcome: 'completed' })
  m.getBuildingProfile.mockResolvedValue(profile)
})

describe('POST /api/permits/[id]/process', () => {
  it('rejects signed-out requests before touching data', async () => {
    m.requireApiUser.mockResolvedValue({ response: Response.json({ error: 'Unauthorized' }, { status: 401 }) })
    const res = await call()
    expect(res.status).toBe(401)
    expect(m.getPermit).not.toHaveBeenCalled()
  })

  it("returns 404 for another user's permit and does no work", async () => {
    m.getPermit.mockResolvedValue(null)
    const res = await call()
    expect(res.status).toBe(404)
    expect(m.getPermit).toHaveBeenCalledWith('permit-1', 'user-a')
    expect(m.extractPermitText).not.toHaveBeenCalled()
    expect(m.analyzePermit).not.toHaveBeenCalled()
    expect(m.consumeRateLimit).not.toHaveBeenCalled()
  })

  it('returns 429 when the analysis rate limit is reached', async () => {
    m.getPermit.mockResolvedValue({ id: 'permit-1', status: 'uploaded' })
    m.consumeRateLimit.mockResolvedValue({ ok: false, retryAfterSeconds: 60 })
    const res = await call()
    expect(res.status).toBe(429)
    expect(m.consumeRateLimit).toHaveBeenCalledWith('analysis:user-a', 30, 3_600_000)
    expect(m.extractPermitText).not.toHaveBeenCalled()
  })

  it('reuses already-extracted text on re-runs', async () => {
    m.getPermit.mockResolvedValue({
      id: 'permit-1',
      status: 'scored',
      rawText: 'permit text',
      textExtraction: { status: 'completed' },
    })
    const res = await call()
    expect(await res.json()).toEqual({ status: 'scored' })
    expect(m.extractPermitText).not.toHaveBeenCalled()
    expect(m.analyzePermit).toHaveBeenCalledWith('permit-1')
  })

  it('extracts, analyzes, scores, and saves a new permit', async () => {
    m.getPermit.mockResolvedValue({ id: 'permit-1', status: 'uploaded' })
    m.extractPermitText.mockResolvedValue({ outcome: 'completed' })
    const res = await call()

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: 'scored' })
    expect(m.extractPermitText).toHaveBeenCalledWith('permit-1')
    expect(m.upsertPrediction).toHaveBeenCalledWith(
      expect.objectContaining({ permitId: 'permit-1', modelType: 'prototype_rule_based' }),
    )
    expect(m.updatePermit).toHaveBeenCalledWith('permit-1', { status: 'scored' })
  })

  it('stops at scanned PDFs without calling OpenAI', async () => {
    m.getPermit.mockResolvedValue({ id: 'permit-1', status: 'uploaded' })
    m.extractPermitText.mockResolvedValue({ outcome: 'scanned_pdf' })
    const res = await call()
    expect(await res.json()).toEqual({ status: 'scanned_pdf' })
    expect(m.analyzePermit).not.toHaveBeenCalled()
  })

  it('reports extraction failures as 500', async () => {
    m.getPermit.mockResolvedValue({ id: 'permit-1', status: 'uploaded' })
    m.extractPermitText.mockResolvedValue({ outcome: 'failed', error: 'S3 unavailable' })
    const res = await call()
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ status: 'failed', error: 'S3 unavailable' })
  })
})
