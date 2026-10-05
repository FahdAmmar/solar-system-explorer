import type { MarkerKind } from '@/features/solar-system/types/interaction'

// Connects the DOM overlay (labels, rings) with the per-frame positioner inside the Canvas.
export class OverlayRegistry {
  readonly labels = new Map<string, HTMLElement>()
  readonly markers = new Map<MarkerKind, HTMLElement>()

  setLabel(id: string, element: HTMLElement | null) {
    if (element) this.labels.set(id, element)
    else this.labels.delete(id)
  }

  setMarker(kind: MarkerKind, element: HTMLElement | null) {
    if (element) this.markers.set(kind, element)
    else this.markers.delete(kind)
  }
}
