import { create } from 'zustand'
import {
  DEFAULT_SIMULATION_SPEED,
  type SimulationSpeed,
} from '@/features/solar-system/data/simulation'

// Client/UI state only. Planet data is server state and belongs to TanStack Query.
export interface SolarSystemState {
  selectedPlanetId: string | null
  isPaused: boolean
  simulationSpeed: SimulationSpeed
  showOrbits: boolean
  showLabels: boolean
  showStars: boolean

  selectPlanet: (id: string | null) => void
  togglePause: () => void
  setSimulationSpeed: (speed: SimulationSpeed) => void
  toggleOrbits: () => void
  toggleLabels: () => void
  toggleStars: () => void
}

export const useSolarSystemStore = create<SolarSystemState>()((set) => ({
  selectedPlanetId: null,
  isPaused: false,
  simulationSpeed: DEFAULT_SIMULATION_SPEED,
  showOrbits: true,
  showLabels: true,
  showStars: true,

  selectPlanet: (id) => set({ selectedPlanetId: id }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
  toggleOrbits: () => set((state) => ({ showOrbits: !state.showOrbits })),
  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),
  toggleStars: () => set((state) => ({ showStars: !state.showStars })),
}))
