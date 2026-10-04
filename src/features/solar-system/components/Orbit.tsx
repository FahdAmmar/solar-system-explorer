import { LineBasicMaterial } from 'three'
import { unitCircleGeometry } from '@/features/solar-system/utils/geometries'

// One material for every orbit, so a single opacity change fades them all together.
const orbitMaterial = new LineBasicMaterial({
  color: '#8aa4d6',
  transparent: true,
  opacity: 0.3,
})

export function Orbit({ radius }: { radius: number }) {
  return (
    <lineLoop
      geometry={unitCircleGeometry}
      material={orbitMaterial}
      scale={radius}
      dispose={null}
    />
  )
}
