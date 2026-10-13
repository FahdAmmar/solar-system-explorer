import { PlanetSwatch } from '@/features/planets/components/PlanetSwatch'
import type { Planet } from '@/types/planet'

// Even the smallest body stays visible. The Sun next to Mercury would otherwise leave a dot
// that is not there.
const MIN_DISC_SIZE = '4px'

interface SizeComparisonProps {
  first: Planet
  second: Planet
  /** Each size as a share (0 to 1) of the larger body. */
  shares: readonly [number, number]
  /** Text alternative for the picture, such as "Earth is 1.9x as wide as Mars". */
  summary: string | null
}

// Two discs in true relative size: the one thing the 3D scene cannot show, because it
// compresses sizes on purpose. The text rows below carry the same information.
export function SizeComparison({ first, second, shares, summary }: SizeComparisonProps) {
  const bodies = [first, second] as const

  return (
    <figure className="[--disc-max:7rem] sm:[--disc-max:11rem]">
      <div
        role={summary ? 'img' : undefined}
        aria-label={summary ?? undefined}
        aria-hidden={summary ? undefined : true}
        className="flex h-[calc(var(--disc-max)+2rem)] items-stretch justify-center gap-8 sm:gap-16"
      >
        {bodies.map((planet, index) => (
          <div
            key={planet.id}
            className="flex w-28 flex-col items-center justify-end gap-2 sm:w-40"
          >
            <div
              className="transition-[width] duration-500 motion-reduce:transition-none"
              style={{
                width: `max(${MIN_DISC_SIZE}, calc(var(--disc-max) * ${shares[index] ?? 0}))`,
                aspectRatio: '1',
              }}
            >
              <PlanetSwatch color={planet.color} className="size-full" />
            </div>
            <span className="text-sm font-medium">{planet.name}</span>
          </div>
        ))}
      </div>
      <figcaption className="mt-1 text-center text-xs text-ink-muted">
        Drawn to relative size
      </figcaption>
    </figure>
  )
}
