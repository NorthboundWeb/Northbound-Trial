/* Drawn pieces for Thornley Heating. Pure components: no hooks. */
import type { JSX } from 'react'
import type { ProblemId } from './data'
import styles from './styles.module.css'

export function Mark({ size = 34 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className={styles.markSvg}>
      <rect width="40" height="40" rx="11" fill="#0c1f3f" />
      <path
        d="M20 30.5c-4.6 0-7.6-3-7.6-7 0-3.3 2.1-5.4 3.9-7.3.4 1.9 1.4 3.2 2.8 3.9-.3-3.6 1.3-6.8 4.4-9.1-.2 3.1 1 5.3 2.7 7.3 1.3 1.6 1.8 3.2 1.8 5.1 0 4.1-3.3 7.1-8 7.1Z"
        fill="#d7261e"
      />
      <path d="M20 30.5c-2 0-3.3-1.3-3.3-3.1 0-1.9 1.6-3 3.3-4.9 1.7 1.9 3.3 3 3.3 4.9 0 1.8-1.3 3.1-3.3 3.1Z" fill="#ffd2c9" />
    </svg>
  )
}

/** The hero boiler. Seventeen elements, so it is cheap enough for the wall. */
export function Boiler(): JSX.Element {
  return (
    <svg viewBox="0 0 360 430" className={styles.boilerSvg} aria-hidden="true">
      <ellipse cx="180" cy="410" rx="120" ry="12" fill="#0c1f3f" opacity=".08" />
      <path className={styles.wave} d="M118 92c-10-14 10-22 0-38s10-24 0-40" fill="none" stroke="#d7261e" strokeWidth="5" strokeLinecap="round" opacity=".55" />
      <path className={`${styles.wave} ${styles.wave2}`} d="M180 84c-10-14 10-22 0-38s10-24 0-40" fill="none" stroke="#d7261e" strokeWidth="5" strokeLinecap="round" opacity=".8" />
      <path className={`${styles.wave} ${styles.wave3}`} d="M242 92c-10-14 10-22 0-38s10-24 0-40" fill="none" stroke="#d7261e" strokeWidth="5" strokeLinecap="round" opacity=".55" />
      <rect x="70" y="108" width="220" height="250" rx="22" fill="#ffffff" stroke="#0c1f3f" strokeWidth="4" />
      <rect x="72" y="110" width="216" height="44" rx="20" fill="#f0f3f7" />
      <rect x="100" y="178" width="160" height="78" rx="12" fill="#0c1f3f" />
      <text x="196" y="231" textAnchor="middle" fill="#ffffff" fontSize="38" fontWeight="700" style={{ fontFamily: 'var(--nb-mono), monospace' }}>
        21.5°
      </text>
      <path d="M126 236c-6 0-9-4-9-8 0-4 3-6 5-9 .5 2.3 1.6 3.6 3 4.3-.3-4 1.5-7.4 4.7-9.6-.2 3.4 1 5.7 2.8 7.8 1.2 1.5 1.6 3 1.6 4.6 0 5.2-3.6 9.9-8.1 9.9Z" fill="#d7261e" />
      <circle cx="132" cy="300" r="22" fill="#ffffff" stroke="#0c1f3f" strokeWidth="4" />
      <line className={styles.needle} x1="132" y1="300" x2="144" y2="290" stroke="#d7261e" strokeWidth="4" strokeLinecap="round" />
      <circle cx="206" cy="300" r="12" fill="#f0f3f7" stroke="#0c1f3f" strokeWidth="4" />
      <circle cx="246" cy="300" r="12" fill="#f0f3f7" stroke="#0c1f3f" strokeWidth="4" />
      <path d="M110 358v50M150 358v50M210 358v50M250 358v50" stroke="#0c1f3f" strokeWidth="9" strokeLinecap="round" />
      <path d="M102 378h16v12h-16zM202 378h16v12h-16z" fill="#d7261e" />
      <rect x="70" y="336" width="220" height="4" fill="#0c1f3f" opacity=".12" />
    </svg>
  )
}

export function ProblemIcon({ id }: { id: ProblemId }): JSX.Element {
  const common = {
    width: 28,
    height: 28,
    viewBox: '0 0 28 28',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  switch (id) {
    case 'no-heat':
      return (
        <svg {...common}>
          <rect x="4" y="8" width="20" height="14" rx="3" />
          <path d="M9 8v14M14 8v14M19 8v14M6 25h3M19 25h3" />
        </svg>
      )
    case 'no-hot-water':
      return (
        <svg {...common}>
          <path d="M5 9h11a4 4 0 0 1 4 4v1M9 5h6M12 5v4" />
          <path d="M20 18c-1.4 2-2 3-2 4a2 2 0 0 0 4 0c0-1-.6-2-2-4Z" />
        </svg>
      )
    case 'leak':
      return (
        <svg {...common}>
          <path d="M14 4c-4 5.5-6 8.6-6 11.5a6 6 0 0 0 12 0C20 12.6 18 9.5 14 4Z" />
          <path d="M11 17a3 3 0 0 0 3 3" />
        </svg>
      )
    case 'noise':
      return (
        <svg {...common}>
          <path d="M5 11v6h4l5 4V7l-5 4H5Z" />
          <path d="M18 10a5 5 0 0 1 0 8M21 7a9 9 0 0 1 0 14" />
        </svg>
      )
    case 'service':
      return (
        <svg {...common}>
          <path d="M16.5 5.5a5 5 0 0 0-6.4 6.4L4.5 17.5a2 2 0 0 0 2.9 2.9l5.6-5.6a5 5 0 0 0 6.4-6.4l-3 3-2.8-.9-.9-2.8 3-3Z" />
        </svg>
      )
    case 'new-boiler':
      return (
        <svg {...common}>
          <rect x="6" y="3" width="16" height="19" rx="3" />
          <path d="M10 9h8M10 22v3M18 22v3" />
          <circle cx="14" cy="15" r="2.5" />
        </svg>
      )
  }
}

/** A drawn, not-to-scale map of the patch we cover. */
export function AreaMap(): JSX.Element {
  return (
    <svg viewBox="0 0 400 300" className={styles.mapSvg} role="img" aria-label="Sketch map of the area covered, centred on Wakefield">
      <rect width="400" height="300" rx="24" fill="#f0f3f7" />
      <circle cx="200" cy="150" r="128" fill="none" stroke="#0c1f3f" strokeOpacity=".12" strokeWidth="2" strokeDasharray="4 8" />
      <circle cx="200" cy="150" r="72" fill="#d7261e" fillOpacity=".06" stroke="#d7261e" strokeOpacity=".35" strokeWidth="2" />
      <path d="M20 210C90 190 140 170 200 150s140-80 180-110" fill="none" stroke="#ffffff" strokeWidth="14" strokeLinecap="round" />
      <path d="M40 60c60 40 110 60 160 90s90 80 160 120" fill="none" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" />
      <path d="M200 10v280" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
      <path d="M0 240c80-10 130 10 200 0s140-40 200-20" fill="none" stroke="#9fc3e6" strokeWidth="9" strokeLinecap="round" opacity=".8" />
      <circle cx="200" cy="150" r="9" fill="#d7261e" />
      <circle cx="200" cy="150" r="17" fill="none" stroke="#d7261e" strokeWidth="2" />
      <text x="216" y="140" fill="#0c1f3f" fontSize="15" fontWeight="700" style={{ fontFamily: 'var(--nb-display), sans-serif' }}>Wakefield</text>
      <circle cx="112" cy="122" r="5" fill="#0c1f3f" />
      <text x="68" y="110" fill="#0c1f3f" fontSize="12" style={{ fontFamily: 'var(--nb-sans), sans-serif' }}>Ossett</text>
      <circle cx="128" cy="196" r="5" fill="#0c1f3f" />
      <text x="82" y="218" fill="#0c1f3f" fontSize="12" style={{ fontFamily: 'var(--nb-sans), sans-serif' }}>Horbury</text>
      <circle cx="300" cy="104" r="5" fill="#0c1f3f" />
      <text x="290" y="90" fill="#0c1f3f" fontSize="12" style={{ fontFamily: 'var(--nb-sans), sans-serif' }}>Normanton</text>
      <circle cx="232" cy="62" r="5" fill="#0c1f3f" />
      <text x="244" y="58" fill="#0c1f3f" fontSize="12" style={{ fontFamily: 'var(--nb-sans), sans-serif' }}>Outwood</text>
      <circle cx="210" cy="214" r="5" fill="#0c1f3f" />
      <text x="222" y="226" fill="#0c1f3f" fontSize="12" style={{ fontFamily: 'var(--nb-sans), sans-serif' }}>Sandal</text>
      <text x="24" y="282" fill="#4a5a72" fontSize="11" style={{ fontFamily: 'var(--nb-mono), monospace' }}>ROUGHLY 8 MILES ACROSS · NOT TO SCALE</text>
    </svg>
  )
}

export function Check(): JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 9.5 7 13l7.5-8" />
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
