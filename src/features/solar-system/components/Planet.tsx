import { memo } from 'react'
import {
  HOVER_EMISSIVE_INTENSITY,
  SELECTED_EMISSIVE_INTENSITY,
} from '@/features/solar-system/data/interaction'
import type { BodyHandlers } from '@/features/solar-system/types/interaction'
import { unitSphereGeometry } from '@/features/solar-system/utils/geometries'
import { getBodyRadius, toSceneDistance } from '@/features/solar-system/utils/scale'
import type { Planet as PlanetData } from '@/types/planet'
import { SaturnRings } from './SaturnRings'
import { SelectableBody } from './SelectableBody'

interface PlanetProps extends BodyHandlers {
  data: PlanetData
  /** Position on the orbit in radians (0 = +X axis). */
  startAngle: number
  selected: boolean
  hovered: boolean
}

function getEmissiveIntensity(selected: boolean, hovered: boolean): number {
  if (selected) return SELECTED_EMISSIVE_INTENSITY
  return hovered ? HOVER_EMISSIVE_INTENSITY : 0
}

// memo: only the planets whose selected/hovered state changed re-render.
export const Planet = memo(function Planet({
  data,
  startAngle,
  selected,
  hovered,
  ...handlers
}: PlanetProps) {
  const radius = getBodyRadius(data)
  const orbitRadius = toSceneDistance(data.distanceFromSun)

  return (
    // The outer group is the orbit pivot: turning it moves the planet along its orbit.
    <group rotation-y={startAngle}>
      <group position-x={orbitRadius}>
        <SelectableBody id={data.id} radius={radius} {...handlers}>
          <mesh geometry={unitSphereGeometry} scale={radius} dispose={null}>
            <meshStandardMaterial
              color={data.color}
              emissive={data.color}
              emissiveIntensity={getEmissiveIntensity(selected, hovered)}
              roughness={1}
            />
          </mesh>
          {data.id === 'saturn' && <SaturnRings planetRadius={radius} />}
        </SelectableBody>
      </group>
    </group>
  )
})
