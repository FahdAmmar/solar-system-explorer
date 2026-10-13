import {
  NOT_AVAILABLE,
  formatDiameter,
  formatDistanceFromSun,
  formatMoons,
  formatOrbitalPeriod,
  formatRotationPeriod,
  formatTemperature,
} from '@/features/planets/utils/formatPlanet'
import type { Planet } from '@/types/planet'

const ABSOLUTE_ZERO_CELSIUS = -273.15
// Two values closer than this read as "about the same" instead of "1.0x as wide".
const ABOUT_THE_SAME_RATIO = 1.05

const oneDecimal = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })
const wholeNumber = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

export type MetricId =
  'diameter' | 'distance' | 'moons' | 'temperature' | 'year' | 'rotation'

export interface MetricSide {
  /** The value as shown to people, or a dash when it does not apply to this body. */
  text: string
  /** 0 to 1: this value as a share of the larger of the two. Drives the bar length. */
  share: number
}

export interface MetricRow {
  id: MetricId
  label: string
  first: MetricSide
  second: MetricSide
  /** One plain sentence about the difference, or null when it cannot be stated. */
  summary: string | null
}

interface Ranked {
  high: Planet
  low: Planet
  highValue: number
  lowValue: number
}

interface MetricDefinition {
  id: MetricId
  label: string
  /** The number the bar is drawn from, or null when the metric does not apply to the body. */
  barValue: (planet: Planet) => number | null
  format: (planet: Planet) => string
  summarize: (first: Planet, second: Planet, ranked: Ranked) => string
}

const isPositive = (value: number) => Number.isFinite(value) && value > 0
const positiveOrNull = (value: number) => (isPositive(value) ? value : null)
const times = (ratio: number) =>
  `${ratio >= 10 ? wholeNumber.format(ratio) : oneDecimal.format(ratio)}×`
const ratioOf = ({ highValue, lowValue }: Ranked) => highValue / lowValue
const isAboutTheSame = (ranked: Ranked) => ratioOf(ranked) < ABOUT_THE_SAME_RATIO

// A star orbits nothing and has no moons here, so these metrics do not apply to it.
const forOrbiting = (planet: Planet, value: number | null) =>
  planet.type === 'star' ? null : value

// Order matters: it is the order of the rows on the page.
const METRICS: readonly MetricDefinition[] = [
  {
    id: 'diameter',
    label: 'Diameter',
    barValue: (planet) => positiveOrNull(planet.radius * 2),
    format: (planet) => formatDiameter(planet.radius),
    summarize: (first, second, ranked) =>
      isAboutTheSame(ranked)
        ? `${first.name} and ${second.name} are about the same size`
        : `${ranked.high.name} is ${times(ratioOf(ranked))} as wide as ${ranked.low.name}`,
  },
  {
    id: 'distance',
    label: 'Distance from Sun',
    barValue: (planet) => forOrbiting(planet, positiveOrNull(planet.distanceFromSun)),
    format: (planet) => formatDistanceFromSun(planet.distanceFromSun),
    summarize: (first, second, ranked) =>
      isAboutTheSame(ranked)
        ? `${first.name} and ${second.name} are about as far from the Sun`
        : `${ranked.high.name} is ${times(ratioOf(ranked))} as far from the Sun as ${ranked.low.name}`,
  },
  {
    id: 'moons',
    label: 'Moons',
    barValue: (planet) =>
      forOrbiting(
        planet,
        Number.isInteger(planet.moons) && planet.moons >= 0 ? planet.moons : null,
      ),
    format: (planet) => formatMoons(planet.moons),
    summarize: (_first, _second, ranked) => {
      const difference = ranked.highValue - ranked.lowValue
      if (difference === 0) return 'Both have the same number of moons'
      const noun = difference === 1 ? 'moon' : 'moons'
      return `${ranked.high.name} has ${wholeNumber.format(difference)} more ${noun}`
    },
  },
  {
    id: 'temperature',
    label: 'Temperature',
    // Kelvin, so zero means "no heat at all" and a bar can start at zero. A bar that starts
    // at 0 °C could not show a body colder than that.
    barValue: (planet) =>
      Number.isFinite(planet.temperature) && planet.temperature >= ABSOLUTE_ZERO_CELSIUS
        ? planet.temperature - ABSOLUTE_ZERO_CELSIUS
        : null,
    format: (planet) => formatTemperature(planet.temperature),
    summarize: (_first, _second, ranked) => {
      const difference = Math.round(ranked.highValue - ranked.lowValue)
      return difference === 0
        ? 'About the same temperature'
        : `${ranked.high.name} is ${wholeNumber.format(difference)} °C warmer`
    },
  },
  {
    id: 'year',
    label: 'Year',
    barValue: (planet) => forOrbiting(planet, positiveOrNull(planet.orbitalPeriod)),
    format: (planet) => formatOrbitalPeriod(planet.orbitalPeriod),
    summarize: (first, second, ranked) =>
      isAboutTheSame(ranked)
        ? `A year is about as long on ${first.name} as on ${second.name}`
        : `A year on ${ranked.high.name} is ${times(ratioOf(ranked))} as long as on ${ranked.low.name}`,
  },
  {
    id: 'rotation',
    label: 'Rotation',
    // The direction of the spin is in the text ("retrograde"); the bar shows how long one turn takes.
    barValue: (planet) =>
      Number.isFinite(planet.rotationPeriod) && planet.rotationPeriod !== 0
        ? Math.abs(planet.rotationPeriod)
        : null,
    format: (planet) => formatRotationPeriod(planet.rotationPeriod),
    summarize: (first, second, ranked) =>
      isAboutTheSame(ranked)
        ? `${first.name} and ${second.name} spin at about the same pace`
        : `${ranked.high.name} takes ${times(ratioOf(ranked))} as long as ${ranked.low.name} to spin once`,
  },
]

function toShares(first: number | null, second: number | null): [number, number] {
  const largest = Math.max(first ?? 0, second ?? 0)
  if (largest <= 0) return [0, 0]
  return [(first ?? 0) / largest, (second ?? 0) / largest]
}

function rank(
  first: Planet,
  firstValue: number,
  second: Planet,
  secondValue: number,
): Ranked {
  return firstValue >= secondValue
    ? { high: first, low: second, highValue: firstValue, lowValue: secondValue }
    : { high: second, low: first, highValue: secondValue, lowValue: firstValue }
}

export function getComparisonRows(first: Planet, second: Planet): MetricRow[] {
  return METRICS.map((metric) => {
    const firstValue = metric.barValue(first)
    const secondValue = metric.barValue(second)
    const [firstShare, secondShare] = toShares(firstValue, secondValue)

    return {
      id: metric.id,
      label: metric.label,
      first: {
        text: firstValue === null ? NOT_AVAILABLE : metric.format(first),
        share: firstShare,
      },
      second: {
        text: secondValue === null ? NOT_AVAILABLE : metric.format(second),
        share: secondShare,
      },
      summary:
        firstValue === null || secondValue === null
          ? null
          : metric.summarize(first, second, rank(first, firstValue, second, secondValue)),
    }
  })
}

/** How big each body is next to the other, as a share (0 to 1) of the larger one. */
export function getSizeShares(first: Planet, second: Planet): readonly [number, number] {
  return toShares(positiveOrNull(first.radius), positiveOrNull(second.radius))
}
