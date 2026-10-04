export type PlanetType = 'star' | 'planet' | 'dwarf-planet'

export interface Planet {
  id: string
  name: string
  type: PlanetType
  /** Mean radius in km. */
  radius: number
  /** Mean distance from the Sun in million km (0 for the Sun). */
  distanceFromSun: number
  /** Orbital period in Earth days (0 for the Sun, which does not orbit). */
  orbitalPeriod: number
  /** Sidereal rotation period in hours. Negative means retrograde spin. */
  rotationPeriod: number
  /** Mean temperature in °C (1 bar level for gas giants, photosphere for the Sun). */
  temperature: number
  /** Confirmed moons. Counts change as new moons are announced. */
  moons: number
  description: string
  /** Base display color as a hex string. */
  color: string
}
