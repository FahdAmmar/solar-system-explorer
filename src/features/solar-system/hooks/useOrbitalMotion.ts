import { useFrame } from '@react-three/fiber'
import type { RefObject } from 'react'
import type { Object3D } from 'three'
import { FRAME_PRIORITY } from '@/features/solar-system/data/simulation'
import { getOrbitAngle } from '@/features/solar-system/utils/bodyMotion'
import type { SimulationClock } from '@/features/solar-system/utils/simulationClock'

// Turns the orbit pivot (a group at the Sun's centre) so the body moves along its orbit.
export function useOrbitalMotion(
  pivotRef: RefObject<Object3D | null>,
  clock: SimulationClock,
  orbitalPeriodDays: number,
  startAngle: number,
) {
  useFrame(() => {
    const pivot = pivotRef.current
    if (!pivot) return
    pivot.rotation.y = startAngle + getOrbitAngle(orbitalPeriodDays, clock.simulatedDays)
  }, FRAME_PRIORITY.bodies)
}
