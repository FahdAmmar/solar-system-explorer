import { AdditiveBlending } from 'three'
import { useDisposable } from '@/features/solar-system/hooks/useDisposable'
import { unitSphereGeometry } from '@/features/solar-system/utils/geometries'
import { getBodyRadius } from '@/features/solar-system/utils/scale'
import { createGlowTexture } from '@/features/solar-system/utils/textures'
import type { Planet } from '@/types/planet'

const LIGHT_COLOR = '#fff1d6'
// With zero decay the light does not weaken with distance, so outer planets stay visible.
// Distances are not physical in this scene anyway.
const LIGHT_INTENSITY = Math.PI
const LIGHT_DECAY = 0
const GLOW_SIZE_IN_RADII = 3.5

export function Sun({ data }: { data: Planet }) {
  const radius = getBodyRadius(data)
  const glowTexture = useDisposable(createGlowTexture)
  const glowSize = radius * GLOW_SIZE_IN_RADII

  return (
    <group>
      <mesh geometry={unitSphereGeometry} scale={radius} dispose={null}>
        <meshStandardMaterial color="#000000" emissive={data.color} toneMapped={false} />
      </mesh>
      <sprite scale={[glowSize, glowSize, 1]}>
        <spriteMaterial
          map={glowTexture}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
      <pointLight color={LIGHT_COLOR} intensity={LIGHT_INTENSITY} decay={LIGHT_DECAY} />
    </group>
  )
}
