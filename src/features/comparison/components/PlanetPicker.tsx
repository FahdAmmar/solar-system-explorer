import { useId } from 'react'
import { PlanetSwatch } from '@/features/planets/components/PlanetSwatch'
import type { Planet } from '@/types/planet'

interface PlanetPickerProps {
  label: string
  planets: readonly Planet[]
  value: Planet
  /** The body chosen on the other side. It stays in the list but cannot be picked twice. */
  otherId: string
  onChange: (id: string) => void
}

// A native <select>: keyboard, screen reader and touch support come for free, and phones
// show their own picker. `color-scheme: dark` makes the open list match the dark theme.
export function PlanetPicker({
  label,
  planets,
  value,
  otherId,
  onChange,
}: PlanetPickerProps) {
  const selectId = useId()

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
      <PlanetSwatch color={value.color} className="size-12 sm:size-16" />
      <label
        htmlFor={selectId}
        className="text-xs tracking-widest text-ink-muted uppercase"
      >
        {label}
      </label>
      <select
        id={selectId}
        value={value.id}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 w-full max-w-44 cursor-pointer rounded-full border border-edge-strong bg-panel px-4 text-base font-semibold text-ink [color-scheme:dark] transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
      >
        {planets.map((planet) => (
          <option key={planet.id} value={planet.id} disabled={planet.id === otherId}>
            {planet.name}
          </option>
        ))}
      </select>
    </div>
  )
}
