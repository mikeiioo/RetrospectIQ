import { describe, expect, it } from 'vitest'
import { hasPdfSignature } from './pdf'

describe('hasPdfSignature', () => {
  it('accepts bytes starting with %PDF-', () => {
    expect(hasPdfSignature(Buffer.from('%PDF-1.7\n...'))).toBe(true)
  })

  it('rejects other content even if renamed to .pdf', () => {
    expect(hasPdfSignature(Buffer.from('<html>not a pdf</html>'))).toBe(false)
    expect(hasPdfSignature(Buffer.from([0x89, 0x50, 0x4e, 0x47]))).toBe(false)
  })

  it('rejects empty and truncated input', () => {
    expect(hasPdfSignature(Buffer.alloc(0))).toBe(false)
    expect(hasPdfSignature(Buffer.from('%PDF'))).toBe(false)
  })
})
