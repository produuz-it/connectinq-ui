import { describe, expect, it } from 'vitest'
import { MARKS, PLATFORM, PLATFORM_ORDER, isPlatformKey } from '../src/platform'

describe('platform', () => {
  it('lists the applications before the tools', () => {
    const kinds = PLATFORM_ORDER.map((key) => PLATFORM[key].kind)
    expect(kinds.lastIndexOf('application')).toBeLessThan(kinds.indexOf('tool'))
  })

  it('draws every entry as a mark or as a glyph on a tile', () => {
    for (const key of PLATFORM_ORDER) {
      const look = PLATFORM[key]
      expect(Boolean(look.logo) || Boolean(look.glyph && look.tile && look.ink), key).toBe(true)
    }
  })

  it('gives every mark a URL', () => {
    for (const url of Object.values(MARKS)) expect(url).toMatch(/\.(png|svg)|^data:/)
  })

  it('knows its own keys only', () => {
    expect(isPlatformKey('qr')).toBe(true)
    expect(isPlatformKey('toString')).toBe(false)
    expect(isPlatformKey(3)).toBe(false)
  })
})
