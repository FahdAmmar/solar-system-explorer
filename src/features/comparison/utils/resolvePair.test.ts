import { describe, expect, it } from 'vitest'
import { planets } from '@/data/planets'
import { resolvePair } from './resolvePair'

const ids = (pair: ReturnType<typeof resolvePair>) => [pair?.first.id, pair?.second.id]

describe('resolvePair', () => {
  it('uses the two bodies named in the link', () => {
    expect(ids(resolvePair(planets, 'venus', 'jupiter'))).toEqual(['venus', 'jupiter'])
  })

  it('starts from Earth vs Mars when the link names nobody', () => {
    expect(ids(resolvePair(planets, null, null))).toEqual(['earth', 'mars'])
  })

  it('pairs a single named body with Earth, so "Mars" becomes Mars vs Earth', () => {
    expect(ids(resolvePair(planets, 'mars', null))).toEqual(['mars', 'earth'])
    expect(ids(resolvePair(planets, 'saturn', null))).toEqual(['saturn', 'earth'])
  })

  it('pairs Earth with Mars, never with itself', () => {
    expect(ids(resolvePair(planets, 'earth', null))).toEqual(['earth', 'mars'])
  })

  it('keeps a named second body and fills the first', () => {
    expect(ids(resolvePair(planets, null, 'venus'))).toEqual(['earth', 'venus'])
    expect(ids(resolvePair(planets, null, 'earth'))).toEqual(['mars', 'earth'])
  })

  it('ignores ids that do not exist', () => {
    expect(ids(resolvePair(planets, 'pluto', 'krypton'))).toEqual(['earth', 'mars'])
    expect(ids(resolvePair(planets, 'pluto', 'venus'))).toEqual(['earth', 'venus'])
  })

  it('never compares a body with itself', () => {
    expect(ids(resolvePair(planets, 'venus', 'venus'))).toEqual(['venus', 'earth'])
    expect(ids(resolvePair(planets, 'earth', 'earth'))).toEqual(['earth', 'mars'])
  })

  it.each([
    '<script>alert(1)</script>',
    '../../etc/passwd',
    '',
    'EARTH',
    'earth ',
    'a'.repeat(10_000),
  ])('treats hostile or malformed id %j as unknown', (id) => {
    expect(ids(resolvePair(planets, id, id))).toEqual(['earth', 'mars'])
  })

  it('always returns two different bodies from the list', () => {
    for (const a of [...planets.map((p) => p.id), 'x', null]) {
      for (const b of [...planets.map((p) => p.id), 'x', null]) {
        const pair = resolvePair(planets, a, b)
        expect(pair).not.toBeNull()
        expect(pair!.first.id).not.toBe(pair!.second.id)
        expect(planets).toContain(pair!.first)
        expect(planets).toContain(pair!.second)
      }
    }
  })

  it('works when Earth and Mars are missing from the data', () => {
    const others = planets.filter((p) => p.id !== 'earth' && p.id !== 'mars')
    const pair = resolvePair(others, null, null)
    expect(pair?.first.id).not.toBe(pair?.second.id)
    expect(others).toContain(pair?.first)
  })

  it('returns null when there is nothing to compare', () => {
    expect(resolvePair([], 'earth', 'mars')).toBeNull()
    expect(resolvePair(planets.slice(0, 1), null, null)).toBeNull()
  })
})
