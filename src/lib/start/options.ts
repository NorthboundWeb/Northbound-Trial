/**
 * "Start a project": the free-build offer. Copy and option lists live here.
 * The same validation runs in the browser (for messages) and in the API
 * route (for trust).
 */

export const OFFER = {
  headline: 'I will build your first website for free.',
  points: [
    { id: 'free', title: 'Free to build', body: 'Your first website: no deposit and nothing to pay up front. After that, new work starts with a 50% deposit.' },
    { id: 'buy', title: 'Like it? Buy it.', body: 'If you love it, you buy it. If you do not, I will not contact you again.' },
    { id: 'any', title: 'Websites or systems', body: 'Sites, booking systems, shops, portals, tools. Tell me what you need.' },
    { id: 'no-obligation', title: 'No obligation', body: 'If you do not like my approach at all, you do not have to go ahead with anything.' },
  ],
  timing: {
    processing: 'Up to 24 hours to process your request.',
    build: 'Estimated build time is 72 hours. Larger requests can take longer.',
  },
} as const

/**
 * What can be built, as headers that each open to a short list. Only one
 * header is open at a time so the page never gets long. A chosen item is
 * stored as "Header: item" (or just the header for "Something else").
 */
export const BUILD_GROUPS = [
  {
    id: 'website',
    title: 'New website',
    blurb: 'A full site for your business.',
    items: ['Business or services site', 'Portfolio or gallery', 'Blog or news site', 'Rebuild my existing site', 'Not sure yet'],
  },
  {
    id: 'landing',
    title: 'Landing page',
    blurb: 'One focused page.',
    items: ['One page for a service or offer', 'Launch or campaign page', 'Coming soon or waiting list', 'Not sure yet'],
  },
  {
    id: 'booking',
    title: 'Online booking',
    blurb: 'Let customers book themselves in.',
    items: ['Appointments', 'Classes or timetable', 'Several staff or calendars', 'Not sure yet'],
  },
  {
    id: 'shop',
    title: 'Online shop',
    blurb: 'Sell products online.',
    items: ['Shopify store', 'Shopify store plus a custom website', 'Custom-built shop', 'Not sure, advise me'],
  },
  {
    id: 'system',
    title: 'Web app or work system',
    blurb: 'Software for you or your customers.',
    items: ['Customer accounts or portal', 'Internal tool or dashboard', 'Quotes, jobs or invoices', 'Automating a manual process', 'Not sure yet'],
  },
  {
    id: 'other',
    title: 'Something else',
    blurb: 'Describe it on the next screen.',
    items: [],
  },
] as const

export const buildValue = (g: (typeof BUILD_GROUPS)[number], item?: string) => (item ? `${g.title}: ${item}` : g.title)
export const BUILD_VALUES: readonly string[] = BUILD_GROUPS.flatMap((g) => (g.items.length ? g.items.map((i) => buildValue(g, i)) : [buildValue(g)]))

export const REPLY_OPTIONS = [
  { id: 'whatsapp', label: 'WhatsApp', note: 'Quickest. I reply in the same chat.' },
  { id: 'email', label: 'Email', note: 'A written reply to your inbox.' },
] as const
export type ReplyVia = (typeof REPLY_OPTIONS)[number]['id']

export const STEPS = [
  { id: 'offer', label: 'The offer' },
  { id: 'build', label: 'What to build' },
  { id: 'details', label: 'Details' },
  { id: 'photos', label: 'Photos' },
  { id: 'links', label: 'Links' },
  { id: 'date', label: 'Delivery date' },
  { id: 'you', label: 'About you' },
  { id: 'review', label: 'Send' },
] as const
export type StepId = (typeof STEPS)[number]['id']

export const MAX_PHOTOS = 6
/** Each photo is resized in the browser to fit this many pixels on its longest side. */
export const PHOTO_MAX_EDGE = 1600
/** And must come out smaller than this many bytes (base64 adds ~33% on the wire). */
export const PHOTO_MAX_BYTES = 1_100_000

export type Photo = { id: string; name: string; type: string; data: string; preview: string; bytes: number }

export type StartForm = {
  build: string[]
  business: string
  trade: string
  details: string
  website: string
  socials: string[]
  portfolio: string
  date: string
  name: string
  email: string
  replyVia: '' | ReplyVia
  phone: string
}

export const emptyStart = (): StartForm => ({
  build: [],
  business: '',
  trade: '',
  details: '',
  website: '',
  socials: [''],
  portfolio: '',
  date: '',
  name: '',
  email: '',
  replyVia: '',
  phone: '',
})

// ---- dates: always UK days, as YYYY-MM-DD ---------------------------------

const london = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' })
export const todayUK = () => london.format(new Date())
export function addDays(iso: string, n: number) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}
export function dayDiff(from: string, to: string) {
  const a = Date.UTC(+from.slice(0, 4), +from.slice(5, 7) - 1, +from.slice(8, 10))
  const b = Date.UTC(+to.slice(0, 4), +to.slice(5, 7) - 1, +to.slice(8, 10))
  return Math.round((b - a) / 86_400_000)
}
export function fmtDay(iso: string, o: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-GB', { ...o, timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`))
}

/**
 * Day 1 (today) is processing, days 2–4 are the build, days 5–7 may move for
 * big requests, day 8 onwards is clear. Delivery can be picked from day 5.
 */
export type DayKind = 'past' | 'processing' | 'building' | 'maybe' | 'open'
export function dayKind(today: string, iso: string): DayKind {
  const n = dayDiff(today, iso)
  if (n < 0) return 'past'
  if (n === 0) return 'processing'
  if (n <= 3) return 'building'
  if (n <= 6) return 'maybe'
  return 'open'
}
export const LAST_BOOKABLE_DAYS = 120

// ---- validation --------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const isUrlish = (s: string) => !s.trim() || /^(https?:\/\/)?[^\s.]+\.[^\s]{2,}|^@[\w.]{2,}$/i.test(s.trim())

export function validateStep(step: StepId, f: StartForm, today: string): Record<string, string> {
  const e: Record<string, string> = {}
  if (step === 'build') {
    if (!f.build.some((b) => BUILD_VALUES.includes(b))) e.build = 'Open a heading and pick at least one option, even if it is "Something else".'
  }
  if (step === 'details') {
    if (f.details.trim().length < 20) e.details = 'Tell me a bit more: what the business does and what the site needs to do.'
    if (f.details.length > 3000) e.details = 'Please keep this under 3,000 characters. You can send more in the chat.'
    if (f.business.length > 120) e.business = 'That is too long.'
    if (f.trade.length > 120) e.trade = 'That is too long.'
  }
  if (step === 'links') {
    if (!isUrlish(f.website)) e.website = 'That does not look like a web address.'
    if (!isUrlish(f.portfolio)) e.portfolio = 'That does not look like a web address.'
    f.socials.forEach((s, i) => {
      if (!isUrlish(s)) e[`social-${i}`] = 'Use a link or an @handle.'
    })
  }
  if (step === 'date') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f.date)) e.date = 'Pick the date you would like your website.'
    else {
      const k = dayKind(today, f.date)
      if (k === 'past' || k === 'processing' || k === 'building') e.date = 'That is inside the processing and build window. Pick a later date.'
      else if (dayDiff(today, f.date) > LAST_BOOKABLE_DAYS) e.date = 'Pick a date within the next four months.'
    }
  }
  if (step === 'you') {
    const n = f.name.trim()
    if (n.length < 2) e.name = 'Add your name.'
    else if (n.length > 100) e.name = 'That name is too long.'
    if (!REPLY_OPTIONS.some((r) => r.id === f.replyVia)) e.replyVia = 'Pick how you would like me to reply.'
    const em = f.email.trim()
    if (f.replyVia === 'email' && !em) e.email = 'Add the email you would like the reply sent to.'
    else if (em && (!EMAIL_RE.test(em) || em.length > 200)) e.email = 'That email address does not look complete.'
  }
  return e
}

export function firstInvalid(f: StartForm, today: string) {
  for (const s of STEPS) {
    const e = validateStep(s.id, f, today)
    if (Object.keys(e).length) return { step: s.id, errors: e }
  }
  return null
}

/** The plain-text body that lands in the email and the Sheet. */
export function composeRequest(f: StartForm, today: string, photoCount: number) {
  const reply = REPLY_OPTIONS.find((r) => r.id === f.replyVia)?.label ?? ''
  const socials = f.socials.map((s) => s.trim()).filter(Boolean)
  const kind = f.date ? dayKind(today, f.date) : 'open'
  const lines = [
    'Hi Che, here is my free website request.',
    '',
    f.name.trim() ? `Name: ${f.name.trim()}` : '',
    `Wanted by: ${f.date ? fmtDay(f.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-'}${kind === 'maybe' ? ' (inside the possible-delay window)' : ''}`,
    `Reply by: ${reply}${f.replyVia === 'email' ? ` (${f.email.trim()})` : ' (this chat)'}`,
    `Build: ${f.build.join(', ')}`,
    f.business.trim() ? `Business: ${f.business.trim()}` : '',
    f.trade.trim() ? `What I do: ${f.trade.trim()}` : '',
    f.website.trim() ? `Current website: ${f.website.trim()}` : 'Current website: none given',
    socials.length ? `Social pages: ${socials.join(', ')}` : '',
    f.portfolio.trim() ? `Portfolio: ${f.portfolio.trim()}` : '',
    photoCount ? `Photos: ${photoCount}, sending them next in this chat` : 'Photos: none',
    '',
    'Details:',
    f.details.trim(),
  ]
  return lines.filter((l, i) => l !== '' || i === 1 || i === lines.length - 3).join('\n')
}
