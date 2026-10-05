import { memo } from 'react'
import { AdditiveBlending } from 'three'
import { useDisposable } from '@/features/solar-system/hooks/useDisposable'
import type { BodyHandlers } from '@/features/solar-system/types/interaction'
import { unitSphereGeometry } from '@/features/solar-system/utils/geometries'
import { getBodyRadius } from '@/features/solar-system/utils/scale'
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
}

export const Sun = memo(function Sun({ data, ...handlers }: SunProps) {
  const radius = getBodyRadius(data)
  const glowTexture = useDisposable(createGlowTexture)
  const glowSize = radius * GLOW_SIZE_IN_RADII

  return (
    <SelectableBody id={data.id} radius={radius} {...handlers}>
      <mesh geometry={unitSphereGeometry} scale={radius} dispose={null}>
        <meshStandardMaterial color="#000000" emissive={data.color} toneMapped={false} />
      </mesh>
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
