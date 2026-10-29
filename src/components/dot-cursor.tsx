'use client'

import { useEffect, useRef } from 'react'

/**
 * A round dot that follows the mouse with a little lag, in the style of
 * Averlo's cursor. It grows into a soft ring over anything clickable and
 * shrinks when pressed. It uses difference blending, so it shows dark on light
 * pages and light on the dark menu.
 *
 * Only for a real mouse or trackpad (pointer: fine), and never on text fields,
 * where the normal I-beam is more useful. The system cursor is hidden only
 * while this dot is actually running.
 */
export function DotCursor() {
  const dot = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = dot.current
    if (!el) return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!fine.matches) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const root = document.documentElement
    root.classList.add('has-dot-cursor')

    const target = { x: -100, y: -100 }
    const pos = { x: -100, y: -100 }
    let raf = 0
    let shown = false

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      target.x = e.clientX
      target.y = e.clientY
      if (!shown) {
        pos.x = target.x
        pos.y = target.y
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

    const tick = () => {
      const k = reduced ? 1 : 0.22
      pos.x += (target.x - pos.x) * k
      pos.y += (target.y - pos.y) * k
      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      root.classList.remove('has-dot-cursor')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div ref={dot} className="dot-cursor" aria-hidden="true">
      <span />
    </div>
  )
}
