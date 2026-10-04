import { BufferGeometry, RingGeometry, SphereGeometry, Vector3 } from 'three'
import { SATURN_RING_RADII } from '@/features/solar-system/data/visualScale'

const SPHERE_WIDTH_SEGMENTS = 48
const SPHERE_HEIGHT_SEGMENTS = 32
const ORBIT_SEGMENTS = 128
const RING_SEGMENTS = 96

// Shared app-wide singletons. Meshes use them with `dispose={null}` and set their size via `scale`.
export const unitSphereGeometry = new SphereGeometry(
  1,
  SPHERE_WIDTH_SEGMENTS,
  SPHERE_HEIGHT_SEGMENTS,
)

// Circle of radius 1 in the orbital plane (XZ).
export const unitCircleGeometry = new BufferGeometry().setFromPoints(
  Array.from({ length: ORBIT_SEGMENTS }, (_, index) => {
    const angle = (index / ORBIT_SEGMENTS) * Math.PI * 2
    return new Vector3(Math.cos(angle), 0, Math.sin(angle))
  }),
)

// Flat ring of radius 1 in the XZ plane. The default UVs are planar, so they are rewritten
// to map the radius to U, which lets a 1D texture draw the ring bands.
export function createSaturnRingGeometry(): RingGeometry {
  const { inner, outer } = SATURN_RING_RADII
  const geometry = new RingGeometry(inner, outer, RING_SEGMENTS)
  const positions = geometry.getAttribute('position')
  const uvs = geometry.getAttribute('uv')
  const vertex = new Vector3()
  for (let index = 0; index < positions.count; index++) {
    vertex.fromBufferAttribute(positions, index)
    uvs.setXY(index, (vertex.length() - inner) / (outer - inner), 0.5)
  }
  geometry.rotateX(-Math.PI / 2)
  return geometry
}
