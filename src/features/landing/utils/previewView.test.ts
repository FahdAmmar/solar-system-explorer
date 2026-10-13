import { describe, expect, it } from 'vitest'
import { PREVIEW } from '../data/preview'
import { getPreviewView } from './previewView'

describe('getPreviewView', () => {
  it('puts the Sun on the right of a wide screen, leaving the left for the text', () => {
    const view = getPreviewView(16 / 9)
    expect(view.sunX).toBeGreaterThan(0.6)
    expect(view.sunY).toBeGreaterThan(0.4)
    expect(view.sunY).toBeLessThan(0.7)
  })

  it('puts the Sun low on a tall screen, leaving the top for the text', () => {
    const view = getPreviewView(9 / 19.5)
    expect(view.sunX).toBe(0.5)
    expect(view.sunY).toBeGreaterThan(0.7)
  })

  it('shows the same amount of the system across the shorter side on a wide screen', () => {
    // At 45° and this extent, the camera sits about 55 units back.
    const halfFov = (PREVIEW.fov * Math.PI) / 360
    const distance = getPreviewView(16 / 9).distance
    expect(2 * distance * Math.tan(halfFov)).toBeCloseTo(PREVIEW.visibleExtent)
  })

  it('backs the camera away on a narrow screen so the picture still fits across its width', () => {
    expect(getPreviewView(0.5).distance).toBeGreaterThan(getPreviewView(1).distance)
    expect(getPreviewView(1).distance).toBeCloseTo(getPreviewView(2).distance)
  })

  it('never moves the camera past its limit', () => {
    expect(getPreviewView(0.001).distance).toBe(PREVIEW.maxDistance)
  })

  it.each([0, -1, NaN, Infinity, -Infinity])('treats aspect %s as square', (aspect) => {
    const view = getPreviewView(aspect)
    expect(view).toEqual(getPreviewView(1))
    expect(Number.isFinite(view.distance)).toBe(true)
  })

  it('keeps the Sun on screen for any shape', () => {
    for (const aspect of [0.2, 0.46, 0.75, 1, 1.33, 1.78, 2.4, 4]) {
      const { sunX, sunY } = getPreviewView(aspect)
      expect(sunX).toBeGreaterThan(0)
      expect(sunX).toBeLessThan(1)
      expect(sunY).toBeGreaterThan(0)
      expect(sunY).toBeLessThan(1)
    }
  })
})
