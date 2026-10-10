import { ApiError } from '@/services/api'

// Friendly copy only: technical details stay in the console, never in the UI.
export function getUserErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Something unexpected went wrong.'
  switch (error.kind) {
    case 'timeout':
      return 'The server took too long to respond.'
    case 'network':
      return 'We could not reach the server. Check your connection and try again.'
    case 'invalid-data':
      return 'The server sent data we could not read.'
    case 'http':
      return error.status === 404
        ? 'The planetary data could not be found.'
        : 'The server ran into a problem. Please try again in a moment.'
  }
}
