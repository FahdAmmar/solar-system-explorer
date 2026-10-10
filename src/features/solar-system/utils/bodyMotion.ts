import { SPIN_VISUALIZATION } from '@/features/solar-system/data/simulation'
import { isPositive } from '@/features/solar-system/utils/numbers'

const FULL_TURN = Math.PI * 2

// Angles are in radians around +Y. Positive is counter-clockwise seen from above, which is the
// real prograde direction for orbits and for most spins (see getStartAngle).

/** How far a body has travelled along its orbit, from its starting point. */
export function getOrbitAngle(orbitalPeriodDays: number, simulatedDays: number): number {
  if (!isPositive(orbitalPeriodDays) || !Number.isFinite(simulatedDays)) return 0
  return ((simulatedDays / orbitalPeriodDays) % 1) * FULL_TURN
}

/** Visual spin in radians per scaled second. Negative for retrograde spin (Venus, Uranus). */
export function getSpinRate(rotationPeriodHours: number): number {
  if (!Number.isFinite(rotationPeriodHours) || rotationPeriodHours === 0) return 0
  const { earthRotationHours, radiansPerSecondAtEarthRate, exponent } = SPIN_VISUALIZATION
  const relativeRate = earthRotationHours / Math.abs(rotationPeriodHours)
  return (
    Math.sign(rotationPeriodHours) *
    radiansPerSecondAtEarthRate *
    relativeRate ** exponent
  )
}

export function getSpinAngle(rotationPeriodHours: number, scaledSeconds: number): number {
  if (!Number.isFinite(scaledSeconds)) return 0
  return (getSpinRate(rotationPeriodHours) * scaledSeconds) % FULL_TURN
}
