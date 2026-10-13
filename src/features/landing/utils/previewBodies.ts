import { toSceneDistance } from '@/features/solar-system/utils/scale'
import type { Planet } from '@/types/planet'
import { PREVIEW } from '../data/preview'

// The Sun always shows. Planets show only when their orbit fits the cropped preview, which
// keeps the picture calm: fewer lines crossing the text, and Saturn's rings as the highlight.
export const isShownInPreview = (body: Planet): boolean =>
  body.type === 'star' || toSceneDistance(body.distanceFromSun) <= PREVIEW.maxOrbitRadius
