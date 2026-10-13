import type { ReactNode } from 'react'
import { StatusScreen } from '@/components/common/StatusScreen'
import { usePlanets } from '@/hooks/queries/usePlanets'
import type { Planet } from '@/types/planet'
import { PlanetsUnavailable } from './PlanetsUnavailable'

// Decides what a page shows from the planet query: loading, no data (error or empty), or the
// page itself. Every page that needs planets goes through here, so they all behave the same.
export function PlanetsGate({
  children,
}: {
  children: (planets: readonly Planet[]) => ReactNode
}) {
  const { data: planets, isError, error, isFetching, refetch } = usePlanets()

  // Checked on `data`, not on the status: a failed background refresh must not remove a page
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

  return <>{children(planets)}</>
}
