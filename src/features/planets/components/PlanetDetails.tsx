import { useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ChevronIcon, CloseIcon } from '@/components/ui/icons'
import { buttonClass } from '@/components/ui/buttonClass'
import { useEntranceAnimation } from '@/hooks/useEntranceAnimation'
import { useSolarSystemStore } from '@/store/solarSystemStore'
import type { Planet } from '@/types/planet'
import { getPlanetFacts, PLANET_TYPE_LABELS } from '../utils/formatPlanet'
import { PlanetSwatch } from './PlanetSwatch'

// On phones only the key facts show at first, so the 3D scene keeps most of the screen.
// From the lg breakpoint up there is room for everything and the toggle disappears.
export function PlanetDetails({ planet }: { planet: Planet }) {
  const titleId = useId()
  const moreId = useId()
  const rootRef = useRef<HTMLElement>(null)
  const [expanded, setExpanded] = useState(false)
  const selectPlanet = useSolarSystemStore((state) => state.selectPlanet)
  useEntranceAnimation(rootRef)

  const moreClass = expanded ? 'block' : 'hidden lg:block'

  return (
    <section
      ref={rootRef}
      aria-labelledby={titleId}
      className="max-h-[55dvh] overflow-y-auto rounded-2xl glass-panel p-3 lg:p-5 dock:absolute dock:top-3 dock:right-3 dock:max-h-[calc(100%-1.5rem)] dock:w-[min(22rem,calc(50%-1.5rem))]"
    >
      <header className="flex items-center gap-3">
        <PlanetSwatch color={planet.color} className="size-10 lg:size-14" />
        <div className="min-w-0 flex-1">
          <p className="text-xs tracking-widest text-ink-muted uppercase">
            {PLANET_TYPE_LABELS[planet.type]}
          </p>
          <h2 id={titleId} className="truncate text-xl font-semibold tracking-wide">
            {planet.name}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => selectPlanet(null)}
          aria-label={`Close details for ${planet.name}`}
          className={`${buttonClass('ghost')} size-11 shrink-0 px-0`}
        >
          <CloseIcon />
        </button>
      </header>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 lg:mt-5">
        {getPlanetFacts(planet).map((fact) => (
          <div key={fact.id} className={fact.primary ? undefined : moreClass}>
            <dt className="text-xs text-ink-muted">{fact.label}</dt>
            <dd className="text-sm font-medium tabular-nums">{fact.value}</dd>
          </div>
        ))}
      </dl>

      <div id={moreId} className={`${moreClass} mt-4`}>
        <p className="text-sm leading-relaxed text-ink-muted">{planet.description}</p>
        <p className="mt-3 text-xs text-ink-muted">
          Mean temperature. For gas giants, measured at the 1 bar pressure level.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => selectPlanet(planet.id)}
            className={buttonClass('primary')}
          >
            Focus camera
          </button>
          <Link to="/compare" className={buttonClass('secondary')}>
            Compare
          </Link>
        </div>
      </div>

      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={moreId}
        onClick={() => setExpanded((value) => !value)}
        className={`${buttonClass('ghost')} mt-2 w-full lg:hidden`}
      >
        {expanded ? 'Fewer details' : 'More details'}
        <ChevronIcon up={expanded} />
      </button>
    </section>
  )
}
