'use client'

import { useEffect, useRef } from 'react'

/**
 * A living background: soft bands of colour drift and fold over each other
 * like an aurora, and lean towards the pointer when it is over the panel.
 * Drawn on a low-resolution canvas (a quarter of the panel) and blurred by
 * CSS, so it costs very little; it pauses when off screen and freezes to a
 * single frame for people who prefer reduced motion.
 */
type Blob = { x: number; y: number; r: number; vx: number; vy: number; hue: number; sat: number; phase: number }

const PALETTE = [
  [215, 90, 56], // blue
  [168, 85, 48], // teal
  [268, 70, 52], // violet
  [14, 85, 55], // ember
  [40, 90, 56], // amber
  [195, 90, 50], // cyan
] as const

export function Aurora({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const SCALE = 0.25
    let w = 1
    let h = 1
    let raf = 0
    let running = false
    let t = Math.random() * 1000
    const pointer = { x: 0.5, y: 0.5, on: false, tx: 0.5, ty: 0.5 }

    const blobs: Blob[] = PALETTE.map(([hue, sat], i) => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.45 + Math.random() * 0.3,
      vx: (Math.random() - 0.5) * 0.0012,
      vy: (Math.random() - 0.5) * 0.0012,
      hue,
      sat,
      phase: (i / PALETTE.length) * Math.PI * 2,
    }))

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      w = Math.max(2, Math.round(r.width * SCALE))
      h = Math.max(2, Math.round(r.height * SCALE))
      canvas.width = w
      canvas.height = h
    }

    const frame = () => {
      t += 0.004
      pointer.x += (pointer.tx - pointer.x) * 0.06
      pointer.y += (pointer.ty - pointer.y) * 0.06

      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = '#0a0d14'
      ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'

      for (const b of blobs) {
        // Slow wander, a gentle orbit, and a pull towards the pointer when present.
        b.x += b.vx + Math.sin(t + b.phase) * 0.0009
        b.y += b.vy + Math.cos(t * 0.8 + b.phase) * 0.0009
        if (pointer.on) {
          b.x += (pointer.x - b.x) * 0.006
          b.y += (pointer.y - b.y) * 0.006
        }
        if (b.x < -0.2 || b.x > 1.2) b.vx *= -1
        if (b.y < -0.2 || b.y > 1.2) b.vy *= -1

        const rad = b.r * Math.max(w, h) * (0.9 + 0.1 * Math.sin(t * 1.3 + b.phase))
        const cx = b.x * w
        const cy = b.y * h
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad)
        const light = 48 + 6 * Math.sin(t + b.phase)
        g.addColorStop(0, `hsla(${b.hue}, ${b.sat}%, ${light}%, .55)`)
        g.addColorStop(0.55, `hsla(${b.hue}, ${b.sat}%, ${light - 10}%, .18)`)
        g.addColorStop(1, 'hsla(0, 0%, 0%, 0)')
        ctx.fillStyle = g
        ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2)
      }

      // A faint highlight that follows the pointer.
      if (pointer.on) {
        const px = pointer.x * w
        const py = pointer.y * h
        const r = Math.max(w, h) * 0.35
        const g = ctx.createRadialGradient(px, py, 0, px, py, r)
        g.addColorStop(0, 'rgba(255,255,255,.14)')
        g.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = g
        ctx.fillRect(px - r, py - r, r * 2, r * 2)
      }

      if (running && !reduced) raf = requestAnimationFrame(frame)
    }

    const start = () => {
      if (running) return
      running = true
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.05 })
    io.observe(canvas)
    if (reduced) frame()

    const host = canvas.parentElement ?? canvas
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect()
      pointer.tx = (e.clientX - r.left) / r.width
      pointer.ty = (e.clientY - r.top) / r.height
      pointer.on = true
    }
    const onLeave = () => {
      pointer.on = false
    }
    host.addEventListener('pointermove', onMove, { passive: true })
    host.addEventListener('pointerleave', onLeave)
    const onVis = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVis)

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return <canvas ref={ref} className={className ?? 'aurora'} aria-hidden="true" />
}
