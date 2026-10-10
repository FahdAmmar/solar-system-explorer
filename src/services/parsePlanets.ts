import type { Planet, PlanetType } from '@/types/planet'
import { ApiError } from './api'

const PLANET_TYPES: readonly PlanetType[] = ['star', 'planet', 'dwarf-planet']
// Ids end up in DOM ids and object names, so only a safe character set is accepted.
const ID_PATTERN = /^[a-z0-9-]+$/
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i
const ABSOLUTE_ZERO_CELSIUS = -273.15

type Fields = Record<string, unknown>

const invalid = (where: string, problem: string): ApiError =>
  new ApiError('invalid-data', `${where}: ${problem}`)

function readText(fields: Fields, key: string, where: string): string {
  const value = fields[key]
  if (typeof value !== 'string' || value.trim() === '') {
    throw invalid(where, `"${key}" must be a non-empty string`)
  }
  return value
}

function readNumber(
  fields: Fields,
  key: string,
  where: string,
  isAllowed: (value: number) => boolean,
  expected: string,
): number {
  const value = fields[key]
  if (typeof value !== 'number' || !Number.isFinite(value) || !isAllowed(value)) {
    throw invalid(where, `"${key}" must be ${expected}`)
  }
  return value
}

function parsePlanet(value: unknown, index: number): Planet {
  const where = `planets[${index}]`
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw invalid(where, 'must be an object')
  }
  const fields = value as Fields

  const id = readText(fields, 'id', where)
  if (!ID_PATTERN.test(id)) throw invalid(where, '"id" may only use a-z, 0-9 and "-"')

  const type = readText(fields, 'type', where)
  if (!PLANET_TYPES.includes(type as PlanetType)) {
    throw invalid(where, `"type" must be one of ${PLANET_TYPES.join(', ')}`)
  }

  const color = readText(fields, 'color', where)
  if (!HEX_COLOR_PATTERN.test(color))
    throw invalid(where, '"color" must be a #rrggbb hex')

  const isStar = type === 'star'
  return {
    id,
    name: readText(fields, 'name', where),
    type: type as PlanetType,
    radius: readNumber(fields, 'radius', where, (n) => n > 0, 'a positive number'),
    // Anything that orbits needs a real distance and period, or the simulation divides by zero.
    distanceFromSun: readNumber(
      fields,
      'distanceFromSun',
      where,
      (n) => (isStar ? n >= 0 : n > 0),
      isStar ? 'zero or more' : 'a positive number',
    ),
    orbitalPeriod: readNumber(
      fields,
      'orbitalPeriod',
      where,
      (n) => (isStar ? n >= 0 : n > 0),
      isStar ? 'zero or more' : 'a positive number',
    ),
    // Negative means retrograde spin; zero is not a rotation.
    rotationPeriod: readNumber(
      fields,
      'rotationPeriod',
      where,
      (n) => n !== 0,
      'a non-zero number',
    ),
    temperature: readNumber(
      fields,
      'temperature',
      where,
      (n) => n >= ABSOLUTE_ZERO_CELSIUS,
      'at or above absolute zero (-273.15)',
    ),
    moons: readNumber(
      fields,
      'moons',
      where,
      (n) => Number.isInteger(n) && n >= 0,
      'a whole number, zero or more',
    ),
    description: readText(fields, 'description', where),
    color,
  }
}

/** Turns an unknown API body into typed planets, or throws an `invalid-data` ApiError. */
export function parsePlanets(body: unknown): Planet[] {
  if (!Array.isArray(body)) throw invalid('response', 'must be an array of planets')

  const planets = body.map(parsePlanet)
  const seen = new Set<string>()
  for (const { id } of planets) {
    if (seen.has(id)) throw invalid('response', `duplicate planet id "${id}"`)
    seen.add(id)
  }
  return planets
}
