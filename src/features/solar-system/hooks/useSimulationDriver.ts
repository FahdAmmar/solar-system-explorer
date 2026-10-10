import { useFrame } from '@react-three/fiber'
import { FRAME_PRIORITY } from '@/features/solar-system/data/simulation'
import type { SimulationClock } from '@/features/solar-system/utils/simulationClock'
import { useSolarSystemStore } from '@/store/solarSystemStore'

// Feeds the clock once per frame. The store is read directly (not subscribed to), so pausing
// or changing the speed never re-renders the scene.
export function useSimulationDriver(clock: SimulationClock) {
  useFrame((_, deltaSeconds) => {
    const { isPaused, simulationSpeed } = useSolarSystemStore.getState()
    clock.advance(deltaSeconds, simulationSpeed, isPaused)
  }, FRAME_PRIORITY.clock)
}
