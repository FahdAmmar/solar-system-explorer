import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { type ComponentRef, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { PerspectiveCamera } from 'three'
import { CameraDirector } from '@/features/solar-system/utils/cameraDirector'
import { getBodyObjectName } from '@/features/solar-system/utils/bodyObjectName'
import { prefersReducedMotion } from '@/features/solar-system/utils/motion'
import { getVisualExtent } from '@/features/solar-system/utils/scale'
import { useSolarSystemStore } from '@/store/solarSystemStore'
import type { Planet } from '@/types/planet'

const DAMPING_FACTOR = 0.08
// After the controls (-1), before the overlay (0). R3F renders automatically only while
// every frame callback stays at or below 0.
const DIRECTOR_PRIORITY = -0.5

// Free camera (orbit, zoom, pan) plus focus and reset. The store says what to do and
// <CameraDirector /> decides how the move looks; this component only connects the two.
export function CameraController({ bodies }: { bodies: readonly Planet[] }) {
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null)
  const directorRef = useRef<CameraDirector | null>(null)
  const get = useThree((state) => state.get)
  const aspect = useThree((state) => state.size.width / state.size.height)
  const extents = useMemo(
    () => new Map(bodies.map((body) => [body.id, getVisualExtent(body)])),
    [bodies],
  )

  useLayoutEffect(() => {
    const controls = controlsRef.current
    const { camera } = get()
    if (!controls || !(camera instanceof PerspectiveCamera)) return

    const store = useSolarSystemStore
    const director = new CameraDirector({
      camera,
      controls,
      bodyIds: [...extents.keys()],
      findBody: (id) => get().scene.getObjectByName(getBodyObjectName(id)),
      getExtent: (id) => extents.get(id),
      getAspect: () => get().size.width / get().size.height,
      shouldAnimate: () => !prefersReducedMotion(),
      onModeChange: (mode) => store.getState().setCameraMode(mode),
    })
    directorRef.current = director
    director.placeAtDefault()

    // A selection that outlived the page starts focused, without replaying the flight.
    const { selectedPlanetId } = store.getState()
    if (selectedPlanetId) director.focus(selectedPlanetId, false)

    // Remember the last command handled, rather than comparing with the previous state: the
    // director itself updates the store, and nested updates re-notify listeners out of order.
    let lastHandled = store.getState().cameraCommand
    const unsubscribe = store.subscribe((state) => {
      const { cameraCommand } = state
      if (!cameraCommand || cameraCommand === lastHandled) return
      lastHandled = cameraCommand
      director.execute(cameraCommand)
    })

    return () => {
      unsubscribe()
      director.dispose()
      directorRef.current = null
      store.getState().setCameraMode('free')
    }
  }, [get, extents])

  useEffect(() => {
    directorRef.current?.refitIfPristine()
  }, [aspect])

  useFrame(() => directorRef.current?.update(), DIRECTOR_PRIORITY)

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={DAMPING_FACTOR}
      onStart={() => directorRef.current?.interrupt()}
    />
  )
}
