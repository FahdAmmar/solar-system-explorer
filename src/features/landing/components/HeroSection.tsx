import { useRef } from 'react'
import { Link } from 'react-router'
import { buttonClass } from '@/components/ui/buttonClass'
import { ArrowRightIcon } from '@/components/ui/icons'
import { useHeroEntrance } from '../hooks/useHeroEntrance'

interface HeroSectionProps {
  /** Called when the person shows intent to start (hover, focus, touch), to load the next page early. */
  onStartIntent?: () => void
  /** Called once the entrance animation has finished (immediately under reduced motion). */
  onEntranceComplete?: () => void
}

export function HeroSection({ onStartIntent, onEntranceComplete }: HeroSectionProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  useHeroEntrance(rootRef, onEntranceComplete)

  return (
    <div
      ref={rootRef}
      className="relative z-10 flex w-full flex-1 flex-col justify-start px-[clamp(1.5rem,8vw,8rem)] pt-[12dvh] pb-10 sm:justify-center sm:pt-0"
    >
      {/* Written in normal case and capitalised by CSS, so screen readers read words, not letters.
          Each line sits in its own mask: the entrance slides it up from behind the mask's edge. */}
      <h1 className="text-[clamp(2.1rem,9vw,3.5rem)] leading-[1.06] font-semibold tracking-[0.04em] uppercase sm:text-[clamp(2.75rem,4.8vw,5.5rem)]">
        <span className="block overflow-hidden">
          <span data-hero="line" className="block text-accent">
            Explore{' '}
          </span>
        </span>
        <span className="block overflow-hidden">
          <span data-hero="line" className="block text-balance">
            The Solar System
          </span>
        </span>
      </h1>

      <p
        data-hero="fade"
        className="mt-5 max-w-md text-base leading-relaxed text-ink-muted sm:mt-6 sm:text-lg"
      >
        An interactive journey through our cosmic neighborhood.
      </p>

      <div data-hero="cta" className="mt-8 sm:mt-10">
        <Link
          to="/explore"
          onPointerEnter={onStartIntent}
          onFocus={onStartIntent}
          className={`${buttonClass('primary', 'lg')} group`}
        >
          Start Exploring
          <span className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none">
            <ArrowRightIcon />
          </span>
        </Link>
      </div>
    </div>
  )
}
