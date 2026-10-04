export function WebGLUnsupported() {
  return (
    <section className="grid h-full place-items-center p-6 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-semibold">3D graphics are unavailable</h1>
        <p className="mt-3 text-sm text-slate-400">
          Your browser or device does not support WebGL, which the 3D solar system needs.
          Try another browser, or update your graphics drivers.
        </p>
      </div>
    </section>
  )
}
