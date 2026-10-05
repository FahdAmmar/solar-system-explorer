import type { OverlayRegistry } from '@/features/solar-system/utils/overlayRegistry'
import type { Planet } from '@/types/planet'
import { PlanetLabels } from './PlanetLabels'
import { SelectionMarker } from './SelectionMarker'

// Plain DOM drawn over the canvas. Real buttons keep the planets reachable by keyboard
// and screen readers. Only the visible labels capture the pointer.
export function SceneOverlay({
  bodies,
  registry,
}: {
  bodies: readonly Planet[]
  registry: OverlayRegistry
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <SelectionMarker kind="hover" registry={registry} />
      <SelectionMarker kind="selected" registry={registry} />
      <PlanetLabels bodies={bodies} registry={registry} />
    </div>
  )
}
