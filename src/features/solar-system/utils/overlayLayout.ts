import {
  LABEL_GAP_PX,
  LABEL_SPACING_PX,
  MARKER_PADDING_PX,
  MIN_MARKER_DIAMETER_PX,
} from '@/features/solar-system/data/interaction'

export interface LabelBox {
  /** Top-left corner of the label. Written by resolveLabelVisibility. */
  x: number
  y: number
  width: number
  height: number
  /** Centre and radius (selection ring) of the body this label belongs to. */
  centerX: number
  centerY: number
  radius: number
  /** Projects inside the view, in front of the camera. */
  usable: boolean
  /** Hovered or selected: always shown, even over other labels. */
  forced: boolean
  /** Written by resolveLabelVisibility. */
  visible: boolean
}

export function getMarkerDiameter(bodyRadiusPx: number): number {
  const diameter = 2 * (bodyRadiusPx + MARKER_PADDING_PX)
  return Number.isFinite(diameter)
    ? Math.max(diameter, MIN_MARKER_DIAMETER_PX)
    : MIN_MARKER_DIAMETER_PX
}

// Tried in order: above the body, below it, then to its right.
const PLACEMENT_COUNT = 3

function place(box: LabelBox, placement: number) {
  if (placement === 0) {
    box.x = box.centerX - box.width / 2
    box.y = box.centerY - box.radius - LABEL_GAP_PX - box.height
  } else if (placement === 1) {
    box.x = box.centerX - box.width / 2
    box.y = box.centerY + box.radius + LABEL_GAP_PX
  } else {
    box.x = box.centerX + box.radius + LABEL_GAP_PX
    box.y = box.centerY - box.height / 2
  }
}

function labelsOverlap(a: LabelBox, b: LabelBox): boolean {
  return (
    a.x < b.x + b.width + LABEL_SPACING_PX &&
    b.x < a.x + a.width + LABEL_SPACING_PX &&
    a.y < b.y + b.height + LABEL_SPACING_PX &&
    b.y < a.y + a.height + LABEL_SPACING_PX
  )
}

// Does the label rectangle touch the body's disc? Compares the disc centre with the nearest
// point of the rectangle.
function coversBody(label: LabelBox, body: LabelBox): boolean {
  const nearestX = Math.min(Math.max(body.centerX, label.x), label.x + label.width)
  const nearestY = Math.min(Math.max(body.centerY, label.y), label.y + label.height)
  const dx = body.centerX - nearestX
  const dy = body.centerY - nearestY
  return dx * dx + dy * dy < body.radius * body.radius
}

function isInside(box: LabelBox, viewportWidth: number, viewportHeight: number): boolean {
  return (
    box.x >= 0 &&
    box.y >= 0 &&
    box.x + box.width <= viewportWidth &&
    box.y + box.height <= viewportHeight
  )
}

function isFree(
  box: LabelBox,
  boxes: readonly LabelBox[],
  viewportWidth: number,
  viewportHeight: number,
): boolean {
  if (!isInside(box, viewportWidth, viewportHeight)) return false
  for (const other of boxes) {
    if (other === box) continue
    if (other.visible && labelsOverlap(box, other)) return false
    // A label must never sit on top of another body: it would block clicks on it.
    if (other.usable && coversBody(box, other)) return false
  }
  return true
}

// Greedy declutter. `boxes` must be ordered from most to least important.
// Forced labels are always shown above their body. The others take the first placement that
// stays on screen and touches neither a visible label nor another body; if none fits they hide.
// Mutates `x`, `y` and `visible` in place: this runs every frame, so it must not allocate.
export function resolveLabelVisibility(
  boxes: readonly LabelBox[],
  showAll: boolean,
  viewportWidth: number,
  viewportHeight: number,
): void {
  for (const box of boxes) {
    place(box, 0)
    box.visible = box.usable && box.forced
  }
  if (!showAll) return

  for (const box of boxes) {
    if (box.visible || !box.usable) continue
    for (let placement = 0; placement < PLACEMENT_COUNT; placement++) {
      place(box, placement)
      if (isFree(box, boxes, viewportWidth, viewportHeight)) {
        box.visible = true
        break
      }
    }
    if (!box.visible) place(box, 0)
  }
}
