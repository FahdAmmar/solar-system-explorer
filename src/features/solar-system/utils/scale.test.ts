import { describe, expect, it } from 'vitest'
import { planets } from '@/data/planets'
import { CAMERA } from '@/features/solar-system/data/camera'
import { SATURN_RING_RADII, VISUAL_SCALE } from '@/features/solar-system/data/visualScale'
import { getBodyRadius, getVisualExtent, toSceneDistance, toSceneRadius } from './scale'

const orbiting = planets.filter((body) => body.type !== 'star')
const sun = planets.find((body) => body.type === 'star')

describe('toSceneDistance', () => {
  it('places Earth (1 AU) at the configured distance', () => {
    expect(toSceneDistance(149.6)).toBeCloseTo(VISUAL_SCALE.distanceAtOneAu)
  })

  it('compresses with a square-root curve, so 4 AU is only twice as far as 1 AU', () => {
    expect(toSceneDistance(4 * 149.6)).toBeCloseTo(2 * VISUAL_SCALE.distanceAtOneAu)
  })

  it('keeps the real order of the planets', () => {
    const distances = orbiting.map((body) => toSceneDistance(body.distanceFromSun))
    expect(distances).toEqual([...distances].sort((a, b) => a - b))
    expect(new Set(distances).size).toBe(distances.length)
  })

  it.each([0, -1, NaN, Infinity])('returns 0 for %s', (value) => {
    expect(toSceneDistance(value)).toBe(0)
  })
})

describe('toSceneRadius', () => {
  it('gives Earth the configured radius', () => {
    expect(toSceneRadius(6371)).toBeCloseTo(VISUAL_SCALE.radiusOfEarth)
  })

  it('makes bigger bodies bigger, but not proportionally', () => {
    const jupiter = toSceneRadius(69_911)
    expect(jupiter).toBeGreaterThan(toSceneRadius(6371))
    expect(jupiter).toBeLessThan(69_911 / 6371)
  })

  it.each([0, -1, NaN, Infinity])('returns 0 for %s', (value) => {
    expect(toSceneRadius(value)).toBe(0)
  })
})

describe('getBodyRadius and getVisualExtent', () => {
  it('uses a fixed radius for the Sun', () => {
    expect(sun).toBeDefined()
    expect(getBodyRadius(sun!)).toBe(VISUAL_SCALE.sunRadius)
  })

  it('includes the rings in the extent of Saturn only', () => {
    const saturn = orbiting.find((body) => body.id === 'saturn')!
    const earth = orbiting.find((body) => body.id === 'earth')!
    expect(getVisualExtent(saturn)).toBeCloseTo(
      getBodyRadius(saturn) * SATURN_RING_RADII.outer,
    )
    expect(getVisualExtent(earth)).toBe(getBodyRadius(earth))
  })
})

describe('the bundled system fits the scene', () => {
  it('keeps every planet outside the Sun', () => {
    for (const body of orbiting) {
      const orbit = toSceneDistance(body.distanceFromSun)
      expect(orbit - getBodyRadius(body)).toBeGreaterThan(VISUAL_SCALE.sunRadius)
    }
  })

  it('fits the outermost orbit inside the area the default camera frames', () => {
    const outermost = Math.max(...orbiting.map((b) => toSceneDistance(b.distanceFromSun)))
    expect(outermost).toBeLessThan(CAMERA.framedRadius)
  })
})
