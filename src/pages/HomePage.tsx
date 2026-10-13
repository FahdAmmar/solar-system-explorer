import { useState } from 'react'
import { loadExplorePage } from '@/app/routeModules'
import { PageTitle } from '@/components/common/PageTitle'
import { HeroSection } from '@/features/landing/components/HeroSection'
import { MotionToggle } from '@/features/landing/components/MotionToggle'
import { SolarSystemPreview } from '@/features/landing/components/SolarSystemPreview'
import { StarfieldBackground } from '@/features/landing/components/StarfieldBackground'

export default function HomePage() {
  // The 3D preview starts only when the hero is fully in place.
  const [heroReady, setHeroReady] = useState(false)

  return (
    <section className="relative isolate flex min-h-full flex-col overflow-hidden">
      <PageTitle />
      <StarfieldBackground />
      <SolarSystemPreview enabled={heroReady} />
      {/* Keeps the text readable where the planets drift behind it: from the top on tall
          screens (text above, Sun below), from the left on wide ones. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-space/80 via-space/30 to-transparent sm:bg-linear-to-r sm:from-space/90 sm:via-space/45"
      />
      {/* Loading the Explore page when the button is approached makes the click feel instant. */}
      <HeroSection
        onStartIntent={() => void loadExplorePage()}
        onEntranceComplete={() => setHeroReady(true)}
      />
      <MotionToggle />
    </section>
  )
}
