import { useFrame, useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import {
  createOverlayState,
  updateOverlay,
} from '@/features/solar-system/utils/overlayFrame'
import type { OverlayRegistry } from '@/features/solar-system/utils/overlayRegistry'
import type { Planet } from '@/types/planet'

// Runs inside the Canvas: each frame it moves the DOM labels and rings onto their bodies.
export function OverlayPositioner({
  bodies,
  registry,
}: {
  bodies: readonly Planet[]
  registry: OverlayRegistry
}) {
  const scene = useThree((state) => state.scene)
  const overlay = useMemo(
    () => createOverlayState(bodies, registry, scene),
    [bodies, registry, scene],
  )

  useFrame(({ camera, size }) => updateOverlay(overlay, camera, size))

  return null
}
