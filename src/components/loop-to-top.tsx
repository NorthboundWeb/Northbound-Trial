'use client'

import { useEffect, useRef } from 'react'

/**
 * The end of the home page loops back to the start. The last panel repeats
 * the opening headline; once it fills the screen and the scroll has settled,
 * the page jumps to the very top, which looks the same, so the next swipe
 * carries on from the start.
 */
export function LoopToTop() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let armed = false
    let touching = false
    let timer = 0

    // Jumping while a finger is down, or while momentum is still carrying the
    // page, makes the browser drop the scroll (iOS especially), so the visitor
    // gets stuck at the bottom. Wait until everything has settled, then jump.
    const jump = () => {
      if (touching) return
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (armed && window.scrollY >= max - 2) {
        armed = false
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
      }
    }
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      // Only loop after the visitor has actually scrolled down the page.
      if (window.scrollY > window.innerHeight) armed = true
      window.clearTimeout(timer)
      if (armed && window.scrollY >= max - 2) timer = window.setTimeout(jump, 140)
    }
    const onTouchStart = () => {
      touching = true
      window.clearTimeout(timer)
    }
    const onTouchEnd = () => {
      touching = false
      // Momentum may follow the lift; the next scroll event re-arms the wait.
      window.clearTimeout(timer)
      timer = window.setTimeout(jump, 220)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', onTouchEnd, { passive: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
    }
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
