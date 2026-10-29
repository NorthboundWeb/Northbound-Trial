/**
 * Black Fern Tattoo: the flash sheet. Every piece is an original drawing
 * made from simple geometry for this concept site. Paths are computed once
 * at module load from fixed maths, so rendering stays pure.
 */

import styles from './styles.module.css'

export type Style = 'Fine line' | 'Botanical' | 'Blackwork' | 'Geometric' | 'Dotwork'
export type ArtistId = 'ines' | 'rory' | 'mae'

export type Piece = {
  id: string
  title: string
  artist: ArtistId
  styles: Style[]
  size: string
  from: string
  note: string
}

export const STYLES: Style[] = ['Fine line', 'Botanical', 'Blackwork', 'Geometric', 'Dotwork']

export const pieces: Piece[] = [
  { id: 'fern', title: 'Fern frond', artist: 'ines', styles: ['Botanical', 'Fine line'], size: 'Forearm or ribs, about 12cm', from: '£120', note: 'The studio’s namesake. Can be mirrored or bent to follow a muscle.' },
  { id: 'moth', title: 'Moth and new moon', artist: 'ines', styles: ['Fine line'], size: 'Palm size', from: '£90', note: 'Single needle. Sits well on a sternum or the back of an arm.' },
  { id: 'wildflowers', title: 'Three wildflowers', artist: 'ines', styles: ['Botanical', 'Fine line'], size: 'About 10cm tall', from: '£110', note: 'Swap any stem for a flower that means something to you.' },
  { id: 'phases', title: 'Moon phases', artist: 'mae', styles: ['Dotwork', 'Fine line'], size: 'Spine or forearm, 15cm', from: '£140', note: 'Stippled shadows, so it softens nicely as it heals.' },
  { id: 'pine', title: 'Pine sprig', artist: 'ines', styles: ['Botanical'], size: 'Palm size', from: '£85', note: 'Short needles, one cone. Good first tattoo.' },
  { id: 'peaks', title: 'Peaks in a circle', artist: 'rory', styles: ['Geometric'], size: 'About 8cm across', from: '£100', note: 'Three ridges and a sun. Tell us which hills and we’ll draw those.' },
  { id: 'hex', title: 'Hexagon study', artist: 'rory', styles: ['Geometric'], size: 'About 9cm across', from: '£110', note: 'Ruler-straight lines. Best on flat ground: forearm, calf, back.' },
  { id: 'band', title: 'Arrowhead band', artist: 'rory', styles: ['Blackwork', 'Geometric'], size: 'Wraps an arm or calf', from: '£180', note: 'Solid black, measured to your arm on the day.' },
  { id: 'blackfern', title: 'Black fern', artist: 'rory', styles: ['Blackwork', 'Botanical'], size: 'About 14cm', from: '£150', note: 'The frond again, filled solid. Heavy, graphic, lasts for ever.' },
  { id: 'swell', title: 'Swell', artist: 'rory', styles: ['Blackwork'], size: 'About 9cm across', from: '£130', note: 'Negative-space waves cut out of a black disc.' },
  { id: 'mandala', title: 'Mandala', artist: 'mae', styles: ['Dotwork', 'Geometric'], size: '10 to 20cm', from: '£160', note: 'Built up in dots. Scales up to a full back piece.' },
  { id: 'lotus', title: 'Lotus', artist: 'mae', styles: ['Dotwork'], size: 'About 10cm wide', from: '£120', note: 'Stippled petals, finished with a line of water.' },
  { id: 'compass', title: 'Eight-point star', artist: 'mae', styles: ['Geometric', 'Dotwork'], size: 'About 8cm across', from: '£100', note: 'Ornamental compass with a ring of dots.' },
]

/* ------------------------------------------------------------------ */
/* Geometry helpers                                                     */
/* ------------------------------------------------------------------ */

const f = (n: number): string => (Math.round(n * 10) / 10).toString()

/** A lens-shaped leaf from base (bx,by) to tip (tx,ty), width as a fraction of length. */
function leaf(bx: number, by: number, tx: number, ty: number, w: number): string {
  const dx = tx - bx
  const dy = ty - by
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  const mx = bx + dx * 0.5
  const my = by + dy * 0.5
  const k = len * w
  return `M${f(bx)} ${f(by)}Q${f(mx + nx * k)} ${f(my + ny * k)} ${f(tx)} ${f(ty)}Q${f(mx - nx * k)} ${f(my - ny * k)} ${f(bx)} ${f(by)}Z`
}

function frond(cx: number, base: number, top: number, span: number, pairs: number, w: number): { stem: string; leaves: string } {
  const pts: string[] = []
  let stem = ''
  const steps = 30
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const x = cx + 10 * Math.sin(t * 2.4)
    const y = base - (base - top) * t
    stem += `${i === 0 ? 'M' : 'L'}${f(x)} ${f(y)}`
  }
  for (let k = 0; k < pairs; k++) {
    const t = 0.1 + (0.86 * k) / pairs
    const x = cx + 10 * Math.sin(t * 2.4)
    const y = base - (base - top) * t
    const L = span * Math.pow(1 - t, 0.7) * (0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, t * 1.6)))
    const a = (38 + t * 18) * (Math.PI / 180)
    pts.push(leaf(x, y, x - L * Math.cos(a), y - L * Math.sin(a), w))
    pts.push(leaf(x, y, x + L * Math.cos(a), y - L * Math.sin(a), w))
  }
  pts.push(leaf(cx + 10 * Math.sin(2.4 * 0.97), base - (base - top) * 0.97, cx + 10 * Math.sin(2.4), top - 8, 0.3))
  return { stem, leaves: pts.join('') }
}

const fernA = frond(100, 228, 26, 78, 13, 0.2)
/** The hero frond: same drawing, wider canvas. */
export const heroFern = frond(150, 380, 28, 128, 15, 0.19)
const fernB = frond(100, 228, 26, 84, 12, 0.26)

function ring(cx: number, cy: number, r: number, n: number, dot: number, phase: number): string {
  let d = ''
  for (let i = 0; i < n; i++) {
    const a = phase + (i / n) * Math.PI * 2
    const x = cx + r * Math.cos(a)
    const y = cy + r * Math.sin(a)
    d += `M${f(x - dot)} ${f(y)}a${dot} ${dot} 0 1 0 ${f(dot * 2)} 0a${dot} ${dot} 0 1 0 ${f(-dot * 2)} 0`
  }
  return d
}

function petals(cx: number, cy: number, r1: number, r2: number, n: number, w: number, phase: number): string {
  let d = ''
  for (let i = 0; i < n; i++) {
    const a = phase + (i / n) * Math.PI * 2
    d += leaf(cx + r1 * Math.cos(a), cy + r1 * Math.sin(a), cx + r2 * Math.cos(a), cy + r2 * Math.sin(a), w)
  }
  return d
}

function star(cx: number, cy: number, points: number, rOut: number, rIn: number, phase: number): string {
  let d = ''
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? rOut : rIn
    const a = phase + (i / (points * 2)) * Math.PI * 2
    d += `${i === 0 ? 'M' : 'L'}${f(cx + r * Math.cos(a))} ${f(cy + r * Math.sin(a))}`
  }
  return d + 'Z'
}

function poly(cx: number, cy: number, n: number, r: number, phase: number): string {
  return star(cx, cy, n / 2, r, r, phase)
}

function circle(cx: number, cy: number, r: number): string {
  return `M${f(cx - r)} ${f(cy)}a${r} ${r} 0 1 0 ${f(r * 2)} 0a${r} ${r} 0 1 0 ${f(-r * 2)} 0`
}

/** Deterministic stipple: dots scattered inside a lens between two points. */
function stipple(bx: number, by: number, tx: number, ty: number, w: number, count: number, seed: number): string {
  let d = ''
  const dx = tx - bx
  const dy = ty - by
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  for (let i = 0; i < count; i++) {
    const a = Math.sin((i + seed) * 12.9898) * 43758.5453
    const b = Math.sin((i + seed) * 78.233) * 12345.678
    const t = 0.12 + 0.76 * (a - Math.floor(a))
    const s = (b - Math.floor(b) - 0.5) * 2 * Math.sin(Math.PI * t) * len * w * 0.55
    const x = bx + dx * t + nx * s
    const y = by + dy * t + ny * s
    d += `M${f(x - 0.9)} ${f(y)}a0.9 0.9 0 1 0 1.8 0a0.9 0.9 0 1 0 -1.8 0`
  }
  return d
}

/* ------------------------------------------------------------------ */
/* Pieces                                                               */
/* ------------------------------------------------------------------ */

const moth = {
  wings:
    'M100 104 C 80 72, 44 52, 26 62 C 16 80, 34 112, 62 122 C 76 126, 92 122, 100 116 Z ' +
    'M100 104 C 120 72, 156 52, 174 62 C 184 80, 166 112, 138 122 C 124 126, 108 122, 100 116 Z ' +
    'M100 118 C 86 128, 60 140, 56 166 C 66 178, 88 162, 98 138 Z ' +
    'M100 118 C 114 128, 140 140, 144 166 C 134 178, 112 162, 102 138 Z',
  veins:
    'M98 108 C 80 96, 60 84, 36 70 M98 112 C 78 108, 58 108, 40 102 M98 128 C 84 140, 72 152, 62 162 ' +
    'M102 108 C 120 96, 140 84, 164 70 M102 112 C 122 108, 142 108, 160 102 M102 128 C 116 140, 128 152, 138 162',
  body: 'M100 96 C 106 104, 106 150, 100 160 C 94 150, 94 104, 100 96 Z',
  antennae: 'M98 98 C 92 84, 84 76, 76 74 M102 98 C 108 84, 116 76, 124 74',
  spots: circle(62, 92, 7) + circle(138, 92, 7),
  moon: 'M100 14 A 20 20 0 1 0 100 54 A 15 15 0 1 1 100 14 Z',
}

const wild = {
  stems: 'M100 228 C 98 180, 80 140, 64 96 M100 228 C 102 170, 104 120, 104 64 M100 228 C 104 186, 124 150, 144 110',
  leaves:
    leaf(84, 168, 58, 150, 0.32) + leaf(102, 160, 128, 140, 0.3) + leaf(114, 186, 140, 176, 0.3) + leaf(92, 196, 70, 190, 0.3),
  flowerA: petals(64, 88, 4, 22, 5, 0.42, -Math.PI / 2),
  flowerB: petals(104, 54, 4, 24, 6, 0.36, -Math.PI / 2),
  flowerC: petals(144, 102, 4, 18, 5, 0.42, -Math.PI / 3),
  centres: circle(64, 88, 4) + circle(104, 54, 4.5) + circle(144, 102, 3.5),
}

function pineBranch(t: number): { x: number; y: number; dx: number; dy: number } {
  const x = 48 + 104 * t + 14 * Math.sin(t * Math.PI)
  const y = 222 - 196 * t
  const dx = 104 + 14 * Math.PI * Math.cos(t * Math.PI)
  const dy = -196
  const len = Math.hypot(dx, dy)
  return { x, y, dx: dx / len, dy: dy / len }
}

function pineDrawing(): { branch: string; needles: string; cone: string } {
  let branch = ''
  for (let i = 0; i <= 24; i++) {
    const p = pineBranch(i / 24)
    branch += `${i === 0 ? 'M' : 'L'}${f(p.x)} ${f(p.y)}`
  }
  let needles = ''
  for (let k = 0; k < 13; k++) {
    const t = 0.1 + k * 0.069
    const p = pineBranch(t)
    const L = 34 - t * 18
    for (let side = -1; side <= 1; side += 2) {
      for (let j = 0; j < 3; j++) {
        const ang = side * (0.5 + j * 0.28)
        const c = Math.cos(ang)
        const sn = Math.sin(ang)
        const vx = p.dx * c - p.dy * sn
        const vy = p.dx * sn + p.dy * c
        const l = L * (1 - j * 0.12)
        needles += `M${f(p.x)} ${f(p.y)}l${f(vx * l)} ${f(vy * l)}`
      }
    }
  }
  const tip = pineBranch(1)
  needles += `M${f(tip.x)} ${f(tip.y)}l${f(tip.dx * 10)} ${f(tip.dy * 10)}`
  const c0 = pineBranch(0.32)
  const cx = c0.x + 26
  const cy = c0.y + 18
  let cone = `M${f(c0.x)} ${f(c0.y)}Q${f(c0.x + 16)} ${f(c0.y + 2)} ${f(cx)} ${f(cy - 16)}`
  cone += `M${f(cx)} ${f(cy - 18)}C${f(cx - 13)} ${f(cy - 6)} ${f(cx - 12)} ${f(cy + 24)} ${f(cx)} ${f(cy + 34)}C${f(cx + 12)} ${f(cy + 24)} ${f(cx + 13)} ${f(cy - 6)} ${f(cx)} ${f(cy - 18)}Z`
  for (let i = 0; i < 5; i++) {
    const yy = cy - 8 + i * 8
    const w = 10 - Math.abs(i - 1.5) * 1.6
    cone += `M${f(cx - w)} ${f(yy)}Q${f(cx)} ${f(yy + 6)} ${f(cx + w)} ${f(yy)}`
  }
  return { branch, needles, cone }
}
const pine = pineDrawing()

function moonPhases(): { outline: string; dark: string; dots: string } {
  const ys = [30, 74, 120, 166, 210]
  const r = 17
  let outline = ''
  let dark = ''
  ys.forEach((y, i) => {
    outline += circle(100, y, r)
    const top = `${f(100)} ${f(y - r)}`
    const bot = `${f(100)} ${f(y + r)}`
    if (i === 0) dark += circle(100, y, r)
    if (i === 1) dark += `M${top}A${r} ${r} 0 0 0 ${bot}A${f(r * 0.55)} ${r} 0 0 0 ${top}Z`
    if (i === 2) dark += `M${top}A${r} ${r} 0 0 0 ${bot}Z`
    if (i === 3) dark += `M${top}A${r} ${r} 0 0 0 ${bot}A${f(r * 0.55)} ${r} 0 0 1 ${top}Z`
  })
  const dots = stipple(100, 195, 100, 225, 0.62, 34, 3) + stipple(108, 106, 108, 134, 0.3, 12, 9)
  return { outline, dark, dots }
}
const phases = moonPhases()

const peaks = {
  frame: circle(100, 120, 82),
  sun: circle(100, 96, 22),
  rays: (() => {
    let d = ''
    for (let i = 0; i < 9; i++) {
      const a = Math.PI + (i / 8) * Math.PI
      d += `M${f(100 + 30 * Math.cos(a))} ${f(96 + 30 * Math.sin(a))}L${f(100 + 42 * Math.cos(a))} ${f(96 + 42 * Math.sin(a))}`
    }
    return d
  })(),
  ridges: 'M24 160 L64 104 L90 140 L116 92 L150 146 L170 124 L186 150 M44 172 L76 132 L104 166 L134 128 L172 178',
  hatch: 'M70 112 L64 128 M76 120 L70 140 M120 100 L112 120 M126 110 L118 132 M132 118 L124 140',
  horizon: 'M20 176 L180 176 M30 188 L170 188 M44 200 L156 200',
}

const hex = {
  outer: poly(100, 120, 6, 84, -Math.PI / 2),
  inner: poly(100, 120, 6, 42, 0),
  seed: (() => {
    let d = circle(100, 120, 21)
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      d += circle(100 + 21 * Math.cos(a), 120 + 21 * Math.sin(a), 21)
    }
    return d
  })(),
  frame: circle(100, 120, 84),
}
// Two overlaid triangles, drawn as one path of six vertices joined alternately.
const triPath =
  `M${f(100)} ${f(36)}L${f(100 + 72.7)} ${f(162)}L${f(100 - 72.7)} ${f(162)}Z` +
  `M${f(100)} ${f(204)}L${f(100 + 72.7)} ${f(78)}L${f(100 - 72.7)} ${f(78)}Z`

function bandPath(): { solid: string; line: string } {
  let solid = 'M14 92 H186 V104 H14 Z M14 136 H186 V148 H14 Z'
  for (let i = 0; i < 8; i++) {
    const x = 14 + i * 21.5
    solid += `M${f(x)} 108 L${f(x + 21.5)} 108 L${f(x + 10.75)} 132 Z`
  }
  let line = ''
  for (let i = 0; i < 18; i++) {
    const x = 18 + i * 9.6
    line += circle(x, 82, 1.8) + circle(x, 158, 1.8)
  }
  return { solid, line }
}
const band = bandPath()

const swell = {
  disc: circle(100, 120, 80),
  waves:
    'M28 150 C 44 132, 62 132, 74 146 C 84 158, 100 156, 104 140 C 108 120, 90 108, 78 118 ' +
    'M60 178 C 80 164, 100 166, 112 178 C 124 190, 146 188, 156 172 C 166 154, 154 138, 138 144 C 126 150, 128 166, 140 166 ' +
    'M40 116 C 54 96, 80 88, 102 96 M96 72 C 116 60, 146 68, 160 92 C 170 110, 160 126, 146 122',
  foam: circle(78, 118, 4) + circle(140, 166, 3.5) + circle(146, 122, 3) + circle(120, 108, 2.5) + circle(64, 102, 2.5),
}

const mandala = {
  lines: circle(100, 120, 84) + circle(100, 120, 62) + circle(100, 120, 30),
  outer: petals(100, 120, 62, 86, 16, 0.22, 0),
  inner: petals(100, 120, 30, 60, 12, 0.24, Math.PI / 12),
  core: petals(100, 120, 6, 28, 8, 0.32, 0),
  dots: ring(100, 120, 92, 32, 1.6, 0) + ring(100, 120, 72, 24, 1.3, Math.PI / 24) + ring(100, 120, 40, 16, 1.1, 0) + circle(100, 120, 3),
}

const lotus = {
  outline:
    leaf(100, 176, 100, 70, 0.34) +
    leaf(100, 176, 62, 92, 0.3) +
    leaf(100, 176, 138, 92, 0.3) +
    leaf(100, 176, 36, 132, 0.28) +
    leaf(100, 176, 164, 132, 0.28),
  dots:
    stipple(100, 176, 100, 70, 0.34, 46, 1) +
    stipple(100, 176, 62, 92, 0.3, 34, 4) +
    stipple(100, 176, 138, 92, 0.3, 34, 8) +
    stipple(100, 176, 36, 132, 0.28, 24, 12) +
    stipple(100, 176, 164, 132, 0.28, 24, 16),
  water: 'M40 196 C 70 188, 130 188, 160 196 M56 208 C 80 202, 120 202, 144 208 M72 220 C 88 216, 112 216, 128 220',
}

const compass = {
  big: star(100, 120, 4, 88, 18, -Math.PI / 2),
  small: star(100, 120, 4, 56, 14, -Math.PI / 4),
  rings: circle(100, 120, 44) + circle(100, 120, 66),
  dots: ring(100, 120, 74, 36, 1.5, 0) + ring(100, 120, 52, 4, 3, Math.PI / 4),
  split: 'M100 32 L100 208 M12 120 L188 120',
}

/* ------------------------------------------------------------------ */
/* Renderers                                                            */
/* ------------------------------------------------------------------ */

function Art({ id }: { id: string }) {
  switch (id) {
    case 'fern':
      return (
        <>
          <path className={styles.inkLine} d={fernA.stem} />
          <path className={styles.inkLine} d={fernA.leaves} />
        </>
      )
    case 'moth':
      return (
        <>
          <path className={styles.inkLine} d={moth.wings} />
          <path className={styles.inkFine} d={moth.veins} />
          <path className={styles.inkSolid} d={moth.body} />
          <path className={styles.inkFine} d={moth.antennae} />
          <path className={styles.inkFine} d={moth.spots} />
          <path className={styles.inkLine} d={moth.moon} />
        </>
      )
    case 'wildflowers':
      return (
        <>
          <path className={styles.inkLine} d={wild.stems} />
          <path className={styles.inkFine} d={wild.leaves} />
          <path className={styles.inkLine} d={wild.flowerA + wild.flowerB + wild.flowerC} />
          <path className={styles.inkSolid} d={wild.centres} />
        </>
      )
    case 'pine':
      return (
        <>
          <path className={styles.inkLine} d={pine.branch} />
          <path className={styles.inkFine} d={pine.needles} />
          <path className={styles.inkLine} d={pine.cone} />
        </>
      )
    case 'phases':
      return (
        <>
          <path className={styles.inkHair} d="M100 8 L100 232" />
          <path className={styles.inkLine} d={phases.outline} />
          <path className={styles.inkSolid} d={phases.dark} />
          <path className={styles.inkSolid} d={phases.dots} />
        </>
      )
    case 'peaks':
      return (
        <>
          <path className={styles.inkLine} d={peaks.frame} />
          <path className={styles.inkLine} d={peaks.sun} />
          <path className={styles.inkFine} d={peaks.rays + peaks.hatch + peaks.horizon} />
          <path className={styles.inkLine} d={peaks.ridges} />
        </>
      )
    case 'hex':
      return (
        <>
          <path className={styles.inkLine} d={hex.frame} />
          <path className={styles.inkLine} d={hex.outer} />
          <path className={styles.inkFine} d={triPath} />
          <path className={styles.inkFine} d={hex.seed} />
          <path className={styles.inkLine} d={hex.inner} />
        </>
      )
    case 'band':
      return (
        <>
          <path className={styles.inkSolid} d={band.solid} />
          <path className={styles.inkSolid} d={band.line} />
        </>
      )
    case 'blackfern':
      return (
        <>
          <path className={styles.inkHeavy} d={fernB.stem} />
          <path className={styles.inkSolid} d={fernB.leaves} />
        </>
      )
    case 'swell':
      return (
        <>
          <path className={styles.inkSolid} d={swell.disc} />
          <path className={styles.paperLine} d={swell.waves} />
          <path className={styles.paperSolid} d={swell.foam} />
        </>
      )
    case 'mandala':
      return (
        <>
          <path className={styles.inkFine} d={mandala.lines} />
          <path className={styles.inkLine} d={mandala.outer} />
          <path className={styles.inkLine} d={mandala.inner} />
          <path className={styles.inkSolid} d={mandala.core} />
          <path className={styles.inkSolid} d={mandala.dots} />
        </>
      )
    case 'lotus':
      return (
        <>
          <path className={styles.inkLine} d={lotus.outline} />
          <path className={styles.inkSolid} d={lotus.dots} />
          <path className={styles.inkFine} d={lotus.water} />
        </>
      )
    case 'compass':
      return (
        <>
          <path className={styles.inkFine} d={compass.rings + compass.split} />
          <path className={styles.inkSolid} d={compass.dots} />
          <path className={styles.paperFill} d={compass.big} />
          <path className={styles.inkSolid} d={compass.small} />
        </>
      )
    default:
      return null
  }
}

export function FlashArt({ id, className }: { id: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 240" aria-hidden="true" focusable="false">
      <Art id={id} />
    </svg>
  )
}

/** The hero drawing: a big frond, as two paths so it stays cheap to render. */
export function HeroFern({ className, draw }: { className?: string; draw: boolean }) {
  return (
    <svg className={className} viewBox="0 0 300 400" aria-hidden="true" focusable="false">
      <path className={draw ? `${styles.heroStem} ${styles.drawOn}` : styles.heroStem} d={heroFern.stem} pathLength={1} />
      <path className={draw ? `${styles.heroLeaves} ${styles.drawOnSlow}` : styles.heroLeaves} d={heroFern.leaves} pathLength={1} />
    </svg>
  )
}
