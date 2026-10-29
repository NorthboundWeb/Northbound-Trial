/* Drawn pieces for Northgate Motors. Pure components: no hooks. */
import type { JSX } from 'react'
import styles from './styles.module.css'

export function Mark({ size = 36 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className={styles.block}>
      <rect width="40" height="40" rx="10" fill="#15803d" />
      <path d="M11 29V11l18 18V11" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** A hatchback on a two-post lift. Seventeen elements; the body takes the car's colour. */
export function Car({ colour = '#15803d', lifted = true }: { colour?: string; lifted?: boolean }): JSX.Element {
  return (
    <svg viewBox="0 0 520 360" className={styles.carSvg} aria-hidden="true">
      <path d="M0 334h520" stroke="#f5c400" strokeWidth="6" strokeDasharray="34 22" />
      <rect x="22" y="70" width="22" height="262" rx="4" fill="#d6dbe3" />
      <rect x="476" y="70" width="22" height="262" rx="4" fill="#d6dbe3" />
      <ellipse cx="260" cy="326" rx="190" ry="10" fill="#101828" opacity=".1" />
      <g className={lifted ? styles.carLift : undefined}>
        <path d="M44 240h96M476 240H380" stroke="#9aa3b2" strokeWidth="10" strokeLinecap="round" />
        <path
          d="M70 226v-38c2-20 25-25 25-25l55-7 55-40c10-7 20-8 30-8h95c20 0 35 6 45 14l40 36 40 10c17 4 17 24 17 24v34c0 8-10 8-10 8h-57a42 42 0 0 0-84 0H195a42 42 0 0 0-84 0H80s-10 0-10-8Z"
          fill={colour}
          stroke="#101828"
          strokeWidth="3"
          strokeLinejoin="round"
          className={styles.carBody}
        />
        <path d="M160 156l50-35c8-5 14-7 24-7h36v42ZM282 114h46c14 0 24 5 32 12l30 30H282Z" fill="#dbeafe" stroke="#101828" strokeWidth="3" strokeLinejoin="round" />
        <path d="M276 112v120M292 176h22" stroke="#101828" strokeWidth="3" strokeLinecap="round" opacity=".55" />
        <rect x="444" y="176" width="16" height="10" rx="3" fill="#fef3c7" stroke="#101828" strokeWidth="2" />
        <rect x="70" y="180" width="10" height="16" rx="2" fill="#dc2626" />
        <circle cx="153" cy="234" r="34" fill="#101828" />
        <circle cx="153" cy="234" r="14" fill="#d0d5dd" />
        <circle cx="363" cy="234" r="34" fill="#101828" />
        <circle cx="363" cy="234" r="14" fill="#d0d5dd" />
      </g>
      <circle className={styles.passBadge} cx="430" cy="58" r="30" fill="#15803d" />
      <path className={styles.passBadge} d="M416 58l10 10 19-20" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** A UK rear plate drawn in HTML. */
export function Plate({ text, small = false }: { text: string; small?: boolean }): JSX.Element {
  return (
    <span className={`${styles.plate} ${small ? styles.plateSmall : ''}`}>
      <span className={styles.plateBand} aria-hidden="true">
        UK
      </span>
      <span className={styles.plateText}>{text}</span>
    </span>
  )
}

export function MapSketch(): JSX.Element {
  return (
    <svg viewBox="0 0 420 300" className={styles.mapSvg} role="img" aria-label="Sketch map: the garage sits just off the ring road, north of the river">
      <rect width="420" height="300" rx="20" fill="#eef6f0" />
      <path d="M0 236c70-20 120 8 190-6s150-54 230-36" fill="none" stroke="#9cc7e8" strokeWidth="22" strokeLinecap="round" />
      <path d="M210 150m-110 0a110 80 0 1 0 220 0a110 80 0 1 0-220 0" fill="none" stroke="#ffffff" strokeWidth="14" />
      <path d="M210 0v300M0 120h420" stroke="#ffffff" strokeWidth="10" />
      <path d="M290 92h40v34h-40z" fill="#15803d" />
      <path d="M310 126v22" stroke="#15803d" strokeWidth="4" />
      <circle cx="310" cy="152" r="6" fill="#15803d" />
      <text x="340" y="112" fill="#101828" fontSize="14" fontWeight="700" style={{ fontFamily: 'var(--nb-display), sans-serif' }}>Northgate</text>
      <text x="24" y="276" fill="#4b5563" fontSize="11" style={{ fontFamily: 'var(--nb-mono), monospace' }}>RIVER</text>
      <text x="220" y="20" fill="#4b5563" fontSize="11" style={{ fontFamily: 'var(--nb-mono), monospace' }}>TO M6 J31</text>
      <text x="24" y="112" fill="#4b5563" fontSize="11" style={{ fontFamily: 'var(--nb-mono), monospace' }}>RING ROAD</text>
    </svg>
  )
}

export function Arrow(): JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9h12M10 4l5 5-5 5" />
    </svg>
  )
}

export function Tick(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.5 6.5 12 13 4.5" />
    </svg>
  )
}
