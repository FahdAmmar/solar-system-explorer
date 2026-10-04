import { useEffect, useMemo } from 'react'

// Creates a GPU resource once and frees it on unmount. `create` must be a stable function.
export function useDisposable<T extends { dispose: () => void }>(create: () => T): T {
  const resource = useMemo(() => create(), [create])
  useEffect(() => () => resource.dispose(), [resource])
  return resource
}
