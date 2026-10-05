import type { MarkerKind } from '@/features/solar-system/types/interaction'
import type { OverlayRegistry } from '@/features/solar-system/utils/overlayRegistry'

// Selected = solid ring, hover = dashed ring: the two differ by shape, not only by color.
const STYLE_BY_KIND: Record<MarkerKind, string> = {
  selected: 'border-2 border-solid border-sky-300',
  hover: 'border border-dashed border-white/80',
}

// A ring around a body. Positioned and sized every frame by <OverlayPositioner />.
export function SelectionMarker({
  kind,
  registry,
}: {
  kind: MarkerKind
  registry: OverlayRegistry
}) {
  return (
    <div
      aria-hidden="true"
      ref={(element) => registry.setMarker(kind, element)}
      className={`pointer-events-none absolute top-0 left-0 rounded-full opacity-0 transition-opacity duration-150 motion-reduce:transition-none ${STYLE_BY_KIND[kind]}`}
    />
  )
}
