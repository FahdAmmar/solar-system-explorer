import { Fragment } from 'react'
import { getStartAngle } from '@/features/solar-system/utils/orbit'
import { toSceneDistance } from '@/features/solar-system/utils/scale'
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
  const sun = planets.find((body) => body.type === 'star')
  const orbitingBodies = planets.filter((body) => body.type !== 'star')

  return (
    <>
      <Lighting />
      <Stars />
      {sun && <Sun data={sun} />}
      {orbitingBodies.map((body, index) => (
        <Fragment key={body.id}>
          <Orbit radius={toSceneDistance(body.distanceFromSun)} />
          <Planet data={body} startAngle={getStartAngle(index)} />
        </Fragment>
      ))}
    </>
  )
}
