/**
 * Pure calendar maths for the availability checker. No Date in render code:
 * the clock is read in an effect (readToday) and everything else works on
 * day numbers counted from 1 Jan 1970.
 */

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function toSerial(y: number, m: number, d: number): number {
  const yy = m <= 2 ? y - 1 : y
  const era = Math.floor(yy / 400)
  const yoe = yy - era * 400
  const mp = (m + 9) % 12
  const doy = Math.floor((153 * mp + 2) / 5) + d - 1
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy
  return era * 146097 + doe - 719468
}

export function fromSerial(serial: number): { y: number; m: number; d: number } {
  const z = serial + 719468
  const era = Math.floor(z / 146097)
  const doe = z - era * 146097
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365)
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100))
  const mp = Math.floor((5 * doy + 2) / 153)
  const d = doy - Math.floor((153 * mp + 2) / 5) + 1
  const m = mp < 10 ? mp + 3 : mp - 9
  return { y: yoe + era * 400 + (m <= 2 ? 1 : 0), m, d }
}

export function dowOf(serial: number): number {
  return (((serial + 4) % 7) + 7) % 7
}

export function daysInMonth(y: number, m: number): number {
  if (m === 2) return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28
  return [4, 6, 9, 11].includes(m) ? 30 : 31
}

/** Only call from an effect or event handler. */
export function readToday(): number {
  const d = new Date()
  return toSerial(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

export function longDate(serial: number): string {
  const { y, m, d } = fromSerial(serial)
  return `${DAY_NAMES[dowOf(serial)]} ${d} ${MONTH_NAMES[m - 1]} ${y}`
}

export function shortDate(serial: number): string {
  const { m, d } = fromSerial(serial)
  return `${DAY_NAMES[dowOf(serial)].slice(0, 3)} ${d} ${MONTH_NAMES[m - 1].slice(0, 3)}`
}

/** "2027-06-12" ↔ serial */
export function isoOf(serial: number): string {
  const { y, m, d } = fromSerial(serial)
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export function serialOfIso(iso: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return null
  const y = Number(match[1])
  const m = Number(match[2])
  const d = Number(match[3])
  if (m < 1 || m > 12 || d < 1 || d > daysInMonth(y, m)) return null
  return toSerial(y, m, d)
}

export type DayStatus = 'past' | 'booked' | 'limited' | 'free'

function hash(n: number): number {
  let x = Math.imul(n ^ 0x5bd1e995, 0x27d4eb2d)
  x ^= x >>> 15
  x = Math.imul(x, 0x2c1b3c6d)
  x ^= x >>> 12
  return (x >>> 0) % 100
}

/**
 * Made-up but stable diary: Saturdays in summer are mostly gone, weekdays
 * are mostly free. The same date always gives the same answer.
 */
export function statusOf(serial: number, today: number): DayStatus {
  if (serial <= today) return 'past'
  const { m, d } = fromSerial(serial)
  if (m === 12 && (d === 25 || d === 26)) return 'booked'
  const dow = dowOf(serial)
  const h = hash(serial)
  const summer = m >= 5 && m <= 9
  if (dow === 6) return h < (summer ? 74 : 38) ? 'booked' : h < (summer ? 84 : 46) ? 'limited' : 'free'
  if (dow === 5 || dow === 0) return h < (summer ? 42 : 20) ? 'booked' : h < (summer ? 58 : 30) ? 'limited' : 'free'
  return h < 8 ? 'booked' : h < 20 ? 'limited' : 'free'
}

export const STATUS_TEXT: Record<DayStatus, { label: string; body: string }> = {
  past: { label: 'Not available', body: 'That date has passed or is too close to plan properly.' },
  booked: { label: 'Booked', body: 'Another couple has this date. Here are the nearest free days.' },
  limited: {
    label: 'Partly free',
    body: 'Something is booked that morning, so the afternoon is free: ideal for an elopement or a half day from 2pm.',
  },
  free: { label: 'Free', body: 'Your date is open. Send an enquiry and it is held for you for seven days while we talk.' },
}

/** Nearest free dates either side of `serial`, closest first. */
export function nearestFree(serial: number, today: number, count: number): number[] {
  const out: number[] = []
  for (let i = 1; i <= 60 && out.length < count; i++) {
    for (const s of [serial - i, serial + i]) {
      if (out.length < count && statusOf(s, today) === 'free') out.push(s)
    }
  }
  return out.sort((a, b) => a - b)
}
