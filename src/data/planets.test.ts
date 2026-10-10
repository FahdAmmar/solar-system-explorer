import { describe, expect, it } from 'vitest'
import { parsePlanets } from '@/services/parsePlanets'
import { planets } from './planets'

// The bundled data stands in for the API, so it must satisfy the same rules.
describe('bundled planet data', () => {
  it('passes the same validation as an API response', () => {
    expect(() => parsePlanets(structuredClone(planets))).not.toThrow()
  })

  it('has unique ids', () => {
    expect(new Set(planets.map((body) => body.id)).size).toBe(planets.length)
  })

  it('has exactly one star, and it comes first', () => {
    const stars = planets.filter((body) => body.type === 'star')
    expect(stars).toHaveLength(1)
    expect(planets[0]?.id).toBe('sun')
  })

  it('lists the eight planets from the Sun outward', () => {
    const orbiting = planets.filter((body) => body.type !== 'star')
    expect(orbiting.map((body) => body.id)).toEqual([
      'mercury',
      'venus',
      'earth',
      'mars',
      'jupiter',
      'saturn',
      'uranus',
      'neptune',
    ])
    const distances = orbiting.map((body) => body.distanceFromSun)
    expect(distances).toEqual([...distances].sort((a, b) => a - b))
  })

  it('follows Kepler: a farther planet takes longer to orbit', () => {
    const periods = planets
      .filter((body) => body.type === 'planet')
      .map((body) => body.orbitalPeriod)
    expect(periods).toEqual([...periods].sort((a, b) => a - b))
  })

  it('has retrograde spin only for Venus and Uranus', () => {
    const retrograde = planets.filter((body) => body.rotationPeriod < 0).map((b) => b.id)
    expect(retrograde).toEqual(['venus', 'uranus'])
  })
})
