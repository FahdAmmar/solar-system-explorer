import { useId } from 'react'
import {
  SIMULATION_SPEEDS,
  type SimulationSpeed,
} from '@/features/solar-system/data/simulation'

const LAST_STEP = SIMULATION_SPEEDS.length - 1

const formatSpeed = (speed: number) => `${speed}×`

interface SpeedSliderProps {
  speed: SimulationSpeed
  onChange: (speed: SimulationSpeed) => void
}

// The speeds are a fixed list (0.1x ... 100x), so the slider moves by index, not by value.
export function SpeedSlider({ speed, onChange }: SpeedSliderProps) {
  const inputId = useId()
  const step = Math.max(SIMULATION_SPEEDS.indexOf(speed), 0)

  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline justify-between text-xs">
        <label htmlFor={inputId} className="text-ink-muted">
          Speed
        </label>
        <output htmlFor={inputId} className="font-medium text-ink tabular-nums">
          {formatSpeed(speed)}
        </output>
      </div>
      <input
        id={inputId}
        type="range"
        min={0}
        max={LAST_STEP}
        step={1}
        value={step}
        aria-valuetext={formatSpeed(speed)}
        onChange={(event) => {
          const next = SIMULATION_SPEEDS[Number(event.target.value)]
          if (next !== undefined) onChange(next)
        }}
        className="h-8 w-full cursor-pointer accent-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      />
    </div>
  )
}
