'use client'

import { useEffect, useRef } from 'react'

/**
 * A round dot that sits exactly on the mouse, in the style of Averlo's
 * cursor. No easing or trailing: it is moved on every pointer event, so it
 * never lags. It grows into a ring over anything clickable and shrinks when
 * pressed. Difference blending shows it dark on light pages and light on dark.
 *
 * Only for a real mouse or trackpad (hover + fine pointer), and hidden over
 * text fields, where the normal I-beam is more useful. The system cursor is
 * hidden only while this dot is actually running.
 */
export function DotCursor() {
  const dot = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = dot.current
    if (!el) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const root = document.documentElement
    root.classList.add('has-dot-cursor')
    let shown = false

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
      if (!shown) {
        shown = true
        el.classList.add('on')
      }
      const t = e.target as Element | null
      const text = t?.closest('input:not([type=button]):not([type=submit]), textarea, select, [contenteditable="true"]')
      const hot = t?.closest('a, button, [role="tab"], label, summary')
      el.classList.toggle('hot', !!hot && !text)
      el.classList.toggle('text', !!text)
    }
    const onDown = () => el.classList.add('down')
    const onUp = () => el.classList.remove('down')
    const onLeave = () => {
      shown = false
      el.classList.remove('on')
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    root.addEventListener('pointerleave', onLeave)
    return () => {
      root.classList.remove('has-dot-cursor')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      root.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div ref={dot} className="dot-cursor" aria-hidden="true">
      <span />
    </div>
  )
}
