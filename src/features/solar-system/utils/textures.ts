import { CanvasTexture, SRGBColorSpace } from 'three'

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
