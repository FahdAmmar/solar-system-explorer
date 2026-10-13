import { PlanetSwatch } from '@/features/planets/components/PlanetSwatch'
import type { Planet } from '@/types/planet'
import type { MetricRow, MetricSide } from '../utils/compareMetrics'

// A value that exists but is tiny next to the other still gets a visible stub of a bar.
const MIN_BAR_PERCENT = 2

const toPercent = (share: number) =>
  share > 0 ? `${Math.max(share * 100, MIN_BAR_PERCENT)}%` : '0%'

interface SideProps {
  planet: Planet
  side: MetricSide
  /** The left side grows leftwards from the centre line; the right side grows rightwards. */
  edge: 'left' | 'right'
}

function Side({ planet, side, edge }: SideProps) {
  const isLeft = edge === 'left'

  return (
    <div
      className={`flex min-w-0 flex-col gap-1.5 ${
        isLeft ? 'items-end border-r border-edge pr-3 text-right' : 'items-start pl-3'
      }`}
    >
      <p className="text-sm font-semibold tabular-nums">
        <span className="sr-only">{planet.name}: </span>
        {side.text}
      </p>
      {/* The bar repeats the number as a picture; screen readers get the number itself. */}
      <div
        aria-hidden="true"
        className={`flex h-2.5 w-full rounded-full bg-white/10 ${isLeft ? 'justify-end' : ''}`}
      >
        <div
          data-bar
          className="h-full rounded-full"
          style={{
            width: toPercent(side.share),
            backgroundColor: planet.color,
            transformOrigin: isLeft ? 'right center' : 'left center',
          }}
        />
      </div>
    </div>
  )
}

interface ComparisonRowsProps {
  first: Planet
  second: Planet
  rows: readonly MetricRow[]
}

export function ComparisonRows({ first, second, rows }: ComparisonRowsProps) {
  return (
    <div>
      {/* Stays at the top while the rows scroll, so it is always clear which side is which. */}
      <div
        aria-hidden="true"
        className="sticky top-0 z-10 grid grid-cols-2 border-b border-edge bg-space py-2.5 text-sm font-semibold"
      >
        <span className="flex items-center justify-end gap-2 pr-3">
          {first.name}
          <PlanetSwatch color={first.color} className="size-3.5" />
        </span>
        <span className="flex items-center gap-2 pl-3">
          <PlanetSwatch color={second.color} className="size-3.5" />
          {second.name}
        </span>
      </div>

      <ul className="divide-y divide-edge">
        {rows.map((row) => (
          <li key={row.id} className="py-4">
            <h2 className="text-center text-sm font-semibold">{row.label}</h2>
            {row.summary && (
              <p className="mt-0.5 text-center text-xs text-ink-muted">{row.summary}</p>
            )}
            <div className="mt-3 grid grid-cols-2">
              <Side planet={first} side={row.first} edge="left" />
              <Side planet={second} side={row.second} edge="right" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
