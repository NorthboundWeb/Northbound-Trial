/** Line-drawn illustrations for Clearwater. Pure, no hooks. Geometry is built
 *  once at module load so each drawing is only a handful of elements. */
import type { JSX } from 'react'

type Box = [number, number, number, number]

const TERRACE_X = [60, 190, 320]
const SEMI_X = [510, 660]

function windowBoxes(): Box[] {
  const out: Box[] = []
  for (const x of TERRACE_X) {
    out.push([x + 18, 174, 40, 44], [x + 72, 174, 40, 44], [x + 14, 254, 58, 56])
  }
  SEMI_X.forEach((x, h) => {
    out.push([x + 22, 154, 46, 50], [x + 86, 154, 46, 50], [x + (h === 0 ? 18 : 80), 242, 52, 56])
  })
  out.push([892, 146, 48, 54], [966, 146, 48, 54], [1040, 146, 48, 54], [892, 238, 60, 60], [1036, 238, 52, 60])
  return out
}

const BOXES = windowBoxes()
const WINDOWS = BOXES.map(([x, y, w, h]) => `M${x} ${y}h${w}v${h}h${-w}z`).join('')
const BARS = BOXES.map(([x, y, w, h]) => `M${x + w / 2} ${y}v${h}M${x} ${y + h / 2}h${w}`).join('')
const GLINTS = BOXES.map(([x, y, w, h]) => `M${x + 6} ${y + h * 0.42}l${w * 0.22} ${-h * 0.24}`).join('')
const SILLS = BOXES.map(([x, y, w, h]) => `M${x - 4} ${y + h + 3}h${w + 8}`).join('')

const WALLS =
  'M60 150h390v190H60z' + // terrace
  'M510 130h300v210H510z' + // semi pair
  'M870 120h240v220H870z' // detached

const ROOFS =
  'M48 150l42-48h320l42 48z' +
  'M140 102v-26h18v26M270 102v-26h18v26M400 102v-26h18v26' +
  'M498 130l60-58h204l60 58z' +
  'M600 72v-22h20v22' +
  'M856 122l134-82 134 82z' +
  'M1060 84V40h20v56'

const PARTY_WALLS = 'M190 150v190M320 150v190M660 130v210'

const DOORS =
  TERRACE_X.map((x) => `M${x + 86} ${250}h30v90h-30z`).join('') +
  'M610 238h30v102h-30zM690 238h30v102h-30z' +
  'M972 232h40v108h-40z'

export function StreetScene({ className, sheen = false, sheenClass }: { className?: string; sheen?: boolean; sheenClass?: string }): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 1200 372" aria-hidden="true" focusable="false">
      {sheen ? (
        <defs>
          <clipPath id="cw-glass">
            <path d={WINDOWS + 'M1112 262h66v78h-66z'} />
          </clipPath>
          <linearGradient id="cw-sheen" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset=".5" stopColor="#fff" stopOpacity=".95" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
      ) : null}
      <g fill="#fff" opacity=".9">
        <ellipse cx="190" cy="46" rx="58" ry="16" />
        <ellipse cx="226" cy="36" rx="34" ry="16" />
        <ellipse cx="760" cy="26" rx="46" ry="12" />
      </g>
      <path d="M0 340h1200v32H0z" fill="#d6ecfb" />
      <path d="M0 340h1200" stroke="#082f49" strokeWidth="2" />
      <path d={ROOFS} fill="#d6ecfb" stroke="#082f49" strokeWidth="2" strokeLinejoin="round" />
      <path d={WALLS} fill="#fff" stroke="#082f49" strokeWidth="2" />
      <path d={PARTY_WALLS} stroke="#082f49" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
      <path d={WINDOWS} fill="#bfe0f7" stroke="#082f49" strokeWidth="2" />
      <path d={BARS + SILLS} stroke="#082f49" strokeWidth="1.5" fill="none" />
      <path d={GLINTS} stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d={DOORS} fill="#0369a1" stroke="#082f49" strokeWidth="2" />
      {/* conservatory */}
      <path d="M1110 262h70v78h-70zM1133 262v78M1156 262v78M1110 300h70" fill="#e6f4fd" stroke="#082f49" strokeWidth="1.5" />
      {/* tree */}
      <path d="M478 340v-56" stroke="#082f49" strokeWidth="2" />
      <circle cx="478" cy="262" r="26" fill="#cde7d6" stroke="#082f49" strokeWidth="2" />
      {/* the cleaner, with a water-fed pole */}
      <path d="M842 340l6-34 6 34M848 306v-30M848 286l-18-6" stroke="#082f49" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="848" cy="266" r="9" fill="#0284c7" stroke="#082f49" strokeWidth="2" />
      <path d="M836 300L776 186M766 180l20 10" stroke="#082f49" strokeWidth="3" strokeLinecap="round" />
      <path d="M770 196q-4 8 0 10q4-2 0-10zM784 204q-4 8 0 10q4-2 0-10z" fill="#0284c7" />
      {sheen ? (
        <g clipPath="url(#cw-glass)">
          <rect className={sheenClass} x="-260" y="0" width="200" height="372" fill="url(#cw-sheen)" />
        </g>
      ) : null}
    </svg>
  )
}

/** Small line drawings for the house-type picker. */
export function HouseIcon({ shape, className }: { shape: 'flat' | 'terrace' | 'semi' | 'detached'; className?: string }): JSX.Element {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinejoin: 'round' as const }
  return (
    <svg className={className} viewBox="0 0 72 52" aria-hidden="true" focusable="false">
      {shape === 'flat' ? (
        <>
          <path d="M18 6h36v44H18z" {...common} />
          <path d="M24 12h8v8h-8zM40 12h8v8h-8zM24 27h8v8h-8zM40 27h8v8h-8zM32 41h8v9h-8z" {...common} strokeWidth={1.5} />
        </>
      ) : null}
      {shape === 'terrace' ? (
        <>
          <path d="M4 22l6-8h52l6 8v28H4z" {...common} />
          <path d="M26 22v28M46 22v28M9 28h8v8H9zM31 28h8v8h-8zM51 28h8v8h-8zM18 40h5v10M40 40h5v10M60 40h5v10" {...common} strokeWidth={1.5} />
        </>
      ) : null}
      {shape === 'semi' ? (
        <>
          <path d="M8 22l10-12h36l10 12v28H8z" {...common} />
          <path d="M36 10v40M14 28h9v8h-9zM49 28h9v8h-9zM27 38h6v12M39 38h6v12" {...common} strokeWidth={1.5} />
        </>
      ) : null}
      {shape === 'detached' ? (
        <>
          <path d="M14 24L36 6l22 18v26H14z" {...common} />
          <path d="M20 28h9v8h-9zM43 28h9v8h-9zM32 38h8v12h-8z" {...common} strokeWidth={1.5} />
        </>
      ) : null}
    </svg>
  )
}

export function IconTag({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M6 24L24 6h18v18L24 42z" />
      <circle cx="34" cy="14" r="3" />
      <path d="M18 26l6 6M22 22l6 6" />
    </svg>
  )
}

export function IconPole({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M8 6h20v20H8zM18 6v20M8 16h20" />
      <path d="M44 44L26 22M22 20l8 6" />
      <path d="M33 30q-2 4 0 5q2-1 0-5z" />
    </svg>
  )
}

export function IconCard({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
      <rect x="10" y="4" width="22" height="40" rx="4" />
      <path d="M16 12h10M16 18h6" />
      <rect x="22" y="24" width="20" height="13" rx="2" />
      <path d="M22 29h20" />
    </svg>
  )
}

export function IconSkip({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
      <rect x="6" y="10" width="36" height="32" rx="4" />
      <path d="M6 18h36M16 6v8M32 6v8M18 26l12 10M30 26L18 36" />
    </svg>
  )
}

/** Brand mark: a pane with a squeegee stroke. */
export function Mark({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <rect x="2" y="2" width="36" height="36" rx="9" fill="#0369a1" />
      <path d="M10 10h20v20H10zM20 10v20M10 20h20" fill="none" stroke="#fff" strokeWidth="2" />
      <path d="M13 26l14-14" stroke="#7dd3fc" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
