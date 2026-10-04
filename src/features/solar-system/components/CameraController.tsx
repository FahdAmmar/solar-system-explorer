import { useThree } from '@react-three/fiber'
import { useLayoutEffect } from 'react'
import { PerspectiveCamera } from 'three'
import { getDefaultCameraPosition } from '@/features/solar-system/utils/cameraFraming'

// Phase 3: frames the whole system for the current screen shape.
// Phase 5 adds free movement, focus and reset on top of this.
export function CameraController() {
  const camera = useThree((state) => state.camera)
  const aspect = useThree((state) => state.size.width / state.size.height)

  useLayoutEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return
    const [x, y, z] = getDefaultCameraPosition(aspect, camera.fov)
    camera.position.set(x, y, z)
    camera.lookAt(0, 0, 0)
  }, [camera, aspect])

  return null
}
