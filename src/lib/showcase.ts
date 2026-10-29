/**
 * Demo websites for the home page wall and /demos/[slug].
 *
 * Every business here is invented to show what a Northbound site can look
 * like, and each demo page says so in a bar at the top. No real names, no
 * testimonials, no review counts: a made-up business with made-up praise
 * would still read as social proof. Prices shown belong to the pretend
 * business, not to Northbound.
 */

export type DemoVariant = 'split' | 'centered' | 'editorial' | 'bold'
export type DemoFont = 'sans' | 'serif' | 'grotesk'

export type Demo = {
  slug: string
  name: string
  trade: string
  place: string
  variant: DemoVariant
  font: DemoFont
  /** Colours: page, text, accent, text on accent, soft panel, quiet text. */
  c: { bg: string; ink: string; accent: string; on: string; soft: string; muted: string }
  kicker: string
  headline: string
  sub: string
  ctaA: string
  ctaB: string
  /** What the business sells, with the pretend business's own prices. */
  menu: { name: string; price: string; note: string }[]
  points: { title: string; body: string }[]
  hours: string
  /** What this demo shows off about a Northbound build. */
  shows: string[]
}

export const demos: Demo[] = [
  {
    slug: 'heating',
    name: 'Thornley Heating',
    trade: 'Heating engineer',
    place: 'Wakefield',
    variant: 'split',
    font: 'sans',
    c: { bg: '#ffffff', ink: '#0c1f3f', accent: '#d7261e', on: '#ffffff', soft: '#f0f3f7', muted: '#4a5a72' },
    kicker: 'Boiler down?',
    headline: "We'll have you warm again today.",
    sub: 'Gas Safe heating engineers covering the district. A fixed price before any work starts.',
    ctaA: 'Book a visit',
    ctaB: 'Get a price',
    menu: [
      { name: 'Boiler repair', price: 'From £85', note: 'Fixed price agreed before we start' },
      { name: 'Annual service', price: '£70', note: 'Includes safety certificate' },
      { name: 'New boiler', price: 'Free survey', note: 'Written quote within two days' },
    ],
    points: [
      { title: 'Same-day callouts', body: 'Book before 11am for a visit the same day, Monday to Saturday.' },
      { title: 'Price first', body: 'You get the figure before we pick up a spanner.' },
      { title: 'Text updates', body: 'A message when the engineer is on the way.' },
    ],
    hours: 'Mon–Sat · 8am–6pm',
    shows: ['Online booking', 'Prices up front', 'Fast on a phone'],
  },
  {
    slug: 'bakery',
    name: 'Saltmarsh Bakehouse',
    trade: 'Bakery and café',
    place: 'Whitstable',
    variant: 'editorial',
    font: 'serif',
    c: { bg: '#f6f1e7', ink: '#20301f', accent: '#2f4a2c', on: '#f6f1e7', soft: '#ebe3d2', muted: '#5b6650' },
    kicker: 'Open today 7am – 3pm',
    headline: 'Bread worth the queue.',
    sub: 'Sourdough, buns and coffee from a little shop by the harbour. Order ahead and skip the line.',
    ctaA: 'Order ahead',
    ctaB: 'See the menu',
    menu: [
      { name: 'Country sourdough', price: '£4.80', note: 'Baked from 4am, every day' },
      { name: 'Cardamom bun', price: '£3.20', note: 'Gone by eleven on Saturdays' },
      { name: 'Celebration cakes', price: 'From £38', note: 'Order 48 hours ahead' },
    ],
    points: [
      { title: 'Order for collection', body: 'Pick a time, pay online, walk past the queue.' },
      { title: 'A real menu', body: 'A page, not a PDF. Updated the moment something sells out.' },
      { title: 'Today’s hours, first', body: 'Open or closed, right at the top.' },
    ],
    hours: 'Tue–Sun · 7am–3pm',
    shows: ['Order ahead', 'Live menu', 'Editorial type'],
  },
  {
    slug: 'lashes',
    name: 'Kestrel Lash Studio',
    trade: 'Lash and brow technician',
    place: 'Mobile, Hampshire',
    variant: 'centered',
    font: 'serif',
    c: { bg: '#fff5f6', ink: '#3a0f22', accent: '#b0245c', on: '#ffffff', soft: '#fbe3ea', muted: '#7a4a5c' },
    kicker: 'Lashes · Brows · Mobile',
    headline: 'Book in seconds. Not in DMs.',
    sub: 'Classic, hybrid and volume sets at your door. Pick a time, pay a small deposit, done.',
    ctaA: 'Book now',
    ctaB: 'Prices',
    menu: [
      { name: 'Classic full set', price: '£45', note: 'About 90 minutes' },
      { name: 'Volume full set', price: '£60', note: 'About 2 hours' },
      { name: 'Brow lamination', price: '£35', note: 'Includes tint' },
    ],
    points: [
      { title: 'Deposit on booking', body: 'Taken securely, so the slot is really yours.' },
      { title: 'Reminders sent', body: 'A day before and two hours before.' },
      { title: 'Patch tests sorted', body: 'Booked automatically for first-time clients.' },
    ],
    hours: 'Mon–Sat · by appointment',
    shows: ['Deposits', 'Reminders', 'Booking in three taps'],
  },
  {
    slug: 'grooming',
    name: 'Bramble & Bone',
    trade: 'Dog groomer',
    place: 'Harrogate',
    variant: 'split',
    font: 'grotesk',
    c: { bg: '#f4fbfa', ink: '#0b3b38', accent: '#0f766e', on: '#ffffff', soft: '#d9f0ec', muted: '#3f6662' },
    kicker: 'Dog grooming · Two groomers',
    headline: 'Clean dog. Happy dog.',
    sub: 'Full grooms, baths and nails. Prices by size, booked online with either groomer.',
    ctaA: 'Book a groom',
    ctaB: 'See prices',
    menu: [
      { name: 'Small dog groom', price: 'From £32', note: 'Bath, dry, trim, nails' },
      { name: 'Medium dog groom', price: 'From £40', note: 'About two hours' },
      { name: 'Large dog groom', price: 'From £52', note: 'Double coats welcome' },
    ],
    points: [
      { title: 'Two calendars, one page', body: 'Book whichever groomer is free first.' },
      { title: 'Prices by size', body: 'No phoning round to find out what it costs.' },
      { title: 'Collection texts', body: 'A message when your dog is ready.' },
    ],
    hours: 'Tue–Sat · 8.30am–5pm',
    shows: ['Multi-staff booking', 'Price tables', 'Text alerts'],
  },
  {
    slug: 'barber',
    name: 'Fade & Fellow',
    trade: 'Barber',
    place: 'Sheffield',
    variant: 'bold',
    font: 'grotesk',
    c: { bg: '#111111', ink: '#f4f1ea', accent: '#e8b13a', on: '#111111', soft: '#1f1f1f', muted: '#a6a197' },
    kicker: 'Walk-ins welcome · Or skip the wait',
    headline: 'Sharp cuts. No waiting around.',
    sub: 'See live wait times, book the next free chair, and get a text when you’re up.',
    ctaA: 'Book a chair',
    ctaB: 'Wait times',
    menu: [
      { name: 'Skin fade', price: '£22', note: '40 minutes' },
      { name: 'Cut and beard', price: '£28', note: 'Hot towel finish' },
      { name: 'Kids’ cut', price: '£14', note: 'Under 12s' },
    ],
    points: [
      { title: 'Live queue', body: 'See how long the wait is before you leave the house.' },
      { title: 'Pick your barber', body: 'Each one has their own calendar.' },
      { title: 'Text when you’re up', body: 'Grab a coffee instead of a seat.' },
    ],
    hours: 'Mon–Sat · 9am–7pm',
    shows: ['Live wait times', 'Dark theme', 'Per-barber calendars'],
  },
  {
    slug: 'florist',
    name: 'Wild Stem',
    trade: 'Florist',
    place: 'Bath',
    variant: 'editorial',
    font: 'serif',
    c: { bg: '#fbf6f2', ink: '#2c1d2b', accent: '#7a2e5c', on: '#ffffff', soft: '#f1e4ea', muted: '#6b5562' },
    kicker: 'Same-day delivery across the city',
    headline: 'Flowers that look like they were picked this morning.',
    sub: 'Seasonal bouquets, weddings and weekly arrangements. Order by 1pm for delivery today.',
    ctaA: 'Send flowers',
    ctaB: 'Weddings',
    menu: [
      { name: 'Seasonal bouquet', price: 'From £35', note: 'Florist’s choice' },
      { name: 'Hand-tied luxe', price: '£65', note: 'Gift wrapped' },
      { name: 'Wedding flowers', price: 'From £450', note: 'Consultation included' },
    ],
    points: [
      { title: 'Order by 1pm', body: 'Delivered the same day, with a photo when it arrives.' },
      { title: 'Card message', body: 'Written by hand, typed by you at checkout.' },
      { title: 'Subscriptions', body: 'Weekly or monthly flowers, pause any time.' },
    ],
    hours: 'Mon–Sat · 8am–5pm',
    shows: ['Online shop', 'Delivery cut-offs', 'Subscriptions'],
  },
  {
    slug: 'electrician',
    name: 'Brightline Electrical',
    trade: 'Electrician',
    place: 'Leicester',
    variant: 'bold',
    font: 'sans',
    c: { bg: '#0b1d3a', ink: '#ffffff', accent: '#ffd60a', on: '#0b1d3a', soft: '#132a52', muted: '#a9b8d4' },
    kicker: 'NICEIC approved contractor',
    headline: 'Power on. Problem sorted.',
    sub: 'Fault finding, rewires, EV chargers and certificates for landlords. Upload a photo for a quick price.',
    ctaA: 'Get a quote',
    ctaB: 'EV chargers',
    menu: [
      { name: 'EICR certificate', price: 'From £120', note: 'Landlords and sales' },
      { name: 'EV charger fitted', price: 'From £795', note: 'Grant-checked for you' },
      { name: 'Fault finding', price: '£75 first hour', note: 'Then by the half hour' },
    ],
    points: [
      { title: 'Photo quotes', body: 'Snap the fuse box, get a ballpark the same day.' },
      { title: 'Certificates online', body: 'Download yours whenever you need it.' },
      { title: 'Clean and tidy', body: 'Dust sheets down, everything back as it was.' },
    ],
    hours: 'Mon–Fri · 7.30am–5.30pm',
    shows: ['Photo upload quotes', 'Document downloads', 'Bold colour'],
  },
  {
    slug: 'windows',
    name: 'Clearwater',
    trade: 'Window cleaner',
    place: 'Swindon',
    variant: 'centered',
    font: 'grotesk',
    c: { bg: '#eef7ff', ink: '#082f49', accent: '#0284c7', on: '#ffffff', soft: '#d6ecfb', muted: '#3c6380' },
    kicker: 'Every four or eight weeks',
    headline: 'Price your clean in ten seconds.',
    sub: 'Pick your house type and how often. See the price, book the round, pay by card after each clean.',
    ctaA: 'Get my price',
    ctaB: 'How it works',
    menu: [
      { name: 'Terrace', price: '£12', note: 'Every four weeks' },
      { name: 'Three-bed semi', price: '£16', note: 'Every four weeks' },
      { name: 'Detached', price: 'From £20', note: 'Conservatory extra' },
    ],
    points: [
      { title: 'Instant prices', body: 'No visit needed for a standard house.' },
      { title: 'Pay after each clean', body: 'A card link by text when we have been.' },
      { title: 'Skip a round', body: 'One tap if you are away.' },
    ],
    hours: 'Rounds Mon–Fri',
    shows: ['Instant quote calculator', 'Recurring payments', 'Text links'],
  },
  {
    slug: 'personal-trainer',
    name: 'Ironfield PT',
    trade: 'Personal trainer',
    place: 'Bristol',
    variant: 'bold',
    font: 'grotesk',
    c: { bg: '#f2f2ee', ink: '#141414', accent: '#ff4d1a', on: '#ffffff', soft: '#e4e4dc', muted: '#55554f' },
    kicker: 'Small-group and one-to-one',
    headline: 'Get strong. Stay consistent.',
    sub: 'Book sessions, track your plan and message your coach, all in one place.',
    ctaA: 'Book a taster',
    ctaB: 'Timetable',
    menu: [
      { name: 'Taster session', price: '£10', note: 'First session only' },
      { name: 'Small group (6)', price: '£12', note: 'Per session' },
      { name: 'One-to-one', price: '£40', note: '45 minutes' },
    ],
    points: [
      { title: 'Live timetable', body: 'See spaces left and book in two taps.' },
      { title: 'Member log-in', body: 'Your plan and progress in one place.' },
      { title: 'Packs and memberships', body: 'Paid online, renewed automatically.' },
    ],
    hours: 'Mon–Sun · 6am–8pm',
    shows: ['Class timetable', 'Member accounts', 'Memberships'],
  },
  {
    slug: 'tattoo',
    name: 'Black Fern Tattoo',
    trade: 'Tattoo studio',
    place: 'Manchester',
    variant: 'editorial',
    font: 'serif',
    c: { bg: '#0d0d0d', ink: '#ece8e1', accent: '#c9a96e', on: '#0d0d0d', soft: '#1a1a1a', muted: '#9c968c' },
    kicker: 'Custom work · Three resident artists',
    headline: 'Tell us the idea. We’ll draw the rest.',
    sub: 'Browse each artist’s style, send your idea with references, and pay the deposit to lock the date.',
    ctaA: 'Start a booking',
    ctaB: 'Our artists',
    menu: [
      { name: 'Small piece', price: 'From £80', note: 'Up to palm size' },
      { name: 'Half day', price: '£280', note: 'About four hours' },
      { name: 'Full day', price: '£500', note: 'Large custom work' },
    ],
    points: [
      { title: 'Idea form', body: 'Upload references and placement photos in one go.' },
      { title: 'Artist portfolios', body: 'Filter by style before you choose.' },
      { title: 'Deposits', body: 'Taken online, counted off the final price.' },
    ],
    hours: 'Tue–Sat · 11am–7pm',
    shows: ['Image uploads', 'Portfolios', 'Dark editorial'],
  },
  {
    slug: 'garage',
    name: 'Northgate Motors',
    trade: 'Garage and MOT centre',
    place: 'Preston',
    variant: 'split',
    font: 'sans',
    c: { bg: '#ffffff', ink: '#101828', accent: '#16a34a', on: '#ffffff', soft: '#eef6f0', muted: '#4b5563' },
    kicker: 'MOT · Servicing · Repairs',
    headline: 'Book your MOT in under a minute.',
    sub: 'Enter your reg, pick a time, and we’ll text you when it’s done. Reminders every year, free.',
    ctaA: 'Book an MOT',
    ctaB: 'Servicing',
    menu: [
      { name: 'MOT', price: '£45', note: 'Free retest within 10 days' },
      { name: 'Interim service', price: '£119', note: 'Oil, filter, 40-point check' },
      { name: 'Full service', price: '£189', note: 'Manufacturer schedule' },
    ],
    points: [
      { title: 'Reg lookup', body: 'Your car’s details filled in for you.' },
      { title: 'Yearly reminders', body: 'A text a month before your MOT is due.' },
      { title: 'Approve repairs online', body: 'See photos and prices, then say yes or no.' },
    ],
    hours: 'Mon–Fri · 8am–5.30pm · Sat 8am–12pm',
    shows: ['Reg lookup', 'Reminders', 'Online approvals'],
  },
  {
    slug: 'photographer',
    name: 'Harbour Light',
    trade: 'Wedding photographer',
    place: 'Cornwall',
    variant: 'centered',
    font: 'serif',
    c: { bg: '#faf8f5', ink: '#2a2622', accent: '#8a6a4a', on: '#ffffff', soft: '#efe9e1', muted: '#6e665d' },
    kicker: 'Weddings and elopements',
    headline: 'Quiet, honest photographs of your day.',
    sub: 'Check your date, see what’s included, and get your gallery delivered online within six weeks.',
    ctaA: 'Check my date',
    ctaB: 'Packages',
    menu: [
      { name: 'Elopement', price: '£650', note: 'Up to three hours' },
      { name: 'Half day', price: '£1,150', note: 'Ceremony to first dance' },
      { name: 'Full day', price: '£1,650', note: 'Prep to evening' },
    ],
    points: [
      { title: 'Date checker', body: 'See straight away whether your day is free.' },
      { title: 'Private galleries', body: 'Password protected, download in full size.' },
      { title: 'Plan online', body: 'Timings and must-have shots in a shared form.' },
    ],
    hours: 'Replies within two working days',
    shows: ['Availability checker', 'Client galleries', 'Calm serif design'],
  },
]

export const demoBySlug = (slug: string) => demos.find((d) => d.slug === slug)
