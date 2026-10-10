import { describe, expect, it } from 'vitest'
import { getStartAngle } from './orbit'

describe('getStartAngle', () => {
  it('starts the first body on the +X axis', () => {
    expect(getStartAngle(0)).toBe(0)
  })

  it('stays within one turn', () => {
    for (let index = 0; index < 50; index++) {
      const angle = getStartAngle(index)
      expect(angle).toBeGreaterThanOrEqual(0)
      expect(angle).toBeLessThan(Math.PI * 2)
    }
  })

  it('gives every body a different angle, so planets do not line up in a row', () => {
    const angles = Array.from({ length: 10 }, (_, index) => getStartAngle(index))
    expect(new Set(angles.map((angle) => angle.toFixed(6))).size).toBe(10)
  })
})
