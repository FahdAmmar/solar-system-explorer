import { useRef } from 'react'
import { useSearchParams } from 'react-router'
import { StatusScreen } from '@/components/common/StatusScreen'
import { buttonClass } from '@/components/ui/buttonClass'
import { SwapIcon } from '@/components/ui/icons'
import { useEntranceAnimation } from '@/hooks/useEntranceAnimation'
import type { Planet } from '@/types/planet'
import { useBarReveal } from '../hooks/useBarReveal'
import { getComparisonRows, getSizeShares } from '../utils/compareMetrics'
import { type ComparisonPair, resolvePair } from '../utils/resolvePair'
import { ComparisonRows } from './ComparisonRows'
import { PlanetPicker } from './PlanetPicker'
import { SizeComparison } from './SizeComparison'

interface ComparisonPanelProps {
  planets: readonly Planet[]
  pair: ComparisonPair
  onChange: (firstId: string, secondId: string) => void
}

function ComparisonPanel({ planets, pair, onChange }: ComparisonPanelProps) {
  const { first, second } = pair
  const rootRef = useRef<HTMLDivElement>(null)
  const rows = getComparisonRows(first, second)
  const diameterSummary = rows.find((row) => row.id === 'diameter')?.summary ?? null

  useEntranceAnimation(rootRef)
  useBarReveal(rootRef, `${first.id}:${second.id}`)

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">
      <header className="text-center">
        <h1 className="text-2xl font-semibold sm:text-4xl">Compare planets</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Pick two bodies to see how they stack up.
        </p>
      </header>

      <div ref={rootRef} className="mt-6 sm:mt-8">
        <section
          aria-label="Choose what to compare"
          className="mx-auto flex max-w-md items-end gap-2 sm:gap-4"
        >
          <PlanetPicker
            label="First planet"
            planets={planets}
            value={first}
            otherId={second.id}
            onChange={(id) => onChange(id, second.id)}
          />
          <button
            type="button"
            onClick={() => onChange(second.id, first.id)}
            className={`${buttonClass('secondary')} size-11 shrink-0 px-0`}
          >
            <SwapIcon />
            <span className="sr-only">Swap planets</span>
          </button>
          <PlanetPicker
            label="Second planet"
            planets={planets}
            value={second}
            otherId={first.id}
            onChange={(id) => onChange(first.id, id)}
          />
        </section>

        {/* Announces the new pair to screen readers when a choice changes. */}
        <p className="sr-only" aria-live="polite">
          Comparing {first.name} with {second.name}
        </p>

        <div className="mt-6">
          <SizeComparison
            first={first}
            second={second}
            shares={getSizeShares(first, second)}
            summary={diameterSummary}
          />
        </div>

        <section
          aria-label={`${first.name} compared with ${second.name}`}
          className="mt-4 rounded-2xl glass-panel px-4 sm:px-6"
        >
          <ComparisonRows first={first} second={second} rows={rows} />
        </section>

        <p className="mt-4 text-center text-xs text-ink-muted">
          Each bar is measured against the larger of the two values. Temperature bars
          start at absolute zero (−273&nbsp;°C), not at 0&nbsp;°C.
        </p>
      </div>
    </div>
  )
}

// The pair lives in the URL (/compare?a=earth&b=mars): a link, a refresh and the back button
// all keep it, and other pages can link to a comparison.
export function ComparisonView({ planets }: { planets: readonly Planet[] }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const pair = resolvePair(planets, searchParams.get('a'), searchParams.get('b'))

  if (!pair) {
    return (
      <StatusScreen
        variant="empty"
        title="Not enough planets to compare"
        message="Comparing needs at least two bodies."
      />
    )
  }

  return (
    <ComparisonPanel
      planets={planets}
      pair={pair}
      // `replace`: picking from a list should not fill the back button with every choice.
      onChange={(a, b) => setSearchParams({ a, b }, { replace: true })}
    />
  )
}
