import { DoubleSide } from 'three'
import { useDisposable } from '@/features/solar-system/hooks/useDisposable'
import { createSaturnRingGeometry } from '@/features/solar-system/utils/geometries'
import { createRingTexture } from '@/features/solar-system/utils/textures'

// Rendered as a child of Saturn's group, so the rings follow the planet.
export function SaturnRings({ planetRadius }: { planetRadius: number }) {
  const geometry = useDisposable(createSaturnRingGeometry)
  const texture = useDisposable(createRingTexture)

  return (
    <mesh geometry={geometry} scale={planetRadius} dispose={null}>
      {/* Unlit: the Sun's light sits exactly in the ring plane and would leave a lit ring black. */}
      <meshBasicMaterial map={texture} transparent depthWrite={false} side={DoubleSide} />
    </mesh>
  )
}
