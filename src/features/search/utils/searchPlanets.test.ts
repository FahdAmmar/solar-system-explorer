import { describe, expect, it } from 'vitest'
import { planets } from '@/data/planets'
import { searchPlanets } from './searchPlanets'

const names = (query: string) => searchPlanets(planets, query).map((p) => p.name)

describe('searchPlanets', () => {
  it('returns everything for an empty or blank query', () => {
    expect(searchPlanets(planets, '')).toBe(planets)
    expect(searchPlanets(planets, '   ')).toBe(planets)
  })

  it('ignores case and surrounding spaces', () => {
    expect(names('  EARTH ')).toEqual(['Earth'])
  })

  it('matches part of a name, with names starting with the query first', () => {
    // "ur": Uranus starts with it; Mercury and Saturn only contain it.
    expect(names('ur')).toEqual(['Uranus', 'Mercury', 'Saturn'])
  })

  it('keeps the original list order inside each group', () => {
    // "ar": nothing starts with it; Earth comes before Mars in the list.
    expect(names('ar')).toEqual(['Earth', 'Mars'])
  })

  it('puts prefix matches first even when they appear later in the list', () => {
    // Sun and Saturn start with "s"; the rest only contain it.
    expect(names('s').slice(0, 2)).toEqual(['Sun', 'Saturn'])
  })

  it('returns nothing when no name matches', () => {
    expect(names('pluto')).toEqual([])
  })
})
