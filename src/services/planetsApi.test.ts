import { afterEach, describe, expect, it, vi } from 'vitest'
import { planets } from '@/data/planets'

async function loadPlanetsApi(baseUrl: string) {
  vi.resetModules()
  vi.stubEnv('VITE_API_BASE_URL', baseUrl)
  return import('./planetsApi')
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('getPlanets', () => {
  it('returns the bundled planets without any request when no API is configured', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { getPlanets } = await loadPlanetsApi('')

    expect(await getPlanets()).toEqual(planets)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('fetches and validates GET {base}/planets when an API is configured', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(planets))
    vi.stubGlobal('fetch', fetchMock)
    const { getPlanets } = await loadPlanetsApi('https://api.example.com')

    expect(await getPlanets()).toEqual(planets)
    expect(fetchMock.mock.calls[0]?.[0]).toBe('https://api.example.com/planets')
  })

  it('rejects an API response that is not valid planet data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json([{ id: 'x' }])))
    const { getPlanets } = await loadPlanetsApi('https://api.example.com')

    await expect(getPlanets()).rejects.toMatchObject({ kind: 'invalid-data' })
  })
})
