import type { Planet } from '@/types/planet'

// A pair to start from when the link names nobody (or only one body): the classic Earth vs Mars.
const PREFERRED_IDS = ['earth', 'mars'] as const

export interface ComparisonPair {
  first: Planet
  second: Planet
}

// The first preferred body that exists, then any body, never `excludeId`.
function pickPlanet(planets: readonly Planet[], excludeId?: string): Planet | undefined {
  const preferred = PREFERRED_IDS.map((id) => planets.find((planet) => planet.id === id))
  return [...preferred, ...planets].find(
    (planet): planet is Planet => planet !== undefined && planet.id !== excludeId,
  )
}

// Turns the ids from the URL into two different bodies that exist. The URL is user input:
// unknown ids, a missing id and the same id twice all fall back to a sensible pair, so no
// link can break the page. Returns null only when there is nothing to compare.
export function resolvePair(
  planets: readonly Planet[],
  firstId: string | null,
  secondId: string | null,
): ComparisonPair | null {
  if (planets.length < 2) return null

  const requestedFirst = planets.find((planet) => planet.id === firstId)
  const requestedSecond = planets.find((planet) => planet.id === secondId)

  const first = requestedFirst ?? pickPlanet(planets, requestedSecond?.id)
  const second =
    requestedSecond && requestedSecond.id !== first?.id
      ? requestedSecond
      : pickPlanet(planets, first?.id)

  return first && second ? { first, second } : null
}
