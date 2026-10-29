# Northbound Trial — booking flow preview

A standalone preview of the Northbound Web "Book a call" flow. It is **not**
the live site (that is `NorthboundWeb/northbound-web-site`) and shares no code
or styling with it. Same setup: Next.js 16 App Router, Tailwind CSS v4,
TypeScript, deployed on Vercel.

This version of Next.js may differ from your training data. Read the relevant
guide in `node_modules/next/dist/docs/` before writing code, and heed
deprecation notices.

## Look

Laid out like Averlo's booking page (plain white page, mark top left, step
counter top right, hairline progress bar, one narrow column, Continue pinned to
the bottom) but with Northbound's own mark, intro, copy and blue. Do not copy
Averlo's logo, wording, icons or colours. The intro curtain
(`src/components/intro.tsx`, art in `public/brand/`) plays once per browser
session.

## Pages

`/` home, `/services` and `/services/[pro|ultimate|custom|management]`,
`/work` and `/work/[slug]` (made-up concept businesses from
`src/lib/discover.ts`; always labelled as concepts), `/about`, `/tools` (the
site self-check, runs in the browser only), `/start`, `/demos/[slug]`. Package
copy, prices and terms come from `src/lib/services.ts`, copied from the live
site; keep the two in step. Swiping right on a touch screen goes back a page (`src/components/swipe-back.tsx`); booking steps are history entries (`?step=N`) so back, edge-swipe and the swipe step back one question. Clicking the logo plays the curtain
(`src/components/curtain.tsx`) and goes home.

## How it fits together

- `/start` — "Start a project" (`src/components/project-flow.tsx`): needs,
  working budget, timeline, details, then how to reply (WhatsApp or email).
  No calls are booked. Copy and option lists are in
  `src/lib/booking/options.ts`, not JSX.
- `src/lib/booking/actions.ts` — the only write path, a public POST endpoint.
  Validates on the server, keeps the honeypot, the submit-time trap and the
  rate limit, then posts to the Google Apps Script inbox
  (`apps-script/enquiries.gs`, same script as the live site), which emails Che
  and logs a row in the "Northbound enquiries" Google Sheet. Needs
  `ENQUIRY_WEBHOOK_URL` and `ENQUIRY_WEBHOOK_TOKEN` (server-side only).
- "Message me" opens WhatsApp (`src/lib/contact.ts`). No phone calls anywhere.
- Home hero: `site-wall.tsx` (the demo sites drifting on a tilted plane, with
  a dot-field morph on a canvas) and `service-ticker.tsx`. Demo sites are in
  `src/lib/showcase.ts`, drawn by `demo-site.tsx`, full pages at
  `/demos/[slug]`; all made-up businesses, always labelled.
- `theme-toggle.tsx` (light/dark, circle reveal), `dot-cursor.tsx` (mouse only).

## Copy rules (same as the live site)

Prices are real: Pro £249, Ultimate £349, management from £39 a month with the
first month free and optional. No unlimited or guaranteed promises, no invented
social proof. The call time is a *preferred* time until confirmed by email.

## Known gaps

Supabase is no longer used (the old `nb_booking` schema can be dropped). Every env var is server-side
only; never rename one to `NEXT_PUBLIC_*`.

Run `npm run typecheck && npm run lint && npm run build` before committing.
