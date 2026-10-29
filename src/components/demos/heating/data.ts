/* Thornley Heating: copy, prices and booking helpers. Made-up business. */

export const BIZ = {
  name: 'Thornley Heating',
  place: 'Wakefield',
  hours: 'Mon–Sat · 8am–6pm',
  phone: '01924 000 482',
}

export const navLinks: { id: string; label: string }[] = [
  { id: 'th-emergency', label: 'Emergency?' },
  { id: 'th-prices', label: 'Prices' },
  { id: 'th-book', label: 'Book' },
  { id: 'th-how', label: 'How it works' },
  { id: 'th-faq', label: 'FAQ' },
]

export type ProblemId = 'no-heat' | 'no-hot-water' | 'leak' | 'noise' | 'service' | 'new-boiler'

export type Problem = { id: ProblemId; label: string; hint: string; price: string }

export const problems: Problem[] = [
  { id: 'no-heat', label: 'No heating', hint: 'Radiators cold, boiler on or off', price: 'Repair from £85' },
  { id: 'no-hot-water', label: 'No hot water', hint: 'Taps run cold, heating may work', price: 'Repair from £85' },
  { id: 'leak', label: 'Leak or drip', hint: 'Water under the boiler or a pipe', price: 'Repair from £85' },
  { id: 'noise', label: 'Odd noises', hint: 'Banging, gurgling, kettling', price: 'Repair from £85' },
  { id: 'service', label: 'Annual service', hint: 'Includes the safety certificate', price: '£70 fixed' },
  { id: 'new-boiler', label: 'New boiler survey', hint: 'Free, written quote in two days', price: 'Free' },
]

export type Slot = { id: string; label: string; start: number }

export const slots: Slot[] = [
  { id: 's8', label: '8am – 10am', start: 8 },
  { id: 's10', label: '10am – 12pm', start: 10 },
  { id: 's12', label: '12pm – 2pm', start: 12 },
  { id: 's14', label: '2pm – 4pm', start: 14 },
  { id: 's16', label: '4pm – 6pm', start: 16 },
]

export type Day = {
  iso: string
  dow: string
  date: number
  month: string
  long: string
  isToday: boolean
}

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DOW_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MON_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export type Calendar = { days: Day[]; hour: number }

/** The next ten working days (Mon–Sat). Called from an effect, never in render. */
export function buildCalendar(nowMs: number): Calendar {
  const now = new Date(nowMs)
  const hour = now.getHours()
  const days: Day[] = []
  for (let i = 0; days.length < 10 && i < 20; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)
    if (d.getDay() === 0) continue
    // Same-day visits only when booked before 11am.
    if (i === 0 && hour >= 11) continue
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    days.push({
      iso,
      dow: i === 0 ? 'Today' : DOW[d.getDay()],
      date: d.getDate(),
      month: MON[d.getMonth()],
      long: `${i === 0 ? 'Today, ' : ''}${DOW_LONG[d.getDay()]} ${d.getDate()} ${MON_LONG[d.getMonth()]}`,
      isToday: i === 0,
    })
  }
  return { days, hour }
}

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Made-up but stable availability: the same day always shows the same gaps. */
export function slotState(day: Day, slot: Slot): 'free' | 'full' | 'gone' {
  if (day.isToday && slot.start < 12) return 'gone'
  return hash(day.iso + slot.id) % 10 < 3 ? 'full' : 'free'
}

export const services: { name: string; price: string; note: string; tag?: string }[] = [
  { name: 'Boiler repair', price: 'From £85', note: 'Fixed price agreed before we start. Most parts on the van.', tag: 'Most booked' },
  { name: 'Annual service', price: '£70', note: 'Full combustion check and your gas safety certificate.' },
  { name: 'New boiler', price: 'Free survey', note: 'We measure up, you get a written quote within two days.' },
  { name: 'Landlord gas safety record', price: '£60', note: 'One appliance. £15 for each extra appliance.' },
  { name: 'Radiators and valves', price: 'From £60', note: 'Bleeding, balancing, new valves or a new radiator.' },
  { name: 'Power flush', price: '£320', note: 'For sludgy systems and cold spots. Up to ten radiators.' },
]

export const howSteps: { title: string; body: string }[] = [
  { title: 'Book online', body: 'Pick the problem, a day and a two-hour window. Before 11am gets you a visit today.' },
  { title: 'Price first', body: 'The engineer looks, explains, and gives you a fixed figure before any work starts.' },
  { title: 'Text on the way', body: 'A message with the engineer’s name when they set off, so you are not waiting in.' },
  { title: 'Warm and tidy', body: 'Fixed, tested and cleaned up. Paperwork emailed the same evening.' },
]

export const areas = ['Wakefield', 'Ossett', 'Horbury', 'Normanton', 'Outwood', 'Crigglestone', 'Sandal', 'Stanley']

export const faqs: { q: string; a: string }[] = [
  {
    q: 'How quickly can you come out?',
    a: 'Book before 11am, Monday to Saturday, and we aim to offer an afternoon window the same day. If today is full, the booking form only shows what is genuinely free.',
  },
  {
    q: 'What does “price first” mean?',
    a: 'The engineer diagnoses the fault and tells you the fixed price for the repair before starting. If you would rather not go ahead, you only pay the £45 call-out.',
  },
  {
    q: 'Do you work on all boiler makes?',
    a: 'We work on gas combi, system and regular boilers from all the common manufacturers, plus hot water cylinders and controls. We do not work on oil or LPG.',
  },
  {
    q: 'I smell gas. Should I book?',
    a: 'No. Leave the property and call the National Gas Emergency Service on 0800 111 999 straight away. It is free and open 24 hours. Book us once they have made it safe.',
  },
  {
    q: 'How do I pay?',
    a: 'By card or bank transfer once the work is done and you are happy. We send a receipt and any certificate by email.',
  },
]
