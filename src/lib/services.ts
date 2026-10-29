/**
 * Northbound Web's offer: fixed-price website builds and monthly management
 * plans.
 *
 * These are the real advertised prices, not illustrations. Only the Custom
 * build is variable ("from £349"), because its scope is agreed per project.
 * Do not reintroduce "example price" or "starting from" framing around the
 * £249 and £349 packages — they are the advertised prices.
 *
 * Everything a customer is promised lives in this file. Do not add
 * deliverables here that have not been agreed as part of the offer, and do not
 * promise unlimited fixes, updates or support anywhere.
 */

/** Management's starting monthly price, quoted wherever the free month is mentioned. */
export const ADVANCED_MANAGEMENT_PRICE = 39
/** The annual deal, stated the same way everywhere: twelve months for the price of ten. */
export const ANNUAL_TERMS =
  'Pay for a year up front and you get twelve months for the price of ten — the first and the last month free.'

export type BuildPackage = {
  slug: string
  name: string
  price: number
  /** True only where the price is a floor rather than the advertised figure. */
  variable?: boolean
  badge?: string
  summary: string
  bestFor: string
  includes: string[]
  /**
   * An estimate, never a guarantee. Always render alongside TIMELINE_TERMS so
   * the conditions the estimate depends on are never separated from it.
   */
  timeline: string
  /**
   * Query-string value used by /contact?package=… to preselect this package in
   * the enquiry form. Deliberately separate from `slug`, which is a live page
   * anchor (/services#advanced) and must not change.
   */
  enquiryParam: string
  /** Label for the card's call to action. */
  cta: string
  /** The short list on the home page's price sign. Must stay within `includes`. */
  highlights: string[]
  /** Shown as small print under the package — used to bound what is included. */
  note?: string
  /** Whether the package bundles a complimentary month of Advanced Management. */
  freeAdvancedMonth?: boolean
}

export const buildPackages: BuildPackage[] = [
  {
    slug: 'pro',
    name: 'Pro',
    price: 249,
    badge: 'Most popular',
    summary:
      'A proper small-business site: every page designed for mobile and desktop, with bookings handled for you.',
    bestFor:
      'Sole traders and small teams who take enquiries and bookings and want to look the part.',
    includes: [
      'Up to 5 pages, each designed for mobile and desktop',
      'Contact form and basic SEO',
      'Booking setup for one staff calendar, with email confirmations',
      '1 revision round',
    ],
    timeline: 'Approximately 7–10 working days',
    enquiryParam: 'pro',
    cta: 'Choose Pro',
    highlights: [
      'Up to 5 pages, designed for mobile and desktop',
      'Contact form and basic SEO',
      'Booking setup for one staff calendar, with email confirmations',
      '1 round of revisions',
    ],
  },
  {
    slug: 'ultimate',
    name: 'Ultimate',
    price: 349,
    freeAdvancedMonth: true,
    summary:
      'More pages, local search set up properly, and a booking system that runs a whole team.',
    bestFor:
      'Businesses with several services or staff, where bookings and local search matter.',
    includes: [
      'Up to 8 pages, each designed for mobile and desktop',
      'Contact form and basic SEO',
      'Local SEO setup',
      'Booking setup for multiple staff calendars, with reminders, booking payments, cancellation and rescheduling, and custom questions',
      '2 revision rounds',
    ],
    timeline: 'Approximately 10–15 working days',
    enquiryParam: 'ultimate',
    cta: 'Choose Ultimate',
    highlights: [
      'Up to 8 pages, designed for mobile and desktop',
      'Contact form, basic and local SEO',
      'Booking setup for several staff calendars, with reminders, payments, cancelling and rescheduling',
      '2 rounds of revisions',
    ],
    note: 'Booking payments run through Stripe, so card details never touch the website. Stripe\'s own fees apply to each payment.',
  },
  {
    slug: 'custom',
    name: 'Custom',
    price: 349,
    variable: true,
    freeAdvancedMonth: true,
    summary:
      'For work that does not fit a package. Pages, functionality, booking needs and SEO scope are agreed up front.',
    bestFor:
      'Web applications, integrations, and businesses with specific requirements.',
    includes: [
      'Pages, functionality, booking needs and SEO scope agreed upfront',
      'Bespoke integrations where needed',
      'Revisions and timeline set in your quote',
    ],
    timeline: 'Agreed with your brief',
    enquiryParam: 'custom',
    cta: 'Discuss a Custom build',
    highlights: [
      'Pages, features and SEO agreed up front',
      'Bespoke integrations where you need them',
      'Revisions and timeline set in your quote',
      'Accounts, databases, payments, portals and shops are quoted separately',
    ],
    note: '£349 is where a custom project starts, not what every custom project costs. Substantial functionality — user accounts, databases, payments, customer portals, ecommerce and the like — is not included in that starting price. Anything of that kind is scoped and quoted separately before any work begins.',
  },
]

export type ManagementPlan = {
  slug: string
  name: string
  price: number
  summary: string
  /**
   * The benefits of the plan. Change time is deliberately NOT listed here — a
   * plan is looking after the site, not a block of hours sold by the month.
   * It goes in `changeTime`, rendered below the benefits.
   */
  includes: string[]
  changeTime: string
  /** `changeTime` in a few words, for the home page's management sign. */
  changeTimeShort: string
  /** See BuildPackage.enquiryParam. */
  enquiryParam: string
  /** Label for the card's call to action. */
  cta: string
}

export const managementPlans: ManagementPlan[] = [
  {
    slug: 'pro-management',
    name: 'Pro Management',
    price: 39,
    summary:
      'Keeps the site online, secure and current, with hosting included while the plan is active.',
    includes: [
      'Hosting included while the plan is active',
      'Security and dependency maintenance, where applicable',
      'Uptime monitoring',
      'Safety and security fixes never count against your hours',
    ],
    changeTime:
      'Includes up to 2 hours of requested website updates per billing month.',
    changeTimeShort: 'Up to 2 hours of updates a month',
    enquiryParam: 'pro-management',
    cta: 'Choose Pro Management',
  },
  {
    slug: 'ultimate-management',
    name: 'Ultimate Management',
    price: 39,
    summary:
      'Twice the update time, a regular look at how the site is performing, and your requests go up the queue.',
    includes: [
      'Everything in Pro Management',
      'Analytics and performance check',
      'Priority support — your requests go ahead of Pro Management ones in the queue',
      'Safety and security fixes never count against your hours',
    ],
    changeTime:
      'Includes up to 4 hours of requested website updates per billing month.',
    changeTimeShort: 'Up to 4 hours of updates a month',
    enquiryParam: 'ultimate-management',
    cta: 'Choose Ultimate Management',
  },
  {
    slug: 'custom-management',
    name: 'Custom Management',
    price: 39,
    summary:
      'For custom builds and web applications, where what needs looking after is agreed alongside the build.',
    includes: [
      'Everything in Ultimate Management',
      'Monitoring and maintenance scoped to what was built',
      'Quoted with your Custom build',
    ],
    changeTime:
      'Update time is agreed in your quote.',
    changeTimeShort: 'Quoted with your build',
    enquiryParam: 'custom-management',
    cta: 'Discuss Custom Management',
  },
]

/**
 * The terms that bound every management plan. Shown wherever plans are, so the
 * limits are as visible as the features.
 */
export const managementTerms = [
  'Unused change time does not roll over from one billing month to the next.',
  'Additional work beyond the included allowance can be quoted separately.',
  'Priority support means Ultimate Management requests are handled ahead of Pro Management ones. It is a place in the queue rather than a guaranteed response time.',
  'Safety and security work — patching, certificate renewals, fixing something that has broken — is done as part of the plan and never counts against your update hours.',
  'You can cancel before your next billing date, which stops future renewals. Amounts already charged for the current billing period are not partially refunded if you cancel part-way through it.',
  'If you end a plan, I will set out your options — either continuing hosting separately, where that is available, or transferring the website to another suitable hosting provider.',
  'A management plan is optional. It is not a condition of having a website built.',
]

/** Stated wherever the free first month is mentioned. */
export const COMPLIMENTARY_MONTH_TERMS =
  'Your first month of management is free. It does not turn into a paid subscription automatically — when it ends, you decide whether to carry on, and if you do nothing, nothing is charged.'

/**
 * The conditions every timeline estimate depends on. Render this wherever a
 * `timeline` is shown; an estimate separated from its conditions reads as a
 * guarantee, which is exactly what these are not.
 */
export const TIMELINE_TERMS =
  'Estimates, not guarantees. The clock starts once the deposit has been received and I have the information, content and assets needed to begin. Delays in content, feedback or approvals can move the completion date.'

/**
 * The practical commercial terms, shown on the services page. Wording here is
 * deliberately bounded — read the constraints at the top of this file before
 * editing any of it.
 */
export const commercialTerms: { title: string; points: string[] }[] = [
  {
    title: 'Payment',
    points: [
      'A 50% deposit secures your project and allows work to begin — £124.50 on Pro, £174.50 on Ultimate.',
      'The remaining 50% is payable once the website is complete and approved, before it goes live.',
      'Northbound is not VAT registered, so no VAT is added to any price.',
      'Hosting, domains and third-party provider fees are separate unless a plan or quote says otherwise.',
    ],
  },
  {
    title: 'Timescales',
    points: [
      'Pro — approximately 7–10 working days.',
      'Ultimate — approximately 10–15 working days.',
      'Custom — agreed individually in your written quote.',
      TIMELINE_TERMS,
    ],
  },
  {
    title: 'Revisions and feedback',
    points: [
      'Each package includes a set number of revision rounds — one on Pro, two on Ultimate. Custom is agreed in your quote.',
      'Please send the feedback for each round within 10 working days of getting the preview link.',
      'If it arrives later than that, the project may be paused and the estimated completion date may move.',
      'Silence is never treated as approval. If I have not heard from you, I will follow up rather than sign the work off on your behalf.',
    ],
  },
  {
    title: 'Domains',
    points: [
      'Your domain should be owned and controlled by you.',
      'I can help you buy one, configure it, and connect it to your site.',
      'Domain registration and renewal charges are separate, unless a written quote says otherwise.',
    ],
  },
  {
    title: 'Content and images',
    points: [
      'You normally supply your business information, any branding or logo files you have, specific photographs you want used, accurate service or product details, and your contact information.',
      'I format and structure what you send, and make reasonable improvements to it as part of the build.',
      'Professional copywriting, photography, logo or brand design, and paid stock assets are not included in the fixed packages. Anything substantially outside a package can be quoted separately.',
      'Waiting on content is the most common reason a project runs past its estimate.',
    ],
  },
]

/** The steps a project actually runs through, used on the home and approach pages. */
export const process = [
  {
    step: '01',
    title: 'Conversation',
    body: 'A call to work out what the site is for, who it is talking to, and which package fits. No charge and no obligation — and if a smaller package would do the job, that is the one I will point you at.',
  },
  {
    step: '02',
    title: 'Confirmation',
    body: 'You know the price before anything starts, because it is published. For a Custom build, the scope and the final figure are agreed in writing first. A 50% deposit secures the project, and the remaining 50% is payable once the site is complete and approved, before it goes live.',
  },
  {
    step: '03',
    title: 'Design',
    body: 'Structure and layout first, then the visual design, reviewed with you before a line of production code is written. Changing a design is cheap; changing a built site is not.',
  },
  {
    step: '04',
    title: 'Build',
    body: 'Built in the open on a live preview link you can check at any point. Most packages take somewhere between one and three weeks, counted from the deposit and the arrival of your content — an estimate rather than a promise, since it moves if content or feedback is slow.',
  },
  {
    step: '05',
    title: 'Revisions',
    body: 'Your package includes a set number of revision rounds — one on Pro, two on Ultimate. A round means you collect your changes, send them over, and I work through them together. Feedback within 10 working days of the preview keeps things moving; later than that and the finish date can shift. I will never take silence as approval.',
  },
  {
    step: '06',
    title: 'Launch',
    body: 'Testing across real devices, then a careful DNS switch — planned in advance so nothing goes dark. Handover comes with documentation you can actually use, and a management plan afterwards is entirely optional.',
  },
]

/** Standards applied to every build — the differentiator, so stated plainly. */
export const standards = [
  {
    title: 'Fast by default',
    body: 'Pages are pre-rendered and served from a global edge network. Performance is a design constraint from the start, not an optimisation pass bolted on at the end when it is too late to fix cheaply.',
  },
  {
    title: 'Accessible',
    body: 'Real semantic HTML, keyboard navigation, sensible contrast and labelled form fields. It is the right thing to do, it is better for search, and in the UK accessibility is increasingly a legal expectation rather than a nice-to-have.',
  },
  {
    title: 'Secure',
    body: 'Secrets stay server-side and never reach the browser. Forms validate on the server, not just in the page. Where a project stores data, access rules are enforced by the database rather than by trusting the front end to behave.',
  },
  {
    title: 'Yours to keep',
    body: 'Every project lives in a Git repository you own, with full history. No proprietary page builder, no hostage situation. If you ever want to take it to another developer, you hand over a repo and they get to work.',
  },
  {
    title: 'Privacy-conscious',
    body: 'Analytics configured to answer business questions without hoovering up personal data. UK GDPR is considered when the system is designed rather than patched in after someone asks about it.',
  },
  {
    title: 'Monitored',
    body: 'Sites are built so that downtime can be spotted by monitoring rather than by a customer emailing to say the contact form has been broken for a fortnight. Uptime monitoring is part of every management plan.',
  },
]

/** The home page's route: three junctions from first message to a live site. */
export const junctions = [
  {
    code: 'J1',
    title: 'Tell us the plan',
    body: 'Your business, what you want from it, and what the website needs to do.',
  },
  {
    code: 'J2',
    title: 'Make it yours',
    body: 'We agree the brief and build the first version, then refine it with you.',
  },
  {
    code: 'J3',
    title: 'Put it out there',
    body: "Once you've approved it and paid the balance, it goes live. Management keeps it running, if you want it to.",
  },
]
