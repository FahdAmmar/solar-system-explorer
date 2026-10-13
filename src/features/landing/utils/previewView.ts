import { PREVIEW } from '../data/preview'

export interface PreviewView {
  /** Camera distance from the Sun, in scene units. */
  distance: number
  /** Where the Sun appears on screen, as a share of the width and height from the top left. */
  sunX: number
  sunY: number
}

// Picks how far back the camera sits so the same amount of the system fits across the
// SHORTER side of any screen, and where the Sun lands. The text takes the left on wide
// screens and the top on tall ones, so the Sun moves right or down to leave room.
export function getPreviewView(aspect: number): PreviewView {
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1
  const placement =
    safeAspect < 1 ? PREVIEW.sunPosition.portrait : PREVIEW.sunPosition.landscape

  const halfFov = (PREVIEW.fov * Math.PI) / 360
  const shorterSideShare = Math.min(1, safeAspect)
  const distance = PREVIEW.visibleExtent / (2 * Math.tan(halfFov) * shorterSideShare)

  return {
    distance: Math.min(distance, PREVIEW.maxDistance),
    sunX: placement.x,
    sunY: placement.y,
  }
}
