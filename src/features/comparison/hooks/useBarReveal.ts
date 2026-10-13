import gsap from 'gsap'
import { type RefObject, useLayoutEffect } from 'react'
import { prefersReducedMotion } from '@/utils/motion'

const DURATION_SECONDS = 0.5
const STAGGER_SECONDS = 0.05

// Grows every `[data-bar]` inside `ref` out from the centre line, top row first, whenever
// `changeKey` changes (a new pair of bodies). The stagger reads as "here is the next row".
// Skipped under reduced motion: the bars simply show at full length.
// gsap.context + revert (not just kill) so React StrictMode's second mount starts clean.
export function useBarReveal(ref: RefObject<HTMLElement | null>, changeKey: string) {
  useLayoutEffect(() => {
    const root = ref.current
    if (!root || prefersReducedMotion()) return
    const context = gsap.context(() => {
      gsap.from('[data-bar]', {
        scaleX: 0,
        duration: DURATION_SECONDS,
        ease: 'power2.out',
        stagger: STAGGER_SECONDS,
        clearProps: 'transform',
      })
    }, root)
    return () => context.revert()
  }, [ref, changeKey])
}
