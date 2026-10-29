/**
 * Everything the booking flow asks, in one place. Copy lives here, not in JSX.
 *
 * The database re-checks the parts that matter (day, time, name, email, at
 * least one need) in `nb_booking_create`, so changing a list here does not
 * loosen what the server accepts.
 */

export const CONTACT_EMAIL = 'che@northboundweb.co.uk'

export const HELP_OPTIONS = [
  'Build a new website',
  'Redesign my website',
  'Landing page',
  'Online booking or shop',
  'Monthly website care',
  'Something else',
] as const

export const BUDGETS = [
  { id: 'around-249', label: 'Around £249', note: 'A focused site or a single landing page.' },
  { id: '250-500', label: '£250 – £500', note: 'A multi-page site with the essentials done properly.' },
  { id: '500-1000', label: '£500 – £1,000', note: 'More pages, bookings or a shop, extra features.' },
  { id: '1000-plus', label: '£1,000+', note: 'A bigger build or a web app, scoped on the call.' },
  { id: 'unsure', label: 'Not sure yet', note: 'No problem. I will suggest what fits after we talk.' },
] as const

export const PLAN_OPTIONS = ['Yes, tell me more', 'Maybe', 'One-off build only'] as const

export const TIMELINES = ['As soon as possible', 'Within a month', '1–3 months', 'Just exploring'] as const

/** Must match nb_booking.slots() in the database. */
export const TIMES = ['09:30', '11:00', '13:30', '15:00', '17:30', '19:00'] as const

/** Weekdays offered, counted from tomorrow. The database allows up to 21 days ahead. */
export const DAYS_SHOWN = 10

export const STEPS = [
  { title: 'What do you need help with', mark: '?', sub: 'Select all that apply. You can change your mind on the call.' },
  {
    title: 'What is your working budget',
    mark: '?',
    sub: 'A rough range is fine. It helps me suggest the right size of build, not a bigger one. The package prices themselves are fixed and published.',
  },
  { title: 'When do you want to be live', mark: '?', sub: 'Pick the closest.' },
  { title: 'Tell me about you', mark: '.', sub: 'So I know who I am talking to before the call.' },
  {
    title: 'Pick a time',
    mark: '.',
    sub: 'A free 20-minute video or phone call, UK time. I confirm the slot by email, or offer another if something changes.',
  },
] as const

export const ON_THE_CALL = [
  ['01', 'Your current site or socials', 'If you have them. What is working, what is not, and what customers ask that the site does not answer.'],
  ['02', 'What the new site needs to do', 'Bookings, a price list, a gallery, showing up locally. Working out what to build is part of the job.'],
  ['03', 'A written quote afterwards', 'Fixed scope, fixed price, normally within one working day of the call. No obligation.'],
] as const

export type BookingStatus = 'requested' | 'confirmed' | 'cancelled'

export type BookingForm = {
  help: string[]
  other: string
  budget: string
  plan: string
  timeline: string
  name: string
  business: string
  email: string
  phone: string
  site: string
  day: string
  slot: string
}

export const emptyForm = (): BookingForm => ({
  help: [],
  other: '',
  budget: '',
  plan: '',
  timeline: '',
  name: '',
  business: '',
  email: '',
  phone: '',
  site: '',
  day: '',
  slot: '',
})

export type MyBooking = {
  ref: string
  day: string
  slot: string
  status: BookingStatus
  help: string[]
  budget: string
  timeline: string
  name: string
  email: string
}

export type DiaryBooking = MyBooking & {
  other: string
  plan: string
  business: string
  phone: string
  site: string
  cancelledBy: string | null
  createdAt: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const isEmail = (s: string) => EMAIL_RE.test(s.trim())

/** The same checks run in the browser (for messages) and on the server (for trust). */
export function validateStep(step: number, f: BookingForm, days: readonly string[]): Record<string, string> {
  const e: Record<string, string> = {}
  if (step === 0) {
    const known = f.help.filter((h) => (HELP_OPTIONS as readonly string[]).includes(h))
    if (!known.length) e.help = 'Pick at least one, even if it is "Something else".'
    if (f.other.length > 1000) e.other = 'Please keep this under 1,000 characters.'
  }
  if (step === 1 && !BUDGETS.some((b) => b.label === f.budget)) e.budget = 'Pick the closest range, or "Not sure yet".'
  if (step === 1 && f.plan && !(PLAN_OPTIONS as readonly string[]).includes(f.plan)) e.plan = 'Pick one of the options.'
  if (step === 2 && !(TIMELINES as readonly string[]).includes(f.timeline)) e.timeline = 'Pick the closest.'
  if (step === 3) {
    const name = f.name.trim()
    if (name.length < 2) e.name = 'Add your name.'
    else if (name.length > 100) e.name = 'That name is too long.'
    if (!isEmail(f.email) || f.email.trim().length > 200) e.email = 'That email address does not look complete.'
    if (f.business.length > 120) e.business = 'That is too long.'
    if (f.phone.length > 40) e.phone = 'That is too long.'
    if (f.site.length > 200) e.site = 'That is too long.'
  }
  if (step === 4) {
    if (!days.includes(f.day)) e.day = 'Pick a weekday from the list.'
    if (!(TIMES as readonly string[]).includes(f.slot)) e.slot = 'Pick a time.'
  }
  return e
}

export function validateAll(f: BookingForm, days: readonly string[]) {
  for (let s = 0; s < STEPS.length; s++) {
    const e = validateStep(s, f, days)
    if (Object.keys(e).length) return { step: s, errors: e }
  }
  return null
}
