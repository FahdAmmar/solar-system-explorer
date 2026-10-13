import { Canvas, useThree } from '@react-three/fiber'
import { Fragment, useLayoutEffect } from 'react'
import type { PerspectiveCamera } from 'three'
import { Lighting } from '@/features/solar-system/components/Lighting'
import { Orbit } from '@/features/solar-system/components/Orbit'
import { Planet } from '@/features/solar-system/components/Planet'
import { Sun } from '@/features/solar-system/components/Sun'
import { CAMERA } from '@/features/solar-system/data/camera'
import { useReleaseSharedResources } from '@/features/solar-system/hooks/useReleaseSharedResources'
import { useSimulationDriver } from '@/features/solar-system/hooks/useSimulationDriver'
import type { BodyHandlers } from '@/features/solar-system/types/interaction'
import { getStartAngle } from '@/features/solar-system/utils/orbit'
import { toSceneDistance } from '@/features/solar-system/utils/scale'
import type { SimulationClock } from '@/features/solar-system/utils/simulationClock'
import { useSolarSystemStore } from '@/store/solarSystemStore'
import type { Planet as PlanetData } from '@/types/planet'
import { PREVIEW } from '../data/preview'
import { isShownInPreview } from '../utils/previewBodies'
import { getPreviewView } from '../utils/previewView'

// The preview cannot be clicked (its container ignores the pointer), so nothing to handle.
const noop = () => undefined
const NO_HANDLERS: BodyHandlers = { onSelect: noop, onHover: noop, onHoverEnd: noop }

// Lower than Explore: this is decoration, and it must not cost a phone its battery.
const PIXEL_RATIO_RANGE: [number, number] = [1, 1.5]

// Places the camera and slides the picture so the Sun lands where the text leaves room.
// `setViewOffset` shifts the image without turning the camera, so perspective stays natural.
function PreviewCamera() {
  const camera = useThree((state) => state.camera) as PerspectiveCamera
  const size = useThree((state) => state.size)
  const invalidate = useThree((state) => state.invalidate)

  useLayoutEffect(() => {
    const { width, height } = size
    const view = getPreviewView(width / height)
    const elevation = (PREVIEW.elevationDegrees * Math.PI) / 180

    camera.position.set(
      0,
      Math.sin(elevation) * view.distance,
      Math.cos(elevation) * view.distance,
    )
    camera.lookAt(0, 0, 0)
    camera.setViewOffset(
      width,
      height,
      (0.5 - view.sunX) * width,
      (0.5 - view.sunY) * height,
      width,
      height,
    )
    camera.updateProjectionMatrix()
    invalidate()

    return () => camera.clearViewOffset()
  }, [camera, size, invalidate])

  return null
}

// Same simulated time as the Explore page, so the planets are where you will find them.
function PreviewClock({ clock }: { clock: SimulationClock }) {
  useSimulationDriver(clock)
  return null
}

interface PreviewSceneProps {
  planets: readonly PlanetData[]
  onReady: () => void
}

export default function PreviewScene({ planets, onReady }: PreviewSceneProps) {
  useReleaseSharedResources()
  const clock = useSolarSystemStore((state) => state.clock)
  const isPaused = useSolarSystemStore((state) => state.isPaused)
  const sun = planets.find((body) => body.type === 'star')
  const orbitingBodies = planets.filter((body) => body.type !== 'star')

  return (
    <Canvas
      aria-hidden="true"
      // R3F sets pointer-events: auto on its own wrapper, which would override the layer
      // above. The preview is a picture: no hover, no click, no swallowed touch gestures.
      style={{ pointerEvents: 'none' }}
      dpr={PIXEL_RATIO_RANGE}
      // Paused (including reduced motion): draw once, then stop using the GPU.
      frameloop={isPaused ? 'demand' : 'always'}
      // Transparent, so the CSS stars show through behind the planets.
      gl={{ alpha: true, powerPreference: 'low-power' }}
      camera={{ fov: CAMERA.fov, near: CAMERA.near, far: CAMERA.far }}
      onCreated={onReady}
    >
      <PreviewCamera />
      <PreviewClock clock={clock} />
      <Lighting />
      {sun && <Sun data={sun} clock={clock} {...NO_HANDLERS} />}
      {orbitingBodies.map(
        (body, index) =>
          isShownInPreview(body) && (
            <Fragment key={body.id}>
              <Orbit radius={toSceneDistance(body.distanceFromSun)} />
              {/* The index is among ALL planets, as in Explore, so every planet starts in the same place. */}
              <Planet
                data={body}
                startAngle={getStartAngle(index)}
                clock={clock}
                selected={false}
                hovered={false}
                {...NO_HANDLERS}
              />
            </Fragment>
          ),
      )}
    </Canvas>
  )
}
