/**
 * Everything the "Start a project" flow asks, in one place. Copy lives here,
 * not in JSX. The server action re-runs validateAll before anything is sent.
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
  { id: '1000-plus', label: '£1,000+', note: 'A bigger build or a web app, scoped in writing.' },
  { id: 'unsure', label: 'Not sure yet', note: 'No problem. I will suggest what fits.' },
] as const

export const PLAN_OPTIONS = ['Yes, tell me more', 'Maybe', 'One-off build only'] as const

export const TIMELINES = ['As soon as possible', 'Within a month', '1–3 months', 'Just exploring'] as const

export const REPLY_OPTIONS = [
  { id: 'whatsapp', label: 'WhatsApp message', note: 'Quickest. I will message the number you give me.' },
  { id: 'email', label: 'Email', note: 'A written reply to the address you give me.' },
] as const

export type ReplyVia = (typeof REPLY_OPTIONS)[number]['id']

export const STEPS = [
  { title: 'What do you need help with', mark: '?', sub: 'Select all that apply. Nothing is fixed until you have a written quote.' },
  {
    title: 'What is your working budget',
    mark: '?',
    sub: 'A rough range is fine. It helps me suggest the right size of build, not a bigger one. The package prices themselves are fixed and published.',
  },
  { title: 'When do you want to be live', mark: '?', sub: 'Pick the closest.' },
  { title: 'Tell me about you', mark: '.', sub: 'So I know who I am writing back to.' },
  { title: 'How should I reply', mark: '?', sub: 'No calls. I will reply by message or email, normally within one working day, with questions or a written quote.' },
] as const

export type ProjectForm = {
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
  replyVia: '' | ReplyVia
}

export const emptyForm = (): ProjectForm => ({
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
  replyVia: '',
})

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const isEmail = (s: string) => EMAIL_RE.test(s.trim())
const phoneDigits = (s: string) => s.replace(/\D/g, '')

/** The same checks run in the browser (for messages) and on the server (for trust). */
export function validateStep(step: number, f: ProjectForm): Record<string, string> {
  const e: Record<string, string> = {}
  if (step === 0) {
    const known = f.help.filter((h) => (HELP_OPTIONS as readonly string[]).includes(h))
    if (!known.length) e.help = 'Pick at least one, even if it is "Something else".'
    if (f.other.length > 1000) e.other = 'Please keep this under 1,000 characters.'
  }
  if (step === 1) {
    if (!BUDGETS.some((b) => b.label === f.budget)) e.budget = 'Pick the closest range, or "Not sure yet".'
    if (f.plan && !(PLAN_OPTIONS as readonly string[]).includes(f.plan)) e.plan = 'Pick one of the options.'
  }
  if (step === 2 && !(TIMELINES as readonly string[]).includes(f.timeline)) e.timeline = 'Pick the closest.'
  if (step === 3) {
    const name = f.name.trim()
    if (name.length < 2) e.name = 'Add your name.'
    else if (name.length > 100) e.name = 'That name is too long.'
    if (!isEmail(f.email) || f.email.trim().length > 200) e.email = 'That email address does not look complete.'
    if (f.business.length > 120) e.business = 'That is too long.'
    if (f.site.length > 200) e.site = 'That is too long.'
  }
  if (step === 4) {
    if (!REPLY_OPTIONS.some((r) => r.id === f.replyVia)) e.replyVia = 'Pick how you would like me to reply.'
    if (f.replyVia === 'whatsapp') {
      const d = phoneDigits(f.phone)
      if (d.length < 10 || d.length > 15) e.phone = 'Add a mobile number that has WhatsApp.'
    } else if (f.phone.length > 40) e.phone = 'That is too long.'
  }
  return e
}

export function validateAll(f: ProjectForm) {
  for (let s = 0; s < STEPS.length; s++) {
    const e = validateStep(s, f)
    if (Object.keys(e).length) return { step: s, errors: e }
  }
  return null
}

/** The plain-text body of the enquiry email and Sheet row. */
export function composeMessage(f: ProjectForm) {
  const reply = REPLY_OPTIONS.find((r) => r.id === f.replyVia)?.label ?? ''
  const lines = [
    `Reply by: ${reply}${f.replyVia === 'whatsapp' ? ` (${f.phone.trim()})` : ''}`,
    `Needs: ${f.help.join(', ')}`,
    `Working budget: ${f.budget}`,
    `Monthly plan: ${f.plan || 'Not answered'}`,
    `Timeline: ${f.timeline}`,
    f.site.trim() ? `Current site or Instagram: ${f.site.trim()}` : '',
    f.phone.trim() && f.replyVia !== 'whatsapp' ? `Phone (not for calls): ${f.phone.trim()}` : '',
    f.other.trim() ? `\nNotes:\n${f.other.trim()}` : '',
  ]
  return lines.filter(Boolean).join('\n')
}
