import { planets as localPlanets } from '@/data/planets'
import type { Planet } from '@/types/planet'
import { API_BASE_URL, apiGet } from './api'
import { parsePlanets } from './parsePlanets'

// Without VITE_API_BASE_URL the bundled data stands in for the server. Callers cannot tell
// the difference, so connecting a real API later means setting one environment variable.
export async function getPlanets(signal?: AbortSignal): Promise<readonly Planet[]> {
  if (!API_BASE_URL) return localPlanets
  return apiGet('/planets', parsePlanets, signal)
}
