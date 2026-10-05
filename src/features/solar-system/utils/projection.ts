import { MathUtils, type Camera, type PerspectiveCamera, type Vector3 } from 'three'

// Size of one screen pixel in world units, at the depth of `point`.
export function getWorldUnitsPerPixel(
  camera: PerspectiveCamera,
  point: Vector3,
  viewportHeight: number,
): number {
  if (!(viewportHeight > 0)) return 1
  const distance = camera.position.distanceTo(point)
  return (2 * distance * Math.tan(MathUtils.degToRad(camera.fov) / 2)) / viewportHeight
}

// Writes CSS-pixel coordinates (origin top-left) into `target`.
// Returns false when the point is behind the camera or beyond the far plane.
export function projectToScreen(
  point: Vector3,
  camera: Camera,
  width: number,
  height: number,
  target: Vector3,
): boolean {
  target.copy(point).project(camera)
  const inFrustumDepth = target.z >= -1 && target.z <= 1
  target.x = (target.x * 0.5 + 0.5) * width
  target.y = (-target.y * 0.5 + 0.5) * height
  return inFrustumDepth
}
