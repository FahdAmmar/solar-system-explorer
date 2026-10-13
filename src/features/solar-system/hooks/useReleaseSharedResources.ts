import { useEffect } from 'react'
import { disposeSharedResources } from '@/features/solar-system/utils/sharedResources'

// Call it in the component that owns a <Canvas>. The shared geometries and materials outlive
// every canvas, so without this each visit to a 3D page would leave a renderer's bookkeeping
// attached to them for the rest of the session.
export function useReleaseSharedResources() {
  useEffect(() => disposeSharedResources, [])
}
