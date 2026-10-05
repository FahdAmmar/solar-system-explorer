import { useEffect } from 'react'
import { useSolarSystemStore } from '@/store/solarSystemStore'

export function useDeselectOnEscape() {
  const selectPlanet = useSolarSystemStore((state) => state.selectPlanet)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') selectPlanet(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectPlanet])
}
