export type CameraMode = 'free' | 'focusing' | 'focused'

// What should happen to the camera. The camera director decides how it looks.
export type CameraCommand =
  { type: 'focus'; id: string } | { type: 'release' } | { type: 'reset' }
