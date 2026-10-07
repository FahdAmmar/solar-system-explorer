import { create } from 'zustand'
import {
  DEFAULT_SIMULATION_SPEED,
  type SimulationSpeed,
} from '@/features/solar-system/data/simulation'
import type { CameraCommand, CameraMode } from '@/features/solar-system/types/camera'

// Client/UI state only. Planet data is server state and belongs to TanStack Query.
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
  isPaused: false,
  cameraMode: 'free',
  cameraCommand: null,
  simulationSpeed: DEFAULT_SIMULATION_SPEED,
  showOrbits: true,
  showLabels: true,
  showStars: true,

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
