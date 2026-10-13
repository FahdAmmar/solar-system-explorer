import gsap from 'gsap'
import { type RefObject, useLayoutEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/utils/motion'

const CLEAR = 'transform,opacity'

// The hero builds up in the order people read it: the title lines rise out of a mask one after
// the other, then the subtitle, then the button. Skipped under reduced motion (everything
// simply shows). gsap.context + revert so React StrictMode's second mount starts clean.
// `onComplete` fires when the hero is fully in place (at once under reduced motion), so heavier
// decoration can wait for it instead of competing with the entrance.
export function useHeroEntrance(
  ref: RefObject<HTMLElement | null>,
  onComplete?: () => void,
) {
  const onCompleteRef = useRef(onComplete)
  useLayoutEffect(() => {
    onCompleteRef.current = onComplete
  })

  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return
    if (prefersReducedMotion()) {
      onCompleteRef.current?.()
      return
    }

    const context = gsap.context(() => {
      gsap
        .timeline({
          defaults: { ease: 'power3.out' },
          onComplete: () => onCompleteRef.current?.(),
        })
        .from('[data-hero="line"]', {
          yPercent: 110,
          duration: 0.9,
          stagger: 0.12,
          clearProps: CLEAR,
        })
        .from(
          '[data-hero="fade"]',
          { opacity: 0, y: 14, duration: 0.7, clearProps: CLEAR },
          '-=0.5',
        )
        .from(
          '[data-hero="cta"]',
          { opacity: 0, y: 14, duration: 0.6, clearProps: CLEAR },
          '-=0.45',
        )
    }, root)

    return () => context.revert()
  }, [ref])
}
