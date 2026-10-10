import gsap from 'gsap'
import { type RefObject, useLayoutEffect } from 'react'
import { prefersReducedMotion } from '@/utils/motion'

const DURATION_SECONDS = 0.28

// Fades and slides an element in when it mounts. Skipped under reduced motion.
// gsap.context + revert (not just kill) so React StrictMode's second mount starts clean:
// a killed tween would leave the element stuck at opacity 0.
export function useEntranceAnimation(ref: RefObject<HTMLElement | null>, offsetY = 16) {
  useLayoutEffect(() => {
    const element = ref.current
    if (!element || prefersReducedMotion()) return
    const context = gsap.context(() => {
      gsap.from(element, {
        opacity: 0,
        y: offsetY,
        duration: DURATION_SECONDS,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      })
    }, element)
    return () => context.revert()
  }, [ref, offsetY])
}
