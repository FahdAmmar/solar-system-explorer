import { describe, expect, it } from 'vitest'
import { planets } from '@/data/planets'
import type { Planet } from '@/types/planet'
import { getComparisonRows, getSizeShares } from './compareMetrics'

const byId = (id: string): Planet => {
  const planet = planets.find((body) => body.id === id)
  if (!planet) throw new Error(`Missing test planet: ${id}`)
  return planet
}
const earth = byId('earth')
const mars = byId('mars')
const rowsOf = (a: Planet, b: Planet) =>
  Object.fromEntries(getComparisonRows(a, b).map((row) => [row.id, row]))

describe('getComparisonRows', () => {
  it('lists the metrics in a fixed order, starting with the ones the spec names', () => {
    const ids = getComparisonRows(earth, mars).map((row) => row.id)
    expect(ids).toEqual([
      'diameter',
      'distance',
      'moons',
      'temperature',
      'year',
      'rotation',
    ])
  })

  it('shows the formatted values of both bodies', () => {
    const rows = rowsOf(earth, mars)
    expect(rows.diameter?.first.text).toBe('12,742 km')
    expect(rows.diameter?.second.text).toBe('6,779 km')
    expect(rows.moons?.first.text).toBe('1')
    expect(rows.moons?.second.text).toBe('2')
    expect(rows.temperature?.first.text).toBe('15 °C')
    expect(rows.year?.first.text).toBe('365 days')
    expect(rows.year?.second.text).toBe('687 days')
  })

  it('gives the larger value a full bar and the other a proportional one', () => {
    const { diameter } = rowsOf(earth, mars)
    expect(diameter?.first.share).toBe(1)
    expect(diameter?.second.share).toBeCloseTo(mars.radius / earth.radius)
  })

  it('swaps the sides without changing the shares', () => {
    const forward = rowsOf(earth, mars)
    const backward = rowsOf(mars, earth)
    for (const id of Object.keys(forward)) {
      expect(backward[id]?.first.share).toBeCloseTo(forward[id]!.second.share)
      expect(backward[id]?.second.share).toBeCloseTo(forward[id]!.first.share)
    }
  })

  it('keeps every share between 0 and 1, with the larger side at exactly 1 (unless both are zero)', () => {
    for (const a of planets) {
      for (const b of planets) {
        if (a.id === b.id) continue
        for (const row of getComparisonRows(a, b)) {
          for (const side of [row.first, row.second]) {
            expect(side.share).toBeGreaterThanOrEqual(0)
            expect(side.share).toBeLessThanOrEqual(1)
            expect(Number.isFinite(side.share)).toBe(true)
          }
          // Two zeros (both bodies have no moons) correctly leave both bars empty.
          const bothZero = row.first.text === '0' && row.second.text === '0'
          if (row.summary !== null) {
            expect(Math.max(row.first.share, row.second.share)).toBe(bothZero ? 0 : 1)
          }
        }
      }
    }
  })

  it('draws temperature from absolute zero, so a cold body still gets a bar', () => {
    const { temperature } = rowsOf(earth, byId('neptune'))
    expect(temperature?.second.share).toBeGreaterThan(0)
    expect(temperature?.second.share).toBeLessThan(temperature!.first.share)
    expect(temperature?.second.text).toBe('-200 °C')
  })

  it('never prints NaN, Infinity or undefined, for any pair of bundled bodies', () => {
    for (const a of planets) {
      for (const b of planets) {
        if (a.id === b.id) continue
        for (const row of getComparisonRows(a, b)) {
          const text = [row.first.text, row.second.text, row.summary ?? ''].join(' ')
          expect(text).not.toMatch(/NaN|Infinity|undefined/)
        }
      }
    }
  })
})

describe('summaries', () => {
  it('states how much bigger one body is', () => {
    expect(rowsOf(earth, mars).diameter?.summary).toBe('Earth is 1.9× as wide as Mars')
  })

  it('names the larger body whichever side it is on', () => {
    expect(rowsOf(mars, earth).diameter?.summary).toBe('Earth is 1.9× as wide as Mars')
  })

  it('rounds big ratios to whole numbers', () => {
    const summary = rowsOf(byId('jupiter'), byId('mercury')).diameter?.summary
    expect(summary).toBe('Jupiter is 29× as wide as Mercury')
  })

  it('compares moons, temperature, year and distance in plain words', () => {
    const rows = rowsOf(earth, mars)
    expect(rows.moons?.summary).toBe('Mars has 1 more moon')
    expect(rows.temperature?.summary).toBe('Earth is 80 °C warmer')
    expect(rows.year?.summary).toBe('A year on Mars is 1.9× as long as on Earth')
    expect(rows.distance?.summary).toBe('Mars is 1.5× as far from the Sun as Earth')
  })

  it('uses the plural for several moons', () => {
    expect(rowsOf(earth, byId('jupiter')).moons?.summary).toMatch(
      /Jupiter has \d+ more moons/,
    )
  })

  it('says so when two values are about the same', () => {
    const twin: Planet = {
      ...earth,
      id: 'twin',
      name: 'Twin',
      radius: earth.radius * 1.01,
    }
    expect(rowsOf(earth, twin).diameter?.summary).toBe(
      'Earth and Twin are about the same size',
    )
  })

  it('says so when moon counts are equal', () => {
    const twin: Planet = { ...earth, id: 'twin', name: 'Twin' }
    expect(rowsOf(earth, twin).moons?.summary).toBe('Both have the same number of moons')
    expect(rowsOf(earth, twin).temperature?.summary).toBe('About the same temperature')
  })

  it('describes retrograde spin through the value, not the ratio', () => {
    const { rotation } = rowsOf(byId('venus'), earth)
    expect(rotation?.first.text).toContain('retrograde')
    expect(rotation?.summary).toBe('Venus takes 244× as long as Earth to spin once')
  })
})

describe('bodies a metric does not apply to', () => {
  it('shows a dash and no bar for the Sun, without breaking the other rows', () => {
    const rows = rowsOf(byId('sun'), earth)

    for (const id of ['distance', 'moons', 'year'] as const) {
      expect(rows[id]?.first.text).toBe('—')
      expect(rows[id]?.first.share).toBe(0)
      expect(rows[id]?.summary).toBeNull()
    }
    expect(rows.diameter?.first.share).toBe(1)
    expect(rows.diameter?.summary).toBe('Sun is 109× as wide as Earth')
    expect(rows.temperature?.summary).toMatch(/^Sun is [\d,]+ °C warmer$/)
  })

  it('shows dashes for invalid values instead of broken numbers', () => {
    const broken: Planet = {
      ...earth,
      id: 'broken',
      name: 'Broken',
      radius: NaN,
      temperature: Infinity,
      rotationPeriod: 0,
    }
    const rows = rowsOf(broken, earth)
    expect(rows.diameter?.first).toEqual({ text: '—', share: 0 })
    expect(rows.temperature?.first).toEqual({ text: '—', share: 0 })
    expect(rows.rotation?.first).toEqual({ text: '—', share: 0 })
    expect(rows.diameter?.summary).toBeNull()
  })
})

describe('getSizeShares', () => {
  it('gives the larger body 1 and the other its relative size', () => {
    const [first, second] = getSizeShares(earth, mars)
    expect(first).toBe(1)
    expect(second).toBeCloseTo(mars.radius / earth.radius)
  })

  it('works from either side', () => {
    expect(getSizeShares(mars, earth)[1]).toBe(1)
  })

  it('returns zeros when neither size is usable', () => {
    const broken: Planet = { ...earth, radius: NaN }
    expect(getSizeShares(broken, broken)).toEqual([0, 0])
  })
})
