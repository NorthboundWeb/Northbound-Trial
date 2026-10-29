'use client'

import { useEffect, useRef } from 'react'

/**
 * The end of the home page loops back to the start. The last panel repeats
 * the opening headline; once it fills the screen, the page jumps to the very
 * top, which looks the same, so scrolling just carries on.
 */
export function LoopToTop() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let armed = false
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      // Only loop after the visitor has actually scrolled down the page.
      if (window.scrollY > window.innerHeight) armed = true
      if (armed && window.scrollY >= max - 2) {
        armed = false
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div ref={ref} className="loop" aria-hidden="true">
      <p className="hero-h">
        Websites that get you found.
        <span>Priced before we start.</span>
      </p>
      <p className="loop-cue">Keep scrolling</p>
    </div>
  )
}
