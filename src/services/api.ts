const REQUEST_TIMEOUT_MS = 10_000
const MAX_RETRIES = 1

/** Empty when no API is configured. Read once: Vite inlines env values at build time. */
export const API_BASE_URL: string = (import.meta.env.VITE_API_BASE_URL ?? '')
  .trim()
  .replace(/\/+$/, '')

export type ApiErrorKind = 'network' | 'timeout' | 'http' | 'invalid-data'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status: number | undefined

  constructor(
    kind: ApiErrorKind,
    message: string,
    options: { status?: number; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause })
    this.name = 'ApiError'
    this.kind = kind
    this.status = options.status
  }
}

/**
 * GET `path` from the configured API and run the body through `parse`.
 * `parse` receives `unknown`: nothing from the network is trusted until it is validated.
 */
export async function apiGet<T>(
  path: string,
  parse: (body: unknown) => T,
  signal?: AbortSignal,
): Promise<T> {
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  const requestSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal

  let body: unknown
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: 'application/json' },
      signal: requestSignal,
    })
    if (!response.ok) {
      throw new ApiError('http', `Request failed with status ${response.status}`, {
        status: response.status,
      })
    }
    body = await response.json()
  } catch (error) {
    // A cancelled request (the caller left) is not a failure: pass it on untouched.
    if (signal?.aborted) throw error
    if (error instanceof ApiError) throw error
    if (timeoutSignal.aborted) {
      throw new ApiError('timeout', 'Request timed out', { cause: error })
    }
    if (error instanceof SyntaxError) {
      throw new ApiError('invalid-data', 'Response is not valid JSON', { cause: error })
    }
    throw new ApiError('network', 'Network request failed', { cause: error })
  }

  return parse(body)
}

/** Retry only failures that can fix themselves. Bad data or a 404 will fail again. */
export function shouldRetryRequest(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES || !(error instanceof ApiError)) return false
  if (error.kind === 'invalid-data') return false
  if (error.kind === 'http') {
    const { status } = error
    return status === undefined || status >= 500 || status === 408 || status === 429
  }
  return true
}
