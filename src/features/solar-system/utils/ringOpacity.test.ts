import { describe, expect, it } from 'vitest'
import { getRingOpacity } from './textures'

describe('getRingOpacity', () => {
  it('draws the B ring denser than the A ring and the faint C ring', () => {
    expect(getRingOpacity(0.5)).toBeGreaterThan(getRingOpacity(0.85))
    expect(getRingOpacity(0.85)).toBeGreaterThan(getRingOpacity(0.1))
  })

  it('leaves the Cassini division almost empty', () => {
    expect(getRingOpacity(0.7)).toBeLessThan(0.06)
  })

  it.each([-0.1, 1, 1.5])('is transparent outside the rings (%s)', (position) => {
    expect(getRingOpacity(position)).toBe(0)
  })

  it('always stays between 0 and 1', () => {
    for (let position = -0.2; position < 1.2; position += 0.01) {
      const opacity = getRingOpacity(position)
      expect(opacity).toBeGreaterThanOrEqual(0)
      expect(opacity).toBeLessThanOrEqual(1)
    }
  })
})
