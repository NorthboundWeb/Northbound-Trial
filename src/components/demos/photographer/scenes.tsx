import type { JSX } from 'react'
import styles from './styles.module.css'

/*
 * Drawn stand-ins for photographs. Every scene is inline SVG; gradient ids
 * are prefixed by scene so each one is unique on the page (each scene is
 * drawn once in Site). `lean` scenes use flat fills and no ids, for the
 * home-page wall.
 */

export type SceneKind = 'headland' | 'beach' | 'confetti' | 'rings' | 'lights' | 'doorway' | 'dance' | 'night'

function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function scatter(seed: number, n: number, w: number, h: number): { x: number; y: number; r: number; k: number }[] {
  const rand = rng(seed)
  const out: { x: number; y: number; r: number; k: number }[] = []
  for (let i = 0; i < n; i++) out.push({ x: rand() * w, y: rand() * h, r: rand(), k: Math.floor(rand() * 4) })
  return out
}

/** Film grain filter, defined once at the top of Site. */
export function GrainDefs(): JSX.Element {
  return (
    <svg className={styles.defs} aria-hidden="true" focusable="false">
      <filter id="hl-grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
    </svg>
  )
}

function Grain({ w, h }: { w: number; h: number }): JSX.Element {
  return <rect width={w} height={h} filter="url(#hl-grain)" opacity="0.13" style={{ mixBlendMode: 'multiply' }} />
}

/** Two small figures, holding hands. Origin is at their feet. */
function Couple({ x, y, s = 1, fill, veil = true }: { x: number; y: number; s?: number; fill: string; veil?: boolean }): JSX.Element {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
      <circle cx="-7" cy="-41" r="4.6" />
      <path d="M-12.5 -35h11l1.6 18-1.6 17h-3.4l-1.6-14-1.6 14h-3.4l-1.6-17z" />
      <circle cx="8" cy="-40" r="4.2" />
      <path d="M4 -34.5h8l2 10 6 24.5h-24l6-24.5z" />
      {veil && <path d="M10.5 -43c5 2 7 10 10 24-4-6-7-10-9.5-12z" opacity="0.55" />}
      <path d="M-1.6 -22h6" stroke={fill} strokeWidth="2.2" strokeLinecap="round" />
    </g>
  )
}

export function Scene({ kind, lean = false, label }: { kind: SceneKind; lean?: boolean; label?: string }): JSX.Element {
  const a11y = label ? { role: 'img' as const, 'aria-label': label } : { 'aria-hidden': true as const }
  switch (kind) {
    case 'headland':
      return <Headland lean={lean} a11y={a11y} />
    case 'beach':
      return <Beach a11y={a11y} />
    case 'confetti':
      return <Confetti a11y={a11y} />
    case 'rings':
      return <Rings a11y={a11y} />
    case 'lights':
      return <Lights a11y={a11y} />
    case 'doorway':
      return <Doorway a11y={a11y} />
    case 'dance':
      return <Dance a11y={a11y} />
    case 'night':
      return <Night a11y={a11y} />
  }
}

type A11y = { role: 'img'; 'aria-label': string } | { 'aria-hidden': true }

function Headland({ lean, a11y }: { lean: boolean; a11y: A11y }): JSX.Element {
  const path = [0, 1, 2, 3, 4, 5, 6, 7, 8]
  return (
    <svg className={styles.scene} viewBox="0 0 1200 520" preserveAspectRatio="xMidYMid slice" {...a11y}>
      {!lean && (
        <defs>
          <linearGradient id="hl-hd-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c9b6aa" />
            <stop offset="0.55" stopColor="#e8cdb1" />
            <stop offset="1" stopColor="#f4dcbb" />
          </linearGradient>
          <linearGradient id="hl-hd-sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#a3a7a4" />
            <stop offset="1" stopColor="#47525a" />
          </linearGradient>
          <radialGradient id="hl-hd-sun">
            <stop offset="0" stopColor="#fff2d8" />
            <stop offset="1" stopColor="#f4dcbb" stopOpacity="0" />
          </radialGradient>
        </defs>
      )}
      <rect width="1200" height="330" fill={lean ? '#e6ccb2' : 'url(#hl-hd-sky)'} />
      {!lean && <circle cx="760" cy="300" r="190" fill="url(#hl-hd-sun)" />}
      <circle cx="760" cy="306" r="40" fill="#fbecd2" />
      <path d="M0 300C80 284 150 270 230 276S340 296 420 318H0z" fill="#a39189" />
      <path d="M176 278l3-38h8l3 38z" fill="#f6efe6" />
      <path d="M177 240l6-8 6 8z" fill="#5d514a" />
      {!lean && <path d="M183 236L600 196V266z" fill="#fff6dc" opacity="0.32" className={styles.beam} />}
      <rect y="318" width="1200" height="202" fill={lean ? '#7d858a' : 'url(#hl-hd-sea)'} />
      {!lean && (
        <g stroke="#fbecd2" strokeLinecap="round">
          {path.map((i) => {
            const w = 70 - i * 6 + (i % 2) * 14
            return <path key={i} d={`M${760 - w} ${326 + i * 12}h${w * 2}`} strokeWidth={2.4 - i * 0.18} opacity={0.75 - i * 0.06} />
          })}
        </g>
      )}
      <path d="M640 520C700 470 760 420 860 380S960 338 1010 330 1120 318 1200 300V520z" fill="#3b332c" />
      <path d="M820 520C880 470 980 430 1200 410V520z" fill="#2a2420" />
      <Couple x={1034} y={330} s={1.05} fill="#2a2420" />
      {!lean && (
        <>
          <g stroke="#3b332c" strokeWidth="2" strokeLinecap="round">
            <path d="M902 362l-4-12M908 360l2-13M1092 326l-3-11M1098 325l2-12M1150 314l-3-10" />
          </g>
          <g fill="none" stroke="#5d514a" strokeWidth="2" strokeLinecap="round">
            <path d="M520 150q8-8 16 0q8-8 16 0" />
            <path d="M574 126q6-6 12 0q6-6 12 0" />
          </g>
          <Grain w={1200} h={520} />
        </>
      )}
    </svg>
  )
}

function Beach({ a11y }: { a11y: A11y }): JSX.Element {
  const prints = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  return (
    <svg className={styles.scene} viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" {...a11y}>
      <defs>
        <linearGradient id="hl-bc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e6e2db" />
          <stop offset="1" stopColor="#f1e5d4" />
        </linearGradient>
        <linearGradient id="hl-bc-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e7d8c3" />
          <stop offset="1" stopColor="#cfb797" />
        </linearGradient>
      </defs>
      <rect width="300" height="160" fill="url(#hl-bc-sky)" />
      <rect y="150" width="300" height="56" fill="#9fb0b4" />
      <path d="M0 200c40-8 70 6 110 0s90-10 190-2v204H0z" fill="url(#hl-bc-sand)" />
      <path d="M0 202c40-8 70 6 110 0s90-10 190-2" fill="none" stroke="#fbf7f0" strokeWidth="3" opacity="0.8" />
      <path d="M0 214c50-6 90 4 140-2s100-6 160 0" fill="none" stroke="#fbf7f0" strokeWidth="1.5" opacity="0.5" />
      <g fill="#b39a7b">
        {prints.map((i) => (
          <ellipse key={i} cx={60 + i * 12 + (i % 2) * 5} cy={392 - i * 9} rx="2.6" ry="4" transform={`rotate(-30 ${60 + i * 12} ${392 - i * 9})`} />
        ))}
      </g>
      <Couple x={196} y={306} s={1.5} fill="#3a322b" />
      <Grain w={300} h={400} />
    </svg>
  )
}

function Confetti({ a11y }: { a11y: A11y }): JSX.Element {
  const bits = scatter(19, 46, 300, 300)
  const colours = ['#e8b4bc', '#f3e1a0', '#ffffff', '#c9d6c8']
  return (
    <svg className={styles.scene} viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" {...a11y}>
      <defs>
        <linearGradient id="hl-cf-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9ccbe" />
          <stop offset="1" stopColor="#b9a896" />
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill="url(#hl-cf-wall)" />
      <g stroke="#a99886" strokeWidth="1" opacity="0.6">
        <path d="M0 70h300M0 140h300M0 210h300M0 280h300M80 0v70M200 70v70M120 140v70M240 210v70M60 280v70" />
      </g>
      <rect y="340" width="300" height="60" fill="#8f7f6f" />
      <Couple x={150} y={350} s={2.6} fill="#2e2924" />
      {bits.map((b, i) => (
        <rect
          key={i}
          x={b.x.toFixed(1)}
          y={(b.y + 20).toFixed(1)}
          width={3 + b.r * 4}
          height="3"
          fill={colours[b.k]}
          transform={`rotate(${Math.floor(b.r * 180)} ${b.x.toFixed(1)} ${(b.y + 20).toFixed(1)})`}
          opacity={0.75 + b.r * 0.25}
        />
      ))}
      <Grain w={300} h={400} />
    </svg>
  )
}

function Rings({ a11y }: { a11y: A11y }): JSX.Element {
  return (
    <svg className={styles.scene} viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" {...a11y}>
      <defs>
        <linearGradient id="hl-rg-cloth" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f2ebe2" />
          <stop offset="1" stopColor="#d6c6b3" />
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill="url(#hl-rg-cloth)" />
      <g fill="none" stroke="#c8b6a2" strokeWidth="18" opacity="0.35" strokeLinecap="round">
        <path d="M-20 90C60 130 120 60 320 120" />
        <path d="M-20 300C80 260 180 340 320 280" />
      </g>
      <ellipse cx="150" cy="232" rx="78" ry="16" fill="#b8a48d" opacity="0.35" />
      <circle cx="132" cy="206" r="36" fill="none" stroke="#c39c5e" strokeWidth="7" />
      <circle cx="168" cy="222" r="30" fill="none" stroke="#d8b77d" strokeWidth="6" />
      <path d="M108 184a36 36 0 0 1 30-14" stroke="#fff6e2" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M150 200a30 30 0 0 1 24-8" stroke="#fff6e2" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="168" cy="192" r="4.5" fill="#fffaf0" />
      <Grain w={300} h={400} />
    </svg>
  )
}

function Lights({ a11y }: { a11y: A11y }): JSX.Element {
  const bulbs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  const stars = scatter(5, 26, 400, 120)
  return (
    <svg className={styles.scene} viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" {...a11y}>
      <defs>
        <linearGradient id="hl-lt-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d2532" />
          <stop offset="1" stopColor="#3d3d48" />
        </linearGradient>
        <radialGradient id="hl-lt-glow">
          <stop offset="0" stopColor="#ffe2a3" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffe2a3" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill="url(#hl-lt-sky)" />
      {stars.map((s, i) => (
        <circle key={i} cx={s.x.toFixed(1)} cy={s.y.toFixed(1)} r={0.6 + s.r} fill="#f4efe6" opacity={0.3 + s.r * 0.5} />
      ))}
      <path d="M90 250L200 120L310 250z" fill="#e6dccd" />
      <path d="M170 250L200 170L230 250z" fill="#f7d79b" />
      <Couple x={202} y={248} s={1.2} fill="#3b2f25" veil={false} />
      <rect y="248" width="400" height="52" fill="#2a2a2a" />
      {[0, 1].map((row) => (
        <g key={row}>
          <path
            d={row === 0 ? 'M0 70Q100 130 200 92T400 70' : 'M0 120Q100 170 200 140T400 116'}
            fill="none"
            stroke="#59544c"
            strokeWidth="1"
          />
          {bulbs.map((i) => {
            const x = i * 40
            const y = row === 0 ? 70 + Math.sin((i / 10) * Math.PI) * 32 : 120 + Math.sin((i / 10) * Math.PI) * 26
            return (
              <g key={i}>
                <circle cx={x} cy={y + 4} r="13" fill="url(#hl-lt-glow)" />
                <circle cx={x} cy={y + 4} r="2.6" fill="#fff1c7" />
              </g>
            )
          })}
        </g>
      ))}
      <Grain w={400} h={300} />
    </svg>
  )
}

function Doorway({ a11y }: { a11y: A11y }): JSX.Element {
  return (
    <svg className={styles.scene} viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" {...a11y}>
      <defs>
        <linearGradient id="hl-dw-light" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbf0da" />
          <stop offset="1" stopColor="#ecd2a6" />
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill="#3a3530" />
      <g stroke="#4a443e" strokeWidth="2">
        <path d="M0 60h300M0 130h300M0 200h300M0 270h300M40 0v60M150 60v70M90 130v70M220 200v70M60 270v70" />
      </g>
      <path d="M96 330V170a54 54 0 0 1 108 0v160z" fill="url(#hl-dw-light)" />
      <path d="M86 330V168a64 64 0 0 1 128 0v162" fill="none" stroke="#5a5249" strokeWidth="8" />
      <path d="M96 330h108l60 70H36z" fill="#e8cfa3" opacity="0.4" />
      <rect y="330" width="300" height="70" fill="#2a2622" opacity="0.6" />
      <g fill="#2a2420">
        <circle cx="150" cy="238" r="9" />
        <path d="M140 250h20l6 26 14 54h-60l14-54z" />
        <path d="M156 232c12 6 20 40 26 98-10-26-18-52-26-60z" opacity="0.5" />
      </g>
      <Grain w={300} h={400} />
    </svg>
  )
}

function Dance({ a11y }: { a11y: A11y }): JSX.Element {
  const bokeh = scatter(71, 22, 400, 200)
  return (
    <svg className={styles.scene} viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" {...a11y}>
      <rect width="400" height="300" fill="#2d241f" />
      {bokeh.map((b, i) => (
        <circle
          key={i}
          cx={b.x.toFixed(1)}
          cy={b.y.toFixed(1)}
          r={6 + b.r * 22}
          fill={b.k % 2 ? '#e7b36b' : '#f3d39b'}
          opacity={0.12 + b.r * 0.25}
        />
      ))}
      <rect y="250" width="400" height="50" fill="#1f1915" />
      <g fill="#140f0c">
        <circle cx="182" cy="170" r="8" />
        <path d="M174 180h16l2 34-2 36h-6l-2-30-2 30h-6l-2-36z" />
        <circle cx="214" cy="166" r="7.5" />
        <path d="M206 176h14l4 22 36 50c-30 6-60 6-84 0l26-50z" />
        <path d="M190 190l16-4" stroke="#140f0c" strokeWidth="4" strokeLinecap="round" />
      </g>
      <Grain w={400} h={300} />
    </svg>
  )
}

function Night({ a11y }: { a11y: A11y }): JSX.Element {
  const stars = scatter(29, 60, 1200, 260)
  return (
    <svg className={styles.scene} viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" {...a11y}>
      <defs>
        <linearGradient id="hl-nt-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#151b26" />
          <stop offset="1" stopColor="#2f3644" />
        </linearGradient>
        <linearGradient id="hl-nt-beam" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#fff3d0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fff3d0" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="1200" height="420" fill="url(#hl-nt-sky)" />
      {stars.map((s, i) => (
        <circle key={i} cx={s.x.toFixed(1)} cy={s.y.toFixed(1)} r={0.5 + s.r * 1.1} fill="#f4efe6" opacity={0.25 + s.r * 0.6} />
      ))}
      <circle cx="220" cy="90" r="22" fill="#f1e9d8" />
      <circle cx="230" cy="84" r="20" fill="#1a2130" />
      <path d="M1000 186L180 120V270z" fill="url(#hl-nt-beam)" className={styles.beam} />
      <rect y="300" width="1200" height="120" fill="#10151d" />
      <g stroke="#f1e9d8" strokeLinecap="round" opacity="0.35">
        <path d="M600 316h80M560 334h140M620 352h60" strokeWidth="2" />
      </g>
      <path d="M880 310c40-30 90-40 150-36s120 14 170 30v116H860z" fill="#0b0f15" />
      <path d="M990 286l6-90h12l6 90z" fill="#d9d2c4" />
      <path d="M992 248h28v10h-28z" fill="#8a3b33" />
      <rect x="993" y="180" width="18" height="16" fill="#fff3d0" />
      <path d="M990 180l12-12 12 12z" fill="#0b0f15" />
      <Grain w={1200} h={420} />
    </svg>
  )
}

/** The lighthouse mark used in the wordmark. */
export function Mark(): JSX.Element {
  return (
    <svg className={styles.mark} viewBox="0 0 28 28" aria-hidden="true">
      <path d="M11 24l1.6-14h2.8L17 24z" fill="currentColor" />
      <path d="M12.2 10l1.8-3 1.8 3z" fill="currentColor" />
      <path d="M15.6 8.4L26 5.6v5.6zM12.4 8.4L2 5.6v5.6z" fill="currentColor" opacity="0.35" />
      <path d="M6 24h16" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}
