import { useEffect } from 'react'
import { useSolarSystemStore } from '@/store/solarSystemStore'

export function useDeselectOnEscape() {
  const selectPlanet = useSolarSystemStore((state) => state.selectPlanet)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // defaultPrevented: another control (the search box) already used this Escape press.
      if (event.key === 'Escape' && !event.defaultPrevented) selectPlanet(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectPlanet])
}
