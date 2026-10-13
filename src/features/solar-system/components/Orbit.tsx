import { unitCircleGeometry } from '@/features/solar-system/utils/geometries'
import { orbitMaterial } from '@/features/solar-system/utils/sharedResources'

export function Orbit({ radius, visible = true }: { radius: number; visible?: boolean }) {
  return (
    <lineLoop
      geometry={unitCircleGeometry}
      material={orbitMaterial}
      scale={radius}
      visible={visible}
      dispose={null}
    />
  )
}
