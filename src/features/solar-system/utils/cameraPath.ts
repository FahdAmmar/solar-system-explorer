import { MathUtils, Vector3 } from 'three'
import { CAMERA_TRANSITION } from '@/features/solar-system/data/camera'

const rise = new Vector3()
const approach = new Vector3()

// Longer trips take longer, within a comfortable range.
export function getTransitionDuration(travelDistance: number): number {
  const { minDurationSeconds, maxDurationSeconds, secondsPerUnit } = CAMERA_TRANSITION
  if (!Number.isFinite(travelDistance)) return minDurationSeconds
  return MathUtils.clamp(
    minDurationSeconds + travelDistance * secondsPerUnit,
    minDurationSeconds,
    maxDurationSeconds,
  )
}

function keepInside(point: Vector3) {
  if (point.length() > CAMERA_TRANSITION.maxPathRadius)
    point.setLength(CAMERA_TRANSITION.maxPathRadius)
}

// Point at progress `t` (0..1) on a cubic curve from `start` to `end`.
// - It first rises, so trips across the system pass over the Sun instead of through it.
// - It finishes along the line from `endTarget` through `end`, so the camera never swings past
//   the body it is approaching and then back out.
export function getCameraPathPoint(
  start: Vector3,
  end: Vector3,
  endTarget: Vector3,
  t: number,
  out: Vector3,
): Vector3 {
  const { liftFactor, minLift, approachFactor, maxApproachInFinalDistances } =
    CAMERA_TRANSITION
  const trip = start.distanceTo(end)

  rise.copy(start)
  rise.y += Math.max(minLift, liftFactor * trip)
  keepInside(rise)

  approach.subVectors(end, endTarget)
  const finalDistance = approach.length()
  approach
    .normalize()
    .multiplyScalar(
      Math.min(approachFactor * trip, maxApproachInFinalDistances * finalDistance),
    )
    .add(end)
  keepInside(approach)

  const remaining = 1 - t
  return out
    .set(0, 0, 0)
    .addScaledVector(start, remaining ** 3)
    .addScaledVector(rise, 3 * remaining ** 2 * t)
    .addScaledVector(approach, 3 * remaining * t ** 2)
    .addScaledVector(end, t ** 3)
}
