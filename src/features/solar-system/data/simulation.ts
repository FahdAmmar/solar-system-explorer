export const SIMULATION_SPEEDS = [0.1, 0.5, 1, 5, 10, 50, 100] as const

export type SimulationSpeed = (typeof SIMULATION_SPEEDS)[number]

export const DEFAULT_SIMULATION_SPEED: SimulationSpeed = 1

// SIMULATION TIME. Orbital periods are real and keep their true ratios (Earth's year is 365.2
// days, Neptune's 60,000): only the pace is compressed, by the same factor for every planet.
export const SIMULATION_TIME = {
  /** Simulated Earth days per real second at 1x. Earth then takes about 73 s per orbit. */
  daysPerSecond: 5,
  /** Longest frame step the clock accepts, so a background tab never makes planets jump. */
  maxFrameSeconds: 0.1,
} as const

// SPIN VISUALIZATION. NOT to scale, like VISUAL_SCALE. Real day lengths run from 10 hours to
// 243 days: at a pace where orbits are visible, fast spinners would be a blur and Venus would
// look frozen. The rate is compressed with a power curve (exponent < 1) instead.
// Direction (retrograde spin) and the order from fastest to slowest are preserved.
export const SPIN_VISUALIZATION = {
  /** Day length that maps to `radiansPerSecondAtEarthRate`. */
  earthRotationHours: 24,
  /** Spin of an Earth-like body at 1x: one turn every ~16 s. */
  radiansPerSecondAtEarthRate: 0.4,
  exponent: 0.5,
} as const

// Order in which per-frame callbacks run (lower first). Bodies must move BEFORE the camera
// reads their position, or the camera trails them by one frame.
// R3F renders automatically only while every priority stays at or below 0.
export const FRAME_PRIORITY = {
  /** Advances the simulation clock. */
  clock: -3,
  /** Orbit and spin of every body. */
  bodies: -2,
  // -1: drei's OrbitControls update.
  /** Camera director: follows the focused body. */
  director: -0.5,
  // 0: overlay (labels, selection ring) reads the final camera and body positions.
} as const
