import { Vector3 } from 'three'
import { describe, expect, it } from 'vitest'
import { CAMERA_TRANSITION } from '@/features/solar-system/data/camera'
import { getCameraPathPoint, getTransitionDuration } from './cameraPath'

describe('getTransitionDuration', () => {
  it('stays within the configured range', () => {
    expect(getTransitionDuration(0)).toBe(CAMERA_TRANSITION.minDurationSeconds)
    expect(getTransitionDuration(10_000)).toBe(CAMERA_TRANSITION.maxDurationSeconds)
  })

  it('gives longer trips more time', () => {
    expect(getTransitionDuration(80)).toBeGreaterThan(getTransitionDuration(20))
  })

  it.each([NaN, Infinity, -Infinity])('falls back to the minimum for %s', (distance) => {
    expect(getTransitionDuration(distance)).toBe(CAMERA_TRANSITION.minDurationSeconds)
  })
})

describe('getCameraPathPoint', () => {
  const start = new Vector3(0, 40, 60)
  const end = new Vector3(15, 4, 6)
  const target = new Vector3(12, 0, 4)

  it('begins at the start and ends at the destination', () => {
    expect(
      getCameraPathPoint(start, end, target, 0, new Vector3()).distanceTo(start),
    ).toBeCloseTo(0)
    expect(
      getCameraPathPoint(start, end, target, 1, new Vector3()).distanceTo(end),
    ).toBeCloseTo(0)
  })

  it('never leaves the star field along the way', () => {
    for (let step = 0; step <= 20; step++) {
      const point = getCameraPathPoint(start, end, target, step / 20, new Vector3())
      expect(point.length()).toBeLessThanOrEqual(CAMERA_TRANSITION.maxPathRadius)
      expect(Number.isFinite(point.x + point.y + point.z)).toBe(true)
    }
  })

  it('rises above a straight line first, so trips pass over the Sun', () => {
    const flatStart = new Vector3(40, 5, 0)
    const flatEnd = new Vector3(-40, 5, 0)
    const middle = getCameraPathPoint(
      flatStart,
      flatEnd,
      new Vector3(-45, 0, 0),
      0.5,
      new Vector3(),
    )
    expect(middle.y).toBeGreaterThan(5)
  })
})
