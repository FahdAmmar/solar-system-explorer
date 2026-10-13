import { Sprite } from 'three'
import { describe, expect, it } from 'vitest'
import { unitCircleGeometry, unitSphereGeometry } from './geometries'
import { disposeSharedResources, orbitMaterial } from './sharedResources'

describe('disposeSharedResources', () => {
  it('notifies the renderers that hold each shared resource', () => {
    const notified: string[] = []
    const shared = {
      sphere: unitSphereGeometry,
      circle: unitCircleGeometry,
      orbit: orbitMaterial,
      // The geometry every sprite shares, which three.js never frees on its own.
      sprite: new Sprite().geometry,
    }
    for (const [name, resource] of Object.entries(shared))
      resource.addEventListener('dispose', () => notified.push(name))

    disposeSharedResources()

    expect(notified.sort()).toEqual(['circle', 'orbit', 'sphere', 'sprite'])
  })

  it('keeps the resources usable afterwards', () => {
    disposeSharedResources()
    expect(unitSphereGeometry.getAttribute('position').count).toBeGreaterThan(0)
    expect(unitCircleGeometry.getAttribute('position').count).toBeGreaterThan(0)
  })
})
