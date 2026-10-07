import { Canvas } from '@react-three/fiber'
import { useState } from 'react'
import { CAMERA } from '@/features/solar-system/data/camera'
import { useDeselectOnEscape } from '@/features/solar-system/hooks/useDeselectOnEscape'
import { useResetHighlightOnUnmount } from '@/features/solar-system/hooks/useResetHighlightOnUnmount'
import { OverlayRegistry } from '@/features/solar-system/utils/overlayRegistry'
import { isWebGLSupported } from '@/features/solar-system/utils/webgl'
import { useSolarSystemStore } from '@/store/solarSystemStore'
import type { Planet } from '@/types/planet'
import { CameraController } from './CameraController'
import { OverlayPositioner } from './OverlayPositioner'
import { ResetViewButton } from './ResetViewButton'
import { SceneOverlay } from './SceneOverlay'
import { SolarSystem } from './SolarSystem'
import { WebGLUnsupported } from './WebGLUnsupported'

const BACKGROUND_COLOR = '#03050c'
// Caps pixel density: sharp on retina screens without overloading mid-range phones.
const PIXEL_RATIO_RANGE: [number, number] = [1, 2]

export function SolarSystemCanvas({ planets }: { planets: readonly Planet[] }) {
  const [registry] = useState(() => new OverlayRegistry())
  const selectPlanet = useSolarSystemStore((state) => state.selectPlanet)
  useDeselectOnEscape()
  useResetHighlightOnUnmount()

  if (!isWebGLSupported()) return <WebGLUnsupported />

  return (
    <div className="relative isolate h-full">
      <Canvas
        aria-hidden="true"
        dpr={PIXEL_RATIO_RANGE}
        camera={{ fov: CAMERA.fov, near: CAMERA.near, far: CAMERA.far }}
        onPointerMissed={(event) => {
          // R3F also reports right-button presses (the contextmenu event) as "missed clicks".
          // Only a real click on empty space clears the selection; a right-drag is a pan.
          if (event.type === 'click') selectPlanet(null)
        }}
      >
        <color attach="background" args={[BACKGROUND_COLOR]} />
        <CameraController bodies={planets} />
        <SolarSystem planets={planets} />
        {/* After the camera controller, so it reads this frame's camera. */}
        <OverlayPositioner bodies={planets} registry={registry} />
      </Canvas>
      <SceneOverlay bodies={planets} registry={registry} />
      <ResetViewButton />
    </div>
  )
}
