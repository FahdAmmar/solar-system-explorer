import type { ReactNode } from 'react'
import type { BodyHandlers } from '@/features/solar-system/types/interaction'
import { getBodyObjectName } from '@/features/solar-system/utils/bodyObjectName'
import { HitTarget } from './HitTarget'

interface SelectableBodyProps extends BodyHandlers {
  id: string
  radius: number
  children: ReactNode
}

// Shared click/hover behaviour for the Sun and every planet.
// Events from any child mesh (planet, rings, hit target) bubble up to this group.
export function SelectableBody({
  id,
  radius,
  onSelect,
  onHover,
  onHoverEnd,
  children,
}: SelectableBodyProps) {
  return (
    <group
      name={getBodyObjectName(id)}
      onClick={(event) => {
        // Only the nearest body reacts, not the ones behind it.
        event.stopPropagation()
        onSelect(id)
      }}
      onPointerOver={(event) => {
        event.stopPropagation()
        onHover(id)
      }}
      onPointerOut={() => onHoverEnd(id)}
    >
      {children}
      <HitTarget radius={radius} />
    </group>
  )
}
