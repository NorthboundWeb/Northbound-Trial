'use client'

import { useEffect, useRef, useState } from 'react'
import { goWithCurtain } from './curtain'

/**
 * Swipe right to go back, on touch screens.
 *
 * A mostly-horizontal swipe to the right, starting anywhere except the very
 * left edge (that strip belongs to the phone's own back gesture), goes back
 * one page. A chevron follows the finger from the left so it is clear what is
 * about to happen; let go before the threshold and nothing happens.
 *
 * Before going back it fires a cancelable `nb:swipe-back` event, so a page can
 * handle the swipe itself (the booking flow steps back one question).
 *
 * Swipes that start inside something that scrolls sideways, a text field, or
 * an element marked `data-noswipe` are left alone.
 */

export const SWIPE_BACK_EVENT = 'nb:swipe-back'

const EDGE_PX = 24
const TRIGGER_PX = 90
const MAX_PULL = 140

function blocked(target: EventTarget | null) {
  let el = target instanceof Element ? target : null
  while (el && el !== document.body) {
    if (el.matches('input, textarea, select, [contenteditable="true"], [data-noswipe]')) return true
    const s = getComputedStyle(el)
    if ((s.overflowX === 'auto' || s.overflowX === 'scroll') && el.scrollWidth > el.clientWidth + 1) return true
    el = el.parentElement
  }
  return false
}

export function SwipeBack() {
  const [pull, setPull] = useState(0)
  const start = useRef<{ x: number; y: number; t: number; live: boolean } | null>(null)
  const decided = useRef<'h' | 'v' | null>(null)

  useEffect(() => {
    // Touch events only come from touch input, so a mouse or trackpad never
    // triggers this; no device check needed (and none to go stale).
    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const t = e.touches[0]
      if (t.clientX < EDGE_PX || blocked(e.target)) {
        start.current = null
        return
      }
      start.current = { x: t.clientX, y: t.clientY, t: Date.now(), live: true }
      decided.current = null
    }

    const onMove = (e: TouchEvent) => {
      const s = start.current
      if (!s?.live) return
      const t = e.touches[0]
      const dx = t.clientX - s.x
      const dy = t.clientY - s.y
      if (!decided.current) {
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return
        decided.current = dx > 0 && Math.abs(dx) > Math.abs(dy) * 1.5 ? 'h' : 'v'
      }
      if (decided.current !== 'h') return
      setPull(Math.max(0, Math.min(MAX_PULL, dx)))
    }

    const onEnd = (e: TouchEvent) => {
      const s = start.current
      start.current = null
      if (!s?.live || decided.current !== 'h') {
        setPull(0)
        return
      }
      const t = e.changedTouches[0]
      const dx = t.clientX - s.x
      const fast = dx > 50 && Date.now() - s.t < 250
      setPull(0)
      if (dx < TRIGGER_PX && !fast) return
      const ev = new CustomEvent(SWIPE_BACK_EVENT, { cancelable: true })
      if (!window.dispatchEvent(ev)) return // the page handled it
      if (window.history.length > 1) window.history.back()
      else goWithCurtain('/')
    }

    const onCancel = () => {
      start.current = null
      setPull(0)
    }

    document.addEventListener('touchstart', onStart, { passive: true })
    document.addEventListener('touchmove', onMove, { passive: true })
    document.addEventListener('touchend', onEnd)
    document.addEventListener('touchcancel', onCancel)
    return () => {
      document.removeEventListener('touchstart', onStart)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onEnd)
      document.removeEventListener('touchcancel', onCancel)
    }
  }, [])

  if (pull <= 0) return null
  const ready = pull >= TRIGGER_PX
  return (
    <div
      className={`swipe-back${ready ? ' ready' : ''}`}
      style={{ transform: `translate(${pull * 0.6 - 56}px, -50%)`, opacity: Math.min(1, pull / 50) }}
      aria-hidden="true"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 5l-7 7 7 7" />
      </svg>
    </div>
  )
}
