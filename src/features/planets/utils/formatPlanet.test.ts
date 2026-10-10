import { describe, expect, it } from 'vitest'
import { planets } from '@/data/planets'
import type { Planet } from '@/types/planet'
import {
  NOT_AVAILABLE,
  formatDiameter,
  formatDistanceFromSun,
  formatMoons,
  formatOrbitalPeriod,
  formatRotationPeriod,
  formatTemperature,
  getPlanetFacts,
} from './formatPlanet'

const byId = (id: string): Planet => {
  const planet = planets.find((body) => body.id === id)
  if (!planet) throw new Error(`Missing test planet: ${id}`)
  return planet
}

describe('number formatting', () => {
  it('formats distance in million km', () => {
    expect(formatDistanceFromSun(149.6)).toBe('149.6 million km')
    expect(formatDistanceFromSun(4495.1)).toBe('4,495.1 million km')
  })

  it('formats the diameter from the radius', () => {
    expect(formatDiameter(6371)).toBe('12,742 km')
  })

  it('formats temperature, including below zero', () => {
    expect(formatTemperature(15)).toBe('15 °C')
    expect(formatTemperature(-65)).toBe('-65 °C')
  })

  it('formats whole moon counts', () => {
    expect(formatMoons(0)).toBe('0')
    expect(formatMoons(146)).toBe('146')
  })

  it('shows an orbit in days below 1000 days and in years above', () => {
    expect(formatOrbitalPeriod(687)).toBe('687 days')
    expect(formatOrbitalPeriod(4332.6)).toBe('11.9 years')
  })

  it('shows rotation in hours below 48 hours and in days above', () => {
    expect(formatRotationPeriod(23.9)).toBe('23.9 hours')
    expect(formatRotationPeriod(1407.6)).toBe('58.7 days')
  })

  it('marks backwards spin as retrograde', () => {
    expect(formatRotationPeriod(-5832.5)).toBe('243 days, retrograde')
  })
})

describe('invalid values never reach the UI', () => {
  const bad = [NaN, Infinity, -Infinity]

  it.each(bad)('shows a dash for %s', (value) => {
    expect(formatDistanceFromSun(value)).toBe(NOT_AVAILABLE)
    expect(formatDiameter(value)).toBe(NOT_AVAILABLE)
    expect(formatTemperature(value)).toBe(NOT_AVAILABLE)
    expect(formatMoons(value)).toBe(NOT_AVAILABLE)
    expect(formatOrbitalPeriod(value)).toBe(NOT_AVAILABLE)
    expect(formatRotationPeriod(value)).toBe(NOT_AVAILABLE)
  })

  it('shows a dash for zero or negative sizes, periods and counts', () => {
    expect(formatDistanceFromSun(0)).toBe(NOT_AVAILABLE)
    expect(formatDiameter(-1)).toBe(NOT_AVAILABLE)
    expect(formatOrbitalPeriod(0)).toBe(NOT_AVAILABLE)
    expect(formatRotationPeriod(0)).toBe(NOT_AVAILABLE)
    expect(formatMoons(-1)).toBe(NOT_AVAILABLE)
    expect(formatMoons(1.5)).toBe(NOT_AVAILABLE)
  })
})

describe('getPlanetFacts', () => {
  it('lists the facts of an orbiting planet in a fixed order', () => {
    const facts = getPlanetFacts(byId('earth'))

    expect(facts.map((fact) => fact.id)).toEqual([
      'distance',
      'diameter',
      'moons',
      'temperature',
      'year',
      'rotation',
    ])
    expect(Object.fromEntries(facts.map((fact) => [fact.id, fact.value]))).toMatchObject({
      distance: '149.6 million km',
      diameter: '12,742 km',
      moons: '1',
      temperature: '15 °C',
      year: '365 days',
      rotation: '23.9 hours',
    })
  })

  it('keeps year and rotation out of the primary facts', () => {
    const secondary = getPlanetFacts(byId('mars')).filter((fact) => !fact.primary)
    expect(secondary.map((fact) => fact.id)).toEqual(['year', 'rotation'])
  })

  it('skips rows that make no sense for the Sun', () => {
    const ids = getPlanetFacts(byId('sun')).map((fact) => fact.id)
    expect(ids).toEqual(['diameter', 'temperature', 'rotation'])
  })

  it('produces readable values for every bundled body', () => {
    for (const body of planets) {
      for (const fact of getPlanetFacts(body)) {
        expect(fact.value).not.toMatch(/NaN|Infinity|undefined/)
        expect(fact.value).not.toBe(NOT_AVAILABLE)
      }
    }
  })
})
