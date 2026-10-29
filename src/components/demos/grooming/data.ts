/** Bramble & Bone — a made-up dog groomer in Harrogate. All prices belong to
 *  the pretend business. */

export type SizeId = 'small' | 'medium' | 'large' | 'giant'
export type CoatId = 'smooth' | 'wire' | 'double' | 'curly'
export type ServiceId = 'full' | 'bath' | 'puppy' | 'nails'
export type MattingId = 'none' | 'some' | 'heavy'
export type GroomerId = 'hattie' | 'sam'

export type Size = { id: SizeId; label: string; weight: string; examples: string; scale: number }
export type Coat = { id: CoatId; label: string; note: string; extra: number; minutes: number }
export type Service = {
  id: ServiceId
  name: string
  note: string
  prices: Record<SizeId, number>
  minutes: Record<SizeId, number>
  /** Whether coat type changes the price (it doesn't for nails). */
  coat: boolean
}
export type Addon = { id: string; label: string; price: number; note: string }
export type Groomer = { id: GroomerId; name: string; focus: string; likes: string; tone: 'teal' | 'apricot' }

export const SIZES: Size[] = [
  { id: 'small', label: 'Small', weight: 'Up to 10kg', examples: 'Shih Tzu, Westie, Jack Russell', scale: 0.62 },
  { id: 'medium', label: 'Medium', weight: '10–20kg', examples: 'Cocker Spaniel, Cockapoo, Beagle', scale: 0.76 },
  { id: 'large', label: 'Large', weight: '20–35kg', examples: 'Labrador, Springer, Labradoodle', scale: 0.9 },
  { id: 'giant', label: 'Giant', weight: '35kg and up', examples: 'Bernese, Newfoundland, Malamute', scale: 1 },
]

export const SERVICES: Service[] = [
  {
    id: 'full',
    name: 'Full groom',
    note: 'Bath, blow-dry, brush-out, trim or clip, nails, ears and a bandana.',
    prices: { small: 32, medium: 40, large: 52, giant: 64 },
    minutes: { small: 90, medium: 120, large: 150, giant: 180 },
    coat: true,
  },
  {
    id: 'bath',
    name: 'Bath and tidy',
    note: 'Bath, dry and brush, with a tidy of feet, face and bottom.',
    prices: { small: 24, medium: 30, large: 38, giant: 46 },
    minutes: { small: 60, medium: 75, large: 90, giant: 120 },
    coat: true,
  },
  {
    id: 'puppy',
    name: 'Puppy intro',
    note: 'Under six months. A short, gentle first visit: bath, dry, nails, lots of treats.',
    prices: { small: 22, medium: 26, large: 30, giant: 34 },
    minutes: { small: 45, medium: 45, large: 60, giant: 60 },
    coat: false,
  },
  {
    id: 'nails',
    name: 'Nails only',
    note: 'Clip and file. No appointment length to worry about.',
    prices: { small: 10, medium: 10, large: 12, giant: 12 },
    minutes: { small: 15, medium: 15, large: 15, giant: 20 },
    coat: false,
  },
]

export const COATS: Coat[] = [
  { id: 'smooth', label: 'Smooth', note: 'Short, flat coats', extra: 0, minutes: 0 },
  { id: 'wire', label: 'Wiry', note: 'Terriers, schnauzers', extra: 4, minutes: 15 },
  { id: 'double', label: 'Double coat', note: 'Huskies, collies, retrievers', extra: 8, minutes: 30 },
  { id: 'curly', label: 'Curly or woolly', note: 'Poodles and doodles', extra: 10, minutes: 30 },
]

export const MATTING: { id: MattingId; label: string; extra: number; note: string }[] = [
  { id: 'none', label: 'No knots', extra: 0, note: 'Brushes through' },
  { id: 'some', label: 'A few knots', extra: 10, note: 'Up to 15 minutes de-matting' },
  { id: 'heavy', label: 'Heavily matted', extra: 0, note: 'We’ll message you first' },
]

export const ADDONS: Addon[] = [
  { id: 'teeth', label: 'Teeth clean', price: 5, note: 'Enzyme paste, finger brush' },
  { id: 'deshed', label: 'De-shed treatment', price: 12, note: 'Less fluff on the sofa' },
  { id: 'balm', label: 'Paw and nose balm', price: 4, note: 'For cracked winter paws' },
]

export const GROOMERS: Groomer[] = [
  {
    id: 'hattie',
    name: 'Hattie',
    focus: 'Scissor work, poodles and doodles',
    likes: 'Teddy-bear faces and very patient puppies.',
    tone: 'teal',
  },
  {
    id: 'sam',
    name: 'Sam',
    focus: 'Big dogs, double coats, nervous dogs',
    likes: 'A full de-shed and a calm, quiet room.',
    tone: 'apricot',
  },
]

/** Drop-off times. Each groomer works one dog at a time. */
export const SLOTS = ['8:30', '9:30', '10:30', '11:30', '13:00', '14:00', '15:00']

export const HOURS: { day: string; time: string }[] = [
  { day: 'Monday', time: 'Closed' },
  { day: 'Tuesday', time: '8.30am – 5pm' },
  { day: 'Wednesday', time: '8.30am – 5pm' },
  { day: 'Thursday', time: '8.30am – 5pm' },
  { day: 'Friday', time: '8.30am – 5pm' },
  { day: 'Saturday', time: '8.30am – 5pm' },
  { day: 'Sunday', time: 'Closed' },
]

export const FAQS: { q: string; a: string }[] = [
  {
    q: 'How often should my dog be groomed?',
    a: 'Curly and woolly coats every six to eight weeks, double coats every eight to twelve, smooth coats whenever they start to smell like a dog. We’ll suggest a gap after the first visit.',
  },
  {
    q: 'My dog is nervous. Can you help?',
    a: 'Yes. Book with Sam and tick “first groom with us”. We keep the room quiet, take breaks, and stop if your dog has had enough. You only pay for what we did.',
  },
  {
    q: 'Do you need vaccination records?',
    a: 'We ask that your dog is up to date with vaccinations and flea treatment. Bring the card on your first visit if you can.',
  },
  {
    q: 'What happens if my dog is matted?',
    a: 'A few knots we brush out (an extra £10 for up to 15 minutes). If the coat is matted to the skin, the kind thing is a short clip and a fresh start. We’ll message you before we do it.',
  },
  {
    q: 'What if I need to cancel?',
    a: 'Let us know 24 hours before and there’s no charge. Inside 24 hours we may ask for half the groom price, because that slot can’t usually be filled.',
  },
  {
    q: 'When do I collect?',
    a: 'We send a text when your dog is dry, brushed and ready. Most full grooms take two to three hours from drop-off.',
  },
]

export function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function money(n: number): string {
  return Number.isInteger(n) ? `£${n}` : `£${n.toFixed(2)}`
}

export function duration(mins: number): string {
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  const hs = h === 1 ? '1 hr' : `${h} hrs`
  return m ? `${hs} ${m} min` : hs
}
