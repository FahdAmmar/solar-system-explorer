import { describe, expect, it } from 'vitest'
import { planets } from '@/data/planets'
import { ApiError } from './api'
import { parsePlanets } from './parsePlanets'

// A deep copy that tests can break one field at a time.
const copyOfPlanets = (): Record<string, unknown>[] =>
  structuredClone(planets.map((planet) => ({ ...planet })))

function expectInvalid(body: unknown, fragment: string) {
  try {
    parsePlanets(body)
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).kind).toBe('invalid-data')
    expect((error as ApiError).message).toContain(fragment)
    return
  }
  expect.unreachable('parsePlanets accepted invalid data')
}

describe('parsePlanets', () => {
  it('accepts the bundled planets unchanged', () => {
    expect(parsePlanets(copyOfPlanets())).toEqual(planets)
  })

  it('accepts an empty list (the UI shows an empty state)', () => {
    expect(parsePlanets([])).toEqual([])
  })

  it('accepts the Sun with zero distance and orbital period', () => {
    expect(parsePlanets([copyOfPlanets()[0]])[0]?.id).toBe('sun')
  })

  it.each([null, undefined, {}, 'planets', 42])('rejects a body that is %j', (body) => {
    expectInvalid(body, 'must be an array')
  })

  it('rejects items that are not objects', () => {
    const body = copyOfPlanets()
    body[1] = 'mars' as unknown as Record<string, unknown>
    expectInvalid(body, 'planets[1]: must be an object')
  })

  describe.each([
    ['name', ''],
    ['name', '   '],
    ['name', 7],
    ['description', ''],
    ['id', 'Earth'],
    ['id', 'earth"><img src=x>'],
    ['type', 'comet'],
    ['color', 'red'],
    ['color', '#fff'],
    ['radius', 0],
    ['radius', -1],
    ['radius', '6371'],
    ['radius', null],
    ['distanceFromSun', 0],
    ['orbitalPeriod', 0],
    ['orbitalPeriod', -5],
    ['rotationPeriod', 0],
    ['temperature', -300],
    ['moons', 1.5],
    ['moons', -1],
  ])('invalid %s', (field, value) => {
    it(`rejects ${JSON.stringify(value)}`, () => {
      const body = copyOfPlanets()
      // Index 3 is Earth: an orbiting body, so every rule applies to it.
      body[3] = { ...body[3], [field]: value }
      expectInvalid(body, `"${field}"`)
    })
  })

  it('rejects a missing field', () => {
    const body = copyOfPlanets()
    delete body[3]?.name
    expectInvalid(body, '"name"')
  })

  it('rejects duplicate ids', () => {
    const body = copyOfPlanets()
    body[4] = { ...body[4], id: body[3]?.id }
    expectInvalid(body, 'duplicate planet id "earth"')
  })

  it('rejects values that JSON turns into null (NaN, Infinity)', () => {
    const body = JSON.parse(
      JSON.stringify(copyOfPlanets().map((p) => ({ ...p, radius: Infinity }))),
    ) as unknown
    expectInvalid(body, '"radius"')
  })
})
