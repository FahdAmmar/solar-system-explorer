import { describe, expect, it } from 'vitest'
import { planets } from '@/data/planets'
import { isShownInPreview } from './previewBodies'

describe('isShownInPreview', () => {
  it('shows the Sun and the planets out to Saturn', () => {
    const shown = planets.filter(isShownInPreview).map((body) => body.id)
    expect(shown).toEqual([
      'sun',
      'mercury',
      'venus',
      'earth',
      'mars',
      'jupiter',
      'saturn',
    ])
  })

  it('leaves out the far planets that would only add lines behind the text', () => {
    const hidden = planets.filter((body) => !isShownInPreview(body)).map((b) => b.id)
    expect(hidden).toEqual(['uranus', 'neptune'])
  })

  it('always shows a star, wherever its data says it is', () => {
    const sun = planets.find((body) => body.type === 'star')!
    expect(isShownInPreview({ ...sun, distanceFromSun: 99_999 })).toBe(true)
  })
})
