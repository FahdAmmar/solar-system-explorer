import { memo, useRef } from 'react'
import { AdditiveBlending, type Group } from 'three'
import { useBodySpin } from '@/features/solar-system/hooks/useBodySpin'
import { useDisposable } from '@/features/solar-system/hooks/useDisposable'
import { useSurfaceTexture } from '@/features/solar-system/hooks/useSurfaceTexture'
import type { BodyHandlers } from '@/features/solar-system/types/interaction'
import { unitSphereGeometry } from '@/features/solar-system/utils/geometries'
import { getBodyRadius } from '@/features/solar-system/utils/scale'
import type { SimulationClock } from '@/features/solar-system/utils/simulationClock'
import { createGlowTexture } from '@/features/solar-system/utils/textures'
import type { Planet } from '@/types/planet'
import { SelectableBody } from './SelectableBody'

const LIGHT_COLOR = '#fff1d6'
// With zero decay the light does not weaken with distance, so outer planets stay visible.
// Distances are not physical in this scene anyway.
const LIGHT_INTENSITY = Math.PI
const LIGHT_DECAY = 0
const GLOW_SIZE_IN_RADII = 3.5

interface SunProps extends BodyHandlers {
  data: Planet
  clock: SimulationClock
}

export const Sun = memo(function Sun({ data, clock, ...handlers }: SunProps) {
  const radius = getBodyRadius(data)
  const glowTexture = useDisposable(createGlowTexture)
  const surface = useSurfaceTexture(data)
  const spinRef = useRef<Group>(null)
  const glowSize = radius * GLOW_SIZE_IN_RADII

  useBodySpin(spinRef, clock, data.rotationPeriod)

  return (
    <SelectableBody id={data.id} radius={radius} {...handlers}>
      {/* Only the surface spins: the glow sprite faces the camera and the light has no direction. */}
      <group ref={spinRef}>
        <mesh geometry={unitSphereGeometry} scale={radius} dispose={null}>
          {/* The texture carries the colour, so the emissive colour is neutral white. */}
          <meshStandardMaterial
            color="#000000"
            emissive="#ffffff"
            emissiveMap={surface}
            toneMapped={false}
          />
        </mesh>
      </group>
      {/* The glow is a square sprite: excluded from picking so its corners do not select the Sun. */}
      <sprite scale={[glowSize, glowSize, 1]} raycast={() => null}>
        <spriteMaterial
          map={glowTexture}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
      <pointLight color={LIGHT_COLOR} intensity={LIGHT_INTENSITY} decay={LIGHT_DECAY} />
    </SelectableBody>
  )
})
