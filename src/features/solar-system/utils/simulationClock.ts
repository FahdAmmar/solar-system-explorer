import { SIMULATION_TIME } from '@/features/solar-system/data/simulation'

// Simulated time, advanced once per frame. It lives outside React state on purpose: it changes
// every frame and only the 3D scene reads it, so React must never re-render because of it.
export class SimulationClock {
  private scaledSeconds = 0

  /** Real seconds multiplied by the speed at the time, summed up. Drives spin. */
  get elapsedScaledSeconds(): number {
    return this.scaledSeconds
  }

  /** Simulated Earth days since the start. Drives orbits. */
  get simulatedDays(): number {
    return this.scaledSeconds * SIMULATION_TIME.daysPerSecond
  }

  // Accumulating (instead of speed x total time) means a speed change never makes bodies jump.
  advance(deltaSeconds: number, speed: number, paused: boolean) {
    if (paused || !Number.isFinite(deltaSeconds) || !Number.isFinite(speed)) return
    const step = Math.min(Math.max(deltaSeconds, 0), SIMULATION_TIME.maxFrameSeconds)
    this.scaledSeconds += step * Math.max(speed, 0)
  }
}
