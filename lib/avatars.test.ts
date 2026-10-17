import { describe, expect, it } from 'vitest'
import { avatarKey, detectImageType } from './avatars'

const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0])
const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0])
const webp = Buffer.concat([Buffer.from('RIFF'), Buffer.from([0, 0, 0, 0]), Buffer.from('WEBPVP8 ')])

describe('detectImageType', () => {
  it('recognizes PNG, JPEG, and WebP by signature', () => {
    expect(detectImageType(png)).toBe('image/png')
    expect(detectImageType(jpeg)).toBe('image/jpeg')
    expect(detectImageType(webp)).toBe('image/webp')
  })

  it('rejects SVG, HTML, PDF, and empty input', () => {
    expect(detectImageType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'))).toBeNull()
    expect(detectImageType(Buffer.from('<html></html>'))).toBeNull()
    expect(detectImageType(Buffer.from('%PDF-1.7'))).toBeNull()
    expect(detectImageType(Buffer.alloc(0))).toBeNull()
  })

  it('rejects RIFF containers that are not WebP', () => {
    const wav = Buffer.concat([Buffer.from('RIFF'), Buffer.from([0, 0, 0, 0]), Buffer.from('WAVE')])
    expect(detectImageType(wav)).toBeNull()
  })
})

describe('avatarKey', () => {
  it('stores each user under their own key', () => {
    expect(avatarKey('abc123')).toBe('avatars/abc123')
  })
})
