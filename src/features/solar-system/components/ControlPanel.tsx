import { buttonClass } from '@/components/ui/buttonClass'
import { PauseIcon, PlayIcon, ResetIcon } from '@/components/ui/icons'
import { useSolarSystemStore } from '@/store/solarSystemStore'
import { SpeedSlider } from './SpeedSlider'
import { ToggleChip } from './ToggleChip'

// Everything the person can change about the simulation and the view, in one place.
export function ControlPanel() {
  const isPaused = useSolarSystemStore((state) => state.isPaused)
  const simulationSpeed = useSolarSystemStore((state) => state.simulationSpeed)
  const showOrbits = useSolarSystemStore((state) => state.showOrbits)
  const showLabels = useSolarSystemStore((state) => state.showLabels)
  const showStars = useSolarSystemStore((state) => state.showStars)
  const togglePause = useSolarSystemStore((state) => state.togglePause)
  const setSimulationSpeed = useSolarSystemStore((state) => state.setSimulationSpeed)
  const toggleOrbits = useSolarSystemStore((state) => state.toggleOrbits)
  const toggleLabels = useSolarSystemStore((state) => state.toggleLabels)
  const toggleStars = useSolarSystemStore((state) => state.toggleStars)
  const resetView = useSolarSystemStore((state) => state.resetView)

  return (
    <section
      aria-label="Simulation controls"
      className="rounded-2xl glass-panel p-2.5 dock:absolute dock:bottom-3 dock:left-3 dock:w-[min(28rem,calc(50%-1.5rem))] dock:p-3"
    >
      <div className="flex items-center gap-2">
        <button type="button" onClick={togglePause} className={buttonClass('primary')}>
          {isPaused ? <PlayIcon /> : <PauseIcon />}
          {isPaused ? 'Play' : 'Pause'}
        </button>
        <SpeedSlider speed={simulationSpeed} onChange={setSimulationSpeed} />
        <button
          type="button"
          onClick={resetView}
          className={`${buttonClass('secondary')} size-11 shrink-0 px-0`}
        >
          <ResetIcon />
          <span className="sr-only">Reset view</span>
        </button>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        <ToggleChip label="Orbits" pressed={showOrbits} onToggle={toggleOrbits} />
        <ToggleChip label="Labels" pressed={showLabels} onToggle={toggleLabels} />
        <ToggleChip label="Stars" pressed={showStars} onToggle={toggleStars} />
      </div>
    </section>
  )
}
