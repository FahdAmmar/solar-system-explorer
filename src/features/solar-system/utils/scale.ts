import {
  EARTH_RADIUS_KM,
  MILLION_KM_PER_AU,
  SATURN_RING_RADII,
  VISUAL_SCALE,
} from '@/features/solar-system/data/visualScale'
import { isPositive } from '@/features/solar-system/utils/numbers'
import type { Planet } from '@/types/planet'

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

// Radius of everything that belongs to the body, including Saturn's rings.
export function getVisualExtent(body: Planet): number {
  const radius = getBodyRadius(body)
  return body.id === 'saturn' ? radius * SATURN_RING_RADII.outer : radius
}
