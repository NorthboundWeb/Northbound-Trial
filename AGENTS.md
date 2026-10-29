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
site self-check, runs in the browser only), `/booking`, `/diary`. Package
copy, prices and terms come from `src/lib/services.ts`, copied from the live
site; keep the two in step. Clicking the logo plays the curtain
(`src/components/curtain.tsx`) and goes home.

## How it fits together

- `/booking` — the five-step flow (`src/components/booking-flow.tsx`): needs, working
  budget, timeline, details, day and time. Copy and option lists are in
  `src/lib/booking/options.ts`, not JSX.
- `/diary` — the owner view, behind `DIARY_PASSWORD`. Confirm or cancel
  requests and block out times.
- `src/lib/booking/actions.ts` — server actions, the only write paths. They are
  public POST endpoints: validate on the server, keep the honeypot, the
  submit-time trap and the rate limit.
- Data lives in Supabase, schema `nb_booking`, which the API does not expose.
  The app can only call the `public.nb_booking_*` functions in
  `supabase/booking.sql`; they re-validate input, return only what each caller
  may see, and the admin ones check `NB_ADMIN_SECRET` against a stored hash.
  The first request for a slot wins (partial unique index plus an advisory
  lock).
- Visitors prove a request is theirs with a random token kept in an httpOnly
  cookie; the database stores only its hash.

## Copy rules (same as the live site)

Prices are real: Pro £249, Ultimate £349, management from £39 a month with the
first month free and optional. No unlimited or guaranteed promises, no invented
social proof. The call time is a *preferred* time until confirmed by email.

## Known gaps

No email is sent to the visitor or owner yet. Every env var is server-side
only; never rename one to `NEXT_PUBLIC_*`.

Run `npm run typecheck && npm run lint && npm run build` before committing.
