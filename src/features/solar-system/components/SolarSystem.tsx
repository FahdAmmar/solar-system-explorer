import { useCursor } from '@react-three/drei'
import { Fragment } from 'react'
import { getStartAngle } from '@/features/solar-system/utils/orbit'
import { toSceneDistance } from '@/features/solar-system/utils/scale'
import { selectHighlightedId, useSolarSystemStore } from '@/store/solarSystemStore'
import type { Planet as PlanetData } from '@/types/planet'
import { Lighting } from './Lighting'
import { Orbit } from './Orbit'
import { Planet } from './Planet'
import { Stars } from './Stars'
import { Sun } from './Sun'

interface SolarSystemProps {
  planets: readonly PlanetData[]
}

export function SolarSystem({ planets }: SolarSystemProps) {
  const selectedId = useSolarSystemStore((state) => state.selectedPlanetId)
  const hoveredId = useSolarSystemStore((state) => state.hoveredPlanetId)
  const highlightedId = useSolarSystemStore(selectHighlightedId)
  const selectPlanet = useSolarSystemStore((state) => state.selectPlanet)
  const hoverPlanet = useSolarSystemStore((state) => state.hoverPlanet)
  const unhoverPlanet = useSolarSystemStore((state) => state.unhoverPlanet)

  useCursor(hoveredId !== null)

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
      <Stars />
      {sun && <Sun data={sun} {...handlers} />}
      {orbitingBodies.map((body, index) => (
        <Fragment key={body.id}>
          <Orbit radius={toSceneDistance(body.distanceFromSun)} />
          <Planet
            data={body}
            startAngle={getStartAngle(index)}
            selected={selectedId === body.id}
            hovered={highlightedId === body.id}
            {...handlers}
          />
        </Fragment>
      ))}
    </>
  )
}
