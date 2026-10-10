import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SIMULATION_SPEED } from '@/features/solar-system/data/simulation'
import { selectHighlightedId, useSolarSystemStore } from './solarSystemStore'

const initialState = useSolarSystemStore.getState()
const state = () => useSolarSystemStore.getState()

beforeEach(() => {
  useSolarSystemStore.setState(initialState, true)
})

describe('selection and camera requests', () => {
  it('selecting a planet also asks the camera to focus it', () => {
    state().selectPlanet('mars')
    expect(state().selectedPlanetId).toBe('mars')
    expect(state().cameraCommand).toEqual({ type: 'focus', id: 'mars' })
  })

  it('selecting the same planet twice makes a new request, so the camera moves again', () => {
    state().selectPlanet('mars')
    const first = state().cameraCommand
    state().selectPlanet('mars')
    expect(state().cameraCommand).not.toBe(first)
    expect(state().cameraCommand).toEqual(first)
  })

  it('clearing the selection releases the camera', () => {
    state().selectPlanet('earth')
    state().selectPlanet(null)
    expect(state().selectedPlanetId).toBeNull()
    expect(state().cameraCommand).toEqual({ type: 'release' })
  })

  it('reset view clears the selection and asks the camera to go home', () => {
    state().selectPlanet('earth')
    state().resetView()
    expect(state().selectedPlanetId).toBeNull()
    expect(state().cameraCommand).toEqual({ type: 'reset' })
  })

  it('tracks the camera mode', () => {
    state().setCameraMode('focusing')
    expect(state().cameraMode).toBe('focusing')
  })
})

describe('hover and keyboard focus', () => {
  it('lets the pointer win over keyboard focus', () => {
    state().focusPlanet('venus')
    state().hoverPlanet('mars')
    expect(selectHighlightedId(state())).toBe('mars')
  })

  it('falls back to keyboard focus when the pointer leaves', () => {
    state().focusPlanet('venus')
    state().hoverPlanet('mars')
    state().unhoverPlanet('mars')
    expect(selectHighlightedId(state())).toBe('venus')
  })

  it('ignores a stale "pointer left" for a body that is no longer hovered', () => {
    state().hoverPlanet('mars')
    state().hoverPlanet('earth')
    state().unhoverPlanet('mars')
    expect(state().hoveredPlanetId).toBe('earth')
  })

  it('ignores a stale "focus left" for a body that is no longer focused', () => {
    state().focusPlanet('venus')
    state().focusPlanet('earth')
    state().unfocusPlanet('venus')
    expect(state().focusedPlanetId).toBe('earth')
  })
})

describe('simulation and view settings', () => {
  it('starts with sensible defaults', () => {
    expect(state().simulationSpeed).toBe(DEFAULT_SIMULATION_SPEED)
    expect(state()).toMatchObject({ showOrbits: true, showLabels: true, showStars: true })
    expect(state().selectedPlanetId).toBeNull()
  })

  it('toggles pause', () => {
    const before = state().isPaused
    state().togglePause()
    expect(state().isPaused).toBe(!before)
    state().togglePause()
    expect(state().isPaused).toBe(before)
  })

  it('sets the simulation speed', () => {
    state().setSimulationSpeed(50)
    expect(state().simulationSpeed).toBe(50)
  })

  it('toggles orbits, labels and stars independently', () => {
    state().toggleOrbits()
    expect(state()).toMatchObject({
      showOrbits: false,
      showLabels: true,
      showStars: true,
    })
    state().toggleLabels()
    state().toggleStars()
    expect(state()).toMatchObject({
      showOrbits: false,
      showLabels: false,
      showStars: false,
    })
  })

  it('keeps one clock object for the whole session', () => {
    const clock = state().clock
    state().togglePause()
    state().selectPlanet('mars')
    expect(state().clock).toBe(clock)
  })

  it('holds no planet data (that is server state, owned by TanStack Query)', () => {
    expect(Object.keys(state())).not.toContain('planets')
  })
})
