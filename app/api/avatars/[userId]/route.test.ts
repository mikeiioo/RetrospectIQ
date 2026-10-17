import { beforeEach, describe, expect, it, vi } from 'vitest'

const m = vi.hoisted(() => ({ requireApiUser: vi.fn(), send: vi.fn() }))

vi.mock('@/lib/session', () => ({ requireApiUser: m.requireApiUser }))
vi.mock('@/lib/s3', () => ({ getS3Client: () => ({ send: m.send }), getS3Bucket: () => 'test-bucket' }))

import { GET } from './route'

function call(userId: string) {
  return GET(new Request(`http://localhost/api/avatars/${userId}`), {
    params: Promise.resolve({ userId }),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  m.requireApiUser.mockResolvedValue({ user: { id: 'user-a', name: 'A', email: 'a@example.com' } })
})

describe('GET /api/avatars/[userId]', () => {
  it('rejects signed-out requests', async () => {
    m.requireApiUser.mockResolvedValue({ response: new Response(null, { status: 401 }) })
    expect((await call('user-a')).status).toBe(401)
    expect(m.send).not.toHaveBeenCalled()
  })

  it("does not serve another user's avatar", async () => {
    const res = await call('user-b')
    expect(res.status).toBe(404)
    expect(m.send).not.toHaveBeenCalled()
  })

  it('serves your own avatar with its stored content type', async () => {
    m.send.mockResolvedValue({
      ContentType: 'image/png',
      Body: { transformToWebStream: () => new Blob([new Uint8Array([1, 2, 3])]).stream() },
    })
    const res = await call('user-a')
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('image/png')
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]))
  })
})
