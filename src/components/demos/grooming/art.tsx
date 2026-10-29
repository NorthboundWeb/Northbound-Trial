/** Drawn illustrations for Bramble & Bone. Pure components, no hooks. */
import type { JSX } from 'react'

type ArtProps = { className?: string }

const COAT = '#ecbd92'
const COAT_DARK = '#d39a68'
const MUZZLE = '#fae3c9'
const INK = '#2b1d18'

/** A fluffy, freshly groomed doodle with a bandana. */
export function DogPortrait({ className, bubbles = true }: ArtProps & { bubbles?: boolean }): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 360 360" aria-hidden="true" focusable="false">
      {/* ears */}
      <path d="M96 140C58 162 46 240 66 284c14 30 54 26 62-6 8-34 4-84-8-118z" fill={COAT_DARK} />
      <path d="M264 140c38 22 50 100 30 144-14 30-54 26-62-6-8-34-4-84 8-118z" fill={COAT_DARK} />
      {/* chest */}
      <path d="M92 360c4-70 46-102 88-102s84 32 88 102z" fill={COAT} />
      {/* bandana */}
      <path d="M112 286q68 26 136 0l-54 60q-14 12-28 0z" fill="#0f766e" />
      <path d="M150 300h4M178 312h4M206 300h4M178 290h4M164 326h4M194 326h4" stroke="#bfe6df" strokeWidth="5" strokeLinecap="round" />
      {/* head: a crown of fluff */}
      <g fill={COAT}>
        <circle cx="180" cy="188" r="88" />
        <circle cx="138" cy="114" r="36" />
        <circle cx="180" cy="98" r="40" />
        <circle cx="222" cy="114" r="36" />
        <circle cx="112" cy="146" r="28" />
        <circle cx="248" cy="146" r="28" />
      </g>
      <path d="M150 92q12-14 26-6M194 84q14-6 22 8M120 128q4-12 16-14" stroke={COAT_DARK} strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* muzzle */}
      <ellipse cx="180" cy="220" rx="58" ry="46" fill={MUZZLE} />
      <ellipse cx="128" cy="214" rx="14" ry="9" fill="#f2a487" opacity=".55" />
      <ellipse cx="232" cy="214" rx="14" ry="9" fill="#f2a487" opacity=".55" />
      {/* eyes */}
      <circle cx="148" cy="180" r="11" fill={INK} />
      <circle cx="212" cy="180" r="11" fill={INK} />
      <path d="M151 176h1M215 176h1" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
      <path d="M134 158q14-10 28-2M198 156q14-8 28 2" stroke={COAT_DARK} strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* nose and mouth */}
      <path d="M164 204q16-10 32 0q-2 16-16 20q-14-4-16-20z" fill={INK} />
      <path d="M172 240q8 18 16 0z" fill="#e66f78" />
      <path d="M180 224v10m0 0q-14 12-26 2m26-2q14 12 26 2" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {bubbles ? (
        <g fill="rgba(255,255,255,.55)" stroke="#fff" strokeWidth="2.5">
          <circle cx="44" cy="96" r="18" />
          <circle cx="76" cy="52" r="10" />
          <circle cx="318" cy="70" r="22" />
          <circle cx="300" cy="22" r="8" />
          <circle cx="330" cy="200" r="12" />
        </g>
      ) : null}
    </svg>
  )
}

/** Side-on dog silhouette, used for the size guide and pickers. */
export function DogSide({ className }: ArtProps): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 120 84" aria-hidden="true" focusable="false">
      <path
        d="M22 38c0-8 6-12 14-12h40c2-8 8-16 16-16 7 0 11 4 13 9l9 4c3 2 1 7-3 7h-6c-2 4-4 8-7 10v30h-8l-2-18H48l-4 18h-8V52c-8-2-14-8-14-14z"
        fill="currentColor"
      />
      <path d="M22 38c-8-2-12-10-10-18" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M92 12c-6 4-8 12-4 20" stroke="rgba(255,255,255,.5)" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export function IconDoor({ className }: ArtProps): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 42V8h20v34M8 42h32M27 26v2" />
      <path d="M32 14l6 4v18" />
    </svg>
  )
}

export function IconBath({ className }: ArtProps): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 24h36v4a10 10 0 0 1-10 10H16A10 10 0 0 1 6 28zM14 38l-2 4M34 38l2 4" />
      <circle cx="18" cy="14" r="4" />
      <circle cx="28" cy="10" r="3" />
      <circle cx="32" cy="18" r="2" />
    </svg>
  )
}

export function IconScissors({ className }: ArtProps): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="36" r="6" />
      <circle cx="36" cy="36" r="6" />
      <path d="M16 31L38 6M32 31L10 6" />
    </svg>
  )
}

export function IconText({ className }: ArtProps): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="13" y="4" width="22" height="40" rx="4" />
      <path d="M20 38h8M18 14h12M18 20h8" />
    </svg>
  )
}

/** A groomer drawn as a badge: a tool and an initial, no faces. */
export function GroomerBadge({ className, tool }: ArtProps & { tool: 'scissors' | 'brush' }): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <circle cx="60" cy="60" r="56" fill="currentColor" opacity=".16" />
      <circle cx="60" cy="60" r="44" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 6" />
      {tool === 'scissors' ? (
        <g fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round">
          <circle cx="44" cy="78" r="9" />
          <circle cx="76" cy="78" r="9" />
          <path d="M50 71l30-38M70 71L40 33" />
        </g>
      ) : (
        <g fill="currentColor">
          <rect x="34" y="40" width="52" height="22" rx="10" />
          <rect x="54" y="62" width="12" height="32" rx="6" />
          <path d="M40 40v-8M50 40v-10M60 40v-10M70 40v-10M80 40v-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </g>
      )}
    </svg>
  )
}

/** A little drawn map of the yard, not to scale. */
export function MapArt({ className }: ArtProps): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 400 260" aria-hidden="true" focusable="false">
      <rect width="400" height="260" fill="#d9f0ec" />
      <path d="M0 180C80 150 140 210 220 170s120-40 180-10v100H0z" fill="#c4e6df" />
      <path d="M-10 90L410 130" stroke="#fff" strokeWidth="26" />
      <path d="M150 -10L190 270" stroke="#fff" strokeWidth="18" />
      <path d="M300 -10l-30 280" stroke="#fff" strokeWidth="12" />
      <g fill="#a9d8cf">
        <rect x="24" y="20" width="96" height="50" rx="8" />
        <rect x="210" y="16" width="70" height="72" rx="8" />
        <rect x="320" y="150" width="64" height="60" rx="8" />
        <rect x="30" y="150" width="100" height="60" rx="8" />
      </g>
      <circle cx="246" cy="190" r="34" fill="#9fd3c8" />
      <circle cx="232" cy="180" r="12" fill="#86c6b9" />
      <circle cx="262" cy="198" r="14" fill="#86c6b9" />
      <g>
        <path d="M200 84c0-16 12-28 28-28s28 12 28 28c0 22-28 48-28 48s-28-26-28-48z" fill="#0f766e" />
        <circle cx="228" cy="84" r="10" fill="#fff" />
      </g>
    </svg>
  )
}
