// A small lit sphere in the body's own color. Decorative: the name is always shown beside it.
export function PlanetSwatch({
  color,
  className = '',
}: {
  color: string
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={`block shrink-0 rounded-full ${className}`}
      style={{
        background: `radial-gradient(circle at 32% 30%, color-mix(in srgb, ${color} 55%, white), ${color} 50%, color-mix(in srgb, ${color} 35%, black))`,
      }}
    />
  )
}
