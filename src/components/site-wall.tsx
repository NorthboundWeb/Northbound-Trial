'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { demos } from '@/lib/showcase'
import { DemoSite } from './demo-site'

/**
 * The home page's moving background: a tilted wall of the demo websites,
 * three rows drifting in opposite directions. Every few seconds the wall
 * dissolves into a field of dots that traces the same cards (and swells
 * under the mouse), then the sites fade back in.
 *
 * The cards are the real demo pages drawn small, not screenshots. The rows
 * and the dot canvas share one tilted plane and one clock, so the dots line
 * up with the cards they replace.
 *
 * Purely decorative for assistive tech (the same demos are listed as normal
 * links lower down the page). Stops when off screen or when the tab is
 * hidden; holds still for people who prefer reduced motion.
 */

const PLANE_W = 2000
const PLANE_H = 900
const CARD_W = 400
const CARD_H = 250
const GAP = 28
const PITCH = CARD_W + GAP
const ROW_H = CARD_H + 40
const TOP = (PLANE_H - ROW_H * 3 + 40) / 2
const PER_ROW = Math.ceil(PLANE_W / PITCH) + 1
const SPEEDS = [-16, 22, -12] // px per second, per row
const SCALE = CARD_W / 1280

// Morph timeline, seconds: sites → dots → sites.
const CYCLE = 15
const FADE = 1.1
const DOTS_FROM = 8
const DOTS_TO = 12.5

const SPACING = 11

function dotPhase(t: number) {
  const c = t % CYCLE
  if (c < DOTS_FROM - FADE) return 0
  if (c < DOTS_FROM) return (c - (DOTS_FROM - FADE)) / FADE
  if (c < DOTS_TO) return 1
  if (c < DOTS_TO + FADE) return 1 - (c - DOTS_TO) / FADE
  return 0
}

export function SiteWall() {
  const wrap = useRef<HTMLDivElement>(null)
  const rows = useRef<(HTMLDivElement | null)[]>([])
  const cardsLayer = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = wrap.current
    const cv = canvas.current
    if (!el || !cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    cv.width = PLANE_W * dpr
    cv.height = PLANE_H * dpr
    ctx.scale(dpr, dpr)

    let visible = true
    let raf = 0
    let last = performance.now()
    let t = 0
    const pointer = { x: -9999, y: -9999 }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    })
    io.observe(el)

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      // Linear map into the plane: ignores the tilt, close enough for a glow.
      pointer.x = ((e.clientX - r.left) / r.width) * PLANE_W
      pointer.y = ((e.clientY - r.top) / r.height) * PLANE_H
    }
    const onLeave = () => {
      pointer.x = -9999
      pointer.y = -9999
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)

    const offsets = [0, 0, 0]

    function draw(alpha: number) {
      ctx!.clearRect(0, 0, PLANE_W, PLANE_H)
      if (alpha <= 0.01) return
      const buckets: Path2D[] = [new Path2D(), new Path2D(), new Path2D(), new Path2D()]
      for (let y = SPACING / 2; y < PLANE_H; y += SPACING) {
        const ry = y - TOP
        const r = Math.floor(ry / ROW_H)
        const inRowY = ry - r * ROW_H
        const rowOk = r >= 0 && r < 3 && inRowY >= 0 && inRowY <= CARD_H
        for (let x = SPACING / 2; x < PLANE_W; x += SPACING) {
          let level = 0 // 0 faint ground, 1 card body, 2 card detail, 3 card edge
          if (rowOk) {
            let lx = (x - offsets[r]) % PITCH
            if (lx < 0) lx += PITCH
            if (lx <= CARD_W) {
              const edge = lx < 8 || lx > CARD_W - 8 || inRowY < 8 || inRowY > CARD_H - 8
              const header = inRowY < 30
              const headline = inRowY > 70 && inRowY < 120 && lx > 24 && lx < CARD_W * 0.6
              const panel = lx > CARD_W * 0.62 && lx < CARD_W - 24 && inRowY > 60 && inRowY < CARD_H - 40
              level = edge ? 3 : header || headline || panel ? 2 : 1
            }
          }
          const dx = x - pointer.x
          const dy = y - pointer.y
          const near = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 160)
          const wave = 0.85 + 0.15 * Math.sin(x * 0.012 + y * 0.008 + t * 1.6)
          const base = [0.9, 1.5, 2.2, 2.8][level]
          const rad = (base + near * 2.6) * wave
          const b = Math.min(3, level + (near > 0.5 ? 1 : 0))
          buckets[b].moveTo(x + rad, y)
          buckets[b].arc(x, y, rad, 0, Math.PI * 2)
        }
      }
      const tones = ['rgba(12,18,32,.16)', 'rgba(12,18,32,.38)', 'rgba(12,18,32,.7)', 'rgba(12,18,32,.95)']
      ctx!.globalAlpha = alpha
      buckets.forEach((p, i) => {
        ctx!.fillStyle = tones[i]
        ctx!.fill(p)
      })
      ctx!.globalAlpha = 1
    }

    function frame(now: number) {
      if (!visible || document.hidden) return
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!reduced) t += dt
      for (let r = 0; r < 3; r++) {
        // Wrap within one set of cards so the loop is seamless.
        const span = PITCH * PER_ROW
        let o = (t * SPEEDS[r]) % span
        if (o > 0) o -= span
        offsets[r] = o
        const row = rows.current[r]
        if (row) row.style.transform = `translate3d(${o}px,0,0)`
      }
      const a = reduced ? 0 : dotPhase(t)
      if (cardsLayer.current) cardsLayer.current.style.opacity = String(1 - a)
      draw(a)
      raf = requestAnimationFrame(frame)
    }

    const onVis = () => {
      if (!document.hidden && visible) {
        last = performance.now()
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(frame)
      }
    }
    document.addEventListener('visibilitychange', onVis)
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return (
    <div className="wall" ref={wrap} aria-hidden="true">
      <div className="wall-plane" style={{ width: PLANE_W, height: PLANE_H }}>
        <div className="wall-cards" ref={cardsLayer}>
          {[0, 1, 2].map((r) => (
            <div
              key={r}
              className="wall-row"
              ref={(n) => {
                rows.current[r] = n
              }}
              style={{ top: TOP + r * ROW_H, width: PITCH * PER_ROW * 2 }}
            >
              {Array.from({ length: PER_ROW * 2 }, (_, i) => {
                const d = demos[(r * 4 + i) % demos.length]
                return (
                  <Link
                    key={i}
                    href={`/demos/${d.slug}`}
                    tabIndex={-1}
                    className="wall-card"
                    style={{ left: i * PITCH, width: CARD_W, height: CARD_H }}
                  >
                    <div className="wall-shot" style={{ transform: `scale(${SCALE})` }}>
                      <DemoSite d={d} />
                    </div>
                  </Link>
                )
              })}
            </div>
          ))}
        </div>
        <canvas ref={canvas} className="wall-dots" style={{ width: PLANE_W, height: PLANE_H }} />
      </div>
    </div>
  )
}
