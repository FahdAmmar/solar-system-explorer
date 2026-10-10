import { describe, expect, it } from 'vitest'
import { SIMULATION_TIME } from '@/features/solar-system/data/simulation'
import { SimulationClock } from './simulationClock'

describe('SimulationClock', () => {
  it('starts at zero', () => {
    const clock = new SimulationClock()
    expect(clock.elapsedScaledSeconds).toBe(0)
    expect(clock.simulatedDays).toBe(0)
  })

  it('multiplies real time by the speed', () => {
    const clock = new SimulationClock()
    clock.advance(0.05, 10, false)
    expect(clock.elapsedScaledSeconds).toBeCloseTo(0.5)
  })

  it('converts scaled seconds to simulated days', () => {
    const clock = new SimulationClock()
    clock.advance(0.05, 10, false)
    expect(clock.simulatedDays).toBeCloseTo(0.5 * SIMULATION_TIME.daysPerSecond)
  })

  it('does not move while paused', () => {
    const clock = new SimulationClock()
    clock.advance(0.05, 1, true)
    expect(clock.elapsedScaledSeconds).toBe(0)
  })

  it('accumulates, so a speed change never makes bodies jump', () => {
    const clock = new SimulationClock()
    clock.advance(0.05, 1, false)
    const before = clock.elapsedScaledSeconds
    clock.advance(0.05, 100, false)
    expect(clock.elapsedScaledSeconds).toBeCloseTo(before + 5)
  })

  it('caps a long frame, so returning from a background tab does not teleport planets', () => {
    const clock = new SimulationClock()
    clock.advance(30, 1, false)
    expect(clock.elapsedScaledSeconds).toBeCloseTo(SIMULATION_TIME.maxFrameSeconds)
  })

  it.each([
    ['negative time', -1, 1],
    ['NaN time', NaN, 1],
    ['Infinite time', Infinity, 1],
    ['NaN speed', 0.05, NaN],
    ['negative speed', 0.05, -5],
  ])('never moves on %s', (_label, delta, speed) => {
    const clock = new SimulationClock()
    clock.advance(delta, speed, false)
    expect(clock.elapsedScaledSeconds).toBe(0)
    expect(Number.isFinite(clock.simulatedDays)).toBe(true)
  })
})
