import { useQuery } from '@tanstack/react-query'
import { getPlanets } from '@/services/planetsApi'

const PLANETS_QUERY_KEY = ['planets'] as const

// Planet data is server state, so it lives in the query cache and never in Zustand.
export function usePlanets() {
  return useQuery({
    queryKey: PLANETS_QUERY_KEY,
    // Passing the signal lets the query cancel the request when nobody needs it anymore.
    queryFn: ({ signal }) => getPlanets(signal),
  })
}
