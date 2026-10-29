/* Brightline Electrical: copy, prices and the made-up quote and certificate logic. */

export const BIZ = {
  name: 'Brightline Electrical',
  place: 'Leicester',
  hours: 'Mon–Fri · 7.30am–5.30pm',
  phone: '0116 000 2731',
}

export const navLinks: { id: string; label: string }[] = [
  { id: 'bl-services', label: 'Services' },
  { id: 'bl-quote', label: 'Photo quote' },
  { id: 'bl-ev', label: 'EV chargers' },
  { id: 'bl-certs', label: 'Certificates' },
  { id: 'bl-faq', label: 'FAQ' },
]

export type JobId = 'eicr' | 'ev' | 'fault' | 'cu' | 'sockets' | 'lights' | 'rewire'

export type Job = {
  id: JobId
  label: string
  short: string
  price: string
  note: string
  ask: 'size' | 'qty' | 'run' | 'none'
  photoTip: string
}

export const jobs: Job[] = [
  {
    id: 'eicr',
    label: 'EICR certificate',
    short: 'EICR',
    price: 'From £120',
    note: 'Landlords, sales and peace of mind. Certificate online the same day.',
    ask: 'size',
    photoTip: 'A photo of the fuse box with the cover open.',
  },
  {
    id: 'ev',
    label: 'EV charger fitted',
    short: 'EV charger',
    price: 'From £795',
    note: 'Seven-kilowatt home charger, fitted and registered. Grant-checked for you.',
    ask: 'run',
    photoTip: 'The fuse box, the meter, and where you park.',
  },
  {
    id: 'fault',
    label: 'Fault finding',
    short: 'Fault finding',
    price: '£75 first hour',
    note: 'Tripping, flickering, dead sockets. Then £35 per half hour.',
    ask: 'none',
    photoTip: 'The fuse box, and anything scorched or buzzing.',
  },
  {
    id: 'cu',
    label: 'Consumer unit upgrade',
    short: 'New fuse box',
    price: 'From £450',
    note: 'Old fuse box out, modern consumer unit with RCD protection in.',
    ask: 'none',
    photoTip: 'The old fuse box, cover open, and the meter next to it.',
  },
  {
    id: 'sockets',
    label: 'Extra sockets',
    short: 'Sockets',
    price: 'From £85 each',
    note: 'Single, double or USB sockets, chased in and made good.',
    ask: 'qty',
    photoTip: 'The walls where the new sockets would go.',
  },
  {
    id: 'lights',
    label: 'Lights and downlights',
    short: 'Lighting',
    price: 'From £45 each',
    note: 'Pendants, downlights, outside lights and switches.',
    ask: 'qty',
    photoTip: 'The ceiling and the existing light switch.',
  },
  {
    id: 'rewire',
    label: 'Full or partial rewire',
    short: 'Rewire',
    price: 'Survey first',
    note: 'Planned room by room so you can stay in for most of it.',
    ask: 'size',
    photoTip: 'The fuse box and a typical socket and switch.',
  },
]

export type QuoteInput = {
  job: JobId
  size: number // bedrooms, 1–4 (4 means four or more)
  qty: number
  run: 'short' | 'mid' | 'long'
  urgent: boolean
}

function round5(n: number): number {
  return Math.round(n / 5) * 5
}

/** A ballpark range in pounds. Deliberately wide: it is not a quote. */
export function ballpark(q: QuoteInput): [number, number] {
  let lo = 0
  let hi = 0
  const s = Math.min(4, Math.max(1, q.size))
  const n = Math.min(30, Math.max(1, q.qty))
  switch (q.job) {
    case 'eicr':
      lo = [120, 140, 160, 190][s - 1]
      hi = [150, 175, 210, 260][s - 1]
      break
    case 'rewire':
      lo = [2400, 2900, 3600, 4500][s - 1]
      hi = [3200, 3800, 4700, 6200][s - 1]
      break
    case 'ev':
      lo = 795 + (q.run === 'mid' ? 150 : q.run === 'long' ? 320 : 0)
      hi = 980 + (q.run === 'mid' ? 260 : q.run === 'long' ? 480 : 0)
      break
    case 'fault':
      lo = 75
      hi = 145
      break
    case 'cu':
      lo = 450
      hi = 650
      break
    case 'sockets':
      lo = 85 * n - (n > 3 ? 20 * (n - 3) : 0)
      hi = 120 * n - (n > 3 ? 20 * (n - 3) : 0)
      break
    case 'lights':
      lo = 45 * n
      hi = 70 * n
      break
  }
  if (q.urgent) {
    lo *= 1.1
    hi *= 1.1
  }
  return [round5(lo), round5(hi)]
}

export function money(n: number): string {
  return '£' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function bytes(n: number): string {
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

/* ---------- certificates ---------- */

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const STREETS = ['Aylestone Rise', 'Clarendon Walk', 'Narborough Close', 'Belgrave Terrace', 'Knighton Lane', 'Evington Grove', 'Westcotes Drive', 'Humberstone Row']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const ENGINEERS = ['D. Okafor', 'R. Patel', 'S. Whitmore', 'J. Kaur']

export type Cert = {
  ref: string
  address: string
  kind: 'Rented property' | 'Owner-occupied'
  issued: string
  issuedY: number
  issuedM: number
  dueY: number
  dueM: number
  due: string
  result: 'Satisfactory' | 'Unsatisfactory'
  circuits: number
  c2: number
  c3: number
  engineer: string
}

export const CERT_PATTERN = /^BLE-(\d{2})(\d{2})(\d{2})$/

export function normaliseRef(raw: string): string {
  const s = raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (s.startsWith('BLE') && s.length === 9) return `BLE-${s.slice(3)}`
  if (/^\d{6}$/.test(s)) return `BLE-${s}`
  return raw.trim().toUpperCase()
}

/** Made-up but stable record for a reference. `null` means "not on file". */
export function findCert(ref: string, nowYear: number, nowMonth: number): Cert | null | 'bad' {
  const m = CERT_PATTERN.exec(ref)
  if (!m) return 'bad'
  const y = 2000 + Number(m[1])
  const mo = Number(m[2])
  const seq = Number(m[3])
  if (mo < 1 || mo > 12) return 'bad'
  if (y < 2016 || y > nowYear || (y === nowYear && mo > nowMonth)) return null
  if (seq === 0) return null
  const h = hash(ref)
  const rented = h % 3 !== 0
  const years = rented ? 5 : 10
  const bad = h % 7 === 0
  const day = 1 + (h % 28)
  const pc = `LE${2 + (h % 4)} ${1 + ((h >>> 3) % 9)}${String.fromCharCode(65 + ((h >>> 5) % 23))}${String.fromCharCode(65 + ((h >>> 9) % 23))}`
  return {
    ref,
    address: `${1 + (h % 118)} ${STREETS[(h >>> 4) % STREETS.length]}, Leicester ${pc}`,
    kind: rented ? 'Rented property' : 'Owner-occupied',
    issued: `${day} ${MONTHS[mo - 1]} ${y}`,
    issuedY: y,
    issuedM: mo,
    dueY: y + years,
    dueM: mo,
    due: `${MONTHS[mo - 1]} ${y + years}`,
    result: bad ? 'Unsatisfactory' : 'Satisfactory',
    circuits: 6 + ((h >>> 6) % 13),
    c2: bad ? 1 + ((h >>> 2) % 3) : 0,
    c3: (h >>> 8) % 4,
    engineer: ENGINEERS[(h >>> 7) % ENGINEERS.length],
  }
}

export function certText(c: Cert, status: string): string {
  return [
    'BRIGHTLINE ELECTRICAL — EICR SUMMARY',
    'Concept site by Northbound Web. This business and record are made up.',
    'This is a sample summary, not an electrical installation condition report.',
    '',
    `Reference:        ${c.ref}`,
    `Property:         ${c.address}`,
    `Type:             ${c.kind}`,
    `Inspected:        ${c.issued}`,
    `Inspector:        ${c.engineer}`,
    `Circuits tested:  ${c.circuits}`,
    `Overall result:   ${c.result}`,
    `Observations:     C1 0 · C2 ${c.c2} · C3 ${c.c3}`,
    `Next inspection:  ${c.due}`,
    `Status today:     ${status}`,
    '',
  ].join('\n')
}

export const services = jobs

export const evPoints: { k: string; v: string }[] = [
  { k: '7 kW', v: 'About 30 miles of range an hour' },
  { k: 'Half day', v: 'Most installs, start to finish' },
  { k: 'Off-peak', v: 'Scheduled charging set up with you' },
]

export const howSteps: { title: string; body: string }[] = [
  { title: 'Send photos', body: 'Pick the job, add a few photos from your phone and see a ballpark straight away.' },
  { title: 'Firm price', body: 'We look at the photos and reply with a fixed price or a short survey visit, same working day.' },
  { title: 'Clean job', body: 'Dust sheets down, floors protected, everything put back as it was.' },
  { title: 'Paperwork online', body: 'Certificates and test results in your account, downloadable any time.' },
]

export const faqs: { q: string; a: string }[] = [
  {
    q: 'How accurate is the photo ballpark?',
    a: 'It is a range, not a quote. Most jobs land inside it, but we always confirm a fixed price after looking at your photos, or after a short visit for bigger work like rewires.',
  },
  {
    q: 'How often does a rented property need an EICR?',
    a: 'In England, privately rented homes need an electrical inspection at least every five years, and tenants should get a copy. Owner-occupiers are usually advised every ten.',
  },
  {
    q: 'What if my report is unsatisfactory?',
    a: 'The report lists what needs fixing and how urgent each item is. We quote for the remedial work there and then, and issue a confirmation once it is done.',
  },
  {
    q: 'Can I get an EV charger if I park on the street?',
    a: 'Usually not safely: a cable across a pavement is a trip hazard. You need off-street parking, such as a drive or garage, for a home charger.',
  },
  {
    q: 'Do you work evenings or weekends?',
    a: 'Our normal hours are Monday to Friday, 7.30am to 5.30pm. For landlords we can arrange tenant access at the start or end of the day.',
  },
]
