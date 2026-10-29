/** Drawn art for Ironfield PT: hard shapes, flat colour. Pure, no hooks. */
import type { JSX } from 'react'

const INK = '#141414'
const ORANGE = '#ff4d1a'
const PAPER = '#f2f2ee'

/** A loaded barbell in front of a big orange plate, with a kettlebell. */
export function BarbellArt({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 520 440" aria-hidden="true" focusable="false">
      <circle cx="300" cy="196" r="176" fill={ORANGE} />
      <circle cx="300" cy="196" r="176" fill="none" stroke={INK} strokeWidth="3" strokeDasharray="2 10" />
      <path d="M0 392h520" stroke={INK} strokeWidth="4" />
      {/* bar */}
      <rect x="10" y="226" width="500" height="12" rx="3" fill={INK} />
      {/* plates, left then right */}
      <path
        d="M58 128h30v208H58zM92 150h22v164H92zM118 212h12v40h-12zM432 128h30v208h-30zM406 150h22v164h-22zM390 212h12v40h-12z"
        fill={INK}
      />
      <path d="M64 138v188M438 138v188" stroke={PAPER} strokeWidth="2" opacity=".35" />
      {/* kettlebell */}
      <path d="M200 330c0-30 18-50 40-50s40 20 40 50" fill="none" stroke={INK} strokeWidth="14" strokeLinecap="round" />
      <path d="M186 362a54 54 0 0 1 108 0v30H186z" fill={PAPER} stroke={INK} strokeWidth="4" />
      <text x="240" y="376" textAnchor="middle" fontFamily="ui-monospace, monospace" fontWeight="700" fontSize="22" fill={INK}>
        16
      </text>
      {/* chalk marks */}
      <path d="M140 100l18-18M156 112l26-26M362 84l22 22M372 64l30 30" stroke={INK} strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

export function Mark({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <rect width="40" height="40" fill={INK} />
      <path d="M6 18h28v4H6z" fill={PAPER} />
      <path d="M9 11h5v18H9zM26 11h5v18h-5z" fill={ORANGE} />
    </svg>
  )
}

/** A coach drawn as a poster tile: a giant initial on a hard shape. */
export function CoachTile({ initial, variant, className }: { initial: string; variant: 0 | 1 | 2; className?: string }): JSX.Element {
  const bg = variant === 0 ? ORANGE : variant === 1 ? INK : '#e4e4dc'
  const fg = variant === 1 ? PAPER : INK
  return (
    <svg className={className} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <rect width="200" height="200" fill={bg} />
      {variant === 0 ? <circle cx="160" cy="40" r="70" fill={INK} opacity=".12" /> : null}
      {variant === 1 ? <path d="M0 200L200 60v140z" fill={ORANGE} /> : null}
      {variant === 2 ? <path d="M0 0h200v24H0zM0 48h200v24H0z" fill={INK} opacity=".08" /> : null}
      <text
        x="18"
        y="186"
        fontFamily="system-ui, sans-serif"
        fontWeight="800"
        fontSize="190"
        letterSpacing="-12"
        fill={fg}
      >
        {initial}
      </text>
    </svg>
  )
}
