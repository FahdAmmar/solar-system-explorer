const FULL_TURN = Math.PI * 2
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

// Spreads planets around their orbits so they do not line up in a row.
// Orbits run counter-clockwise seen from above (+Y), which is the real prograde direction.
export function getStartAngle(index: number): number {
  return (index * GOLDEN_ANGLE) % FULL_TURN
}
