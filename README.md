# Northbound Trial

Preview of the Northbound Web booking flow: a five-step "Book a call" form
with live slot availability, saved requests visitors can check or cancel, and
an owner diary at `/diary`.

Not the live site. See `AGENTS.md` for how it works and `.env.example` for
configuration. Database setup is in `supabase/booking.sql`.

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev
```
