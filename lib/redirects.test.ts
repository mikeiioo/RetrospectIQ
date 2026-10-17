import { describe, expect, it } from 'vitest'
import { DEFAULT_REDIRECT, safeRedirectPath } from './redirects'

describe('safeRedirectPath', () => {
  it('allows same-site paths with query strings', () => {
    expect(safeRedirectPath('/buildings/abc')).toBe('/buildings/abc')
    expect(safeRedirectPath('/permits?page=2')).toBe('/permits?page=2')
  })

  it('uses the first value when given an array', () => {
    expect(safeRedirectPath(['/profile', '/evil'])).toBe('/profile')
  })

  it('falls back to the dashboard for missing values', () => {
    expect(safeRedirectPath(undefined)).toBe(DEFAULT_REDIRECT)
    expect(safeRedirectPath('')).toBe(DEFAULT_REDIRECT)
  })

  it.each([
    'https://evil.com',
    'evil.com',
    '//evil.com',
    '/\\evil.com',
    '/foo\\bar',
    '/\t/evil.com',
    '/\n/evil.com',
    '/\r/evil.com',
    'javascript:alert(1)',
  ])('rejects off-site or ambiguous target %j', (value) => {
    expect(safeRedirectPath(value)).toBe(DEFAULT_REDIRECT)
  })
})
