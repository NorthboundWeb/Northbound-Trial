/**
 * POST /api/start — the free-build request. A route handler rather than a
 * server action because it carries photos (server actions cap the body at
 * 1 MB). Public endpoint: everything is re-validated here, then sent to the
 * Google Apps Script inbox, which emails Che, saves the photos to Drive and
 * logs a row in the Sheet.
 */

import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { CONTACT_EMAIL } from '@/lib/booking/options'
import { rateLimit } from '@/lib/rate-limit'
import { MAX_PHOTOS, PHOTO_MAX_BYTES, composeRequest, emptyStart, firstInvalid, todayUK, type StartForm } from '@/lib/start/options'

const MIN_FILL_MS = 8_000
const WEBHOOK_TIMEOUT_MS = 20_000
const FAIL = `That did not send. Please message me on WhatsApp or email ${CONTACT_EMAIL} and I will pick it up.`
const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

type InPhoto = { name: string; type: string; data: string }

function str(o: Record<string, unknown>, k: string, max: number) {
  return typeof o[k] === 'string' ? (o[k] as string).slice(0, max) : ''
}

function clean(input: unknown): StartForm {
  const f = emptyStart()
  if (typeof input !== 'object' || input === null) return f
  const o = input as Record<string, unknown>
  const reply = str(o, 'replyVia', 10)
  return {
    build: Array.isArray(o.build) ? o.build.filter((x): x is string => typeof x === 'string').slice(0, 8) : [],
    business: str(o, 'business', 140),
    trade: str(o, 'trade', 140),
    details: str(o, 'details', 5200),
    website: str(o, 'website', 300),
    socials: Array.isArray(o.socials) ? o.socials.filter((x): x is string => typeof x === 'string').slice(0, 6).map((s) => s.slice(0, 300)) : [],
    portfolio: str(o, 'portfolio', 300),
    date: str(o, 'date', 10),
    name: str(o, 'name', 140),
    email: str(o, 'email', 220),
    replyVia: reply === 'whatsapp' || reply === 'email' ? reply : '',
    phone: str(o, 'phone', 60),
  }
}

function cleanPhotos(input: unknown): InPhoto[] {
  if (!Array.isArray(input)) return []
  const out: InPhoto[] = []
  for (const p of input) {
    if (out.length >= MAX_PHOTOS) break
    if (typeof p !== 'object' || p === null) continue
    const o = p as Record<string, unknown>
    const type = typeof o.type === 'string' ? o.type : ''
    const data = typeof o.data === 'string' ? o.data : ''
    if (!TYPES.has(type) || !/^[A-Za-z0-9+/=]+$/.test(data)) continue
    if ((data.length * 3) / 4 > PHOTO_MAX_BYTES * 1.4) continue
    out.push({ name: `photo-${out.length + 1}`, type, data })
  }
  return out
}

export async function POST(req: Request) {
  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
  const limited = rateLimit(`start:${ip}`, { limit: 5, windowMs: 60 * 60 * 1000 })
  if (!limited.ok) return NextResponse.json({ ok: false, message: `You have sent a few already. Please try again later, or email ${CONTACT_EMAIL}.` }, { status: 429 })

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ ok: false, message: FAIL }, { status: 400 })
  }

  // Spam traps: a filled hidden field, or a form completed faster than a person can.
  const startedAt = Number(body.startedAt)
  if (typeof body.trap === 'string' && body.trap !== '') return NextResponse.json({ ok: false, message: FAIL }, { status: 400 })
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < MIN_FILL_MS) {
    return NextResponse.json({ ok: false, message: 'That was very quick. Please check your answers and try again.' }, { status: 400 })
  }

  const f = clean(body.form)
  const today = todayUK()
  const invalid = firstInvalid(f, today)
  if (invalid) return NextResponse.json({ ok: false, step: invalid.step, errors: invalid.errors }, { status: 422 })
  const photos = cleanPhotos(body.photos)

  const url = process.env.ENQUIRY_WEBHOOK_URL
  const token = process.env.ENQUIRY_WEBHOOK_TOKEN
  if (!url || !token) {
    console.error('Free-build request not sent: ENQUIRY_WEBHOOK_URL or ENQUIRY_WEBHOOK_TOKEN is missing.')
    return NextResponse.json({ ok: false, message: FAIL }, { status: 503 })
  }

  const ref = `NB-${crypto.randomUUID().slice(0, 6).toUpperCase()}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      redirect: 'follow',
      cache: 'no-store',
      signal: controller.signal,
      body: JSON.stringify({
        token,
        id: ref,
        name: f.name.trim(),
        email: f.email.trim(),
        business: f.business.trim(),
        projectType: `Free build: ${f.build.join(', ')}`.slice(0, 120),
        budget: '',
        message: `Ref ${ref}\n${composeRequest(f, today, photos.length)}`,
        photos,
      }),
    })
    const out: unknown = await res.json().catch(() => null)
    const ok = res.ok && typeof out === 'object' && out !== null && (out as { ok?: unknown }).ok === true
    if (!ok) {
      console.error('The inbox rejected the free-build request:', { status: res.status, out })
      return NextResponse.json({ ok: false, message: FAIL }, { status: 502 })
    }
    return NextResponse.json({ ok: true, ref })
  } catch (error) {
    console.error('Failed to send free-build request:', error)
    return NextResponse.json({ ok: false, message: FAIL }, { status: 502 })
  } finally {
    clearTimeout(timer)
  }
}
