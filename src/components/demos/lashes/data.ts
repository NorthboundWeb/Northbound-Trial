/**
 * Kestrel Lash Studio: copy, prices and the pure helpers the booking flow
 * uses. Everything here is made up for the concept site.
 */

export type Category = 'sets' | 'infills' | 'brows' | 'extras'

export type Treatment = {
  id: string
  category: Category
  name: string
  minutes: number
  price: number
  note: string
  /** Whether it can be booked on its own in the booking flow. */
  bookable: boolean
}

export const categories: { id: Category; label: string; blurb: string }[] = [
  { id: 'sets', label: 'Full sets', blurb: 'A new set from scratch. Allow the whole time: you can nap, most people do.' },
  { id: 'infills', label: 'Infills', blurb: 'For sets done here, within three weeks. After that it is usually a full set.' },
  { id: 'brows', label: 'Brows and lifts', blurb: 'For when you want to wake up done without extensions.' },
  { id: 'extras', label: 'Extras', blurb: 'Small things that can be added to any visit.' },
]

export const treatments: Treatment[] = [
  { id: 'classic', category: 'sets', name: 'Classic full set', minutes: 90, price: 45, note: 'One extension to each natural lash. Mascara-on look.', bookable: true },
  { id: 'hybrid', category: 'sets', name: 'Hybrid full set', minutes: 105, price: 52, note: 'Classic and volume mixed. Textured, a bit fuller.', bookable: true },
  { id: 'volume', category: 'sets', name: 'Volume full set', minutes: 120, price: 60, note: 'Light fans of fine lashes. Soft, dark and full.', bookable: true },
  { id: 'classic-infill', category: 'infills', name: 'Classic infill', minutes: 50, price: 30, note: 'Within three weeks of your last visit.', bookable: true },
  { id: 'hybrid-infill', category: 'infills', name: 'Hybrid infill', minutes: 60, price: 35, note: 'Within three weeks of your last visit.', bookable: true },
  { id: 'volume-infill', category: 'infills', name: 'Volume infill', minutes: 70, price: 40, note: 'Within three weeks of your last visit.', bookable: true },
  { id: 'lamination', category: 'brows', name: 'Brow lamination', minutes: 45, price: 35, note: 'Brushed-up, set brows. Includes tint.', bookable: true },
  { id: 'lift', category: 'brows', name: 'Lash lift and tint', minutes: 60, price: 38, note: 'Your own lashes, curled and darkened for six weeks or so.', bookable: true },
  { id: 'brow-tint', category: 'brows', name: 'Brow tint and shape', minutes: 30, price: 18, note: 'Tint, wax and tidy.', bookable: true },
  { id: 'duo', category: 'brows', name: 'Lamination and lash lift', minutes: 95, price: 65, note: 'Both in one visit.', bookable: true },
  { id: 'removal', category: 'extras', name: 'Lash removal', minutes: 20, price: 10, note: 'Free if your next set is booked straight after.', bookable: false },
  { id: 'patch', category: 'extras', name: 'Patch test', minutes: 10, price: 0, note: 'Needed 48 hours before a first visit. Booked for you.', bookable: false },
  { id: 'travel', category: 'extras', name: 'Travel over 10 miles', minutes: 0, price: 5, note: 'Within 10 miles of Winchester there is no travel charge.', bookable: false },
]

export const DEPOSIT = 15

export const slotTimes: string[] = ['9:00am', '10:30am', '12:00pm', '1:30pm', '3:00pm', '4:30pm', '6:00pm']

export const areas: string[] = [
  'Winchester',
  'Eastleigh',
  'Chandler’s Ford',
  'Romsey',
  'Alresford',
  'Otterbourne',
  'Twyford',
  'Kings Worthy',
  'Stockbridge',
  'North Baddesley',
]

export const faqs: { q: string; a: string }[] = [
  {
    q: 'What do I need at home?',
    a: 'A plug socket and somewhere I can set up a bed about two metres long. I bring the bed, the lamp, a pillow and everything else.',
  },
  {
    q: 'Why is there a deposit?',
    a: 'Because I travel to you, a no-show costs me the slot and the drive. The £15 is taken off your total, so you pay the rest on the day.',
  },
  {
    q: 'What if I need to move my appointment?',
    a: 'Give 48 hours’ notice and the deposit moves with you. Inside 48 hours the deposit is kept, unless it is something you could not help.',
  },
  {
    q: 'Do I really need a patch test?',
    a: 'If you have not had lashes or brows done with me in the last six months, yes. It takes ten minutes, it is free, and the flow below books it for you.',
  },
  {
    q: 'How long do extensions last?',
    a: 'Your natural lashes shed every few weeks, taking extensions with them. Most people book an infill every two to three weeks.',
  },
  {
    q: 'Can I wear mascara?',
    a: 'Not on extensions. Oil-free make-up around the eyes is fine. With a lash lift, mascara is fine after 24 hours.',
  },
]

/** A small deterministic hash so the same day always shows the same gaps. */
export function noise(n: number): number {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

/** Which slots are already taken on a day, from its day number. */
export function takenSlots(dayKey: number): boolean[] {
  return slotTimes.map((_, i) => noise(dayKey * 7 + i * 3.1) < 0.42)
}

export function money(n: number): string {
  return n === 0 ? 'Free' : `£${n}`
}

export function duration(min: number): string {
  if (min === 0) return ''
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h} hr` : `${h} hr ${m}`
}

/* ------------------------------------------------------------------ */
/* Lash drawing: points along a closed-eye lid curve, with lashes      */
/* growing out of it. Computed once, at module load, from fixed maths. */
/* ------------------------------------------------------------------ */

type Pt = { x: number; y: number }

function lid(t: number, a: Pt, c: Pt, b: Pt): { p: Pt; n: Pt; tan: Pt } {
  const u = 1 - t
  const p = { x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y }
  const tx = 2 * u * (c.x - a.x) + 2 * t * (b.x - c.x)
  const ty = 2 * u * (c.y - a.y) + 2 * t * (b.y - c.y)
  const len = Math.hypot(tx, ty) || 1
  return { p, tan: { x: tx / len, y: ty / len }, n: { x: -ty / len, y: tx / len } }
}

const r = (v: number): string => v.toFixed(1)

/**
 * Lash strokes for a closed eye drawn between a and b, sagging towards c.
 * fan = how many strands per lash (1 classic, 2-3 hybrid, 4-5 volume).
 */
export function lashStrokes(count: number, a: Pt, c: Pt, b: Pt, scale: number, fan: (i: number) => number): string[] {
  const out: string[] = []
  for (let i = 0; i < count; i++) {
    const t = 0.04 + (0.92 * i) / (count - 1)
    const { p, n, tan } = lid(t, a, c, b)
    const lift = Math.pow(Math.sin(Math.PI * t), 0.75) * (0.7 + 0.55 * t)
    const len = scale * (0.35 + 0.65 * lift)
    const strands = fan(i)
    for (let s = 0; s < strands; s++) {
      const spread = strands === 1 ? 0 : (s / (strands - 1) - 0.5) * 0.5
      const splay = (t - 0.5) * 1.1 + spread
      const ex = p.x + n.x * len + tan.x * len * splay
      const ey = p.y + n.y * len + tan.y * len * splay
      const cx = p.x + n.x * len * 0.7 + tan.x * len * splay * 0.15
      const cy = p.y + n.y * len * 0.7 + tan.y * len * splay * 0.15
      out.push(`M${r(p.x)} ${r(p.y)}Q${r(cx)} ${r(cy)} ${r(ex)} ${r(ey)}`)
    }
  }
  return out
}

export const heroLid = { a: { x: 40, y: 70 }, c: { x: 300, y: 196 }, b: { x: 560, y: 70 } }

export const heroLashes: string[] = lashStrokes(30, heroLid.a, heroLid.c, heroLid.b, 74, () => 1)
export const shotLashes: string[] = lashStrokes(18, heroLid.a, heroLid.c, heroLid.b, 74, () => 1)

const small = { a: { x: 20, y: 30 }, c: { x: 120, y: 92 }, b: { x: 220, y: 30 } }

export const styleLashes: { id: string; name: string; body: string; strokes: string[] }[] = [
  {
    id: 'classic',
    name: 'Classic',
    body: 'One extension on each of your own lashes. Looks like your lashes on a very good day.',
    strokes: lashStrokes(16, small.a, small.c, small.b, 34, () => 1),
  },
  {
    id: 'hybrid',
    name: 'Hybrid',
    body: 'Singles and small fans mixed together. Texture with a bit more darkness at the root.',
    strokes: lashStrokes(16, small.a, small.c, small.b, 34, (i) => (i % 2 === 0 ? 1 : 3)),
  },
  {
    id: 'volume',
    name: 'Volume',
    body: 'Hand-made fans of very fine lashes. Soft and full, and lighter than it looks.',
    strokes: lashStrokes(16, small.a, small.c, small.b, 34, () => 4),
  },
]

export const smallLid = `M${small.a.x} ${small.a.y}Q${small.c.x} ${small.c.y} ${small.b.x} ${small.b.y}`
export const heroLidPath = `M${heroLid.a.x} ${heroLid.a.y}Q${heroLid.c.x} ${heroLid.c.y} ${heroLid.b.x} ${heroLid.b.y}`
