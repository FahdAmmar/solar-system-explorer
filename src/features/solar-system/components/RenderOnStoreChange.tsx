import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { useSolarSystemStore } from '@/store/solarSystemStore'

// Only matters while the canvas draws on demand (paused). A hover, a selection or a toggle can
// change what is on screen without touching the 3D scene (labels and rings are DOM), so every
// store update asks for one frame. Camera moves ask for their own through the controls.
export function RenderOnStoreChange() {
  const invalidate = useThree((state) => state.invalidate)
  useEffect(() => useSolarSystemStore.subscribe(() => invalidate()), [invalidate])
  return null
}
