/**
 * Fade & Fellow: barbers, prices and the queue simulation. All made up.
 */

export type Barber = {
  id: string
  name: string
  focus: string
  body: string
  /** Day of the week they are off (0 Sunday … 6 Saturday). */
  off: number
  /** Average seconds per cut, for the simulated queue. */
  avg: number
  tool: 'clippers' | 'scissors' | 'razor' | 'comb'
}

export const barbers: Barber[] = [
  { id: 'dev', name: 'Dev', focus: 'Skin fades and tapers', body: 'Clean blends, sharp edges, and he will tell you if your parting wants moving.', off: 1, avg: 35 * 60, tool: 'clippers' },
  { id: 'marcus', name: 'Marcus', focus: 'Scissor cuts and longer hair', body: 'Textured crops, curtains, anything that needs more than a guard.', off: 2, avg: 40 * 60, tool: 'scissors' },
  { id: 'tom', name: 'Tom', focus: 'Beards and hot towel shaves', body: 'Shape-ups, full shaves with a straight razor, and the hot towel at the end.', off: 3, avg: 30 * 60, tool: 'razor' },
  { id: 'kofi', name: 'Kofi', focus: 'Designs, curls and kids', body: 'Patterns, part lines and twists. Patient with first haircuts.', off: 4, avg: 45 * 60, tool: 'comb' },
]

export type Service = { id: string; name: string; price: number; minutes: number; note: string }

export const services: Service[] = [
  { id: 'fade', name: 'Skin fade', price: 22, minutes: 40, note: 'Down to the skin, blended up' },
  { id: 'cut', name: 'Scissor cut', price: 20, minutes: 35, note: 'Wash, cut, finish' },
  { id: 'cutbeard', name: 'Cut and beard', price: 28, minutes: 50, note: 'Hot towel finish' },
  { id: 'beard', name: 'Beard trim', price: 12, minutes: 20, note: 'Shape, line-up and oil' },
  { id: 'shave', name: 'Hot towel shave', price: 18, minutes: 30, note: 'Straight razor, two towels' },
  { id: 'kids', name: 'Kids’ cut', price: 14, minutes: 25, note: 'Under 12s' },
  { id: 'over65', name: 'Over 65s', price: 14, minutes: 30, note: 'Any cut, weekdays' },
  { id: 'design', name: 'Hair design', price: 5, minutes: 10, note: 'Added to any cut' },
]

export const hours: { day: string; dow: number; time: string }[] = [
  { day: 'Monday', dow: 1, time: '9am – 7pm' },
  { day: 'Tuesday', dow: 2, time: '9am – 7pm' },
  { day: 'Wednesday', dow: 3, time: '9am – 7pm' },
  { day: 'Thursday', dow: 4, time: '9am – 7pm' },
  { day: 'Friday', dow: 5, time: '9am – 7pm' },
  { day: 'Saturday', dow: 6, time: '9am – 7pm' },
  { day: 'Sunday', dow: 0, time: 'Closed' },
]

/** Booking grid: a chair every 40 minutes from 9:00 to 18:20. */
export const slotMinutes: number[] = Array.from({ length: 15 }, (_, i) => 9 * 60 + i * 40)

export function clock(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  const h12 = h > 12 ? h - 12 : h
  return `${h12}:${m.toString().padStart(2, '0')}${h >= 12 ? 'pm' : 'am'}`
}

export function noise(n: number): number {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

export function slotBusy(dayKey: number, barberIndex: number, slotIndex: number): boolean {
  return noise(dayKey * 0.013 + barberIndex * 7.31 + slotIndex * 1.77) < 0.45
}

/* ------------------------------------------------------------------ */
/* The simulated queue. One tick is one real second.                    */
/* ------------------------------------------------------------------ */

export type Row = { id: string; remaining: number; queue: number; onBreak: number }
export type Mine = { barberId: string; name: string; serviceId: string; pos: number; up: boolean; ref: string }
export type Live = { rows: Row[]; mine: Mine | null; tick: number }

export const initialLive: Live = {
  tick: 0,
  mine: null,
  rows: [
    { id: 'dev', remaining: 47, queue: 1, onBreak: 0 },
    { id: 'marcus', remaining: 12 * 60 + 30, queue: 0, onBreak: 0 },
    { id: 'tom', remaining: 0, queue: 0, onBreak: 3 * 60 + 20 },
    { id: 'kofi', remaining: 6 * 60 + 10, queue: 1, onBreak: 0 },
  ],
}

export function barberById(id: string): Barber {
  return barbers.find((b) => b.id === id) ?? barbers[0]
}

function cutLength(b: Barber, salt: number): number {
  return Math.round(b.avg * (0.8 + 0.4 * noise(salt)))
}

/** Seconds until a new arrival at this chair would be seen. */
export function waitFor(row: Row): number {
  return row.onBreak + row.remaining + row.queue * barberById(row.id).avg
}

export function mineWait(live: Live): number {
  const m = live.mine
  if (!m || m.up) return 0
  const row = live.rows.find((r) => r.id === m.barberId)
  if (!row) return 0
  return row.onBreak + row.remaining + m.pos * barberById(row.id).avg
}

export function step(live: Live): Live {
  const tick = live.tick + 1
  let mine = live.mine
  const rows = live.rows.map((r, i) => {
    let { remaining, queue, onBreak } = r
    if (onBreak > 0) onBreak -= 1
    else if (remaining > 0) remaining -= 1
    if (onBreak === 0 && remaining === 0 && queue > 0) {
      queue -= 1
      remaining = cutLength(barberById(r.id), tick + i * 31)
      if (mine && mine.barberId === r.id && !mine.up) {
        mine = mine.pos === 0 ? { ...mine, up: true } : { ...mine, pos: mine.pos - 1 }
      }
    }
    return { id: r.id, remaining, queue, onBreak }
  })
  // A walk-in every 41 seconds, round the chairs, while the shop is quiet.
  const waiting = rows.reduce((n, r) => n + r.queue, 0)
  if (tick % 41 === 0 && waiting < 4) {
    const i = Math.floor(tick / 41) % rows.length
    rows[i] = { ...rows[i], queue: rows[i].queue + 1 }
  }
  return { rows, mine, tick }
}

export function fmt(sec: number): string {
  const s = Math.max(0, Math.round(sec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${r.toString().padStart(2, '0')}`
  return `${m}:${r.toString().padStart(2, '0')}`
}
