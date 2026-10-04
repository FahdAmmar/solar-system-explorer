let cachedSupport: boolean | undefined

// Probes once for a WebGL context, then releases it so it does not count against the browser's limit.
export function isWebGLSupported(): boolean {
  if (cachedSupport !== undefined) return cachedSupport

  const probe = document.createElement('canvas')
  const context = probe.getContext('webgl2') ?? probe.getContext('webgl')
  context?.getExtension('WEBGL_lose_context')?.loseContext()

  cachedSupport = context !== null
  return cachedSupport
}
