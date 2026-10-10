import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { shouldRetryRequest } from '@/services/api'

const FIVE_MINUTES_MS = 5 * 60 * 1000

// Created once at module level so the cache survives re-renders.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: FIVE_MINUTES_MS,
      retry: shouldRetryRequest,
      refetchOnWindowFocus: false,
    },
  },
})

export function AppProviders({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
