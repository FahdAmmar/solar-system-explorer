import { describe, expect, it } from 'vitest'
import { buttonClass } from './buttonClass'

describe('buttonClass', () => {
  it('defaults to a medium secondary button, as before the size option existed', () => {
    expect(buttonClass()).toBe(buttonClass('secondary', 'md'))
    expect(buttonClass()).toContain('min-h-11')
    expect(buttonClass()).toContain('border-edge-strong')
  })

  it('keeps every size and variant at least 44px tall (touch target)', () => {
    for (const variant of ['primary', 'secondary', 'ghost'] as const) {
      expect(buttonClass(variant, 'md')).toContain('min-h-11')
      expect(buttonClass(variant, 'lg')).toContain('min-h-14')
    }
  })

  it('never mixes two sizes in one class list', () => {
    expect(buttonClass('primary', 'lg')).not.toContain('min-h-11')
    expect(buttonClass('primary', 'md')).not.toContain('min-h-14')
  })
})
