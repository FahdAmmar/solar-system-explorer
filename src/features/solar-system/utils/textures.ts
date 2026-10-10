import { CanvasTexture, SRGBColorSpace } from 'three'
import { BANDED_BODY_IDS, SURFACE_TEXTURE } from '@/features/solar-system/data/surfaces'
import type { Planet } from '@/types/planet'

const RING_TEXTURE_WIDTH = 512
const GLOW_TEXTURE_SIZE = 128

// Saturn's ring structure as fractions of the ring width (inner edge = 0, outer edge = 1).
const RING_BANDS = [
  { from: 0, to: 0.27, opacity: 0.25 }, // C ring
  { from: 0.27, to: 0.67, opacity: 0.85 }, // B ring
  { from: 0.67, to: 0.745, opacity: 0.04 }, // Cassini division
  { from: 0.745, to: 0.97, opacity: 0.6 }, // A ring
  { from: 0.97, to: 1, opacity: 0.12 }, // Outer fringe
] as const

export function getRingOpacity(position: number): number {
  const band = RING_BANDS.find(({ from, to }) => position >= from && position < to)
  if (!band) return 0
  const ringlets = 0.85 + 0.15 * Math.sin(position * 180)
  return band.opacity * ringlets
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('2D canvas is not supported')
  return { canvas, context }
}

function toTexture(canvas: HTMLCanvasElement): CanvasTexture {
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

// One-pixel-tall strip: the ring geometry maps radius to the U axis.
export function createRingTexture(): CanvasTexture {
  const { canvas, context } = createCanvas(RING_TEXTURE_WIDTH, 1)
  for (let x = 0; x < RING_TEXTURE_WIDTH; x++) {
    context.fillStyle = `rgba(217, 199, 160, ${getRingOpacity(x / RING_TEXTURE_WIDTH)})`
    context.fillRect(x, 0, 1, 1)
  }
  return toTexture(canvas)
}

export function createGlowTexture(): CanvasTexture {
  const { canvas, context } = createCanvas(GLOW_TEXTURE_SIZE, GLOW_TEXTURE_SIZE)
  const center = GLOW_TEXTURE_SIZE / 2
  const gradient = context.createRadialGradient(center, center, 0, center, center, center)
  gradient.addColorStop(0, 'rgba(255, 190, 90, 0.9)')
  gradient.addColorStop(0.35, 'rgba(255, 150, 50, 0.35)')
  gradient.addColorStop(1, 'rgba(255, 120, 30, 0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, GLOW_TEXTURE_SIZE, GLOW_TEXTURE_SIZE)
  return toTexture(canvas)
}

// mulberry32: a tiny seeded generator, so a body looks the same on every visit.
function createRandom(seed: string): () => number {
  let state = 0
  for (const character of seed)
    state = (Math.imul(state, 31) + character.charCodeAt(0)) | 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state)
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
  }
}

const tint = (isLight: boolean, alpha: number) =>
  `rgba(${isLight ? '255, 255, 255' : '0, 0, 0'}, ${alpha})`

function drawBands(context: CanvasRenderingContext2D, random: () => number) {
  const { width, height, bandCount, maxContrast } = SURFACE_TEXTURE
  const phase = random() * Math.PI * 2
  for (let y = 0; y < height; y++) {
    const latitude = y / height
    const wave =
      0.65 * Math.sin(latitude * Math.PI * bandCount + phase) +
      0.35 * Math.sin(latitude * Math.PI * bandCount * 2.7 + phase * 2)
    context.fillStyle = tint(wave > 0, Math.abs(wave) * maxContrast)
    context.fillRect(0, y, width, 1)
  }
}

// A soft blob. Drawn again one texture width to each side, so it wraps around the sphere
// without a seam.
function drawPatch(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  aspect: number,
  isLight: boolean,
  alpha: number,
) {
  for (const offset of [-SURFACE_TEXTURE.width, 0, SURFACE_TEXTURE.width]) {
    context.save()
    context.translate(x + offset, y)
    context.scale(1, aspect)
    const gradient = context.createRadialGradient(0, 0, 0, 0, 0, radius)
    gradient.addColorStop(0, tint(isLight, alpha))
    gradient.addColorStop(1, tint(isLight, 0)) // same hue, so the fade has no grey fringe
    context.fillStyle = gradient
    context.beginPath()
    context.arc(0, 0, radius, 0, Math.PI * 2)
    context.fill()
    context.restore()
  }
}

// Equirectangular map (U = longitude, V = latitude) painted over the body's own colour.
export function createSurfaceTexture(body: Pick<Planet, 'id' | 'color'>): CanvasTexture {
  const { width, height, maxContrast, minPatchRadius, maxPatchRadius } = SURFACE_TEXTURE
  const { canvas, context } = createCanvas(width, height)
  const random = createRandom(body.id)
  const banded = BANDED_BODY_IDS.has(body.id)

  context.fillStyle = body.color
  context.fillRect(0, 0, width, height)
  if (banded) drawBands(context, random)

  const count = banded ? SURFACE_TEXTURE.bandedPatchCount : SURFACE_TEXTURE.patchCount
  const aspect = banded ? SURFACE_TEXTURE.bandedPatchAspect : SURFACE_TEXTURE.patchAspect
  for (let index = 0; index < count; index++) {
    const radius = minPatchRadius + random() * (maxPatchRadius - minPatchRadius)
    const isLight = random() > 0.5
    const alpha = random() * maxContrast
    drawPatch(
      context,
      random() * width,
      random() * height,
      radius,
      aspect,
      isLight,
      alpha,
    )
  }
  return toTexture(canvas)
}
