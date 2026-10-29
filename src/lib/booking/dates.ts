/** Date helpers that always think in UK time, whatever the server or browser clock says. */

const londonDay = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/London',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export const todayInLondon = () => londonDay.format(new Date())

export function addDays(iso: string, n: number) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}

const weekdayOf = (iso: string) => new Date(`${iso}T12:00:00Z`).getUTCDay()

/** The next `count` weekdays, starting tomorrow. */
export function nextWeekdays(count: number, from = todayInLondon()) {
  const out: string[] = []
  let d = from
  while (out.length < count) {
    d = addDays(d, 1)
    const w = weekdayOf(d)
    if (w !== 0 && w !== 6) out.push(d)
  }
  return out
}

export function formatDay(iso: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-GB', { ...options, timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`))
}

export const longDay = (iso: string) => formatDay(iso, { weekday: 'long', day: 'numeric', month: 'long' })

export const slotKey = (day: string, time: string) => `${day}_${time}`
