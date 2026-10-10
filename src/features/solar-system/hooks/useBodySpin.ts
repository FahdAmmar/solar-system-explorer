import { useFrame } from '@react-three/fiber'
import type { RefObject } from 'react'
import type { Object3D } from 'three'
import { FRAME_PRIORITY } from '@/features/solar-system/data/simulation'
import { getSpinAngle } from '@/features/solar-system/utils/bodyMotion'
import type { SimulationClock } from '@/features/solar-system/utils/simulationClock'

// Spins a body around its own axis. Anything inside the group (Saturn's rings) turns with it.
export function useBodySpin(
  spinRef: RefObject<Object3D | null>,
  clock: SimulationClock,
  rotationPeriodHours: number,
) {
  useFrame(() => {
    const spinner = spinRef.current
    if (!spinner) return
    spinner.rotation.y = getSpinAngle(rotationPeriodHours, clock.elapsedScaledSeconds)
  }, FRAME_PRIORITY.bodies)
}
