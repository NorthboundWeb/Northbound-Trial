import type { JSX } from 'react'
import type { Kind } from './data'
import styles from './styles.module.css'

/*
 * Drawn bouquets. Each product has a seed; buildBouquet turns the seed into
 * a fixed set of flower heads and foliage (a tiny deterministic PRNG, so the
 * same product always draws the same way on the server and in the browser).
 */

const STEM = '#5d7a5f'
const LEAF = '#7f9c8a'
const LEAF_DARK = '#57745f'
const KRAFT = '#d9b99b'
const KRAFT_DARK = '#c59f7e'

type HeadKind = 'ran' | 'anem' | 'tulip' | 'puff'
type Head = { kind: HeadKind; x: number; y: number; r: number; rot: number; c: number }
type FillKind = 'euc' | 'sprig' | 'grass' | 'tail'
type Fill = { kind: FillKind; x: number; y: number; ang: number; len: number }

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

const BX = 150
const BY = 292

function buildBouquet(
  seed: number,
  count: number,
  kinds: HeadKind[],
  fills: FillKind[],
  fillCount: number,
): { heads: Head[]; fills: Fill[] } {
  const rand = rng(seed)
  const heads: Head[] = []
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1)
    const inner = i % 3 === 1
    const ang = -1.05 + 2.1 * t + (rand() - 0.5) * 0.28
    const dist = inner ? 52 + rand() * 22 : 88 + rand() * 26
    heads.push({
      kind: kinds[Math.floor(rand() * kinds.length)],
      x: BX + Math.sin(ang) * dist * 1.08,
      y: 196 - Math.cos(ang) * dist * 0.92 + (rand() - 0.5) * 14,
      r: 17 + rand() * 12,
      rot: Math.floor(rand() * 360),
      c: Math.floor(rand() * 4),
    })
  }
  heads.sort((a, b) => a.y - b.y)
  const out: Fill[] = []
  for (let i = 0; i < fillCount; i++) {
    const t = fillCount === 1 ? 0.5 : i / (fillCount - 1)
    const ang = -1.25 + 2.5 * t + (rand() - 0.5) * 0.2
    const len = 150 + rand() * 60
    out.push({
      kind: fills[Math.floor(rand() * fills.length)],
      x: BX + Math.sin(ang) * len,
      y: BY - Math.cos(ang) * len,
      ang,
      len,
    })
  }
  return { heads, fills: out }
}

function FlowerHead({ h, palette, lean }: { h: Head; palette: readonly string[]; lean: boolean }): JSX.Element {
  const c = palette[h.c]
  const c2 = palette[(h.c + 1) % palette.length]
  if (lean) {
    return (
      <g transform={`translate(${h.x.toFixed(1)} ${h.y.toFixed(1)})`}>
        <circle r={h.r} fill={c} />
        <circle r={h.r * 0.42} fill="#2c1d2b" opacity={h.kind === 'anem' ? 0.85 : 0.12} />
      </g>
    )
  }
  switch (h.kind) {
    case 'ran':
      return (
        <g transform={`translate(${h.x.toFixed(1)} ${h.y.toFixed(1)}) rotate(${h.rot})`}>
          <circle r={h.r} fill={c} />
          <circle r={h.r * 0.76} cx={h.r * 0.06} fill="#000" opacity="0.08" />
          <circle r={h.r * 0.56} cx={h.r * 0.04} fill={c} />
          <circle r={h.r * 0.34} fill="#000" opacity="0.1" />
          <circle r={h.r * 0.18} fill={c} />
        </g>
      )
    case 'anem':
      return (
        <g transform={`translate(${h.x.toFixed(1)} ${h.y.toFixed(1)}) rotate(${h.rot})`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy={-h.r * 0.52} rx={h.r * 0.5} ry={h.r * 0.56} fill={c} transform={`rotate(${a})`} />
          ))}
          <circle r={h.r * 0.36} fill="#2c1d2b" />
          <circle r={h.r * 0.46} fill="none" stroke="#2c1d2b" strokeWidth="1.5" strokeDasharray="1.5 3" opacity="0.7" />
        </g>
      )
    case 'tulip': {
      const r = h.r
      return (
        <g transform={`translate(${h.x.toFixed(1)} ${h.y.toFixed(1)}) rotate(${(h.rot % 50) - 25})`}>
          <path
            d={`M${-r * 0.72} ${-r * 0.3}Q${-r * 0.8} ${r * 0.9} 0 ${r * 0.9}Q${r * 0.8} ${r * 0.9} ${r * 0.72} ${-r * 0.3}L${r * 0.36} ${r * 0.1}L0 ${-r * 0.7}L${-r * 0.36} ${r * 0.1}Z`}
            fill={c}
          />
          <path d={`M0 ${-r * 0.7}L${-r * 0.2} ${r * 0.6}`} stroke="#000" strokeOpacity="0.12" strokeWidth="2" />
        </g>
      )
    }
    case 'puff':
      return (
        <g transform={`translate(${h.x.toFixed(1)} ${h.y.toFixed(1)})`}>
          {[
            [0, -0.5],
            [0.5, -0.1],
            [0.3, 0.45],
            [-0.3, 0.45],
            [-0.5, -0.1],
            [0, 0],
          ].map(([dx, dy], i) => (
            <circle key={i} cx={dx * h.r} cy={dy * h.r} r={h.r * 0.42} fill={i % 2 ? c : c2} />
          ))}
        </g>
      )
  }
}

function Filler({ f, palette }: { f: Fill; palette: readonly string[] }): JSX.Element {
  const dx = f.x - BX
  const dy = f.y - BY
  const at = (t: number, side: number, off: number): [number, number] => {
    // point along the stem, pushed sideways by `off`
    const nx = -dy / f.len
    const ny = dx / f.len
    return [BX + dx * t + nx * off * side, BY + dy * t + ny * off * side]
  }
  switch (f.kind) {
    case 'euc':
      return (
        <g>
          <path d={`M${BX} ${BY}L${f.x.toFixed(1)} ${f.y.toFixed(1)}`} stroke={STEM} strokeWidth="2" />
          {[0.5, 0.62, 0.74, 0.86, 0.98].map((t, i) => {
            const [x, y] = at(t, i % 2 ? 1 : -1, 9)
            return <circle key={t} cx={x.toFixed(1)} cy={y.toFixed(1)} r={9 - i} fill={i % 2 ? LEAF : '#94b0a0'} />
          })}
        </g>
      )
    case 'sprig':
      return (
        <g>
          <path d={`M${BX} ${BY}L${f.x.toFixed(1)} ${f.y.toFixed(1)}`} stroke={STEM} strokeWidth="1.5" />
          {[0.8, 0.88, 0.94, 1].map((t, i) => {
            const [x, y] = at(t, i % 2 ? 1 : -1, 6)
            return <circle key={t} cx={x.toFixed(1)} cy={y.toFixed(1)} r="4" fill={palette[(i + 1) % palette.length]} />
          })}
        </g>
      )
    case 'grass': {
      const ticks = [0.7, 0.78, 0.86, 0.94]
        .map((t) => {
          const [x1, y1] = at(t, 1, 0)
          const [x2, y2] = at(t - 0.05, 1, 7)
          const [x3, y3] = at(t - 0.05, -1, 7)
          return `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}M${x1.toFixed(1)} ${y1.toFixed(1)}L${x3.toFixed(1)} ${y3.toFixed(1)}`
        })
        .join('')
      return (
        <g stroke="#c2a273" strokeWidth="2" strokeLinecap="round" fill="none">
          <path d={`M${BX} ${BY}L${f.x.toFixed(1)} ${f.y.toFixed(1)}`} strokeWidth="1.5" />
          <path d={ticks} />
        </g>
      )
    }
    case 'tail':
      return (
        <g>
          <path d={`M${BX} ${BY}L${f.x.toFixed(1)} ${f.y.toFixed(1)}`} stroke="#b9a07c" strokeWidth="1.5" />
          <ellipse
            cx={f.x.toFixed(1)}
            cy={f.y.toFixed(1)}
            rx="7"
            ry="13"
            fill="#f3ead9"
            transform={`rotate(${((f.ang * 180) / Math.PI).toFixed(1)} ${f.x.toFixed(1)} ${f.y.toFixed(1)})`}
          />
        </g>
      )
  }
}

function Wrap({ front }: { front: boolean }): JSX.Element {
  if (!front) {
    return <path d="M34 168Q150 120 266 168L176 318H124z" fill={KRAFT} opacity="0.9" />
  }
  return (
    <g>
      <path d="M60 236Q104 258 150 244Q196 258 240 236L180 398Q150 404 120 398z" fill={KRAFT} />
      <path d="M60 236Q104 258 150 244L120 398z" fill={KRAFT_DARK} opacity="0.6" />
      <path d="M118 300Q150 312 182 300" stroke="#7a2e5c" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M150 306q-26-20-30 2q14 8 30-2zM150 306q26-20 30 2q-14 8-30-2z" fill="#7a2e5c" />
      <path d="M148 308l-14 36M152 308l12 34" stroke="#7a2e5c" strokeWidth="4" strokeLinecap="round" />
    </g>
  )
}

function LeanWrap(): JSX.Element {
  return (
    <g>
      <path d="M60 236Q104 258 150 244Q196 258 240 236L180 398Q150 404 120 398z" fill={KRAFT} />
      <path d="M118 300Q150 312 182 300" stroke="#7a2e5c" strokeWidth="6" fill="none" strokeLinecap="round" />
    </g>
  )
}

function Vase({ ribbed }: { ribbed: boolean }): JSX.Element {
  return (
    <g>
      <path
        d="M104 262h92c4 22 14 44 14 74 0 38-26 56-60 56s-60-18-60-56c0-30 10-52 14-74z"
        fill="#dbe9e4"
        opacity="0.55"
        stroke="#9fb8af"
        strokeWidth="2"
      />
      <path d="M100 258h100" stroke="#9fb8af" strokeWidth="4" strokeLinecap="round" />
      <path d="M96 318c30 8 78 8 108 0v20c0 30-24 46-54 46s-54-16-54-46z" fill="#bcd6cd" opacity="0.5" />
      {ribbed && (
        <path d="M122 270v110M140 268v120M160 268v120M178 270v110" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="2" />
      )}
    </g>
  )
}

function Pot(): JSX.Element {
  return (
    <g>
      <path d="M96 296h108l-14 92H110z" fill="#c7774f" />
      <rect x="88" y="284" width="124" height="22" rx="4" fill="#b8673f" />
      <path d="M110 330h80" stroke="#a65a36" strokeWidth="2" opacity="0.6" />
      <ellipse cx="150" cy="286" rx="54" ry="5" fill="#5a4032" />
    </g>
  )
}

function OliveTree({ seed }: { seed: number }): JSX.Element {
  const leaves = buildLeaves(seed)
  return (
    <g>
      <path d="M150 290C146 250 156 222 146 196M148 236C170 222 182 206 196 180M148 220C126 204 118 186 104 168" stroke="#6b5444" strokeWidth="6" fill="none" strokeLinecap="round" />
      {leaves.map((l, i) => (
        <ellipse
          key={i}
          cx={l.x.toFixed(1)}
          cy={l.y.toFixed(1)}
          rx="12"
          ry="4"
          fill={i % 3 === 0 ? '#9fb19a' : i % 3 === 1 ? LEAF_DARK : '#7f9c8a'}
          transform={`rotate(${l.r} ${l.x.toFixed(1)} ${l.y.toFixed(1)})`}
        />
      ))}
    </g>
  )
}

function buildLeaves(seed: number): { x: number; y: number; r: number }[] {
  const rand = rng(seed)
  const out: { x: number; y: number; r: number }[] = []
  const centres = [
    [150, 150],
    [108, 160],
    [196, 166],
    [150, 112],
  ]
  for (const [cx, cy] of centres) {
    for (let i = 0; i < 11; i++) {
      const a = rand() * Math.PI * 2
      const d = 8 + rand() * 34
      out.push({ x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d * 0.8, r: Math.floor(rand() * 180) })
    }
  }
  return out
}

const KINDS_FOR: Record<Kind, { heads: HeadKind[]; fills: FillKind[] }> = {
  bouquet: { heads: ['ran', 'anem', 'ran', 'tulip', 'puff'], fills: ['euc', 'sprig', 'euc'] },
  vase: { heads: ['ran', 'puff', 'anem', 'tulip'], fills: ['euc', 'sprig', 'grass'] },
  plant: { heads: ['ran'], fills: ['euc'] },
  dried: { heads: ['puff'], fills: ['grass', 'tail', 'grass'] },
  subscription: { heads: ['ran', 'anem', 'tulip', 'puff'], fills: ['euc', 'sprig'] },
}

/**
 * A full drawing for a product. `lean` keeps the node count low for the
 * home-page wall; `big` adds more stems for the hero.
 */
export function Bouquet({
  kind,
  palette,
  seed,
  lean = false,
  big = false,
  label,
}: {
  kind: Kind
  palette: readonly string[]
  seed: number
  lean?: boolean
  big?: boolean
  label?: string
}): JSX.Element {
  const a11y = label ? { role: 'img' as const, 'aria-label': label } : { 'aria-hidden': true as const }
  if (kind === 'plant') {
    return (
      <svg className={styles.art} viewBox="0 0 300 400" {...a11y}>
        <OliveTree seed={seed} />
        <Pot />
      </svg>
    )
  }
  const k = KINDS_FOR[kind]
  const { heads, fills } = buildBouquet(
    seed,
    lean ? 5 : big ? 13 : kind === 'dried' ? 6 : 9,
    k.heads,
    k.fills,
    lean ? 0 : big ? 9 : kind === 'dried' ? 12 : 7,
  )
  const inVase = kind === 'vase'
  return (
    <svg className={styles.art} viewBox="0 0 300 400" {...a11y}>
      {!inVase && !lean && <Wrap front={false} />}
      <g className={styles.sway}>
        {fills.map((f, i) => (
          <Filler key={i} f={f} palette={palette} />
        ))}
        <path
          d={heads.map((h) => `M${BX} ${BY}L${h.x.toFixed(1)} ${h.y.toFixed(1)}`).join('')}
          stroke={STEM}
          strokeWidth="2.5"
          fill="none"
        />
        {heads.map((h, i) => (
          <FlowerHead key={i} h={h} palette={palette} lean={lean} />
        ))}
      </g>
      {inVase ? <Vase ribbed={seed % 2 === 1} /> : lean ? <LeanWrap /> : <Wrap front />}
    </svg>
  )
}

/** Small sprig used in the wordmark. */
export function Sprig(): JSX.Element {
  return (
    <svg className={styles.sprig} viewBox="0 0 32 40" aria-hidden="true">
      <path d="M16 38C16 26 14 16 20 4" stroke="#7a2e5c" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <ellipse cx="11" cy="22" rx="5" ry="2.6" transform="rotate(-30 11 22)" fill="#7f9c8a" />
      <ellipse cx="21" cy="16" rx="5" ry="2.6" transform="rotate(30 21 16)" fill="#7f9c8a" />
      <circle cx="20" cy="5" r="4.5" fill="#c9577f" />
    </svg>
  )
}

/** The studio shopfront, for the Visit section. */
export function Shopfront(): JSX.Element {
  return (
    <svg className={styles.shopSvg} viewBox="0 0 520 380" role="img" aria-label="Drawing of the Wild Stem studio: a plum shopfront with a striped awning and buckets of flowers outside">
      <rect width="520" height="380" fill="#f1e4ea" />
      <rect x="60" y="40" width="400" height="300" fill="#ead8cf" />
      <rect x="80" y="70" width="360" height="40" fill="#7a2e5c" />
      <text x="260" y="98" textAnchor="middle" fill="#fbf6f2" fontSize="22" fontStyle="italic" fontFamily="Georgia, 'Times New Roman', serif">
        Wild Stem
      </text>
      <g>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <path key={i} d={`M${80 + i * 45} 118h45l-6 34c-5 6-28 6-33 0z`} fill={i % 2 ? '#fbf6f2' : '#7a2e5c'} />
        ))}
      </g>
      <rect x="100" y="166" width="150" height="150" fill="#cfe0dc" stroke="#7a2e5c" strokeWidth="6" />
      <path d="M175 166v150M100 241h150" stroke="#7a2e5c" strokeWidth="4" />
      <rect x="290" y="166" width="110" height="174" fill="#5e2148" />
      <circle cx="384" cy="258" r="4" fill="#d9a441" />
      <rect x="40" y="340" width="440" height="40" fill="#d8c8bd" />
      {[
        [120, '#c9577f'],
        [180, '#e9b949'],
        [440, '#e8b4bc'],
      ].map(([x, c]) => (
        <g key={String(x)} transform={`translate(${x} 0)`}>
          <circle cx="-14" cy="298" r="12" fill={String(c)} />
          <circle cx="8" cy="292" r="13" fill={String(c)} opacity="0.85" />
          <circle cx="-2" cy="306" r="11" fill="#7f9c8a" />
          <path d="M-22 310h40l-5 40h-30z" fill="#8a8f93" />
        </g>
      ))}
    </svg>
  )
}
