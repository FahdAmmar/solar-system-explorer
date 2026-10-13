export interface StarTileOptions {
  /** The same seed always draws the same stars. */
  seed: number
  /** Width and height of the repeating tile, in px. */
  tilePx: number
  count: number
  /** Largest star radius in px. The smallest is 0.5 px. */
  maxRadiusPx: number
  minAlpha: number
  maxAlpha: number
}

export interface Star {
  /** Position inside the tile, in px. */
  x: number
  y: number
  radius: number
  alpha: number
}

// Small seeded random generator (mulberry32): the sky is identical on every visit and test run.
function createRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createStars({
  seed,
  tilePx,
  count,
  maxRadiusPx,
  minAlpha,
  maxAlpha,
}: StarTileOptions): Star[] {
  const random = createRandom(seed)
  // Stars stay a full radius away from the edges, so none is cut in half where tiles meet.
  const margin = Math.max(0.5, maxRadiusPx)
  const span = Math.max(0, tilePx - margin * 2)

  return Array.from({ length: Math.max(0, Math.floor(count)) }, () => ({
    x: margin + random() * span,
    y: margin + random() * span,
    radius: 0.5 + random() * Math.max(0, maxRadiusPx - 0.5),
    alpha: minAlpha + random() * (maxAlpha - minAlpha),
  }))
}

// A CSS `background-image` value: one small SVG, drawn once and then tiled.
// (Stacking one radial-gradient per star looks the same, but makes the browser fill the whole
// tile once per star on every repaint. That is far too slow on a CPU-rendered page.)
export function createStarTileImage(options: StarTileOptions): string {
  const circles = createStars(options)
    .map(
      ({ x, y, radius, alpha }) =>
        `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radius.toFixed(2)}" fill="white" fill-opacity="${alpha.toFixed(2)}"/>`,
    )
    .join('')
  const tile = options.tilePx
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${tile}" height="${tile}" viewBox="0 0 ${tile} ${tile}">${circles}</svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}
