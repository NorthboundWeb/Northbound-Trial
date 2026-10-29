# Demo websites: the contract

Twelve made-up small businesses, each built as a real, working demo website.
They are Northbound Web's shop window: the home page wall shows their first
screens drifting past, and each one opens at `/demos/<slug>` as a full site.

The bar is "would a real owner pay for this today". Each demo must feel like a
different studio-quality site, not a recoloured template.

## Files (one folder per demo, nothing shared between demos)

```
src/components/demos/<slug>/index.tsx      // exports Site and Shot
src/components/demos/<slug>/styles.module.css
```

Optional extra files inside the same folder (`parts.tsx`, `data.ts`) are fine.
**Do not edit any file outside your own demo folders.** The registry
(`src/components/demos/registry.ts`), the `/demos/[slug]` page and the wall
are wired by the integrator.

### `index.tsx` must export exactly

```tsx
/** The full interactive site. Rendered at /demos/<slug> under a thin
 *  "Concept site by Northbound" bar (40px, sticky, already provided). */
export function Site(): React.JSX.Element

/** The first screen only, for the home page wall: a static, light render at
 *  exactly 1280×800 CSS px, overflow hidden, no hooks, no state, no effects,
 *  no event handlers, no links, no images that load. It must look like the
 *  top of Site (same nav, same hero) so a click from the wall lands on what
 *  was shown. It will be drawn 36 times on one page, so keep it lean
 *  (well under ~60 elements). */
export function Shot(): React.JSX.Element
```

Put `'use client'` at the top of `index.tsx` (Site uses state). Shot must
still be pure (no hooks) so it is safe to render many times.

## Content

- The business, its name, trade, place, colours and prices are in
  `src/lib/showcase.ts` (look up your slug). Use those as the starting point;
  you may extend them (more menu items, sections, FAQs) inside your folder.
  You may adjust a colour if contrast needs it.
- Every business is fictional. **No testimonials, star ratings, review
  counts, "trusted by", award badges, years-in-business or customer counts.**
  A made-up business with made-up praise still reads as fake social proof.
- No real brand names, logos or people. No stock-photo URLs or external
  images at all. Visuals are drawn: CSS gradients, shapes, inline SVG
  illustration, patterns, type. Make them good: this is where 10/10 lives.
- No phone-call buttons that dial (`tel:` links) — use "Book", "Message",
  "Get a quote". A displayed phone number is fine as text.
- Each demo has a short legal-free footer: business name, place, hours, and a
  line "Concept site by Northbound Web. This business is made up."

## Each Site must have

1. A real navigation bar (sticky within the page, below the 40px concept bar,
   so use `top: 40px`) with in-page anchor links that smooth-scroll, and a
   working mobile menu.
2. A hero that would stop someone scrolling, unique to the business.
3. At least four further sections (services/prices, about, how it works,
   FAQ, hours/location, gallery made of drawn panels… whatever suits).
4. **One or two genuinely working features** (listed below for each slug).
   Everything runs in the browser; nothing is sent anywhere. On "submit",
   show a proper confirmation state (summary of what they chose, a made-up
   reference) and a small note: "Demo only: nothing has been sent."
5. A final call to action and footer.

## Quality rules

- TypeScript strict, React 19, Next 16 App Router. No new npm packages. No
  `any`. Compile-clean by reading carefully: there is no local build.
- ESLint rules in force: `react-hooks` (incl. no synchronous `setState`
  directly inside `useEffect` bodies; no `Date.now()`, `Math.random()` or
  `new Date()` during render — compute in event handlers, `useState`
  initialisers called lazily are NOT safe either for impure values; use an
  effect that sets state in a `setTimeout(…, 0)` or compute on click),
  `@next/next/no-img-element` (you will not need img anyway).
- Styles only in your CSS module. Class names via `styles.x`. You may use
  `:global()` only for nothing; do not style `html`/`body`. Fonts: use the
  CSS variables already loaded globally — `var(--nb-sans)` (Inter),
  `var(--nb-display)` (Inter Tight), `var(--nb-mono)` (JetBrains Mono) — plus
  system serif stacks (`Georgia, 'Times New Roman', serif` or
  `'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif`). Give
  each demo its own typographic personality from those.
- Accessible: semantic landmarks inside Site (`<header>`, `<main>`? — NO,
  the page already has `<main>`; use `<div>`/`<section>`/`<footer>`), one
  `<h1>`, real `<button>`s and `<label>`s, visible focus, 44px touch targets,
  contrast ≥ 4.5:1, `aria-live` for results, respects
  `prefers-reduced-motion`.
- Responsive from 360px to 1600px with no horizontal page scroll.
- Motion: tasteful entrance animations and hover states; nothing that loops
  forever and distracts, except where it is the point (a live queue ticking).
- The Site root element should set its own background and text colour and
  `min-height: 100vh`.

## Features per demo

| slug | business | working features |
|---|---|---|
| heating | Thornley Heating | Book-a-visit flow (problem type → day → time slot → details → confirm); "Is it an emergency?" triage that changes advice |
| electrician | Brightline Electrical | Photo-quote form: pick job, upload photos (show previews with FileReader/URL.createObjectURL, revoke on cleanup), get an instant ballpark range; EICR certificate lookup by made-up reference |
| garage | Northgate Motors | Reg lookup (UK reg format validation, deterministic fake car from the reg string), MOT due-date calculator + reminder sign-up, book MOT slot |
| bakery | Saltmarsh Bakehouse | Order-ahead menu with basket (add/remove, quantities, totals), collection time picker, sold-out items; "open now?" from the hours |
| florist | Wild Stem | Shop with filters, product detail drawer, basket, delivery date with 1pm same-day cut-off countdown, card message |
| photographer | Harbour Light | Date availability checker (calendar with booked dates), package comparison with add-ons and live total, enquiry form |
| lashes | Kestrel Lash Studio | Booking: treatment → date → time → patch-test question → deposit summary; price list tabs |
| barber | Fade & Fellow | Live wait-time board per barber (ticks down, simulated), join the queue, book a chair with barber choice |
| tattoo | Black Fern Tattoo | Artist portfolio filter by style (drawn flash pieces in SVG), idea/booking form with reference image upload previews and placement, deposit summary |
| grooming | Bramble & Bone | Price calculator by size/coat/service, two-groomer booking calendar |
| windows | Clearwater | Instant quote calculator (house type, extras, frequency) with live price and round sign-up; "skip a round" demo |
| personal-trainer | Ironfield PT | Class timetable (week view, spaces left, book/cancel updates spaces), membership plan picker |
