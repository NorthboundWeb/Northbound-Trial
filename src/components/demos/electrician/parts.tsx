/* Drawn pieces for Brightline Electrical. Pure components: no hooks. */
import type { JSX } from 'react'
import type { JobId } from './data'
import styles from './styles.module.css'

export function Mark({ size = 36 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className={styles.block}>
      <rect width="40" height="40" rx="6" fill="#ffd60a" />
      <path d="M23 5 10 23h8l-2 12 13-18h-8l2-12Z" fill="#0b1d3a" />
    </svg>
  )
}

/** The hero fuse box. About twenty elements, cheap enough for the wall. */
export function ConsumerUnit(): JSX.Element {
  const xs = [52, 100, 148, 196, 244, 292]
  return (
    <svg viewBox="0 0 480 400" className={styles.cuSvg} aria-hidden="true">
      <path className={styles.cable} d="M380 150c40 0 54 30 54 70v60" fill="none" stroke="#ffd60a" strokeWidth="6" strokeLinecap="round" />
      <circle className={styles.glow} cx="434" cy="318" r="40" fill="#ffd60a" opacity=".22" />
      <path className={styles.bulb} d="M434 286a22 22 0 0 0-13 40v8h26v-8a22 22 0 0 0-13-40Z" fill="#ffd60a" />
      <rect x="424" y="338" width="20" height="10" rx="3" fill="#a9b8d4" />
      <rect x="12" y="44" width="384" height="250" rx="18" fill="#e9eef6" />
      <rect x="12" y="44" width="384" height="34" rx="18" fill="#ffffff" />
      <rect x="32" y="96" width="344" height="150" rx="10" fill="#132a52" />
      <path
        d="M44 118h40v104H44zM92 118h40v104H92zM140 118h40v104h-40zM188 118h40v104h-40zM236 118h40v104h-40zM284 118h40v104h-40z"
        fill="#f4f6fa"
      />
      {xs.map((x, i) => (
        <rect
          key={x}
          className={styles.toggle}
          style={{ animationDelay: `${0.35 + i * 0.11}s` }}
          x={x}
          y="140"
          width="24"
          height="34"
          rx="4"
          fill={i === 4 ? '#ffd60a' : '#0b1d3a'}
        />
      ))}
      <rect x="332" y="112" width="34" height="118" rx="6" fill="#d7263d" />
      <rect className={styles.toggle} style={{ animationDelay: '1.1s' }} x="338" y="130" width="22" height="40" rx="4" fill="#ffffff" />
      <rect x="44" y="260" width="320" height="14" rx="4" fill="#ffffff" />
      <text x="54" y="66" fill="#0b1d3a" fontSize="13" fontWeight="700" letterSpacing="2" style={{ fontFamily: 'var(--nb-mono), monospace' }}>
        CONSUMER UNIT · 18TH ED.
      </text>
      <circle className={styles.led} cx="372" cy="62" r="6" fill="#22c55e" />
    </svg>
  )
}

export function JobIcon({ id }: { id: JobId }): JSX.Element {
  const p = {
    width: 32,
    height: 32,
    viewBox: '0 0 32 32',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  switch (id) {
    case 'eicr':
      return (
        <svg {...p}>
          <path d="M9 4h10l6 6v18H9z" />
          <path d="M19 4v6h6M13 18l3 3 5-6" />
        </svg>
      )
    case 'ev':
      return (
        <svg {...p}>
          <rect x="6" y="4" width="14" height="24" rx="3" />
          <path d="M14 10l-3 5h4l-3 5M20 12h3a3 3 0 0 1 3 3v6a2 2 0 0 0 4 0" />
        </svg>
      )
    case 'fault':
      return (
        <svg {...p}>
          <circle cx="14" cy="14" r="8" />
          <path d="m20 20 7 7M14 10v5M14 18v.5" />
        </svg>
      )
    case 'cu':
      return (
        <svg {...p}>
          <rect x="4" y="7" width="24" height="18" rx="3" />
          <path d="M9 12v8M14 12v8M19 12v8M24 12v8" />
        </svg>
      )
    case 'sockets':
      return (
        <svg {...p}>
          <rect x="5" y="5" width="22" height="22" rx="4" />
          <path d="M12 12v3M20 12v3M14 21h4" />
        </svg>
      )
    case 'lights':
      return (
        <svg {...p}>
          <path d="M16 3v6M9 20a7 7 0 1 1 14 0z" />
          <path d="M13 24h6M16 24v4" />
        </svg>
      )
    case 'rewire':
      return (
        <svg {...p}>
          <path d="M4 10c6 0 6 12 12 12s6-12 12-12" />
          <path d="M4 22c6 0 6-12 12-12s6 12 12 12" />
        </svg>
      )
  }
}

export function Charger(): JSX.Element {
  return (
    <svg viewBox="0 0 360 320" className={styles.evSvg} role="img" aria-label="Drawing of a wall-mounted car charger with its cable plugged into a car">
      <rect x="0" y="0" width="190" height="300" fill="#132a52" />
      <path d="M0 40h190M0 100h190M0 160h190M0 220h190M60 0v40M130 40v60M60 100v60M130 160v60M60 220v80" stroke="#0b1d3a" strokeWidth="4" />
      <rect x="54" y="70" width="84" height="126" rx="20" fill="#ffffff" />
      <rect x="70" y="92" width="52" height="30" rx="8" fill="#0b1d3a" />
      <path d="M99 98l-8 11h7l-4 9 10-12h-7l2-8Z" fill="#ffd60a" />
      <circle cx="96" cy="160" r="12" fill="none" stroke="#0b1d3a" strokeWidth="4" />
      <path className={styles.evCable} d="M96 196c0 70 40 90 110 70s70-40 94-36" fill="none" stroke="#0b1d3a" strokeWidth="10" strokeLinecap="round" />
      <path className={styles.evCable} d="M96 196c0 70 40 90 110 70s70-40 94-36" fill="none" stroke="#ffd60a" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 14" />
      <path d="M220 300c4-38 26-64 66-70h74v70z" fill="#ffd60a" />
      <circle cx="262" cy="300" r="20" fill="#0b1d3a" />
      <path d="M296 238h40l14 22h-54z" fill="#0b1d3a" opacity=".35" />
      <rect x="0" y="300" width="360" height="20" fill="#0f2445" />
    </svg>
  )
}

export function Arrow(): JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square">
      <path d="M3 9h11M10 4.5 14.5 9 10 13.5" />
    </svg>
  )
}

export function Bolt(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M9.5 1 3 9h4l-1 6 7-9H9l.5-5Z" fill="currentColor" />
    </svg>
  )
}
