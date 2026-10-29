/**
 * Harbour Light — made-up wedding photographer in Cornwall. Prices are the
 * pretend business's own, in whole pounds. Nothing is sent anywhere.
 */

export type PackageId = 'elopement' | 'half' | 'full'

export type Package = {
  id: PackageId
  name: string
  price: number
  hours: string
  line: string
}

export const PACKAGES: Package[] = [
  { id: 'elopement', name: 'Elopement', price: 650, hours: 'Up to three hours', line: 'Just the two of you, or a handful of guests.' },
  { id: 'half', name: 'Half day', price: 1150, hours: 'About six hours', line: 'Ceremony to first dance.' },
  { id: 'full', name: 'Full day', price: 1650, hours: 'About ten hours', line: 'Getting ready to the evening.' },
]

/** Comparison rows: one cell per package, in PACKAGES order. */
export const COMPARE: { label: string; cells: [string, string, string] }[] = [
  { label: 'Coverage', cells: ['Up to 3 hours', 'About 6 hours', 'About 10 hours'] },
  { label: 'Photographs, roughly', cells: ['150 or more', '400 or more', '700 or more'] },
  { label: 'Video call beforehand', cells: ['yes', 'yes', 'yes'] },
  { label: 'Shared planning form', cells: ['yes', 'yes', 'yes'] },
  { label: 'Private online gallery', cells: ['yes', 'yes', 'yes'] },
  { label: 'Second photographer', cells: ['Add-on', 'Add-on', 'Included'] },
  { label: 'Gallery delivered', cells: ['Within 6 weeks', 'Within 6 weeks', 'Within 6 weeks'] },
]

export type AddonId = 'second' | 'engagement' | 'album' | 'express'

export const ADDONS: { id: AddonId; name: string; price: number; note: string }[] = [
  { id: 'second', name: 'Second photographer', price: 350, note: 'Two angles on the vows, guests caught as well as you' },
  { id: 'engagement', name: 'Engagement shoot', price: 250, note: 'An hour anywhere in Cornwall, good practice for the day' },
  { id: 'album', name: 'Printed album', price: 420, note: 'Thirty spreads, linen cover, designed with you' },
  { id: 'express', name: 'Gallery in three weeks', price: 200, note: 'Your full gallery in half the usual time' },
]

export const EXTRA_HOUR = 150
export const MAX_EXTRA_HOURS = 3
export const BOOKING_FEE = 300

export type Addons = { second: boolean; engagement: boolean; album: boolean; express: boolean; hours: number }

export const NO_ADDONS: Addons = { second: false, engagement: false, album: false, express: false, hours: 0 }

export function packageById(id: PackageId): Package {
  return PACKAGES.find((p) => p.id === id) ?? PACKAGES[0]
}

/** Line items and total for a package and its add-ons. */
export function quote(pkg: PackageId, a: Addons): { lines: { label: string; price: number }[]; total: number } {
  const p = packageById(pkg)
  const lines: { label: string; price: number }[] = [{ label: `${p.name} coverage`, price: p.price }]
  for (const addon of ADDONS) {
    if (!a[addon.id]) continue
    if (addon.id === 'second' && pkg === 'full') continue
    lines.push({ label: addon.name, price: addon.price })
  }
  if (a.hours > 0) lines.push({ label: `${a.hours} extra ${a.hours === 1 ? 'hour' : 'hours'}`, price: a.hours * EXTRA_HOUR })
  return { lines, total: lines.reduce((s, l) => s + l.price, 0) }
}

export function gbp(n: number): string {
  return `£${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

export const STEPS: { title: string; body: string }[] = [
  { title: 'Check your date', body: 'Use the calendar. If it is free, send an enquiry with the package you have in mind.' },
  { title: 'A short call', body: 'Twenty minutes on video to hear about the day and see if we get on. No pressure either way.' },
  { title: 'Plan it together', body: 'A shared form for timings, family groups and the photographs that matter most to you.' },
  { title: 'Your gallery', body: 'A private, password-protected gallery within six weeks, every image downloadable in full size.' },
]

export const FAQS: { q: string; a: string }[] = [
  {
    q: 'How do I secure my date?',
    a: 'Once we have spoken and you are happy, a booking fee of £300 holds the date. It comes off your total, and the balance is due a month before the wedding.',
  },
  {
    q: 'Do you travel outside Cornwall?',
    a: 'Yes, anywhere in the UK. Travel within Cornwall is included; further afield is quoted at cost before you book.',
  },
  {
    q: 'Will you direct us?',
    a: 'Gently, and only when it helps. Most of the day I stay out of the way. For portraits we take a short walk, twenty minutes or so, and I give you something to do rather than a pose to hold.',
  },
  {
    q: 'What happens if it rains?',
    a: 'It is Cornwall, so we plan for it. I bring clear umbrellas, scout a covered spot at your venue beforehand, and some of the best light comes just after a shower.',
  },
  {
    q: 'Can we print the photographs ourselves?',
    a: 'Of course. Every image in your gallery comes with a personal print licence, so you can order prints from anyone you like.',
  },
]
