import { Vector3 } from 'three'
import { describe, expect, it } from 'vitest'
import { CAMERA } from '@/features/solar-system/data/camera'
import {
  getDefaultCameraPosition,
  getFitDistance,
  getFocusDirection,
  getFocusDistance,
  getFocusPosition,
} from './cameraFraming'

describe('getFitDistance', () => {
  it('needs less distance on a wide screen than on a narrow one', () => {
    expect(getFitDistance(2)).toBeLessThanOrEqual(getFitDistance(1))
    expect(getFitDistance(1)).toBeLessThan(getFitDistance(0.5))
  })

  it('never goes past the star field', () => {
    expect(getFitDistance(0.05)).toBe(CAMERA.maxFitDistance)
  })

  it.each([0, -1, NaN, Infinity * 0])(
    'treats an invalid aspect (%s) as square',
    (aspect) => {
      expect(getFitDistance(aspect)).toBe(getFitDistance(1))
    },
  )
})

describe('getDefaultCameraPosition', () => {
  it('sits above the orbital plane, on the Z axis side, looking at the Sun', () => {
    const [x, y, z] = getDefaultCameraPosition(16 / 9)
    expect(x).toBe(0)
    expect(y).toBeGreaterThan(0)
    expect(z).toBeGreaterThan(0)
  })

  it('is exactly the fit distance away from the origin', () => {
    const position = new Vector3(...getDefaultCameraPosition(1.5))
    expect(position.length()).toBeCloseTo(getFitDistance(1.5))
  })
})

describe('getFocusDistance', () => {
  it('is farther for a bigger body', () => {
    expect(getFocusDistance(5, 1.6, 45)).toBeGreaterThan(getFocusDistance(1, 1.6, 45))
  })

  it('is proportional to the size of the body', () => {
    expect(getFocusDistance(4, 1.6, 45)).toBeCloseTo(4 * getFocusDistance(1, 1.6, 45))
  })

  it('backs away further on a portrait phone, where the horizontal angle is the limit', () => {
    expect(getFocusDistance(1, 0.5, 45)).toBeGreaterThan(getFocusDistance(1, 1.8, 45))
  })

  it('never returns a negative or non-finite distance', () => {
    expect(getFocusDistance(-3, 1.6, 45)).toBe(0)
    expect(Number.isFinite(getFocusDistance(2, NaN, 45))).toBe(true)
    expect(getFocusDistance(2, NaN, 45)).toBe(getFocusDistance(2, 1, 45))
  })
})

describe('getFocusDirection', () => {
  it('returns a unit vector', () => {
    const direction = getFocusDirection(new Vector3(20, 0, 0), new Vector3())
    expect(direction.length()).toBeCloseTo(1)
  })

  it('views an orbiting body from above and from its lit side (toward the Sun)', () => {
    const body = new Vector3(20, 0, 0)
    const direction = getFocusDirection(body, new Vector3())
    expect(direction.y).toBeGreaterThan(0)
    // The Sun is at the origin, so "toward the Sun" is the negative of the body position.
    expect(direction.dot(body.clone().negate().normalize())).toBeGreaterThan(0)
  })

  it('uses the overview angle for the Sun', () => {
    const direction = getFocusDirection(new Vector3(0, 0, 0), new Vector3())
    const [, y, z] = getDefaultCameraPosition(1)
    const overview = new Vector3(0, y, z).normalize()
    expect(direction.distanceTo(overview)).toBeCloseTo(0)
  })
})

describe('getFocusPosition', () => {
  it('puts the camera exactly the focus distance from the body', () => {
    const body = new Vector3(-30, 0, 12)
    const position = getFocusPosition(body, 2, 1.6, 45, new Vector3())
    expect(position.distanceTo(body)).toBeCloseTo(getFocusDistance(2, 1.6, 45))
  })
})
