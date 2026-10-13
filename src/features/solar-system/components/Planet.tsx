import { memo, useRef } from 'react'
import type { Group } from 'three'
import {
  HOVER_EMISSIVE_INTENSITY,
  SELECTED_EMISSIVE_INTENSITY,
} from '@/features/solar-system/data/interaction'
import { useBodySpin } from '@/features/solar-system/hooks/useBodySpin'
import { useOrbitalMotion } from '@/features/solar-system/hooks/useOrbitalMotion'
import { useSurfaceTexture } from '@/features/solar-system/hooks/useSurfaceTexture'
import type { BodyHandlers } from '@/features/solar-system/types/interaction'
import { unitSphereGeometry } from '@/features/solar-system/utils/geometries'
import { getBodyRadius, toSceneDistance } from '@/features/solar-system/utils/scale'
import type { SimulationClock } from '@/features/solar-system/utils/simulationClock'
import type { Planet as PlanetData } from '@/types/planet'
import { SaturnRings } from './SaturnRings'
import { SelectableBody } from './SelectableBody'

interface PlanetProps extends BodyHandlers {
  data: PlanetData
  /** Position on the orbit in radians (0 = +X axis) when the simulation starts. */
  startAngle: number
  clock: SimulationClock
  selected: boolean
  hovered: boolean
}

function getEmissiveIntensity(selected: boolean, hovered: boolean): number {
  if (selected) return SELECTED_EMISSIVE_INTENSITY
  return hovered ? HOVER_EMISSIVE_INTENSITY : 0
}

// memo: only the planets whose selected/hovered state changed re-render.
// Motion never goes through React: the hooks below write to the 3D objects every frame.
export const Planet = memo(function Planet({
  data,
  startAngle,
  clock,
  selected,
  hovered,
  ...handlers
}: PlanetProps) {
  const radius = getBodyRadius(data)
  const orbitRadius = toSceneDistance(data.distanceFromSun)
  const surface = useSurfaceTexture(data)
  const pivotRef = useRef<Group>(null)
  const spinRef = useRef<Group>(null)

  useOrbitalMotion(pivotRef, clock, data.orbitalPeriod, startAngle)
  useBodySpin(spinRef, clock, data.rotationPeriod)

  return (
    // The outer group is the orbit pivot: turning it moves the planet along its orbit.
    <group ref={pivotRef}>
      <group position-x={orbitRadius}>
        <SelectableBody id={data.id} radius={radius} {...handlers}>
          {/* The spin group holds everything that turns with the planet, including Saturn's rings. */}
          <group ref={spinRef}>
            <mesh geometry={unitSphereGeometry} scale={radius} dispose={null}>
              {/* Lambert, not Standard: these bodies are matte and unlit by anything but the Sun, so
                  PBR adds cost and nothing visible. It also avoids a three.js r186 leak: every renderer
                  that draws a Standard material stays attached to a shared lookup texture for good. */}
              <meshLambertMaterial
                map={surface}
                emissive={data.color}
                emissiveIntensity={getEmissiveIntensity(selected, hovered)}
              />
            </mesh>
            {data.id === 'saturn' && <SaturnRings planetRadius={radius} />}
          </group>
        </SelectableBody>
      </group>
    </group>
  )
})
