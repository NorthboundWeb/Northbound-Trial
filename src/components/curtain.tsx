'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

/**
 * The page change the logo triggers: a dark curtain rises over the page with
 * the mountain mark drawing itself, the route changes underneath, then the
 * curtain lifts north and the new page is there. A short cut of the intro.
 *
 * Anything can start it with `goWithCurtain(href)`.
 */

const EVENT = 'nb:curtain'
const COVER_MS = 650
const LIFT_MS = 750

export function goWithCurtain(href: string) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: href }))
}

type Phase = 'idle' | 'cover' | 'hold' | 'lift'

export function Curtain() {
  const router = useRouter()
  const pathname = usePathname()
  const [phase, setPhase] = useState<Phase>('idle')
  const target = useRef<string | null>(null)
  const timers = useRef<number[]>([])

  useEffect(() => {
    const clear = () => {
      timers.current.forEach((t) => clearTimeout(t))
      timers.current = []
    }
    const onGo = (e: Event) => {
      const href = (e as CustomEvent<string>).detail
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) {
        router.push(href)
        return
      }
      clear()
      target.current = href
      setPhase('cover')
      router.prefetch(href)
      timers.current.push(
        window.setTimeout(() => {
          setPhase('hold')
          const here = window.location.pathname
          router.push(href)
          // Same page: there is no route change to wait for, so lift straight away.
          if (here === new URL(href, window.location.href).pathname) {
            window.scrollTo({ top: 0 })
            setPhase('lift')
            timers.current.push(window.setTimeout(() => setPhase('idle'), LIFT_MS))
          }
        }, COVER_MS)
      )
    }
    window.addEventListener(EVENT, onGo)
    return () => {
      window.removeEventListener(EVENT, onGo)
      clear()
    }
  }, [router])

  // The new page has rendered underneath: lift the curtain.
  useEffect(() => {
    if (phase !== 'hold') return
    const t1 = window.setTimeout(() => {
      window.scrollTo({ top: 0 })
      setPhase('lift')
    }, 120)
    const t2 = window.setTimeout(() => setPhase('idle'), 120 + LIFT_MS)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
    // Only a change of page should end the hold.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  if (phase === 'idle') return null
  return (
    <div className={`nb-curtain is-${phase}`} aria-hidden="true">
      <div className="nb-curtain__mark">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="nb-intro__layer nb-intro__sun" src="/brand/mark.png" alt="" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="nb-intro__layer nb-intro__peaks" src="/brand/mark.png" alt="" />
      </div>
    </div>
  )
}
