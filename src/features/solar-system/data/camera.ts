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

export const CAMERA_LIMITS = {
  /** Closest the free camera can get to its target. Bodies are protected by `bodyClearance`. */
  freeMinDistance: 1,
  /** The camera is pushed out of any body to this many body extents from its centre. */
  bodyClearance: 1.1,
  /** Stays inside the star field. */
  maxDistance: 480,
  /** Farthest the free camera's target can be panned from the Sun. */
  panRadius: 90,
  /** A focused camera keeps at least this many body extents between it and the body. */
  focusMinDistanceFactor: 1.4,
} as const

export const CAMERA_FOCUS = {
  /** Share of the smaller screen angle that the focused body should fill. */
  fillFraction: 0.38,
  /**
   * Weights for where the camera sits around a body: toward the Sun (the lit side), above the
   * orbital plane, and along the orbit. The mix shows a mostly lit body with a visible terminator.
   */
  sunwardWeight: 0.55,
  upWeight: 0.45,
  orbitWeight: 0.35,
} as const

export const CAMERA_TRANSITION = {
  minDurationSeconds: 0.9,
  maxDurationSeconds: 2,
  secondsPerUnit: 0.012,
  /** The trip first rises by this share of its length, so it clears the Sun. */
  liftFactor: 0.35,
  minLift: 6,
  /** The last stretch runs straight toward the body, starting this share of the trip away. */
  approachFactor: 0.6,
  /** ...but never more than this many final distances from the body. */
  maxApproachInFinalDistances: 3,
  /** Control points stay inside this radius, so arcs never reach the star field edge. */
  maxPathRadius: 450,
  ease: 'power3.inOut',
} as const
