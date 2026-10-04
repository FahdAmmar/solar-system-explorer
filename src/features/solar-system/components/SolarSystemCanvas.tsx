import { Canvas } from '@react-three/fiber'
import { CAMERA } from '@/features/solar-system/data/camera'
import { isWebGLSupported } from '@/features/solar-system/utils/webgl'
import type { Planet } from '@/types/planet'
import { CameraController } from './CameraController'
import { SolarSystem } from './SolarSystem'
import { WebGLUnsupported } from './WebGLUnsupported'

const BACKGROUND_COLOR = '#03050c'
// Caps pixel density: sharp on retina screens without overloading mid-range phones.
const PIXEL_RATIO_RANGE: [number, number] = [1, 2]

export function SolarSystemCanvas({ planets }: { planets: readonly Planet[] }) {
  if (!isWebGLSupported()) return <WebGLUnsupported />

  return (
    <Canvas
      dpr={PIXEL_RATIO_RANGE}
      camera={{ fov: CAMERA.fov, near: CAMERA.near, far: CAMERA.far }}
    >
      <color attach="background" args={[BACKGROUND_COLOR]} />
      <CameraController />
      <SolarSystem planets={planets} />
    </Canvas>
  )
}
