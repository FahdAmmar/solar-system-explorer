import type { Planet } from '@/types/planet'

const normalize = (text: string) => text.trim().toLowerCase().replace(/\s+/g, ' ')

// Names that start with the query come first ("ma" finds Mars before any name containing "ma"),
// then names that only contain it. Order inside each group follows the given list.
// An empty query returns everything, so the list can be browsed without typing.
export function searchPlanets(
  planets: readonly Planet[],
  query: string,
): readonly Planet[] {
  const needle = normalize(query)
  if (!needle) return planets

  const startsWith: Planet[] = []
  const contains: Planet[] = []
  for (const planet of planets) {
    const name = normalize(planet.name)
    if (name.startsWith(needle)) startsWith.push(planet)
    else if (name.includes(needle)) contains.push(planet)
  }
  return [...startsWith, ...contains]
}
