export const CAMERA = {
  fov: 45,
  near: 0.1,
  far: 1500,
  /** Angle above the orbital plane for the default view. */
  elevationDegrees: 35,
  /** Radius of the area that must fit on screen: outermost orbit plus a margin. */
  framedRadius: 75,
  /** Upper limit that keeps the camera inside the star field. */
  maxFitDistance: 380,
} as const
