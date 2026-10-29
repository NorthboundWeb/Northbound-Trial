/**
 * Saltmarsh Bakehouse — made-up bakery in Whitstable. Prices are the pretend
 * business's own, in pence. Nothing here is sent anywhere.
 */

export type Category = 'bread' | 'buns' | 'cakes' | 'coffee'

export type ArtKind =
  | 'boule'
  | 'rye'
  | 'tin'
  | 'fougasse'
  | 'bun'
  | 'knot'
  | 'croissant'
  | 'pain'
  | 'roll'
  | 'cakeLemon'
  | 'cakeChoc'
  | 'galette'
  | 'cup'
  | 'filter'
  | 'beans'

export type Item = {
  id: string
  name: string
  /** Price in pence. */
  price: number
  note: string
  cat: Category
  art: ArtKind
  soldOut?: boolean
  /** Hours of notice needed before collection. */
  notice?: number
}

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'bread', label: 'Bread' },
  { id: 'buns', label: 'Buns & pastries' },
  { id: 'cakes', label: 'Cakes' },
  { id: 'coffee', label: 'Coffee' },
]

export const ITEMS: Item[] = [
  { id: 'sourdough', name: 'Country sourdough', price: 480, note: 'Baked from 4am, every day', cat: 'bread', art: 'boule' },
  { id: 'rye', name: 'Seeded rye', price: 520, note: 'Sunflower, pumpkin and linseed', cat: 'bread', art: 'rye' },
  { id: 'tin', name: 'Harbour white tin', price: 390, note: 'Soft crumb, for toast and sandwiches', cat: 'bread', art: 'tin' },
  { id: 'fougasse', name: 'Olive & rosemary fougasse', price: 420, note: 'Torn and shared, best warm', cat: 'bread', art: 'fougasse', soldOut: true },
  { id: 'cardamom', name: 'Cardamom bun', price: 320, note: 'Gone by eleven on Saturdays', cat: 'buns', art: 'bun' },
  { id: 'cinnamon', name: 'Cinnamon knot', price: 320, note: 'Brown butter and muscovado', cat: 'buns', art: 'knot' },
  { id: 'croissant', name: 'Butter croissant', price: 260, note: 'Laminated over three days', cat: 'buns', art: 'croissant' },
  { id: 'pain', name: 'Pain au chocolat', price: 290, note: 'Two batons of dark chocolate', cat: 'buns', art: 'pain', soldOut: true },
  { id: 'roll', name: 'Pork & fennel sausage roll', price: 380, note: 'Rough puff, flaky salt', cat: 'buns', art: 'roll' },
  { id: 'lemon', name: 'Lemon & elderflower cake', price: 3800, note: 'Celebration cake, serves 12', cat: 'cakes', art: 'cakeLemon', notice: 48 },
  { id: 'choc', name: 'Chocolate & sea salt cake', price: 4200, note: 'Celebration cake, serves 12', cat: 'cakes', art: 'cakeChoc', notice: 48 },
  { id: 'galette', name: 'Seasonal fruit galette', price: 1800, note: 'Whole, serves 6. Fruit changes weekly', cat: 'cakes', art: 'galette' },
  { id: 'flat', name: 'Flat white', price: 330, note: 'Ready at your collection time', cat: 'coffee', art: 'cup' },
  { id: 'filter', name: 'Filter coffee', price: 280, note: 'This week: a washed coffee, bright and clean', cat: 'coffee', art: 'filter' },
  { id: 'beans', name: 'House beans, 250g', price: 850, note: 'Whole bean or ground for you', cat: 'coffee', art: 'beans' },
]

export const MAX_QTY = 12

export const DAY_PLAN: { time: string; title: string; body: string }[] = [
  { time: '4.00am', title: 'The ovens go on', body: 'Yesterday’s dough comes out of the cold room and gets its last shape.' },
  { time: '5.30am', title: 'First loaves out', body: 'Sourdough cools on the racks by the window. The street smells of crust.' },
  { time: '7.00am', title: 'Doors open', body: 'Order-ahead bags are lined up by the side hatch, names on, ready.' },
  { time: '11.00am', title: 'Buns run low', body: 'On Saturdays the cardamom buns are usually gone by now. Order ahead to keep one.' },
  { time: '3.00pm', title: 'Closed, starter fed', body: 'We mix tomorrow’s dough and leave it to prove slowly overnight.' },
]

export const FAQS: { q: string; a: string }[] = [
  {
    q: 'How does ordering ahead work?',
    a: 'Add what you want, pick a day and a collection time, and pay online. Your bag waits at the side hatch with your name on it, so you can walk past the queue.',
  },
  {
    q: 'How much notice do celebration cakes need?',
    a: 'Forty-eight hours. The order form only shows collection times that give us enough notice, so you cannot pick one that is too soon.',
  },
  {
    q: 'Do you list allergens?',
    a: 'Yes. Every item has a full allergen sheet on the counter, and you can add a note to your order. We bake with wheat, nuts, sesame and dairy in one small room, so we cannot promise anything is free from traces.',
  },
  {
    q: 'What happens to bread that does not sell?',
    a: 'Day-old loaves go into a half-price basket by the door until we close. Anything left after that goes to a local food bank.',
  },
  {
    q: 'Can I bring my dog?',
    a: 'Of course. There is a water bowl by the bench outside, and the odd crust for good behaviour.',
  },
]
