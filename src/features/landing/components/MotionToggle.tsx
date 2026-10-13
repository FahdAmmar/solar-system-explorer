import { buttonClass } from '@/components/ui/buttonClass'
import { PauseIcon, PlayIcon } from '@/components/ui/icons'
import { useSolarSystemStore } from '@/store/solarSystemStore'

// The planets and the stars move by themselves, so people need a way to stop them (WCAG 2.2.2).
// It shares the Explore page's pause state: pausing here keeps the simulation paused there.
export function MotionToggle() {
  const isPaused = useSolarSystemStore((state) => state.isPaused)
  const togglePause = useSolarSystemStore((state) => state.togglePause)

  return (
    <button
      type="button"
      onClick={togglePause}
      className={`${buttonClass('secondary')} absolute right-3 bottom-3 z-10 sm:right-6 sm:bottom-6`}
    >
      {isPaused ? <PlayIcon /> : <PauseIcon />}
      {isPaused ? 'Play motion' : 'Pause motion'}
    </button>
  )
}
