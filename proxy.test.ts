import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { proxy } from './proxy'

const SESSION_COOKIE = 'better-auth.session_token=some-token'

function request(path: string, cookie?: string) {
  return new NextRequest(new URL(path, 'http://localhost:3000'), {
    headers: cookie ? { cookie } : {},
  })
}

function passesThrough(res: Response) {
  return res.headers.get('x-middleware-next') === '1'
}

describe('proxy', () => {
  it.each(['/', '/learn', '/sign-in', '/sign-up'])('lets signed-out visitors view public page %s', (path) => {
    expect(passesThrough(proxy(request(path)))).toBe(true)
  })

  it('does not treat paths that merely start with "/" as public', () => {
    const res = proxy(request('/buildings'))
    expect(res.status).toBe(307)
  })

  it('redirects signed-out visitors to sign-in and remembers the page', () => {
    const res = proxy(request('/buildings/abc?tab=map'))
    expect(res.status).toBe(307)
    const location = new URL(res.headers.get('location')!)
    expect(location.pathname).toBe('/sign-in')
    expect(location.searchParams.get('next')).toBe('/buildings/abc?tab=map')
  })

  it('omits the next parameter for the default dashboard', () => {
    const res = proxy(request('/dashboard'))
    const location = new URL(res.headers.get('location')!)
    expect(location.searchParams.has('next')).toBe(false)
  })

  it('returns 401 JSON for signed-out API calls instead of redirecting', async () => {
    const res = proxy(request('/api/upload'))
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Unauthorized' })
  })

  it('lets requests with a session cookie through (pages verify the session itself)', () => {
    expect(passesThrough(proxy(request('/dashboard', SESSION_COOKIE)))).toBe(true)
    expect(passesThrough(proxy(request('/api/upload', SESSION_COOKIE)))).toBe(true)
  })
})
