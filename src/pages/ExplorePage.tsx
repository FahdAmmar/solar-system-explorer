import { StatusScreen } from '@/components/common/StatusScreen'
import { usePlanets } from '@/hooks/queries/usePlanets'
import { ControlPanel } from '@/features/solar-system/components/ControlPanel'
import { SolarSystemCanvas } from '@/features/solar-system/components/SolarSystemCanvas'
import type { Planet } from '@/types/planet'
import { PlanetInfoPanel } from '@/features/planets/components/PlanetInfoPanel'
import { PlanetsUnavailable } from '@/features/planets/components/PlanetsUnavailable'
import { PlanetSearch } from '@/features/search/components/PlanetSearch'

// The scene itself. Small screens: a column (scene, then details, then controls), so nothing
// covers the scene. In the `dock` layout (wide, or short and wide) the scene fills the page and
// the panels float over it (see `dock:contents` below).
function ExploreScene({ planets }: { planets: readonly Planet[] }) {
  return (
    <div className="relative flex h-full flex-col">
      <h1 className="sr-only">Explore the solar system</h1>

      {/* A group, not an image: the planet labels inside are real buttons. */}
      <div
        role="group"
        aria-label="Interactive 3D solar system"
        className="relative min-h-0 flex-1 dock:absolute dock:inset-0"
      >
        <SolarSystemCanvas planets={planets} />
      </div>

      <div className="absolute top-3 right-3 left-3 z-20 sm:right-auto sm:w-80">
        <PlanetSearch planets={planets} />
      </div>

      {/* dock:contents removes this wrapper's box, so the panels position against the page. */}
      <div className="relative z-10 flex flex-col gap-2 p-2 md:grid md:grid-cols-2 md:items-end dock:contents">
        <PlanetInfoPanel planets={planets} />
        <ControlPanel />
      </div>
    </div>
  )
}

// Decides what the page shows from the planet query: loading, no data (error or empty), or the scene.
export default function ExplorePage() {
  const { data: planets, isError, error, isFetching, refetch } = usePlanets()

  // Checked on `data`, not on the status: a failed background refresh must not remove a scene
  // that is already showing good data.
  if (planets === undefined) {
    if (!isError) {
      return <StatusScreen variant="loading" title="Loading planetary data…" />
    }
    return (
      <PlanetsUnavailable
        error={error}
        isRetrying={isFetching}
        onRetry={() => void refetch()}
      />
    )
  }

  if (planets.length === 0) {
    return (
      <PlanetsUnavailable
        error={null}
        isRetrying={isFetching}
        onRetry={() => void refetch()}
      />
    )
  }

  return <ExploreScene planets={planets} />
}
