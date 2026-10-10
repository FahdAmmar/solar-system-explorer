import { buttonClass } from '@/components/ui/buttonClass'
import { useSolarSystemStore } from '@/store/solarSystemStore'
import type { Planet } from '@/types/planet'
import { PlanetDetails } from './PlanetDetails'

// Decides what the information area shows: nothing selected (a hint), a selection that no
// longer exists (an error with a way out), or the planet's details.
export function PlanetInfoPanel({ planets }: { planets: readonly Planet[] }) {
  const selectedId = useSolarSystemStore((state) => state.selectedPlanetId)
  const selectPlanet = useSolarSystemStore((state) => state.selectPlanet)
  const planet = selectedId ? planets.find((body) => body.id === selectedId) : undefined

  return (
    <>
      {/* Always in the page, so screen readers hear changes (a region added later is not announced). */}
      <p className="sr-only" aria-live="polite">
        {planet ? `${planet.name} selected. Details are shown below.` : ''}
      </p>

      {planet && <PlanetDetails key={planet.id} planet={planet} />}

      {!selectedId && (
        <p className="rounded-full glass-panel px-4 py-2 text-center text-xs text-ink-muted dock:absolute dock:right-3 dock:bottom-3">
          Select a planet, or search, to see its details.
        </p>
      )}

      {selectedId && !planet && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-2xl glass-panel p-3 dock:absolute dock:top-3 dock:right-3 dock:w-[min(22rem,calc(50%-1.5rem))]"
        >
          <p className="text-sm">That body is not available.</p>
          <button
            type="button"
            onClick={() => selectPlanet(null)}
            className={buttonClass('secondary')}
          >
            Clear selection
          </button>
        </div>
      )}
    </>
  )
}
