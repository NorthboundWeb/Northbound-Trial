/** Ironfield PT — a made-up small-group gym in Bristol. Prices belong to the
 *  pretend business. */

export type TypeId = 'strength' | 'engine' | 'bells' | 'mobility' | 'lab'
export type PlanId = 'payg' | 'pack' | 'unlimited' | 'pt'

export type ClassType = { id: TypeId; name: string; blurb: string }
export type Session = {
  id: string
  day: number // 0 = Monday
  time: string
  type: TypeId
  coach: string
  /** Spaces already taken by (pretend) other members. */
  taken: number
}
export type Plan = {
  id: PlanId
  name: string
  price: string
  unit: string
  lines: string[]
  /** Cost of one session, for the monthly estimate. Null = flat monthly. */
  perSession: number | null
  monthly: number | null
  group: boolean
}

export const CAPACITY = 6
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const TYPES: ClassType[] = [
  { id: 'strength', name: 'Strength Club', blurb: 'Squat, press, pull. A written plan that moves on every week.' },
  { id: 'engine', name: 'Engine', blurb: 'Rower, bike and sled intervals. Hard, short, scaled to you.' },
  { id: 'bells', name: 'Bells', blurb: 'Kettlebell swings, carries and complexes.' },
  { id: 'mobility', name: 'Mobility', blurb: 'Hips, shoulders and backs that sit at desks all day.' },
  { id: 'lab', name: 'Lift Lab', blurb: 'Slow, coached technique on one lift. Ideal after a taster.' },
]

export const COACHES: { name: string; focus: string; line: string; initial: string }[] = [
  { name: 'Dani', focus: 'Strength and barbell lifting', line: 'Runs Strength Club and Lift Lab. Will fix your squat.', initial: 'D' },
  { name: 'Marcus', focus: 'Conditioning and kettlebells', line: 'Writes Engine and Bells. Loud music, quiet coaching.', initial: 'M' },
  { name: 'Jo', focus: 'Mobility and returning to training', line: 'Takes Mobility and most one-to-ones after a break.', initial: 'J' },
]

const RAW: [number, string, TypeId, string][] = [
  [0, '06:15', 'strength', 'Dani'],
  [0, '07:30', 'engine', 'Marcus'],
  [0, '12:15', 'mobility', 'Jo'],
  [0, '17:30', 'strength', 'Dani'],
  [0, '18:45', 'bells', 'Marcus'],
  [1, '06:15', 'engine', 'Marcus'],
  [1, '09:30', 'lab', 'Dani'],
  [1, '12:15', 'strength', 'Dani'],
  [1, '18:00', 'engine', 'Marcus'],
  [1, '19:15', 'mobility', 'Jo'],
  [2, '06:15', 'strength', 'Dani'],
  [2, '07:30', 'bells', 'Marcus'],
  [2, '12:15', 'engine', 'Marcus'],
  [2, '17:30', 'lab', 'Dani'],
  [2, '18:45', 'strength', 'Dani'],
  [3, '06:15', 'bells', 'Marcus'],
  [3, '09:30', 'mobility', 'Jo'],
  [3, '12:15', 'strength', 'Dani'],
  [3, '18:00', 'engine', 'Marcus'],
  [3, '19:15', 'strength', 'Dani'],
  [4, '06:15', 'strength', 'Dani'],
  [4, '07:30', 'engine', 'Marcus'],
  [4, '12:15', 'bells', 'Marcus'],
  [4, '17:30', 'strength', 'Dani'],
  [5, '08:00', 'strength', 'Dani'],
  [5, '09:15', 'engine', 'Marcus'],
  [5, '10:30', 'mobility', 'Jo'],
  [6, '09:00', 'lab', 'Dani'],
  [6, '10:15', 'mobility', 'Jo'],
]

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export const SESSIONS: Session[] = RAW.map(([day, time, type, coach]) => {
  const id = `${day}-${time}`
  return { id, day, time, type, coach, taken: hash(id) % (CAPACITY + 1) }
})

export const PLANS: Plan[] = [
  {
    id: 'payg',
    name: 'Pay as you go',
    price: '£12',
    unit: 'a session',
    lines: ['Any small-group class', 'Book up to a week ahead', 'First session is a £10 taster'],
    perSession: 12,
    monthly: null,
    group: true,
  },
  {
    id: 'pack',
    name: '10-session pack',
    price: '£108',
    unit: '£10.80 a session',
    lines: ['Any small-group class', 'Use within three months', 'Share with a partner'],
    perSession: 10.8,
    monthly: null,
    group: true,
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: '£89',
    unit: 'a month',
    lines: ['Every small-group class', 'Renews monthly, cancel before the renewal date', 'Monthly check-in with a coach'],
    perSession: null,
    monthly: 89,
    group: true,
  },
  {
    id: 'pt',
    name: 'One-to-one',
    price: '£40',
    unit: '45 minutes',
    lines: ['Your own coach, your own plan', 'Pick any open hour', 'Five for £185'],
    perSession: 37,
    monthly: null,
    group: false,
  },
]

export const FAQS: { q: string; a: string }[] = [
  {
    q: 'I’ve never lifted. Is this for me?',
    a: 'Yes. Most people start with a £10 taster and a Lift Lab. Every class has a lighter option and a coach watching six people, not thirty.',
  },
  {
    q: 'What happens at a taster?',
    a: 'A short chat about what you want, a coached warm-up, then the class at your level. Wear trainers, bring water. No hard sell at the end.',
  },
  {
    q: 'Can I cancel a class?',
    a: 'Cancel up to six hours before and the session goes back on your pack or isn’t charged. Later than that and it counts, because someone on the waitlist missed it.',
  },
  {
    q: 'How does Unlimited renew?',
    a: 'It renews on the same date each month, paid by card. Cancel any time before the renewal date and it simply stops at the end of that month.',
  },
  {
    q: 'Is there parking?',
    a: 'Four spaces in the yard and on-street parking after 6pm. Bike racks inside the door.',
  },
]

export function money(n: number): string {
  return Number.isInteger(n) ? `£${n}` : `£${n.toFixed(2)}`
}
