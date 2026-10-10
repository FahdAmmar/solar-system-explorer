import { useEffect, useMemo } from 'react'
import { createSurfaceTexture } from '@/features/solar-system/utils/textures'
import type { Planet } from '@/types/planet'

// One texture per body, created once and freed on unmount.
export function useSurfaceTexture(body: Planet) {
  const texture = useMemo(() => createSurfaceTexture(body), [body])
  useEffect(() => () => texture.dispose(), [texture])
  return texture
}
