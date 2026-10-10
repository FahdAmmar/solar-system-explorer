import { describe, expect, it } from 'vitest'
import { getOrbitAngle, getSpinAngle, getSpinRate } from './bodyMotion'

const FULL_TURN = Math.PI * 2

describe('getOrbitAngle', () => {
  it('is proportional to the share of the period that has passed', () => {
    expect(getOrbitAngle(100, 0)).toBe(0)
    expect(getOrbitAngle(100, 25)).toBeCloseTo(Math.PI / 2)
    expect(getOrbitAngle(100, 50)).toBeCloseTo(Math.PI)
  })

  it('starts over after a full period', () => {
    expect(getOrbitAngle(100, 100)).toBeCloseTo(0)
    expect(getOrbitAngle(100, 125)).toBeCloseTo(Math.PI / 2)
  })

  it('makes a short-period planet travel faster', () => {
    expect(getOrbitAngle(88, 44)).toBeGreaterThan(getOrbitAngle(365.2, 44))
  })

  it.each([0, -10, NaN, Infinity])('returns 0 for an invalid period (%s)', (period) => {
    expect(getOrbitAngle(period, 50)).toBe(0)
  })

  it.each([NaN, Infinity])('returns 0 for invalid time (%s)', (days) => {
    expect(getOrbitAngle(100, days)).toBe(0)
  })
})

describe('getSpinRate', () => {
  it('maps an Earth-length day to the base visual rate', () => {
    expect(getSpinRate(24)).toBeCloseTo(0.4)
  })

  it('spins faster bodies faster, and slower bodies slower', () => {
    expect(getSpinRate(10)).toBeGreaterThan(getSpinRate(24))
    expect(getSpinRate(1407.6)).toBeLessThan(getSpinRate(24))
  })

  it('keeps the order but compresses the range (a square-root curve, not a blur)', () => {
    // A body spinning 100x faster looks only 10x faster.
    expect(getSpinRate(0.24) / getSpinRate(24)).toBeCloseTo(10)
  })

  it('is negative for retrograde spin and mirrors the prograde rate', () => {
    expect(getSpinRate(-5832.5)).toBeLessThan(0)
    expect(getSpinRate(-24)).toBeCloseTo(-getSpinRate(24))
  })

  it.each([0, NaN, Infinity, -Infinity])('returns 0 for %s', (hours) => {
    expect(getSpinRate(hours)).toBe(0)
  })
})

describe('getSpinAngle', () => {
  it('advances with time and wraps within one turn', () => {
    expect(getSpinAngle(24, 1)).toBeCloseTo(0.4)
    expect(Math.abs(getSpinAngle(24, 10_000))).toBeLessThan(FULL_TURN)
  })

  it('returns 0 for non-finite time', () => {
    expect(getSpinAngle(24, NaN)).toBe(0)
    expect(getSpinAngle(24, Infinity)).toBe(0)
  })
})
