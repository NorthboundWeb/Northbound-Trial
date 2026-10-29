'use client'

import { useEffect, useState } from 'react'

import { INTRO_KEY as KEY } from '@/lib/boot-scripts'

/**
 * The Northbound opening sequence: the sun rises, the peaks grow, the name
 * tracks in, then the curtain lifts north. It plays once per browser session.
 *
 * The overlay is in the server HTML so nothing flashes before it. An inline
 * script in the layout marks <html data-nb-intro="seen"> before first paint
 * on later page loads, which hides it with CSS.
 */
export function Intro() {
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    if (root.dataset.nbIntro === 'seen') {
      // Defer so the state change is not synchronous inside the effect.
      const t = setTimeout(() => setGone(true), 0)
      return () => clearTimeout(t)
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t = setTimeout(
      () => {
        root.dataset.nbIntro = 'seen'
        try {
          sessionStorage.setItem(KEY, '1')
        } catch {
          // Storage can be blocked; the intro just plays again next load.
        }
        setGone(true)
      },
      reduced ? 900 : 5200
    )
    return () => clearTimeout(t)
  }, [])

  if (gone) return null
  return (
    <div className="nb-intro" aria-hidden="true">
      <div className="nb-intro__art">
        <div className="nb-intro__mark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="nb-intro__layer nb-intro__sun" src="/brand/mark.png" alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="nb-intro__layer nb-intro__peaks" src="/brand/mark.png" alt="" />
        </div>
        <div className="nb-intro__wordmark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="nb-intro__layer nb-intro__name" src="/brand/word.png" alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="nb-intro__layer nb-intro__web" src="/brand/word.png" alt="" />
        </div>
      </div>
    </div>
  )
}

