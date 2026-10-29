/**
 * Pure date maths for Wild Stem. The clock is only ever read inside effects
 * (readClock); render code works on plain day numbers.
 */

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
export const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Same-day cut-off, seconds after midnight. */
export const CUTOFF = 13 * 3600

export type Clock = { serial: number; secs: number }

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

/** Deliveries run Monday to Saturday. */
export function isDeliveryDay(serial: number): boolean {
  return dowOf(serial) !== 0
}

/** Only call from an effect or event handler. */
export function readClock(): Clock {
  const d = new Date()
  return {
    serial: toSerial(d.getFullYear(), d.getMonth() + 1, d.getDate()),
    secs: d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds(),
  }
}

export type DeliveryDate = { serial: number; top: string; day: string; month: string; long: string }

export function longLabel(serial: number): string {
  const { m, d } = fromSerial(serial)
  return `${DAY_NAMES[dowOf(serial)]} ${d} ${MONTH_NAMES[m - 1]}`
}

/** The next `count` delivery dates; today only before the 1pm cut-off. */
export function deliveryDates(c: Clock, count: number): DeliveryDate[] {
  const out: DeliveryDate[] = []
  for (let i = 0; out.length < count && i < 30; i++) {
    const s = c.serial + i
    if (!isDeliveryDay(s)) continue
    if (i === 0 && c.secs >= CUTOFF) continue
    const { m, d } = fromSerial(s)
    out.push({
      serial: s,
      top: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : DAY_SHORT[dowOf(s)],
      day: String(d),
      month: MONTH_SHORT[m - 1],
      long: longLabel(s),
    })
  }
  return out
}

export type Cutoff = { sameDay: true; left: number } | { sameDay: false; next: string }

export function cutoffInfo(c: Clock): Cutoff {
  if (isDeliveryDay(c.serial) && c.secs < CUTOFF) return { sameDay: true, left: CUTOFF - c.secs }
  for (let i = 1; i < 8; i++) {
    if (isDeliveryDay(c.serial + i)) {
      return { sameDay: false, next: i === 1 ? 'tomorrow' : DAY_NAMES[dowOf(c.serial + i)] }
    }
  }
  return { sameDay: false, next: 'Monday' }
}

/** 8040 → "02:14:00" */
export function hms(total: number): string {
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

export function pounds(pence: number): string {
  return pence % 100 === 0 ? `£${pence / 100}` : `£${(pence / 100).toFixed(2)}`
}
