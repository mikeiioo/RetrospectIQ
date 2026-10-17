import { describe, expect, it } from 'vitest'
import { authBaseURL, authTrustedOrigins } from './auth-urls'

describe('authBaseURL', () => {
  it("trusts only this preview deployment's own hosts", () => {
    expect(
      authBaseURL({
        VERCEL_ENV: 'preview',
        VERCEL_URL: 'retro-abc123-team.vercel.app',
        VERCEL_BRANCH_URL: 'retro-git-feature-team.vercel.app',
        BETTER_AUTH_URL: 'https://www.retrospectiq.live',
      }),
    ).toEqual({
      allowedHosts: ['retro-abc123-team.vercel.app', 'retro-git-feature-team.vercel.app'],
      protocol: 'https',
    })
  })

  it('never trusts all of *.vercel.app', () => {
    const config = authBaseURL({ VERCEL_ENV: 'preview', VERCEL_URL: 'retro-abc123-team.vercel.app' })
    expect(JSON.stringify(config)).not.toContain('*')
  })

  it('defers to BETTER_AUTH_URL in production and locally', () => {
    expect(authBaseURL({ VERCEL_ENV: 'production', VERCEL_URL: 'x.vercel.app' })).toBeUndefined()
    expect(authBaseURL({ BETTER_AUTH_URL: 'http://localhost:3000' })).toBeUndefined()
  })

  it('falls back to the default when a preview has no host info', () => {
    expect(authBaseURL({ VERCEL_ENV: 'preview' })).toBeUndefined()
  })
})

describe('authTrustedOrigins', () => {
  it('trusts both www and apex forms of the site', () => {
    expect(authTrustedOrigins({ BETTER_AUTH_URL: 'https://www.retrospectiq.live' })).toEqual([
      'https://www.retrospectiq.live',
      'https://retrospectiq.live',
    ])
    expect(authTrustedOrigins({ BETTER_AUTH_URL: 'https://retrospectiq.live/' })).toEqual([
      'https://retrospectiq.live',
      'https://www.retrospectiq.live',
    ])
  })

  it('does not invent a www form for localhost', () => {
    expect(authTrustedOrigins({ BETTER_AUTH_URL: 'http://localhost:3000' })).toEqual([
      'http://localhost:3000',
    ])
  })

  it('returns nothing when unset or invalid', () => {
    expect(authTrustedOrigins({})).toEqual([])
    expect(authTrustedOrigins({ BETTER_AUTH_URL: 'not a url' })).toEqual([])
  })
})
