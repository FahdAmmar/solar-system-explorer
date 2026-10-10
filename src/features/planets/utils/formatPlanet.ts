import type { Planet, PlanetType } from '@/types/planet'

// Shown wherever a value is missing or invalid. NaN, Infinity and "undefined" never reach the UI.
export const NOT_AVAILABLE = '—'

const DAYS_PER_YEAR = 365.25
const HOURS_PER_DAY = 24
// Below this, an orbit reads better in days; above it, in years (Mars: 687 days, Jupiter: 11.9 years).
const MAX_ORBIT_DAYS_SHOWN = 1000
// Below this many hours a day is shown in hours (Earth: 23.9 hours, Mercury: 58.7 days).
const MAX_ROTATION_HOURS_SHOWN = 48

const oneDecimal = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })
const wholeNumber = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

const isFiniteNumber = (value: number) => Number.isFinite(value)
const isPositive = (value: number) => Number.isFinite(value) && value > 0

export const PLANET_TYPE_LABELS: Record<PlanetType, string> = {
  star: 'Star',
  planet: 'Planet',
  'dwarf-planet': 'Dwarf planet',
}

export function formatDistanceFromSun(millionKm: number): string {
  return isPositive(millionKm)
    ? `${oneDecimal.format(millionKm)} million km`
    : NOT_AVAILABLE
}

export function formatDiameter(radiusKm: number): string {
  return isPositive(radiusKm) ? `${wholeNumber.format(radiusKm * 2)} km` : NOT_AVAILABLE
}

export function formatTemperature(celsius: number): string {
  return isFiniteNumber(celsius) ? `${wholeNumber.format(celsius)} °C` : NOT_AVAILABLE
}

export function formatMoons(count: number): string {
  return Number.isInteger(count) && count >= 0 ? wholeNumber.format(count) : NOT_AVAILABLE
}

export function formatOrbitalPeriod(days: number): string {
  if (!isPositive(days)) return NOT_AVAILABLE
  if (days < MAX_ORBIT_DAYS_SHOWN) return `${wholeNumber.format(days)} days`
  return `${oneDecimal.format(days / DAYS_PER_YEAR)} years`
}

// A negative period means the body spins backwards (Venus, Uranus).
export function formatRotationPeriod(hours: number): string {
  if (!isFiniteNumber(hours) || hours === 0) return NOT_AVAILABLE
  const length = Math.abs(hours)
  const text =
    length < MAX_ROTATION_HOURS_SHOWN
      ? `${oneDecimal.format(length)} hours`
      : `${oneDecimal.format(length / HOURS_PER_DAY)} days`
  return hours < 0 ? `${text}, retrograde` : text
}

export interface PlanetFact {
  id: string
  label: string
  value: string
  /** Primary facts stay visible on small screens; the rest wait behind "More details". */
  primary: boolean
}

export function getPlanetFacts(planet: Planet): PlanetFact[] {
  const isStar = planet.type === 'star'
  const facts: PlanetFact[] = []

  // The Sun does not orbit anything here and has no moons, so those rows would only say "—".
  if (!isStar) {
    facts.push({
      id: 'distance',
      label: 'Distance from Sun',
      value: formatDistanceFromSun(planet.distanceFromSun),
      primary: true,
    })
  }
  facts.push({
    id: 'diameter',
    label: 'Diameter',
    value: formatDiameter(planet.radius),
    primary: true,
  })
  if (!isStar) {
    facts.push({
      id: 'moons',
      label: 'Moons',
      value: formatMoons(planet.moons),
      primary: true,
    })
  }
  facts.push({
    id: 'temperature',
    label: 'Temperature',
    value: formatTemperature(planet.temperature),
    primary: true,
  })
  if (!isStar) {
    facts.push({
      id: 'year',
      label: 'Year',
      value: formatOrbitalPeriod(planet.orbitalPeriod),
      primary: false,
    })
  }
  facts.push({
    id: 'rotation',
    label: 'Rotation',
    value: formatRotationPeriod(planet.rotationPeriod),
    primary: false,
  })
  return facts
}
