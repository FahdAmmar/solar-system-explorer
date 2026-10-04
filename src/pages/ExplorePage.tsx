import { planets } from '@/data/planets'
import { SolarSystemCanvas } from '@/features/solar-system/components/SolarSystemCanvas'

export default function ExplorePage() {
  return (
    <>
      <h1 className="sr-only">Explore the solar system</h1>
      <div
        role="img"
        aria-label="Interactive 3D model of the solar system"
        className="h-full"
      >
        <SolarSystemCanvas planets={planets} />
      </div>
    </>
  )
}
