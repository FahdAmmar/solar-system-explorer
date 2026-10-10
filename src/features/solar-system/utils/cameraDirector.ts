import gsap from 'gsap'
import { type Object3D, type PerspectiveCamera, Vector3 } from 'three'
import { CAMERA_LIMITS, CAMERA_TRANSITION } from '@/features/solar-system/data/camera'
import type { CameraCommand, CameraMode } from '@/features/solar-system/types/camera'
import {
  getDefaultCameraPosition,
  getFocusDistance,
  getFocusPosition,
} from '@/features/solar-system/utils/cameraFraming'
import {
  getCameraPathPoint,
  getTransitionDuration,
} from '@/features/solar-system/utils/cameraPath'

// Below this the camera is already where it needs to be, so a transition would only be a delay.
const ARRIVED_DISTANCE = 1e-3

/** The parts of OrbitControls that the director drives. */
export interface ControlsLike {
  target: Vector3
  minDistance: number
  maxDistance: number
  enablePan: boolean
  enableDamping: boolean
}

export interface CameraRig {
  camera: PerspectiveCamera
  controls: ControlsLike
  bodyIds: readonly string[]
  findBody: (id: string) => Object3D | undefined
  /** Radius that must fit on screen when focusing the body (Saturn includes its rings). */
  getExtent: (id: string) => number | undefined
  getAspect: () => number
  /** False under reduced motion: transitions then jump straight to their end pose. */
  shouldAnimate: () => boolean
  onModeChange: (mode: CameraMode) => void
}

type TransitionKind = 'focus' | 'reset'

// Owns the camera's behaviour. React/Zustand say WHAT should happen (a CameraCommand);
// this class and GSAP decide HOW it looks. Plain TypeScript, so it runs without React.
export class CameraDirector {
  private readonly rig: CameraRig
  private mode: CameraMode = 'free'
  private tween: gsap.core.Tween | null = null
  private kind: TransitionKind | null = null
  private focusedObject: Object3D | null = null
  private focusedExtent = 0
  // Canvas shape the focused framing was computed for: a resize scales the distance from here.
  private framedAspect = 1
  // True until the user moves the camera: only then does a resize re-frame the overview.
  private pristine = true

  private readonly startPosition = new Vector3()
  private readonly startTarget = new Vector3()
  private readonly endPosition = new Vector3()
  private readonly endTarget = new Vector3()
  private readonly scratch = new Vector3()
  private readonly away = new Vector3()
  private bodies: { object: Object3D; extent: number }[] | null = null

  constructor(rig: CameraRig) {
    this.rig = rig
  }

  execute(command: CameraCommand) {
    if (command.type === 'focus') this.focus(command.id)
    else if (command.type === 'reset') this.reset()
    else this.release()
  }

  focus(id: string, animate = true) {
    const object = this.rig.findBody(id)
    const extent = this.rig.getExtent(id)
    if (!object || extent === undefined) return

    this.stopTween()
    this.focusedObject = object
    this.focusedExtent = extent
    this.pristine = false
    this.openLimits()
    this.begin('focus', animate)
  }

  reset() {
    this.stopTween()
    this.focusedObject = null
    this.openLimits()
    this.begin('reset', true)
  }

  // The selection was cleared: stop following the body but leave the camera where it is.
  release() {
    if (this.kind === 'reset') return
    if (this.mode === 'free') return
    this.stopTween()
    this.focusedObject = null
    this.applyFreeLimits()
    this.setMode('free')
  }

  // The user grabbed the controls. Their input wins over a transition in progress.
  interrupt() {
    this.pristine = false
    if (!this.tween) return
    this.stopTween()
    this.focusedObject = null
    this.applyFreeLimits()
    this.setMode('free')
  }

  placeAtDefault() {
    this.stopTween()
    this.focusedObject = null
    this.writeDefaultPose()
    this.rig.camera.position.copy(this.endPosition)
    this.rig.controls.target.copy(this.endTarget)
    this.applyFreeLimits()
    this.pristine = true
    this.setMode('free')
  }

  // The canvas changed shape (a phone was rotated, the details panel opened below the scene).
  onAspectChange() {
    this.refitIfPristine()
    this.refitFocused()
  }

  private refitIfPristine() {
    if (this.pristine && this.mode === 'free' && !this.tween) this.placeAtDefault()
  }

  // Keeps the planet the same size on screen: same viewing direction and the person's own
  // zoom, rescaled for the new shape. Mid-flight the tween already reads the live aspect.
  private refitFocused() {
    if (this.mode !== 'focused' || !this.focusedObject) return
    const { camera, controls } = this.rig
    const aspect = this.rig.getAspect()
    const before = getFocusDistance(this.focusedExtent, this.framedAspect, camera.fov)
    const after = getFocusDistance(this.focusedExtent, aspect, camera.fov)
    this.framedAspect = aspect
    if (!(before > 0) || !Number.isFinite(after)) return

    this.scratch
      .copy(camera.position)
      .sub(controls.target)
      .multiplyScalar(after / before)
    camera.position.copy(controls.target).add(this.scratch)
  }

  // Runs every frame, after the controls have updated.
  // Bodies must have moved before this runs, or the camera trails them by a frame.
  update() {
    const { controls } = this.rig
    if (this.mode === 'focused' && this.focusedObject) {
      this.focusedObject.getWorldPosition(this.scratch)
      this.shiftBy(this.scratch.sub(controls.target))
    } else if (
      this.mode === 'free' &&
      controls.target.length() > CAMERA_LIMITS.panRadius
    ) {
      this.scratch
        .copy(controls.target)
        .setLength(CAMERA_LIMITS.panRadius)
        .sub(controls.target)
      this.shiftBy(this.scratch)
    }
    if (this.mode !== 'focusing') this.keepCameraOutsideBodies()
  }

  dispose() {
    this.stopTween()
  }

  // The one rule that holds in every mode: the camera is never inside a body. A fixed minimum
  // distance cannot express it, because a small planet is framed closer than the Sun is wide.
  private keepCameraOutsideBodies() {
    const { camera } = this.rig
    this.bodies ??= this.rig.bodyIds.flatMap((id) => {
      const object = this.rig.findBody(id)
      const extent = this.rig.getExtent(id)
      return object && extent !== undefined ? [{ object, extent }] : []
    })

    for (const { object, extent } of this.bodies) {
      object.getWorldPosition(this.scratch)
      this.away.copy(camera.position).sub(this.scratch)
      const minimum = extent * CAMERA_LIMITS.bodyClearance
      const distance = this.away.length()
      if (distance >= minimum) continue
      // Exactly at the centre there is no direction to leave by, so go up.
      if (distance === 0) this.away.set(0, 1, 0)
      else this.away.divideScalar(distance)
      camera.position.copy(this.scratch).addScaledVector(this.away, minimum)
    }
  }

  // Moves camera and target together, so the view direction and distance stay the same.
  private shiftBy(delta: Vector3) {
    this.rig.camera.position.add(delta)
    this.rig.controls.target.add(delta)
  }

  private begin(kind: TransitionKind, animate: boolean) {
    const { camera, controls } = this.rig
    this.kind = kind
    this.startPosition.copy(camera.position)
    this.startTarget.copy(controls.target)
    this.writeEndPose()

    const distance = this.startPosition.distanceTo(this.endPosition)
    const arrived =
      distance + this.startTarget.distanceTo(this.endTarget) < ARRIVED_DISTANCE
    if (!animate || arrived || !this.rig.shouldAnimate()) {
      this.apply(1)
      this.finish()
      return
    }

    this.setMode('focusing')
    const progress = { value: 0 }
    this.tween = gsap.to(progress, {
      value: 1,
      duration: getTransitionDuration(distance),
      ease: CAMERA_TRANSITION.ease,
      onUpdate: () => this.apply(progress.value),
      onComplete: () => this.finish(),
    })
  }

  // The end pose is recomputed on every step, so the camera lands on a body that is moving.
  private apply(progress: number) {
    this.writeEndPose()
    this.rig.controls.target.lerpVectors(this.startTarget, this.endTarget, progress)
    getCameraPathPoint(
      this.startPosition,
      this.endPosition,
      this.endTarget,
      progress,
      this.rig.camera.position,
    )
  }

  private finish() {
    this.tween = null
    if (this.kind === 'focus') {
      this.framedAspect = this.rig.getAspect()
      this.applyFocusLimits()
      this.setMode('focused')
    } else {
      this.applyFreeLimits()
      this.pristine = true
      this.setMode('free')
    }
    this.kind = null
  }

  private writeEndPose() {
    if (this.kind === 'focus' && this.focusedObject) {
      this.focusedObject.getWorldPosition(this.endTarget)
      getFocusPosition(
        this.endTarget,
        this.focusedExtent,
        this.rig.getAspect(),
        this.rig.camera.fov,
        this.endPosition,
      )
    } else {
      this.writeDefaultPose()
    }
  }

  private writeDefaultPose() {
    const [x, y, z] = getDefaultCameraPosition(this.rig.getAspect(), this.rig.camera.fov)
    this.endTarget.set(0, 0, 0)
    this.endPosition.set(x, y, z)
  }

  private stopTween() {
    this.tween?.kill()
    this.tween = null
    this.kind = null
  }

  private setMode(mode: CameraMode) {
    if (mode === this.mode) return
    this.mode = mode
    this.rig.onModeChange(mode)
  }

  // During a transition the camera may pass outside the normal zoom range, and the controls'
  // drag inertia is off: it decays per frame, so on a slow device it would keep pushing the
  // camera away from the exact end pose after the transition is over.
  private openLimits() {
    this.rig.controls.minDistance = 0
    this.rig.controls.maxDistance = Infinity
    this.rig.controls.enableDamping = false
  }

  private applyFreeLimits() {
    this.rig.controls.minDistance = CAMERA_LIMITS.freeMinDistance
    this.rig.controls.maxDistance = CAMERA_LIMITS.maxDistance
    this.rig.controls.enablePan = true
    this.rig.controls.enableDamping = true
  }

  // Orbit and zoom around the body, but panning would pull it out of the centre.
  private applyFocusLimits() {
    this.rig.controls.minDistance =
      this.focusedExtent * CAMERA_LIMITS.focusMinDistanceFactor
    this.rig.controls.maxDistance = CAMERA_LIMITS.maxDistance
    this.rig.controls.enablePan = false
    this.rig.controls.enableDamping = true
  }
}
