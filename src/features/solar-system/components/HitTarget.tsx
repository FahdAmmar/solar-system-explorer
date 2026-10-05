import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { PerspectiveCamera, Vector3, type Mesh } from 'three'
import { MIN_HIT_RADIUS_PX } from '@/features/solar-system/data/interaction'
import { unitSphereGeometry } from '@/features/solar-system/utils/geometries'
import { getWorldUnitsPerPixel } from '@/features/solar-system/utils/projection'

// Invisible sphere that is never smaller than MIN_HIT_RADIUS_PX on screen.
// Invisible meshes are not drawn but still receive pointer events.
export function HitTarget({ radius }: { radius: number }) {
  const meshRef = useRef<Mesh>(null)
  const worldPosition = useMemo(() => new Vector3(), [])

  useFrame(({ camera, size }) => {
    const mesh = meshRef.current
    if (!mesh || !(camera instanceof PerspectiveCamera)) return
    mesh.getWorldPosition(worldPosition)
    const minWorldRadius =
      MIN_HIT_RADIUS_PX * getWorldUnitsPerPixel(camera, worldPosition, size.height)
    mesh.scale.setScalar(Math.max(radius, minWorldRadius))
  })

  return (
    <mesh ref={meshRef} geometry={unitSphereGeometry} visible={false} dispose={null} />
  )
}
