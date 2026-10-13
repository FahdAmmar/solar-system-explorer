import { CAMERA } from '@/features/solar-system/data/camera'

// The landing page shows a cropped, decorative piece of the real scene.
export const PREVIEW = {
  fov: CAMERA.fov,
  /** Angle above the orbital plane. Lower than the Explore default, so the orbits read as wide ellipses. */
  elevationDegrees: 24,
  /** Scene units visible across the shorter side of the screen. */
  visibleExtent: 46,
  /** Keeps the camera inside the far plane on very narrow screens. */
  maxDistance: 700,
  /** Orbits beyond this scene radius are left out: the preview shows part of the system. */
  maxOrbitRadius: 40,
  /** Where the Sun lands on screen (0 to 1 from the left / top), by screen shape. */
  sunPosition: {
    landscape: { x: 0.72, y: 0.54 },
    portrait: { x: 0.5, y: 0.8 },
  },
} as const
