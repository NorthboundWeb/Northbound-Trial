'use server'

/**
 * Server actions: public POST endpoints. Everything a visitor sends is
 * re-validated here, then again in the database.
 */

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { rateLimit } from '@/lib/rate-limit'
import { addDays, nextWeekdays, slotKey, todayInLondon } from './dates'
import { adminSecret, rpc } from './db'
import {
  CONTACT_EMAIL,
  DAYS_SHOWN,
  type BookingForm,
  type DiaryBooking,
  type MyBooking,
  emptyForm,
  validateAll,
} from './options'
import {
  addTicket,
  endDiarySession,
  isDiaryOwner,
  passwordMatches,
  readTickets,
  startDiarySession,
} from './session'

const HONEYPOT = 'website'
const MIN_FILL_MS = 4_000

const GENERIC = `Something went wrong saving your request. Please try again, or email ${CONTACT_EMAIL} and we will find a time.`

async function clientKey() {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
}

/** Slots that are booked or blocked, as "YYYY-MM-DD_HH:MM" keys. No personal data. */
export async function getTaken(): Promise<string[]> {
  const from = todayInLondon()
  const rows = await rpc<{ day: string; slot: string }[]>('nb_booking_taken', {
    p_from: from,
    p_to: addDays(from, 31),
  })
  return rows.map((r) => slotKey(r.day, r.slot))
}

export async function getMine(): Promise<MyBooking[]> {
  const tickets = await readTickets()
  if (!tickets.length) return []
  return rpc<MyBooking[]>('nb_booking_mine', { p_items: tickets })
}

export type CreateResult =
  | { ok: true; booking: MyBooking; taken: string[] }
  | { ok: false; step?: number; errors?: Record<string, string>; message?: string; taken?: string[] }

function clean(input: unknown): BookingForm {
  const base = emptyForm()
  if (typeof input !== 'object' || input === null) return base
  const o = input as Record<string, unknown>
  const str = (k: keyof BookingForm, max: number) => (typeof o[k] === 'string' ? (o[k] as string).slice(0, max) : '')
  return {
    help: Array.isArray(o.help) ? o.help.filter((x): x is string => typeof x === 'string').slice(0, 8) : [],
    other: str('other', 1200),
    budget: str('budget', 60),
    plan: str('plan', 60),
    timeline: str('timeline', 60),
    name: str('name', 140),
    business: str('business', 140),
    email: str('email', 220),
    phone: str('phone', 60),
    site: str('site', 220),
    day: str('day', 10),
    slot: str('slot', 5),
  }
}

export async function createBooking(
  input: unknown,
  meta: { startedAt: number; trap: string }
): Promise<CreateResult> {
  // Spam traps: the hidden field gets a generic failure, nothing is saved.
  if (meta.trap) return { ok: false, message: GENERIC }
  if (!Number.isFinite(meta.startedAt) || Date.now() - meta.startedAt < MIN_FILL_MS) {
    return { ok: false, message: 'That was very quick. Please check your answers and try again.' }
  }
  const limited = rateLimit(`book:${await clientKey()}`, { limit: 6, windowMs: 60 * 60 * 1000 })
  if (!limited.ok) {
    return { ok: false, message: `You have sent a few requests already. Please try again later, or email ${CONTACT_EMAIL}.` }
  }

  const f = clean(input)
  const days = nextWeekdays(DAYS_SHOWN)
  const invalid = validateAll(f, days)
  if (invalid) return { ok: false, step: invalid.step, errors: invalid.errors }

  try {
    const res = await rpc<{ ok: boolean; ref?: string; token?: string; error?: string; field?: string }>(
      'nb_booking_create',
      {
        p: {
          help: f.help,
          other: f.other.trim(),
          budget: f.budget,
          plan: f.plan,
          timeline: f.timeline,
          name: f.name.trim(),
          business: f.business.trim(),
          email: f.email.trim(),
          phone: f.phone.trim(),
          site: f.site.trim(),
          day: f.day,
          slot: f.slot,
        },
      }
    )
    if (!res.ok || !res.ref || !res.token) {
      if (res.error === 'taken') {
        return {
          ok: false,
          step: 4,
          errors: { slot: 'Someone has just taken that time. Pick another.' },
          taken: await getTaken(),
        }
      }
      if (res.error === 'limited') {
        return {
          ok: false,
          message: `You already have three open requests with that email. Cancel one below, or email ${CONTACT_EMAIL}.`,
        }
      }
      return { ok: false, message: GENERIC }
    }
    await addTicket({ ref: res.ref, token: res.token })
    const booking: MyBooking = {
      ref: res.ref,
      day: f.day,
      slot: f.slot,
      status: 'requested',
      help: f.help,
      budget: f.budget,
      timeline: f.timeline,
      name: f.name.trim(),
      email: f.email.trim(),
    }
    return { ok: true, booking, taken: await getTaken() }
  } catch (error) {
    console.error('Booking not saved:', error)
    return { ok: false, message: GENERIC }
  }
}

export async function refreshVisitor(): Promise<{ taken: string[]; mine: MyBooking[] }> {
  try {
    const [taken, mine] = await Promise.all([getTaken(), getMine()])
    return { taken, mine }
  } catch (error) {
    console.error('Refresh failed:', error)
    return { taken: [], mine: [] }
  }
}

export async function cancelMine(ref: string): Promise<{ ok: boolean }> {
  const t = (await readTickets()).find((x) => x.ref === ref)
  if (!t) return { ok: false }
  try {
    return await rpc<{ ok: boolean }>('nb_booking_cancel', { p_ref: t.ref, p_token: t.token })
  } catch (error) {
    console.error('Cancel failed:', error)
    return { ok: false }
  }
}

// ---------------------------------------------------------------------------
// Diary (owner only)
// ---------------------------------------------------------------------------

export type DiaryLoginState = { error?: string }

export async function diaryLogin(_prev: DiaryLoginState, formData: FormData): Promise<DiaryLoginState> {
  const limited = rateLimit(`diary:${await clientKey()}`, { limit: 8, windowMs: 15 * 60 * 1000 })
  if (!limited.ok) return { error: 'Too many attempts. Wait a few minutes and try again.' }
  const attempt = String(formData.get('password') ?? '')
  if (!attempt || !passwordMatches(attempt)) return { error: 'That password is not right.' }
  await startDiarySession()
  redirect('/diary')
}

export async function diaryLogout() {
  await endDiarySession()
  redirect('/diary')
}

export type DiaryData = { bookings: DiaryBooking[]; blocks: string[] }

export async function getDiary(): Promise<DiaryData | null> {
  if (!(await isDiaryOwner())) return null
  const res = await rpc<{ ok: boolean; bookings?: DiaryBooking[]; blocks?: { day: string; slot: string }[] }>(
    'nb_booking_admin_list',
    { p_secret: adminSecret() }
  )
  if (!res.ok) throw new Error('The database refused the diary secret. Check NB_ADMIN_SECRET.')
  return {
    bookings: res.bookings ?? [],
    blocks: (res.blocks ?? []).map((b) => slotKey(b.day, b.slot)),
  }
}

export async function setBookingStatus(ref: string, status: 'confirmed' | 'cancelled') {
  if (!(await isDiaryOwner())) return { ok: false, data: null }
  await rpc('nb_booking_admin_set_status', { p_secret: adminSecret(), p_ref: ref, p_status: status })
  return { ok: true, data: await getDiary() }
}

export async function setBlock(day: string, slot: string, block: boolean) {
  if (!(await isDiaryOwner())) return { ok: false, data: null, error: '' }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return { ok: false, data: null, error: 'Bad day.' }
  const res = await rpc<{ ok: boolean; error?: string }>('nb_booking_admin_block', {
    p_secret: adminSecret(),
    p_day: day,
    p_slot: slot,
    p_block: block,
  })
  return {
    ok: res.ok,
    data: await getDiary(),
    error: res.error === 'booked' ? 'Someone has booked that time. Cancel the booking first.' : '',
  }
}
