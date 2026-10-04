import { CAMERA } from '@/features/solar-system/data/camera'

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
