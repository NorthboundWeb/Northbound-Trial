/**
 * Wild Stem — made-up florist in Bath. Prices are the pretend business's own
 * (whole pounds). Nothing is sent anywhere.
 */

export type Kind = 'bouquet' | 'vase' | 'plant' | 'dried' | 'subscription'
export type Occasion = 'birthday' | 'love' | 'sympathy' | 'thanks' | 'just'
export type Size = 'standard' | 'large' | 'grand'

export type Product = {
  id: string
  name: string
  /** Base price in whole pounds. */
  price: number
  blurb: string
  kind: Kind
  occasions: Occasion[]
  stems: string[]
  /** Four flower colours for the drawing. */
  palette: [string, string, string, string]
  seed: number
  sizes: boolean
  badge?: string
  /** For subscriptions: how often. */
  every?: string
  hidden?: boolean
}

export const OCCASIONS: { id: Occasion | 'all'; label: string }[] = [
  { id: 'all', label: 'Everything' },
  { id: 'birthday', label: 'Birthday' },
  { id: 'love', label: 'Love' },
  { id: 'thanks', label: 'Thank you' },
  { id: 'sympathy', label: 'Sympathy' },
  { id: 'just', label: 'Just because' },
]

export const TYPES: { id: Kind | 'all'; label: string }[] = [
  { id: 'all', label: 'All types' },
  { id: 'bouquet', label: 'Bouquets' },
  { id: 'vase', label: 'In a vase' },
  { id: 'plant', label: 'Plants' },
  { id: 'dried', label: 'Dried' },
]

export type PriceBand = 'any' | 'under40' | '40to60' | 'over60'

export const PRICE_BANDS: { id: PriceBand; label: string }[] = [
  { id: 'any', label: 'Any price' },
  { id: 'under40', label: 'Under £40' },
  { id: '40to60', label: '£40–£60' },
  { id: 'over60', label: '£60 and up' },
]

export const SIZES: { id: Size; label: string; extra: number; note: string }[] = [
  { id: 'standard', label: 'Standard', extra: 0, note: 'As drawn' },
  { id: 'large', label: 'Large', extra: 15, note: 'About a third more stems' },
  { id: 'grand', label: 'Grand', extra: 30, note: 'Generous, for a big table' },
]

export const VASE_PRICE = 12
/** Delivery in pence, free over the threshold (pounds). */
export const DELIVERY_PENCE = 595
export const FREE_OVER = 60

export const PRODUCTS: Product[] = [
  {
    id: 'seasonal',
    name: 'Seasonal bouquet',
    price: 35,
    blurb: 'Whatever is best at the market this week, arranged loose and wild. You trust us, we do the rest.',
    kind: 'bouquet',
    occasions: ['birthday', 'thanks', 'just'],
    stems: ['Ranunculus', 'Anemones', 'Waxflower', 'Eucalyptus'],
    palette: ['#c9577f', '#e8b4bc', '#f3d3c4', '#7a2e5c'],
    seed: 11,
    sizes: true,
    badge: 'Florist’s choice',
  },
  {
    id: 'luxe',
    name: 'Hand-tied luxe',
    price: 65,
    blurb: 'Our fullest hand-tie, deep plums and blush, gift wrapped in tissue and tied with silk ribbon.',
    kind: 'bouquet',
    occasions: ['birthday', 'love', 'thanks'],
    stems: ['Garden roses', 'Ranunculus', 'Scabious', 'Silver dollar eucalyptus'],
    palette: ['#7a2e5c', '#b0457a', '#e8b4bc', '#f6e6df'],
    seed: 29,
    sizes: true,
    badge: 'Gift wrapped',
  },
  {
    id: 'meadow',
    name: 'Morning Meadow',
    price: 42,
    blurb: 'Butter yellows, cornflower blue and white. Looks like it was gathered on a walk, because that is the idea.',
    kind: 'bouquet',
    occasions: ['birthday', 'just', 'thanks'],
    stems: ['Craspedia', 'Cornflower', 'Feverfew', 'Grasses'],
    palette: ['#e9b949', '#f6efe3', '#8fa9d4', '#e8b4bc'],
    seed: 47,
    sizes: true,
  },
  {
    id: 'plum',
    name: 'Plum & Blush',
    price: 55,
    blurb: 'Dark, romantic and a little moody. Burgundy anemones against soft pinks and apricot.',
    kind: 'bouquet',
    occasions: ['love', 'birthday'],
    stems: ['Anemones', 'Spray roses', 'Astrantia', 'Copper beech'],
    palette: ['#5e2148', '#c9577f', '#f1c6cd', '#e39b74'],
    seed: 83,
    sizes: true,
  },
  {
    id: 'quiet',
    name: 'Quiet White',
    price: 48,
    blurb: 'Whites, creams and greens. Calm and simple, for when words are hard to find.',
    kind: 'bouquet',
    occasions: ['sympathy', 'thanks'],
    stems: ['White ranunculus', 'Lisianthus', 'Waxflower', 'Olive'],
    palette: ['#fffaf5', '#efe6da', '#dfe7d8', '#f5ece0'],
    seed: 5,
    sizes: true,
  },
  {
    id: 'jar',
    name: 'Hedgerow Jar',
    price: 38,
    blurb: 'A loose, country arrangement in a reusable glass jar. Arrives in water, ready for the table.',
    kind: 'vase',
    occasions: ['just', 'thanks', 'birthday'],
    stems: ['Sweet peas in season', 'Scabious', 'Chamomile', 'Grasses'],
    palette: ['#d9a441', '#c9577f', '#f6efe3', '#9fb7d6'],
    seed: 61,
    sizes: true,
  },
  {
    id: 'garden',
    name: 'Garden Vase',
    price: 70,
    blurb: 'A full arrangement in a ribbed glass vase that is theirs to keep. Big enough for a mantelpiece.',
    kind: 'vase',
    occasions: ['sympathy', 'love', 'birthday'],
    stems: ['Garden roses', 'Stock', 'Ranunculus', 'Eucalyptus'],
    palette: ['#e8b4bc', '#c9577f', '#fffaf5', '#7a2e5c'],
    seed: 97,
    sizes: true,
    badge: 'Vase included',
  },
  {
    id: 'posy',
    name: 'Little Posy',
    price: 24,
    blurb: 'Small, sweet and easy to post through a door. Lovely for a desk or a bedside.',
    kind: 'bouquet',
    occasions: ['just', 'thanks'],
    stems: ['Spray roses', 'Waxflower', 'Eucalyptus'],
    palette: ['#e9a37c', '#f6efe3', '#c9577f', '#f3d3c4'],
    seed: 13,
    sizes: false,
  },
  {
    id: 'olive',
    name: 'Olive tree in clay',
    price: 45,
    blurb: 'A young olive in a hand-thrown terracotta pot. Lasts for years with a sunny window and not much water.',
    kind: 'plant',
    occasions: ['thanks', 'just', 'sympathy'],
    stems: ['Olive tree, about 60cm', 'Terracotta pot and saucer', 'Care card'],
    palette: ['#8ea383', '#6f8f86', '#b9c4a7', '#c7774f'],
    seed: 3,
    sizes: false,
  },
  {
    id: 'dried',
    name: 'Dried wheat & bunny tails',
    price: 32,
    blurb: 'Natural wheat, bunny tail grass and dried palm. No water, no wilting, still looks good in a year.',
    kind: 'dried',
    occasions: ['just', 'birthday'],
    stems: ['Wheat', 'Bunny tail grass', 'Dried palm', 'Statice'],
    palette: ['#d8c3a5', '#c9a27a', '#efe6d6', '#a7765a'],
    seed: 71,
    sizes: false,
  },
  {
    id: 'sub-weekly',
    name: 'Weekly flowers',
    price: 30,
    blurb: 'A seasonal bouquet every week, on the same day.',
    kind: 'subscription',
    occasions: [],
    stems: ['Florist’s choice each week'],
    palette: ['#c9577f', '#e8b4bc', '#f3d3c4', '#7a2e5c'],
    seed: 17,
    sizes: false,
    every: 'every week',
    hidden: true,
  },
  {
    id: 'sub-fortnightly',
    name: 'Fortnightly flowers',
    price: 32,
    blurb: 'A seasonal bouquet every other week.',
    kind: 'subscription',
    occasions: [],
    stems: ['Florist’s choice each time'],
    palette: ['#e9b949', '#f6efe3', '#8fa9d4', '#e8b4bc'],
    seed: 23,
    sizes: false,
    every: 'every two weeks',
    hidden: true,
  },
  {
    id: 'sub-monthly',
    name: 'Monthly flowers',
    price: 35,
    blurb: 'One generous bouquet a month.',
    kind: 'subscription',
    occasions: [],
    stems: ['Florist’s choice each month'],
    palette: ['#5e2148', '#c9577f', '#f1c6cd', '#e39b74'],
    seed: 41,
    sizes: false,
    every: 'every month',
    hidden: true,
  },
]

export function productById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id)
}

export const FAQS: { q: string; a: string }[] = [
  {
    q: 'What does “order by 1pm” mean exactly?',
    a: 'Orders placed before 1pm Monday to Saturday are delivered the same afternoon within the BA1 and BA2 postcodes. After 1pm, the earliest date offered is the next delivery day.',
  },
  {
    q: 'Will it look exactly like the drawing?',
    a: 'It will look like the same bouquet. We buy what is best each morning, so a stem might be swapped for something similar in colour and size. We never swap down in value.',
  },
  {
    q: 'Do you send a photo?',
    a: 'Yes. When the flowers are handed over we send you a photo by email, so you know they arrived and how they looked.',
  },
  {
    q: 'How do subscriptions work?',
    a: 'Pick weekly, fortnightly or monthly and the first delivery date. You can pause, skip or stop online before 5pm the day before any delivery.',
  },
  {
    q: 'What if nobody is in?',
    a: 'We leave them somewhere safe if you have told us where, or with a neighbour. If neither works we bring them back to the studio and call you to rearrange.',
  },
]

export const WEDDING_STEPS: { title: string; body: string }[] = [
  { title: 'Consultation', body: 'An hour at the studio or at your venue. We talk colours, season, budget and the feel of the day.' },
  { title: 'Proposal', body: 'A written plan with a moodboard and a costed list, so you can see where every pound goes.' },
  { title: 'Trial posy', body: 'A small sample of your bouquet a month before, to be sure the colours are right.' },
  { title: 'On the day', body: 'We deliver, set up, pin buttonholes and come back for the vases afterwards.' },
]
