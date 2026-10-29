/* Northgate Motors: copy, prices, and the made-up reg, MOT and diary logic. */

export const BIZ = {
  name: 'Northgate Motors',
  place: 'Preston',
  hours: 'Mon–Fri 8am–5.30pm · Sat 8am–12pm',
  phone: '01772 000 615',
  address: 'Unit 4, Ribble Works, Preston',
}

export const navLinks: { id: string; label: string }[] = [
  { id: 'ng-prices', label: 'Prices' },
  { id: 'ng-mot', label: 'MOT date' },
  { id: 'ng-book', label: 'Book' },
  { id: 'ng-repairs', label: 'Repairs' },
  { id: 'ng-faq', label: 'FAQ' },
]

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DOW_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/* ---------- registration plates ---------- */

export type Vehicle = {
  reg: string
  plate: string
  make: string
  model: string
  body: string
  colour: string
  colourHex: string
  fuel: string
  engine: string
  regYear: number
  regMonth: number // 1–12
  era: 'current' | 'prefix' | 'suffix'
  approx: boolean
}

const PREFIX: Record<string, [number, number]> = {
  A: [1983, 8], B: [1984, 8], C: [1985, 8], D: [1986, 8], E: [1987, 8], F: [1988, 8], G: [1989, 8],
  H: [1990, 8], J: [1991, 8], K: [1992, 8], L: [1993, 8], M: [1994, 8], N: [1995, 8], P: [1996, 8],
  R: [1997, 8], S: [1998, 8], T: [1999, 3], V: [1999, 9], W: [2000, 3], X: [2000, 9], Y: [2001, 3],
}

const SUFFIX: Record<string, [number, number]> = {
  A: [1963, 1], B: [1964, 1], C: [1965, 1], D: [1966, 1], E: [1967, 1], F: [1967, 8], G: [1968, 8],
  H: [1969, 8], J: [1970, 8], K: [1971, 8], L: [1972, 8], M: [1973, 8], N: [1974, 8], P: [1975, 8],
  R: [1976, 8], S: [1977, 8], T: [1978, 8], V: [1979, 8], W: [1980, 8], X: [1981, 8], Y: [1982, 8],
}

const MAKES = ['Arden', 'Halvard', 'Corvo', 'Mersey', 'Ostler', 'Brannock', 'Linden', 'Vale']
const MODELS = ['Sprint', 'Tourer', 'Strand', 'Ridge', 'Harbour', 'Fell', 'Dale', 'Crest', 'Lark', 'Moor']
const BODIES = ['Hatchback', 'Hatchback', 'Estate', 'Saloon', 'SUV']
const COLOURS: { name: string; hex: string }[] = [
  { name: 'Silver', hex: '#c3c9d1' },
  { name: 'Blue', hex: '#2d5fa8' },
  { name: 'Grey', hex: '#6b7280' },
  { name: 'Black', hex: '#22262f' },
  { name: 'White', hex: '#f5f6f8' },
  { name: 'Red', hex: '#c0392b' },
  { name: 'Green', hex: '#2f6b4f' },
  { name: 'Orange', hex: '#d9772b' },
]
const ENGINES = ['1.0', '1.2', '1.4', '1.5', '1.6', '2.0']

export type RegResult = { ok: true; v: Vehicle } | { ok: false; error: string }

/** Validates a UK plate and builds a made-up but stable car from it. Call from handlers only. */
export function lookupReg(raw: string, nowY: number, nowM: number): RegResult {
  const s = raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (s.length === 0) return { ok: false, error: 'Type your registration first.' }
  if (s.length < 2 || s.length > 7) return { ok: false, error: 'UK registrations are up to seven letters and numbers.' }

  let era: Vehicle['era']
  let y = 0
  let m = 0
  let plate = s
  let approx = false

  const cur = /^([A-Z]{2})(\d{2})([A-Z]{3})$/.exec(s)
  const pre = /^([A-Z])(\d{1,3})([A-Z]{3})$/.exec(s)
  const suf = /^([A-Z]{3})(\d{1,3})([A-Z])$/.exec(s)

  if (cur) {
    if (/[IQZ]/.test(cur[1][0])) return { ok: false, error: `Current plates never start with ${cur[1][0]}. Check the first letter.` }
    const n = Number(cur[2])
    if (n === 1 || n === 0 || n === 50) return { ok: false, error: `“${cur[2]}” is not a valid age identifier.` }
    if (n > 50) {
      y = 2000 + (n - 50)
      m = 9
    } else {
      y = 2000 + n
      m = 3
    }
    if (y > nowY || (y === nowY && m > nowM)) {
      return { ok: false, error: `The “${cur[2]}” identifier is not issued until ${MONTHS[m - 1]} ${y}.` }
    }
    era = 'current'
    plate = `${cur[1]}${cur[2]} ${cur[3]}`
  } else if (pre) {
    const d = PREFIX[pre[1]]
    if (!d) return { ok: false, error: `${pre[1]} was never used as a year letter.` }
    y = d[0]
    m = d[1]
    era = 'prefix'
    plate = `${pre[1]}${pre[2]} ${pre[3]}`
  } else if (suf) {
    const d = SUFFIX[suf[3]]
    if (!d) return { ok: false, error: `${suf[3]} was never used as a year letter.` }
    y = d[0]
    m = d[1]
    era = 'suffix'
    approx = true
    plate = `${suf[1]} ${suf[2]}${suf[3]}`
  } else {
    return { ok: false, error: 'That does not look like a UK number plate. Try something like AB21 CDE.' }
  }

  const h = hash(s)
  const modern = era === 'current'
  const fuelRoll = h % 20
  const fuel = !modern
    ? fuelRoll < 14 ? 'Petrol' : 'Diesel'
    : y >= 2014 && fuelRoll >= 18
      ? 'Electric'
      : y >= 2010 && fuelRoll >= 15
        ? 'Hybrid'
        : fuelRoll >= 9
          ? 'Diesel'
          : 'Petrol'
  const colour = COLOURS[(h >>> 4) % COLOURS.length]
  return {
    ok: true,
    v: {
      reg: s,
      plate,
      make: MAKES[(h >>> 7) % MAKES.length],
      model: MODELS[(h >>> 11) % MODELS.length],
      body: BODIES[(h >>> 15) % BODIES.length],
      colour: colour.name,
      colourHex: colour.hex,
      fuel,
      engine: fuel === 'Electric' ? 'Electric motor' : `${ENGINES[(h >>> 19) % ENGINES.length]} litre`,
      regYear: y,
      regMonth: m,
      era,
      approx,
    },
  }
}

/** A sentence about when this car's MOT falls. */
export function motNote(v: Vehicle, nowY: number, nowM: number): string {
  const ageMonths = (nowY - v.regYear) * 12 + (nowM - v.regMonth)
  if (ageMonths >= 40 * 12) {
    return 'Over 40 years old, so it may be exempt as a historic vehicle. Check before you book.'
  }
  if (ageMonths < 36) {
    return `First MOT due by ${MONTHS[v.regMonth - 1]} ${v.regYear + 3}, three years after registration.`
  }
  return `Needs an MOT every year. Use the calculator below for your exact date.`
}

/* ---------- dates ---------- */

export function parseISO(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(d.getTime()) ? null : d
}

export function addMonths(d: Date, n: number): Date {
  const target = new Date(d.getFullYear(), d.getMonth() + n, 1)
  const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  return new Date(target.getFullYear(), target.getMonth(), Math.min(d.getDate(), last))
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
}

export function longDate(d: Date): string {
  return `${DOW_LONG[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function dayDiff(a: Date, b: Date): number {
  const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
  const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())
  return Math.round((ub - ua) / 86400000)
}

/* ---------- services and diary ---------- */

export type ServiceId = 'mot' | 'mot-interim' | 'mot-full'

export const bookServices: { id: ServiceId; label: string; price: number; was: number | null; note: string; dropOff: boolean }[] = [
  { id: 'mot', label: 'MOT', price: 45, was: null, note: 'About an hour. Wait or drop off.', dropOff: false },
  { id: 'mot-interim', label: 'MOT + interim service', price: 154, was: 164, note: 'Drop off by 10am, ready by 4pm.', dropOff: true },
  { id: 'mot-full', label: 'MOT + full service', price: 224, was: 234, note: 'Drop off by 10am, ready by 5pm.', dropOff: true },
]

export const priceBoard: { name: string; price: string; note: string }[] = [
  { name: 'MOT', price: '£45', note: 'Free retest within 10 working days' },
  { name: 'Interim service', price: '£119', note: 'Oil, filter, 40-point check' },
  { name: 'Full service', price: '£189', note: 'Manufacturer schedule' },
  { name: 'Diagnostics', price: '£55', note: 'Warning lights read and explained' },
  { name: 'Brake pads', price: 'From £95', note: 'Per axle, fitted' },
  { name: 'Air con re-gas', price: '£65', note: 'Leak test included' },
]

export type BookDay = { iso: string; dow: string; date: number; mon: string; long: string; sat: boolean }

/** The next twelve open days, from tomorrow. Built in an effect, never in render. */
export function buildDays(nowMs: number): BookDay[] {
  const now = new Date(nowMs)
  const out: BookDay[] = []
  for (let i = 1; out.length < 12 && i < 30; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)
    if (d.getDay() === 0) continue
    out.push({
      iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      dow: i === 1 ? 'Tmrw' : DOW[d.getDay()],
      date: d.getDate(),
      mon: MON[d.getMonth()],
      long: longDate(d),
      sat: d.getDay() === 6,
    })
  }
  return out
}

const WEEK_SLOTS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00']
const SAT_SLOTS = ['08:00', '09:00', '10:00', '11:00']

export function slotsFor(day: BookDay, dropOff: boolean): { time: string; free: boolean }[] {
  const list = day.sat ? SAT_SLOTS : WEEK_SLOTS
  return list
    .filter((t) => !dropOff || t <= '10:00')
    .map((t) => ({ time: t, free: hash(day.iso + t) % 10 >= 4 }))
}

export function icsFile(opts: { iso: string; time: string; summary: string; ref: string }): string {
  const date = opts.iso.replace(/-/g, '')
  const hh = Number(opts.time.slice(0, 2))
  const start = `${date}T${String(hh).padStart(2, '0')}0000`
  const end = `${date}T${String(hh + 1).padStart(2, '0')}0000`
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Northgate Motors concept//EN',
    'BEGIN:VEVENT',
    `UID:${opts.ref}@northgate-motors.example`,
    `DTSTAMP:${date}T000000`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${opts.summary}`,
    `LOCATION:${BIZ.address}`,
    'DESCRIPTION:Concept site by Northbound Web. This booking is made up.',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n')
}

/* ---------- repairs approval demo ---------- */

export const repairs: { id: string; name: string; price: number; level: 'Needed to pass' | 'Recommended' | 'Advisory'; why: string }[] = [
  { id: 'tyre', name: 'Nearside rear tyre', price: 84, level: 'Needed to pass', why: 'Tread below 1.6 mm on the inner edge.' },
  { id: 'pads', name: 'Front brake pads', price: 96, level: 'Recommended', why: 'About 3 mm left. Fine for now, not for long.' },
  { id: 'wipers', name: 'Wiper blades', price: 18, level: 'Advisory', why: 'Smearing at the edges.' },
]

export const faqs: { q: string; a: string }[] = [
  {
    q: 'How early can I have my MOT?',
    a: 'Up to a month, minus a day, before your current certificate runs out, and you keep the same renewal date. The calculator above works it out for you.',
  },
  {
    q: 'What happens if my car fails?',
    a: 'We show you photos of each fault with a fixed price and you approve or decline online. If we fix it here, the partial retest within 10 working days is free.',
  },
  {
    q: 'Can I wait while it is done?',
    a: 'Yes, for an MOT on its own. It takes about an hour and there is a waiting area with wifi. If you book a service with it, please drop the car off.',
  },
  {
    q: 'Do you do electric and hybrid cars?',
    a: 'Yes. MOTs, servicing and brakes on hybrids and electric cars are all done in the same bays by staff trained for high-voltage systems.',
  },
  {
    q: 'How do the reminders work?',
    a: 'One text a month before your MOT is due, and nothing else. Reply STOP at any time.',
  },
]
