import {
  EARTH_RADIUS_KM,
  MILLION_KM_PER_AU,
  VISUAL_SCALE,
} from '@/features/solar-system/data/visualScale'
import type { Planet } from '@/types/planet'

// Invalid input must never become NaN in the scene.
const isPositive = (value: number) => Number.isFinite(value) && value > 0

export function toSceneDistance(distanceMillionKm: number): number {
  if (!isPositive(distanceMillionKm)) return 0
  const au = distanceMillionKm / MILLION_KM_PER_AU
  return VISUAL_SCALE.distanceAtOneAu * au ** VISUAL_SCALE.distanceExponent
}

export function toSceneRadius(radiusKm: number): number {
  if (!isPositive(radiusKm)) return 0
  return (
    VISUAL_SCALE.radiusOfEarth *
    (radiusKm / EARTH_RADIUS_KM) ** VISUAL_SCALE.radiusExponent
  )
}

export function getBodyRadius(body: Planet): number {
  return body.type === 'star' ? VISUAL_SCALE.sunRadius : toSceneRadius(body.radius)
}
