// Procedural surface detail. Without it a uniformly coloured sphere looks the same at every
// angle and its spin could not be seen. Placeholder art: no real maps, no downloads.
/** Gas and ice giants get horizontal cloud bands; every other body gets patches. */
export const BANDED_BODY_IDS: ReadonlySet<string> = new Set([
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
])

export const SURFACE_TEXTURE = {
  width: 512,
  height: 256,
  /** Strongest tint a band or patch applies over the base colour (0..1). */
  maxContrast: 0.22,
  bandCount: 7,
  bandedPatchCount: 16,
  patchCount: 46,
  /** Patch size in texture pixels. */
  minPatchRadius: 12,
  maxPatchRadius: 46,
  /** Height of a patch relative to its width: banded bodies get long, thin streaks. */
  bandedPatchAspect: 0.28,
  patchAspect: 0.8,
} as const
