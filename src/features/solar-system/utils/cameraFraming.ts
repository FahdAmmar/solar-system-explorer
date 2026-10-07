import { Vector3 } from 'three'
import { CAMERA, CAMERA_FOCUS } from '@/features/solar-system/data/camera'

const toRadians = (degrees: number) => (degrees * Math.PI) / 180

// Distance at which a circle of radius `framedRadius` in the orbital plane fits the screen,
// looking at its centre from above at the default elevation.
// Vertical: the near edge of the circle is the limiting point. Horizontal: the left/right edges.
export function getFitDistance(aspect: number, fovDegrees: number = CAMERA.fov): number {
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1
  const tanHalfFov = Math.tan(toRadians(fovDegrees) / 2)
  const elevation = toRadians(CAMERA.elevationDegrees)

  const forHeight =
    CAMERA.framedRadius * (Math.sin(elevation) / tanHalfFov + Math.cos(elevation))
  const forWidth = CAMERA.framedRadius / (tanHalfFov * safeAspect)

  return Math.min(Math.max(forHeight, forWidth), CAMERA.maxFitDistance)
}

export function getDefaultCameraPosition(
  aspect: number,
  fovDegrees: number = CAMERA.fov,
): [x: number, y: number, z: number] {
  const distance = getFitDistance(aspect, fovDegrees)
  const elevation = toRadians(CAMERA.elevationDegrees)
  return [0, distance * Math.sin(elevation), distance * Math.cos(elevation)]
}

// Distance at which a body of radius `extent` fills CAMERA_FOCUS.fillFraction of the smaller
// screen angle. Portrait phones are limited by the horizontal angle, so both are compared.
export function getFocusDistance(
  extent: number,
  aspect: number,
  fovDegrees: number = CAMERA.fov,
): number {
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1
  const verticalFov = toRadians(fovDegrees)
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * safeAspect)
  const halfAngle = (CAMERA_FOCUS.fillFraction * Math.min(verticalFov, horizontalFov)) / 2
  return Math.max(extent, 0) / Math.sin(halfAngle)
}

const UP = new Vector3(0, 1, 0)
const sunward = new Vector3()
const orbital = new Vector3()

// Writes the unit vector from a body to where the camera should sit.
// Orbiting bodies are seen from their lit side; the Sun uses the overview angle.
export function getFocusDirection(bodyPosition: Vector3, out: Vector3): Vector3 {
  const elevation = toRadians(CAMERA.elevationDegrees)
  if (bodyPosition.lengthSq() < 1e-6) {
    return out.set(0, Math.sin(elevation), Math.cos(elevation))
  }
  sunward.copy(bodyPosition).negate().normalize()
  // up x radial = the direction the body travels along its orbit
  orbital.crossVectors(UP, bodyPosition).normalize()
  return out
    .set(0, 0, 0)
    .addScaledVector(sunward, CAMERA_FOCUS.sunwardWeight)
    .addScaledVector(UP, CAMERA_FOCUS.upWeight)
    .addScaledVector(orbital, CAMERA_FOCUS.orbitWeight)
    .normalize()
}

const direction = new Vector3()

export function getFocusPosition(
  bodyPosition: Vector3,
  extent: number,
  aspect: number,
  fovDegrees: number,
  out: Vector3,
): Vector3 {
  getFocusDirection(bodyPosition, direction)
  const distance = getFocusDistance(extent, aspect, fovDegrees)
  return out.copy(bodyPosition).addScaledVector(direction, distance)
}
