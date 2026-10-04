// VISUALIZATION SCALE. The scene is NOT physically to scale.
// A true-to-scale model is unusable: Neptune is ~78x farther out than Mercury and the Sun is
// ~109x wider than Earth. Distances and radii are compressed with a power curve (exponent < 1)
// so that every body stays visible while the order and relative sizes are preserved.
export const VISUAL_SCALE = {
  /** Scene units for a body at 1 AU (Earth's distance). */
  distanceAtOneAu: 12,
  distanceExponent: 0.5,
  /** Scene units for a body with Earth's radius. */
  radiusOfEarth: 1,
  radiusExponent: 0.5,
  /** The Sun gets a fixed size: the radius curve would make it swallow the inner planets. */
  sunRadius: 3.6,
} as const

export const EARTH_RADIUS_KM = 6371
export const MILLION_KM_PER_AU = 149.6

/** Saturn's ring edges as multiples of Saturn's own (scene) radius. */
export const SATURN_RING_RADII = { inner: 1.24, outer: 2.3 } as const
