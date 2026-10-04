// The Sun's own point light lives in <Sun />. This only keeps the night side from going pitch black.
const AMBIENT_INTENSITY = 0.3

export function Lighting() {
  return <ambientLight intensity={AMBIENT_INTENSITY} />
}
