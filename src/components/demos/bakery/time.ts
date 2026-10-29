/**
 * Pure calendar maths for the bakery. Render code never touches Date: the
 * clock is read once in an effect (readClock) and everything else works on
 * plain day numbers, so server and client render the same markup.
 */

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Open Tuesday to Sunday, closed Monday. 0 = Sunday. */
export const OPEN_DAYS = [0, 2, 3, 4, 5, 6]
export const OPEN_MIN = 7 * 60
export const CLOSE_MIN = 15 * 60
/** First and last collection slots. */
const FIRST_SLOT = 7 * 60 + 30
const LAST_SLOT = 14 * 60 + 45

export type Clock = { serial: number; mins: number }

/** Days since 1 Jan 1970 for a civil date (month 1–12). */
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
  const y = yoe + era * 400 + (m <= 2 ? 1 : 0)
  return { y, m, d }
}

export function dowOf(serial: number): number {
  return (((serial + 4) % 7) + 7) % 7
}

export function isOpenDay(serial: number): boolean {
  return OPEN_DAYS.includes(dowOf(serial))
}

/** Only ever call from an effect or an event handler. */
export function readClock(): Clock {
  const d = new Date()
  return {
    serial: toSerial(d.getFullYear(), d.getMonth() + 1, d.getDate()),
    mins: d.getHours() * 60 + d.getMinutes(),
  }
}

/** 450 → "7.30am", 900 → "3pm". */
export function fmtTime(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  const h12 = h % 12 === 0 ? 12 : h % 12
  const suffix = h < 12 ? 'am' : 'pm'
  return m === 0 ? `${h12}${suffix}` : `${h12}.${String(m).padStart(2, '0')}${suffix}`
}

function fmtLeft(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`
}

export function dateLabel(serial: number): string {
  const { m, d } = fromSerial(serial)
  return `${d} ${MONTH_SHORT[m - 1]}`
}

export type Status = { open: boolean; line: string; detail: string }

export function shopStatus(c: Clock): Status {
  if (isOpenDay(c.serial) && c.mins >= OPEN_MIN && c.mins < CLOSE_MIN) {
    return { open: true, line: 'Open now', detail: `until 3pm · ${fmtLeft(CLOSE_MIN - c.mins)} left` }
  }
  if (isOpenDay(c.serial) && c.mins < OPEN_MIN) {
    return { open: false, line: 'Closed now', detail: 'opens today at 7am' }
  }
  for (let i = 1; i <= 7; i++) {
    if (isOpenDay(c.serial + i)) {
      const when = i === 1 ? 'tomorrow' : DAY_NAMES[dowOf(c.serial + i)]
      return { open: false, line: 'Closed now', detail: `opens ${when} at 7am` }
    }
  }
  return { open: false, line: 'Closed now', detail: 'opens Tuesday at 7am' }
}

export type DayOption = { serial: number; label: string; sub: string; slots: number[] }

/**
 * Collection days with at least one slot, earliest first. Every slot gives
 * 30 minutes' notice, or `noticeHours` if the basket needs more.
 */
export function collectionDays(c: Clock, noticeHours: number): DayOption[] {
  const earliest = c.serial * 1440 + c.mins + Math.max(30, noticeHours * 60)
  const out: DayOption[] = []
  for (let i = 0; i < 14 && out.length < 6; i++) {
    const s = c.serial + i
    if (!isOpenDay(s)) continue
    const slots: number[] = []
    for (let t = FIRST_SLOT; t <= LAST_SLOT; t += 15) {
      if (s * 1440 + t >= earliest) slots.push(t)
    }
    if (slots.length === 0) continue
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : DAY_SHORT[dowOf(s)]
    out.push({ serial: s, label, sub: dateLabel(s), slots })
  }
  return out
}

export function money(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`
}
