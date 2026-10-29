/** Clearwater — a made-up window cleaner in Swindon. Prices belong to the
 *  pretend business. */

export type HouseId = 'flat' | 'terrace' | 'semi3' | 'semi4' | 'det4' | 'det5'
export type FreqId = 'four' | 'eight' | 'once'
export type AccessId = 'open' | 'locked' | 'front'

export type House = { id: HouseId; label: string; sub: string; price: number; shape: 'flat' | 'terrace' | 'semi' | 'detached' }
export type Freq = { id: FreqId; label: string; sub: string; add: number; weeks: number }
export type Extra = { id: string; label: string; note: string; price: number }

export const HOUSES: House[] = [
  { id: 'flat', label: 'Flat', sub: 'Ground or first floor', price: 10, shape: 'flat' },
  { id: 'terrace', label: 'Terrace', sub: '2–3 bedrooms', price: 12, shape: 'terrace' },
  { id: 'semi3', label: 'Semi', sub: '3 bedrooms', price: 16, shape: 'semi' },
  { id: 'semi4', label: 'Large semi', sub: '4 bedrooms', price: 18, shape: 'semi' },
  { id: 'det4', label: 'Detached', sub: '3–4 bedrooms', price: 20, shape: 'detached' },
  { id: 'det5', label: 'Large detached', sub: '5 bedrooms or more', price: 26, shape: 'detached' },
]

export const FREQS: Freq[] = [
  { id: 'four', label: 'Every 4 weeks', sub: 'Most popular for town houses', add: 0, weeks: 4 },
  { id: 'eight', label: 'Every 8 weeks', sub: '+£4 a clean', add: 4, weeks: 8 },
  { id: 'once', label: 'One-off clean', sub: '+£10, no round', add: 10, weeks: 0 },
]

/** Added to every clean. */
export const EXTRAS: Extra[] = [
  { id: 'conservatory', label: 'Conservatory', note: 'Sides and glass roof', price: 8 },
  { id: 'frames', label: 'Frames and sills', note: 'Wiped down every visit', price: 3 },
  { id: 'porch', label: 'Glass porch', note: 'Inside panes not included', price: 2 },
]

/** One-off jobs done on the first visit. */
export const ONE_OFFS: Extra[] = [
  { id: 'gutters', label: 'Gutter clear-out', note: 'Vacuumed from the ground', price: 45 },
  { id: 'fascia', label: 'Fascias and soffits', note: 'Washed with the pole', price: 30 },
]

export const SKYLIGHT_PRICE = 2

export const DISTRICTS: { code: string; area: string; day: number }[] = [
  { code: 'SN1', area: 'Town centre, Old Town', day: 1 },
  { code: 'SN2', area: 'Rodbourne, Gorse Hill', day: 2 },
  { code: 'SN3', area: 'Covingham, Stratton', day: 3 },
  { code: 'SN4', area: 'Wroughton, Chiseldon', day: 4 },
  { code: 'SN5', area: 'West Swindon, Lydiard', day: 4 },
  { code: 'SN25', area: 'Abbey Meads, Haydon', day: 5 },
  { code: 'SN26', area: 'Blunsdon, Stanton', day: 5 },
]

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const FAQS: { q: string; a: string }[] = [
  {
    q: 'Do I need to be in?',
    a: 'No. As long as we can reach the back, you don’t need to be home. Tell us about a locked gate and we’ll text for a code the day before.',
  },
  {
    q: 'What if it rains?',
    a: 'We use pure water, which dries without spots, so light rain doesn’t spoil the clean. In storms or high wind we move your round by a day and text you.',
  },
  {
    q: 'How do I pay?',
    a: 'We text a card link after each clean. Pay when it suits you within seven days. No direct debit, no cash in envelopes.',
  },
  {
    q: 'Can I skip a round?',
    a: 'Yes, one tap from the link in your reminder text, up to the evening before. You’re not charged for a skipped round.',
  },
  {
    q: 'Do you use ladders?',
    a: 'Rarely. A water-fed pole reaches up to four storeys from the ground, which is safer and means nobody is at your window.',
  },
  {
    q: 'How do I stop?',
    a: 'Reply STOP to any text, or tell us at the door. There’s no contract and nothing to cancel.',
  },
]

export function money(n: number): string {
  return Number.isInteger(n) ? `£${n}` : `£${n.toFixed(2)}`
}

export function districtOf(postcode: string): string {
  if (!validPostcode(postcode)) return ''
  // The outward code is everything except the last three characters.
  const clean = postcode.toUpperCase().replace(/\s+/g, '')
  return clean.slice(0, clean.length - 3)
}

export function validPostcode(postcode: string): boolean {
  return /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(postcode.trim())
}

export function formatPostcode(postcode: string): string {
  const clean = postcode.toUpperCase().replace(/\s+/g, '')
  return `${clean.slice(0, clean.length - 3)} ${clean.slice(-3)}`
}

/** Next date that falls on `weekday`, at least `minDays` after `from`. */
export function nextWeekday(from: Date, weekday: number, minDays: number): Date {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + minDays)
  while (d.getDay() !== weekday) d.setDate(d.getDate() + 1)
  return d
}

export function addDays(d: Date, days: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days)
}

export function shortDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function longDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}
