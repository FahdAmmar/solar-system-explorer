import { useEffect } from 'react'
import { useSolarSystemStore } from '@/store/solarSystemStore'

// Pointer-out and blur never fire when the scene unmounts mid-hover or mid-focus.
export function useResetHighlightOnUnmount() {
  const hoverPlanet = useSolarSystemStore((state) => state.hoverPlanet)
  const focusPlanet = useSolarSystemStore((state) => state.focusPlanet)

  useEffect(
    () => () => {
      hoverPlanet(null)
      focusPlanet(null)
    },
    [hoverPlanet, focusPlanet],
  )
}
