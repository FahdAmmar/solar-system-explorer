export interface BodyHandlers {
  onSelect: (id: string) => void
  onHover: (id: string) => void
  onHoverEnd: (id: string) => void
}

export type MarkerKind = 'selected' | 'hover'
