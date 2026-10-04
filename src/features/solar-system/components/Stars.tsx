import { Stars as StarField } from '@react-three/drei'

const FIELD_RADIUS = 500
const FIELD_DEPTH = 100
const STAR_COUNT = 2500
const STAR_SIZE = 9
const TWINKLE_SPEED = 0.5

export function Stars() {
  return (
    <StarField
      radius={FIELD_RADIUS}
      depth={FIELD_DEPTH}
      count={STAR_COUNT}
      factor={STAR_SIZE}
      saturation={0}
      fade
      speed={TWINKLE_SPEED}
    />
  )
}
