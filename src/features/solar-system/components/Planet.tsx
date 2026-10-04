import { unitSphereGeometry } from '@/features/solar-system/utils/geometries'
import { getBodyRadius, toSceneDistance } from '@/features/solar-system/utils/scale'
import type { Planet as PlanetData } from '@/types/planet'
import { SaturnRings } from './SaturnRings'

interface PlanetProps {
  data: PlanetData
  /** Position on the orbit in radians (0 = +X axis). */
  startAngle: number
}

export function Planet({ data, startAngle }: PlanetProps) {
  const radius = getBodyRadius(data)
  const orbitRadius = toSceneDistance(data.distanceFromSun)

  return (
    // The outer group is the orbit pivot: turning it moves the planet along its orbit.
    <group rotation-y={startAngle}>
      <group position-x={orbitRadius}>
        <mesh geometry={unitSphereGeometry} scale={radius} dispose={null}>
          <meshStandardMaterial color={data.color} roughness={1} />
        </mesh>
        {data.id === 'saturn' && <SaturnRings planetRadius={radius} />}
      </group>
    </group>
  )
}
