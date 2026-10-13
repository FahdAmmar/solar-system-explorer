import { LineBasicMaterial, Sprite } from 'three'
import { unitCircleGeometry, unitSphereGeometry } from './geometries'

// One material for every orbit, so a single opacity change fades them all together.
export const orbitMaterial = new LineBasicMaterial({
  color: '#8aa4d6',
  transparent: true,
  opacity: 0.3,
})

// three.js gives every Sprite (the Sun's glow) the same geometry, kept private in its own module
// and never freed. A throwaway sprite is the only way to reach it.
const spriteGeometry = new Sprite().geometry

// Frees the GPU copy of every module-level resource. Each renderer that drew with one of them
// left a "dispose" listener on it; dispatching the event runs and removes those listeners.
// The objects stay usable: three.js uploads them again the next time they are drawn.
export function disposeSharedResources() {
  unitSphereGeometry.dispose()
  unitCircleGeometry.dispose()
  orbitMaterial.dispose()
  spriteGeometry.dispose()
}
