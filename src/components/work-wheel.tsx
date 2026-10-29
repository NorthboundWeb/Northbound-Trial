'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { Demo } from '@/lib/showcase'
import { WorkShot } from './work-shot'

/**
 * The Work page wheel: the demo sites stand in a ring, like seats on a big
 * wheel, and the ring turns to bring one to the front. Drag it, scroll over
 * it, use the arrows or the keyboard; it drifts slowly on its own until you
 * touch it. The front site gets its name, trade and an Open button below.
 */
export function WorkWheel({ demos }: { demos: Demo[] }) {
  const n = demos.length
  const step = 360 / n
  const stage = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  // The ring's angle in degrees; the item whose angle lands at 0 is at the front.
  const angle = useRef(0)
  const target = useRef(0)
  const [front, setFront] = useState(0)
  const idle = useRef(true)
  const drag = useRef<{ x: number; a: number; moved: boolean } | null>(null)
  const justDragged = useRef(false)

  // Spin towards the target, drifting slowly when nobody is touching it.
  useEffect(() => {
    const el = ring.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(48, now - last)
      last = now
      if (!drag.current) {
        if (idle.current && !reduced) target.current -= dt * 0.004
        angle.current += (target.current - angle.current) * (reduced ? 1 : 0.12)
      }
      el.style.transform = `rotateY(${angle.current}deg)`
      const i = ((Math.round(-angle.current / step) % n) + n) % n
      setFront((f) => (f === i ? f : i))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [n, step])

  // Size the ring from the real card width so the cards sit edge to edge.
  useEffect(() => {
    const el = stage.current
    if (!el) return
    const fit = () => {
      const card = el.querySelector<HTMLElement>('.ww-card')
      if (!card) return
      const w = card.offsetWidth
      const r = w / 2 / Math.tan(Math.PI / n) + 12
      el.style.setProperty('--ww-r', `${r}px`)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [n])

  const snap = () => {
    target.current = Math.round(target.current / step) * step
  }
  const go = (by: number) => {
    idle.current = false
    snap()
    target.current -= by * step
  }
  const goTo = (i: number) => {
    idle.current = false
    const cur = ((Math.round(-target.current / step) % n) + n) % n
    let d = i - cur
    if (d > n / 2) d -= n
    if (d < -n / 2) d += n
    go(d)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    idle.current = false
    drag.current = { x: e.clientX, a: angle.current, moved: false }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) > 6) d.moved = true
    const w = stage.current?.offsetWidth || 600
    angle.current = d.a + (dx / w) * 180
    target.current = angle.current
  }
  const endDrag = () => {
    if (!drag.current) return
    justDragged.current = drag.current.moved
    drag.current = null
    snap()
  }
  const onWheel = (e: React.WheelEvent) => {
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (!d) return
    idle.current = false
    target.current -= d * 0.15
  }
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      go(1)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      go(-1)
    }
  }

  const d = demos[front]

  return (
    <div className="ww">
      <div
        ref={stage}
        className="ww-stage"
        role="group"
        aria-roledescription="carousel"
        aria-label="Demo sites"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
        data-noswipe
      >
        <div ref={ring} className="ww-ring">
          {demos.map((x, i) => (
            <Link
              key={x.slug}
              href={`/demos/${x.slug}`}
              className={`ww-card${i === front ? ' is-front' : ''}`}
              style={{ ['--ww-a' as string]: `${i * step}deg` }}
              aria-label={`${x.name}, ${x.trade}`}
              aria-current={i === front ? 'true' : undefined}
              draggable={false}
              onClick={(e) => {
                if (justDragged.current) e.preventDefault()
                else if (i !== front) {
                  e.preventDefault()
                  goTo(i)
                }
              }}
            >
              <span className="ww-shot" aria-hidden="true">
                <span className="demo-tile-scale">
                  <WorkShot slug={x.slug} />
                </span>
              </span>
            </Link>
          ))}
        </div>
        <span className="ww-floor" aria-hidden="true" />
      </div>

      <div className="ww-panel" aria-live="polite">
        <button type="button" className="ww-arrow" onClick={() => go(-1)} aria-label="Previous site">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="ww-info">
          <span className="ww-count">
            {String(front + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
          </span>
          <b>{d.name}</b>
          <span className="ww-trade">
            {d.trade} · {d.place}
          </span>
          <span className="work-tags">
            {d.shows.slice(0, 3).map((s) => (
              <i key={s}>{s}</i>
            ))}
          </span>
          <Link className="btn dark small" href={`/demos/${d.slug}`}>
            Open {d.name}
          </Link>
        </div>
        <button type="button" className="ww-arrow" onClick={() => go(1)} aria-label="Next site">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <ol className="ww-dots" aria-label="Jump to a site">
        {demos.map((x, i) => (
          <li key={x.slug}>
            <button
              type="button"
              className={i === front ? 'is-on' : undefined}
              onClick={() => goTo(i)}
              aria-label={x.name}
              aria-current={i === front ? 'true' : undefined}
            />
          </li>
        ))}
      </ol>
    </div>
  )
}
