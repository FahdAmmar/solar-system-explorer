import type { CSSProperties } from 'react'
import { useSolarSystemStore } from '@/store/solarSystemStore'
import { createStarTileImage } from '../utils/starfield'

// How many times a second the drift moves: smooth enough at this speed, and cheap.
const DRIFT_STEPS_PER_SECOND = 4

// Two layers: far stars are small, dim and slow; near stars are bigger, brighter and quicker.
// The difference in speed gives depth without any 3D.
const LAYERS = [
  {
    tilePx: 420,
    driftSeconds: 420,
    image: createStarTileImage({
      seed: 7,
      tilePx: 420,
      count: 46,
      maxRadiusPx: 1,
      minAlpha: 0.3,
      maxAlpha: 0.7,
    }),
  },
  {
    tilePx: 640,
    driftSeconds: 200,
    image: createStarTileImage({
      seed: 21,
      tilePx: 640,
      count: 18,
      maxRadiusPx: 1.6,
      minAlpha: 0.55,
      maxAlpha: 1,
    }),
  },
] as const

// Plain CSS, so it paints immediately and also stays when WebGL is unavailable.
export function StarfieldBackground() {
  const isPaused = useSolarSystemStore((state) => state.isPaused)

  return (
    <div
      aria-hidden="true"
      data-paused={isPaused}
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {LAYERS.map(({ tilePx, driftSeconds, image }) => (
        <div
          key={tilePx}
          className="star-layer absolute right-0 bottom-0"
          style={
            {
              top: -tilePx,
              left: -tilePx,
              backgroundImage: image,
              backgroundSize: `${tilePx}px ${tilePx}px`,
              '--drift-distance': `${tilePx}px`,
              '--drift-seconds': `${driftSeconds}s`,
              '--drift-steps': driftSeconds * DRIFT_STEPS_PER_SECOND,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
