import { planets } from '@/data/planets'
import { SolarSystemCanvas } from '@/features/solar-system/components/SolarSystemCanvas'

export default function ExplorePage() {
  return (
    // A group, not an image: the planet labels inside are real buttons.
    <div role="group" aria-label="Interactive 3D solar system" className="h-full">
      <h1 className="sr-only">Explore the solar system</h1>
      <SolarSystemCanvas planets={planets} />
    </div>
  )
}
