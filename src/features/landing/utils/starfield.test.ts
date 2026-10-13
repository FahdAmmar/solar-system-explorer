import { describe, expect, it } from 'vitest'
import { createStarTileImage, createStars, type StarTileOptions } from './starfield'

const options: StarTileOptions = {
  seed: 7,
  tilePx: 420,
  count: 30,
  maxRadiusPx: 1.5,
  minAlpha: 0.3,
  maxAlpha: 0.9,
}

// The SVG text inside the CSS `url("data:image/svg+xml,...")` value.
const svgOf = (css: string) =>
  decodeURIComponent(css.replace(/^url\("data:image\/svg\+xml,/, '').replace(/"\)$/, ''))

describe('createStars', () => {
  it('draws exactly the requested number of stars', () => {
    expect(createStars(options)).toHaveLength(30)
    expect(createStars({ ...options, count: 3 })).toHaveLength(3)
  })

  it('draws no stars for a zero, negative or invalid count', () => {
    for (const count of [0, -5, NaN]) {
      expect(createStars({ ...options, count })).toEqual([])
    }
  })

  it('is deterministic: the same seed gives the same sky', () => {
    expect(createStars(options)).toEqual(createStars(options))
  })

  it('gives different skies for different seeds', () => {
    expect(createStars({ ...options, seed: 8 })).not.toEqual(createStars(options))
  })

  it('keeps every star fully inside the tile, so none is cut where tiles meet', () => {
    for (const { x, y, radius } of createStars(options)) {
      expect(x - radius).toBeGreaterThanOrEqual(0)
      expect(x + radius).toBeLessThanOrEqual(options.tilePx)
      expect(y - radius).toBeGreaterThanOrEqual(0)
      expect(y + radius).toBeLessThanOrEqual(options.tilePx)
    }
  })

  it('keeps even a crowded sky of large stars inside the tile (edge cases are certain)', () => {
    // With thousands of big stars, some would land on an edge if the margin were missing.
    const crowded = { ...options, count: 3000, maxRadiusPx: 3 }
    for (const { x, y, radius } of createStars(crowded)) {
      expect(x - radius).toBeGreaterThanOrEqual(0)
      expect(x + radius).toBeLessThanOrEqual(crowded.tilePx)
      expect(y - radius).toBeGreaterThanOrEqual(0)
      expect(y + radius).toBeLessThanOrEqual(crowded.tilePx)
    }
  })

  it('keeps sizes and brightness in the requested range', () => {
    for (const { radius, alpha } of createStars(options)) {
      expect(radius).toBeGreaterThanOrEqual(0.5)
      expect(radius).toBeLessThanOrEqual(1.5)
      expect(alpha).toBeGreaterThanOrEqual(0.3)
      expect(alpha).toBeLessThanOrEqual(0.9)
    }
  })

  it('never produces NaN, even when the largest size is below the smallest', () => {
    const stars = createStars({ ...options, maxRadiusPx: 0.1 })
    for (const star of stars) {
      expect(Object.values(star).every(Number.isFinite)).toBe(true)
    }
  })
})

describe('createStarTileImage', () => {
  it('is a CSS url() holding an SVG of the tile size with one circle per star', () => {
    const css = createStarTileImage(options)
    const svg = svgOf(css)
    expect(css).toMatch(/^url\("data:image\/svg\+xml,/)
    expect(svg).toContain('width="420" height="420"')
    expect(svg.match(/<circle /g)).toHaveLength(30)
  })

  it('is deterministic', () => {
    expect(createStarTileImage(options)).toBe(createStarTileImage(options))
  })

  it('is safe inside a CSS value (no raw quotes, hashes or angle brackets)', () => {
    const body = createStarTileImage(options)
      .replace(/^url\("/, '')
      .replace(/"\)$/, '')
    expect(body).not.toMatch(/["#<>]/)
  })

  it('is a valid, empty SVG when there are no stars', () => {
    expect(svgOf(createStarTileImage({ ...options, count: 0 }))).not.toContain('<circle')
  })
})
