import type { OverlayRegistry } from '@/features/solar-system/utils/overlayRegistry'
import { selectHighlightedId, useSolarSystemStore } from '@/store/solarSystemStore'
import type { Planet } from '@/types/planet'

interface LabelProps {
  id: string
  name: string
  registry: OverlayRegistry
}

// Positioned every frame by <OverlayPositioner />. Starts hidden until it has a position.
function PlanetLabel({ id, name, registry }: LabelProps) {
  const selected = useSolarSystemStore((state) => state.selectedPlanetId === id)
  const highlighted = useSolarSystemStore((state) => selectHighlightedId(state) === id)
  const selectPlanet = useSolarSystemStore((state) => state.selectPlanet)
  const hoverPlanet = useSolarSystemStore((state) => state.hoverPlanet)
  const unhoverPlanet = useSolarSystemStore((state) => state.unhoverPlanet)
  const focusPlanet = useSolarSystemStore((state) => state.focusPlanet)
  const unfocusPlanet = useSolarSystemStore((state) => state.unfocusPlanet)

  // Selected = underline (not only color). Hover and keyboard focus share one look.
  const stateClasses = selected
    ? 'bg-sky-400/25 underline decoration-sky-300 decoration-2 underline-offset-4'
    : highlighted
      ? 'bg-slate-700/90'
      : 'bg-slate-950/70'

  return (
    <li
      ref={(element) => registry.setLabel(id, element)}
      className="pointer-events-none absolute top-0 left-0 opacity-0 transition-opacity duration-150 motion-reduce:transition-none"
    >
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => selectPlanet(id)}
        onPointerEnter={() => hoverPlanet(id)}
        onPointerLeave={() => unhoverPlanet(id)}
        // Only keyboard focus highlights: after a mouse click the pointer already does.
        onFocus={(event) => {
          if (event.currentTarget.matches(':focus-visible')) focusPlanet(id)
        }}
        onBlur={() => unfocusPlanet(id)}
        className={`cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap text-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 ${stateClasses}`}
      >
        {name}
      </button>
    </li>
  )
}

export function PlanetLabels({
  bodies,
  registry,
}: {
  bodies: readonly Planet[]
  registry: OverlayRegistry
}) {
  return (
    <ul aria-label="Solar system bodies">
      {bodies.map((body) => (
        <PlanetLabel key={body.id} id={body.id} name={body.name} registry={registry} />
      ))}
    </ul>
  )
}
