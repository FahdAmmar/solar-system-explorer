export const SIMULATION_SPEEDS = [0.1, 0.5, 1, 5, 10, 50, 100] as const

export type SimulationSpeed = (typeof SIMULATION_SPEEDS)[number]

export const DEFAULT_SIMULATION_SPEED: SimulationSpeed = 1
