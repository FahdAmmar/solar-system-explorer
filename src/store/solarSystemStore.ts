import { create } from 'zustand'
import {
  DEFAULT_SIMULATION_SPEED,
  type SimulationSpeed,
} from '@/features/solar-system/data/simulation'
import type { CameraCommand, CameraMode } from '@/features/solar-system/types/camera'
import { SimulationClock } from '@/features/solar-system/utils/simulationClock'
import { prefersReducedMotion } from '@/utils/motion'

// WHERE STATE LIVES
//  - This store: client state that several components share or that must outlive a page
//    (selection, simulation controls, view toggles, camera requests, simulated time).
//  - useState in a component: state only that component cares about (search text, panel open).
//  - Plain objects owned by one mounted scene (OverlayRegistry): they point at 3D objects
//    that are destroyed with the canvas, so they must not outlive it.
//  - TanStack Query (usePlanets): planet data. It is server state and never goes in here.
export interface SolarSystemState {
  selectedPlanetId: string | null
  /** Pointer hover. */
  hoveredPlanetId: string | null
  /** Keyboard focus on a planet button. Kept apart from hover so the two never overwrite each other. */
  focusedPlanetId: string | null
  isPaused: boolean
  cameraMode: CameraMode
  /** The latest camera request. A new object per request, so asking twice still moves the camera. */
  cameraCommand: CameraCommand | null
  simulationSpeed: SimulationSpeed
  showOrbits: boolean
  showLabels: boolean
  showStars: boolean
  /**
   * Simulated time. One mutable object whose reference never changes: the frame loop advances
   * it every frame WITHOUT notifying subscribers, because a store update that often would
   * re-render React 60 times a second. It lives here, not in a component, so time survives
   * leaving and returning to the page. Mount one scene at a time: each scene advances it.
   */
  readonly clock: SimulationClock

  selectPlanet: (id: string | null) => void
  hoverPlanet: (id: string | null) => void
  /** Clears hover only if `id` is still the hovered body (avoids out/over event races). */
  unhoverPlanet: (id: string) => void
  focusPlanet: (id: string | null) => void
  unfocusPlanet: (id: string) => void
  togglePause: () => void
  resetView: () => void
  setCameraMode: (mode: CameraMode) => void
  setSimulationSpeed: (speed: SimulationSpeed) => void
  toggleOrbits: () => void
  toggleLabels: () => void
  toggleStars: () => void
}

export const useSolarSystemStore = create<SolarSystemState>()((set) => ({
  selectedPlanetId: null,
  hoveredPlanetId: null,
  focusedPlanetId: null,
  // Continuous motion is off by default for people who asked their system for less of it.
  isPaused: prefersReducedMotion(),
  cameraMode: 'free',
  cameraCommand: null,
  simulationSpeed: DEFAULT_SIMULATION_SPEED,
  showOrbits: true,
  showLabels: true,
  showStars: true,
  clock: new SimulationClock(),

  selectPlanet: (id) =>
    set(
      id === null
        ? { selectedPlanetId: null, cameraCommand: { type: 'release' } }
        : { selectedPlanetId: id, cameraCommand: { type: 'focus', id } },
    ),
  resetView: () => set({ selectedPlanetId: null, cameraCommand: { type: 'reset' } }),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  hoverPlanet: (id) => set({ hoveredPlanetId: id }),
  unhoverPlanet: (id) =>
    set((state) => (state.hoveredPlanetId === id ? { hoveredPlanetId: null } : state)),
  focusPlanet: (id) => set({ focusedPlanetId: id }),
  unfocusPlanet: (id) =>
    set((state) => (state.focusedPlanetId === id ? { focusedPlanetId: null } : state)),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
  toggleOrbits: () => set((state) => ({ showOrbits: !state.showOrbits })),
  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),
  toggleStars: () => set((state) => ({ showStars: !state.showStars })),
}))

/** The body to emphasise: the pointer wins over keyboard focus. */
export const selectHighlightedId = (state: SolarSystemState): string | null =>
  state.hoveredPlanetId ?? state.focusedPlanetId
