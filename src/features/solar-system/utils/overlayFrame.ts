import { PerspectiveCamera, Vector3, type Camera, type Object3D, type Scene } from 'three'
import type { MarkerKind } from '@/features/solar-system/types/interaction'
import { getBodyObjectName } from '@/features/solar-system/utils/bodyObjectName'
import {
  getMarkerDiameter,
  resolveLabelVisibility,
  type LabelBox,
} from '@/features/solar-system/utils/overlayLayout'
import type { OverlayRegistry } from '@/features/solar-system/utils/overlayRegistry'
import {
  getWorldUnitsPerPixel,
  projectToScreen,
} from '@/features/solar-system/utils/projection'
import { getVisualExtent } from '@/features/solar-system/utils/scale'
import { selectHighlightedId, useSolarSystemStore } from '@/store/solarSystemStore'
import type { Planet } from '@/types/planet'

// Per-frame overlay logic. Everything is allocated once in createOverlayState and then
// mutated in place by updateOverlay, because this runs on every rendered frame.

interface BodyState extends LabelBox {
  id: string
  /** Radius of the body (with rings) in world units. */
  extent: number
  object: Object3D | null
  // Last values written to the DOM, to skip redundant style writes.
  appliedX: number
  appliedY: number
  appliedVisible: boolean
  appliedUsable: boolean
}

interface MarkerState {
  x: number
  y: number
  diameter: number
  shown: boolean
}

export interface OverlayState {
  /** Most important first: bigger bodies win when labels collide. */
  bodies: BodyState[]
  markers: Record<MarkerKind, MarkerState>
  registry: OverlayRegistry
  scene: Scene
  worldPosition: Vector3
  screenPosition: Vector3
}

const MARKER_KINDS: readonly MarkerKind[] = ['selected', 'hover']

const createBodyState = (body: Planet): BodyState => ({
  id: body.id,
  extent: getVisualExtent(body),
  object: null,
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  centerX: 0,
  centerY: 0,
  radius: 0,
  usable: false,
  forced: false,
  visible: false,
  appliedX: NaN,
  appliedY: NaN,
  appliedVisible: false,
  appliedUsable: true,
})

const createMarkerState = (): MarkerState => ({
  x: NaN,
  y: NaN,
  diameter: NaN,
  shown: false,
})

export function createOverlayState(
  bodies: readonly Planet[],
  registry: OverlayRegistry,
  scene: Scene,
): OverlayState {
  return {
    bodies: [...bodies].sort((a, b) => b.radius - a.radius).map(createBodyState),
    markers: { selected: createMarkerState(), hover: createMarkerState() },
    registry,
    scene,
    worldPosition: new Vector3(),
    screenPosition: new Vector3(),
  }
}

function applyLabel(element: HTMLElement, body: BodyState) {
  if (body.usable !== body.appliedUsable) {
    // A label that is off screen cannot show where keyboard focus is, so it leaves the tab order
    // (WCAG 2.4.7). Screen readers still find it, and search reaches every planet.
    element.firstElementChild?.setAttribute('tabindex', body.usable ? '0' : '-1')
    body.appliedUsable = body.usable
  }
  if (body.visible !== body.appliedVisible) {
    element.style.opacity = body.visible ? '1' : '0'
    element.style.pointerEvents = body.visible ? 'auto' : 'none'
    body.appliedVisible = body.visible
  }
  if (body.x !== body.appliedX || body.y !== body.appliedY) {
    element.style.transform = `translate3d(${body.x}px, ${body.y}px, 0)`
    body.appliedX = body.x
    body.appliedY = body.y
  }
}

function applyMarker(
  element: HTMLElement,
  marker: MarkerState,
  body: BodyState | undefined,
) {
  const shown = body !== undefined && body.usable
  if (shown !== marker.shown) {
    element.style.opacity = shown ? '1' : '0'
    marker.shown = shown
  }
  if (!shown) return

  const diameter = body.radius * 2
  const x = body.centerX - body.radius
  const y = body.centerY - body.radius
  if (x !== marker.x || y !== marker.y) {
    element.style.transform = `translate3d(${x}px, ${y}px, 0)`
    marker.x = x
    marker.y = y
  }
  if (diameter !== marker.diameter) {
    element.style.width = `${diameter}px`
    element.style.height = `${diameter}px`
    marker.diameter = diameter
  }
}

function findBody(
  bodies: readonly BodyState[],
  id: string | null,
): BodyState | undefined {
  if (id === null) return undefined
  for (const body of bodies) if (body.id === id) return body
  return undefined
}

export function updateOverlay(
  overlay: OverlayState,
  camera: Camera,
  size: { width: number; height: number },
) {
  if (!(camera instanceof PerspectiveCamera)) return
  const { bodies, markers, registry, scene, worldPosition, screenPosition } = overlay
  const state = useSolarSystemStore.getState()
  const { selectedPlanetId, showLabels } = state
  const highlightedId = selectHighlightedId(state)
  camera.updateMatrixWorld() // keeps the projection in sync with camera moves from this frame

  for (const body of bodies) {
    const label = registry.labels.get(body.id)
    body.object ??= scene.getObjectByName(getBodyObjectName(body.id)) ?? null
    if (!label || !body.object) {
      body.usable = false
      continue
    }
    if (body.width === 0) {
      body.width = label.offsetWidth
      body.height = label.offsetHeight
    }

    body.object.getWorldPosition(worldPosition)
    const inFront = projectToScreen(
      worldPosition,
      camera,
      size.width,
      size.height,
      screenPosition,
    )
    const bodyRadiusPx =
      body.extent / getWorldUnitsPerPixel(camera, worldPosition, size.height)

    body.centerX = screenPosition.x
    body.centerY = screenPosition.y
    body.radius = getMarkerDiameter(bodyRadiusPx) / 2
    body.usable =
      inFront &&
      body.centerX >= 0 &&
      body.centerX <= size.width &&
      body.centerY >= 0 &&
      body.centerY <= size.height
    body.forced = body.id === selectedPlanetId || body.id === highlightedId
  }

  resolveLabelVisibility(bodies, showLabels, size.width, size.height)

  for (const body of bodies) {
    const label = registry.labels.get(body.id)
    if (label) applyLabel(label, body)
  }

  for (const kind of MARKER_KINDS) {
    const element = registry.markers.get(kind)
    if (!element) continue
    // A hovered body that is already selected only shows the solid ring.
    const targetId = kind === 'selected' ? selectedPlanetId : highlightedId
    const hidden = kind === 'hover' && highlightedId === selectedPlanetId
    applyMarker(element, markers[kind], hidden ? undefined : findBody(bodies, targetId))
  }
}
