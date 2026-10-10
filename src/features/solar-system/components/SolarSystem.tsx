import { useCursor } from '@react-three/drei'
import { Fragment } from 'react'
import { useSimulationDriver } from '@/features/solar-system/hooks/useSimulationDriver'
import { getStartAngle } from '@/features/solar-system/utils/orbit'
import { toSceneDistance } from '@/features/solar-system/utils/scale'
import type { SimulationClock } from '@/features/solar-system/utils/simulationClock'
import { selectHighlightedId, useSolarSystemStore } from '@/store/solarSystemStore'
import type { Planet as PlanetData } from '@/types/planet'
import { Lighting } from './Lighting'
import { Orbit } from './Orbit'
import { Planet } from './Planet'
import { Stars } from './Stars'
import { Sun } from './Sun'

interface SolarSystemProps {
  planets: readonly PlanetData[]
  clock: SimulationClock
}

export function SolarSystem({ planets, clock }: SolarSystemProps) {
  const selectedId = useSolarSystemStore((state) => state.selectedPlanetId)
  const hoveredId = useSolarSystemStore((state) => state.hoveredPlanetId)
  const highlightedId = useSolarSystemStore(selectHighlightedId)
  const showOrbits = useSolarSystemStore((state) => state.showOrbits)
  const showStars = useSolarSystemStore((state) => state.showStars)
  const selectPlanet = useSolarSystemStore((state) => state.selectPlanet)
  const hoverPlanet = useSolarSystemStore((state) => state.hoverPlanet)
  const unhoverPlanet = useSolarSystemStore((state) => state.unhoverPlanet)

  useCursor(hoveredId !== null)
  useSimulationDriver(clock)

  const handlers = {
    onSelect: selectPlanet,
    onHover: hoverPlanet,
    onHoverEnd: unhoverPlanet,
  }
  const sun = planets.find((body) => body.type === 'star')
  const orbitingBodies = planets.filter((body) => body.type !== 'star')

  return (
    <>
      <Lighting />
      {/* Hidden, not unmounted: showing the stars again never rebuilds the field. */}
      <group visible={showStars}>
        <Stars />
      </group>
      {sun && <Sun data={sun} clock={clock} {...handlers} />}
      {orbitingBodies.map((body, index) => (
        <Fragment key={body.id}>
          <Orbit radius={toSceneDistance(body.distanceFromSun)} visible={showOrbits} />
          <Planet
            data={body}
            startAngle={getStartAngle(index)}
            clock={clock}
            selected={selectedId === body.id}
            hovered={highlightedId === body.id}
            {...handlers}
          />
        </Fragment>
      ))}
    </>
  )
}
