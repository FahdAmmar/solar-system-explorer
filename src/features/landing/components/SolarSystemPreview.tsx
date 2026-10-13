import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { SilentErrorBoundary } from '@/components/common/SilentErrorBoundary'
import { usePlanets } from '@/hooks/queries/usePlanets'
import { isWebGLSupported } from '@/features/solar-system/utils/webgl'

const loadPreviewScene = () => import('./PreviewScene')
const PreviewScene = lazy(loadPreviewScene)

// A partial, decorative view of the real solar system behind the hero. It is optional in every
// way: no WebGL, no planet data, a slow connection or a crash all just leave the stars.
export function SolarSystemPreview({ enabled }: { enabled: boolean }) {
  const { data: planets } = usePlanets()
  const [mounted, setMounted] = useState(false)
  const [ready, setReady] = useState(false)

  // Waits for `enabled` (the hero has finished its entrance). Downloading and setting up the 3D
  // scene (compiling the code, generating textures, creating the GL context) keeps the main
  // thread busy, and that would stutter the entrance if it ran at the same time.
  useEffect(() => {
    if (!enabled || !isWebGLSupported()) return
    let cancelled = false
    loadPreviewScene()
      .then(() => {
        if (!cancelled) setMounted(true)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [enabled])

  const visiblePlanets = useMemo(() => planets ?? [], [planets])
  if (!mounted || visiblePlanets.length === 0) return null

  return (
    <SilentErrorBoundary>
      <div
        aria-hidden="true"
        // The page is not interactive through this layer: it is a picture.
        className={`pointer-events-none absolute inset-0 transition-opacity duration-[1600ms] motion-reduce:transition-none ${
          ready ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Suspense fallback={null}>
          <PreviewScene planets={visiblePlanets} onReady={() => setReady(true)} />
        </Suspense>
      </div>
    </SilentErrorBoundary>
  )
}
