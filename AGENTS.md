# Northbound Web — live site

This repo (`NorthboundWeb/Northbound-Trial`, Vercel project `northbound-trial`)
is the **live site** at northboundweb.co.uk. `NorthboundWeb/northbound-web-site`
is now the draft/sandbox copy. The old motorway design is on that repo's
`backup-before-trial-switch` branch. Next.js 16 App Router, Tailwind CSS v4,
TypeScript, deployed on Vercel. Old routes (/contact, /discover, /projects,
/approach) redirect in `next.config.ts` and must keep doing so.

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

- `/start` — "Start a project", the free-build request
  (`src/components/start-flow.tsx`): offer, what to build, details, photos
  (up to 6, shrunk in the browser), links, delivery date, about you, review.
  The calendar marks today Processing, the next 3 days Building (neither
  pickable) and days 4–6 "may move for big requests". The step rail, the
  summary panel and every review row jump to their step. Copy, dates and
  validation are in `src/lib/start/options.ts`, not JSX.
- Sending a `/start` request opens a WhatsApp chat with Che (`whatsappHref`
  in `src/lib/contact.ts`) with the whole request typed out
  (`composeRequest`); photos are shared with the Web Share API or attached in
  the chat. "No WhatsApp?" on the sent screen emails the same request through
  the site instead (`src/components/email-fallback.tsx`).
- `/email` — "Email me", an on-site form (`src/app/email/`). No `mailto:`
  links anywhere; email goes through the site.
- `/portal` — the client area. Clients sign in with a one-time email link
  (20 minutes; Che can also make a 7-day link from the admin page to send on
  WhatsApp). The link lands on `/portal/verify`, which signs in only when the
  button is pressed, so mail scanners cannot use it up. Sessions are a signed
  `nb_session` cookie (`src/lib/portal/session.ts`, 30 days). `/portal/admin`
  is for emails in `ADMIN_EMAILS`: add projects, set stage/progress/dates/
  links/notes, post updates, make sign-in links.
- Storage and email are one Google Apps Script web app over a Google Sheet
  (`apps-script/portal.gs`: Projects, Updates, Messages and hidden Tokens
  tabs). It stores projects, emails sign-in links from Che's Google account,
  and delivers the Email me form to his inbox with Reply-To set. The site
  calls it from the server only (`src/lib/portal/script.ts`). Env vars, all
  server-side, never `NEXT_PUBLIC_*`: `PORTAL_SCRIPT_URL`,
  `PORTAL_SCRIPT_TOKEN` (also used to derive the session key unless
  `SESSION_SECRET` is set), `ADMIN_EMAILS` (comma-separated).
- "Message me" opens WhatsApp (`src/lib/contact.ts`). No phone calls anywhere.
- Home hero: `site-wall.tsx` (the demo sites drifting on a tilted plane, with
  a dot-field morph on a canvas) and `service-ticker.tsx`. Demo sites are in
  `src/lib/showcase.ts`, drawn by `demo-site.tsx`, full pages at
  `/demos/[slug]`; all made-up businesses, always labelled.
- `theme-toggle.tsx` (light/dark, circle reveal; every visit opens dark, a
  switch to light lasts for that tab's session only), `dot-cursor.tsx` (mouse only), `aurora.tsx` (the
  pointer-reactive canvas background behind the home "Message me" panel).

## Copy rules (same as the live site)

Prices are real: Pro £249, Ultimate £349, management from £39 a month with the
first month free and optional. No unlimited or guaranteed promises, no invented
social proof. The free build is for a client's **first** website only (no deposit, buy it
only if you like it, no further contact if not); every later website or system
starts with the 50% deposit. That is Che's own wording; keep it as written.
The 72-hour build is an estimate, never a guarantee.

## Known gaps

Supabase is not used (the old `nb_booking` schema can be dropped). Without
`PORTAL_SCRIPT_URL` and `PORTAL_SCRIPT_TOKEN` the client area and Email me form
show a friendly "being set up" message and point to WhatsApp.

Run `npm run typecheck && npm run lint && npm run build` before committing.
