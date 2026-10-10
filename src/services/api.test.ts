import { afterEach, describe, expect, it, vi } from 'vitest'

// API_BASE_URL is read once when the module loads, so each test loads a fresh copy.
async function loadApi(baseUrl = '') {
  vi.resetModules()
  vi.stubEnv('VITE_API_BASE_URL', baseUrl)
  return import('./api')
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('API_BASE_URL', () => {
  it.each([
    ['', ''],
    ['   ', ''],
    ['https://api.example.com', 'https://api.example.com'],
    ['https://api.example.com/', 'https://api.example.com'],
    ['/api//', '/api'],
  ])('turns %j into %j', async (input, expected) => {
    expect((await loadApi(input)).API_BASE_URL).toBe(expected)
  })
})

describe('shouldRetryRequest', () => {
  it('retries a network error or timeout once', async () => {
    const { ApiError, shouldRetryRequest } = await loadApi()
    for (const kind of ['network', 'timeout'] as const) {
      expect(shouldRetryRequest(0, new ApiError(kind, 'x'))).toBe(true)
      expect(shouldRetryRequest(1, new ApiError(kind, 'x'))).toBe(false)
    }
  })

  it.each([500, 502, 503, 408, 429])('retries HTTP %i', async (status) => {
    const { ApiError, shouldRetryRequest } = await loadApi()
    expect(shouldRetryRequest(0, new ApiError('http', 'x', { status }))).toBe(true)
  })

  it.each([400, 401, 403, 404])('does not retry HTTP %i', async (status) => {
    const { ApiError, shouldRetryRequest } = await loadApi()
    expect(shouldRetryRequest(0, new ApiError('http', 'x', { status }))).toBe(false)
  })

  it('does not retry invalid data or unknown errors', async () => {
    const { ApiError, shouldRetryRequest } = await loadApi()
    expect(shouldRetryRequest(0, new ApiError('invalid-data', 'x'))).toBe(false)
    expect(shouldRetryRequest(0, new Error('boom'))).toBe(false)
  })
})

describe('apiGet', () => {
  it('requests the path on the base URL and returns the parsed body', async () => {
    const { apiGet } = await loadApi('https://api.example.com/')
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([1, 2, 3]))
    vi.stubGlobal('fetch', fetchMock)
    const parse = vi.fn((body: unknown) => (body as number[]).length)

    await expect(apiGet('/planets', parse)).resolves.toBe(3)

    expect(parse).toHaveBeenCalledWith([1, 2, 3])
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.example.com/planets')
    expect(init.headers).toEqual({ Accept: 'application/json' })
  })

  it('turns an HTTP error status into an "http" ApiError', async () => {
    const { apiGet, ApiError } = await loadApi()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, 503)))
    const parse = vi.fn()

    const error = await apiGet('/planets', parse).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ kind: 'http', status: 503 })
    expect(parse).not.toHaveBeenCalled()
  })

  it('turns a failed request into a "network" ApiError', async () => {
    const { apiGet } = await loadApi()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    await expect(apiGet('/planets', String)).rejects.toMatchObject({ kind: 'network' })
  })

  it('turns a body that is not JSON into an "invalid-data" ApiError', async () => {
    const { apiGet } = await loadApi()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>oops</html>')))

    await expect(apiGet('/planets', String)).rejects.toMatchObject({
      kind: 'invalid-data',
    })
  })

  it('lets errors from the parser through untouched', async () => {
    const { apiGet, ApiError } = await loadApi()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([])))
    const failure = new ApiError('invalid-data', 'bad shape')

    await expect(
      apiGet('/planets', () => {
        throw failure
      }),
    ).rejects.toBe(failure)
  })

  it('reports a "timeout" when the timeout signal fires', async () => {
    const { apiGet } = await loadApi()
    const timeout = new AbortController()
    vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeout.signal)
    // A request that never answers and rejects only when it is aborted.
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener('abort', () => reject(init.signal?.reason))
          }),
      ),
    )

    const request = apiGet('/planets', String)
    timeout.abort(new DOMException('Timed out', 'TimeoutError'))

    await expect(request).rejects.toMatchObject({ kind: 'timeout' })
  })

  it('passes a cancellation by the caller on untouched (it is not a failure)', async () => {
    const { apiGet, ApiError } = await loadApi()
    const caller = new AbortController()
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener('abort', () => reject(init.signal?.reason))
          }),
      ),
    )

    const request = apiGet('/planets', String, caller.signal)
    caller.abort(new DOMException('Cancelled', 'AbortError'))

    const error = await request.catch((e: unknown) => e)
    expect(error).not.toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ name: 'AbortError' })
  })
})
