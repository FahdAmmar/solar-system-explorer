import { useEffect } from 'react'
import { StatusScreen } from '@/components/common/StatusScreen'
import { buttonClass } from '@/components/ui/buttonClass'
import { getUserErrorMessage } from '@/utils/errorMessage'

interface PlanetsUnavailableProps {
  /** `null` means the request worked but returned no planets. */
  error: unknown
  isRetrying: boolean
  onRetry: () => void
}

// Shown when there is no planet data to draw: the request failed, or the list came back empty.
export function PlanetsUnavailable({
  error,
  isRetrying,
  onRetry,
}: PlanetsUnavailableProps) {
  const failed = error !== null

  useEffect(() => {
    if (failed) console.error(error)
  }, [failed, error])

  return (
    <StatusScreen
      variant={failed ? 'error' : 'empty'}
      title={failed ? 'Could not load the planets' : 'No planets to show'}
      message={
        failed
          ? getUserErrorMessage(error)
          : 'The data source returned no planets. Check again in a moment.'
      }
    >
      {/* aria-disabled, not disabled: the button keeps keyboard focus while it retries. */}
      <button
        type="button"
        aria-disabled={isRetrying}
        onClick={() => {
          if (!isRetrying) onRetry()
        }}
        className={buttonClass('primary')}
      >
        {isRetrying ? 'Trying again…' : failed ? 'Try again' : 'Check again'}
      </button>
    </StatusScreen>
  )
}
