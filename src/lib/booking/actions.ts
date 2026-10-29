'use server'

/**
 * "Start a project": the site's only write path, and a public POST endpoint.
 * Everything is re-validated here, then posted to the Google Apps Script
 * inbox (apps-script/enquiries.gs), which emails it to Che and adds a row to
 * the "Northbound enquiries" Google Sheet. The script re-checks everything
 * itself and HTML-escapes it before it goes into an email.
 *
 * ENQUIRY_WEBHOOK_URL and ENQUIRY_WEBHOOK_TOKEN are server-side only. Never
 * rename either to NEXT_PUBLIC_*.
 */

import { headers } from 'next/headers'
import { rateLimit } from '@/lib/rate-limit'
import { CONTACT_EMAIL, composeMessage, emptyForm, validateAll, type ProjectForm } from './options'

const MIN_FILL_MS = 4_000
const WEBHOOK_TIMEOUT_MS = 8_000

const GENERIC = `That did not send. Please message me on WhatsApp or email ${CONTACT_EMAIL} and I will pick it up.`

export type StartResult =
  | { ok: true; ref: string }
  | { ok: false; step?: number; errors?: Record<string, string>; message?: string }

async function clientKey() {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
}

function clean(input: unknown): ProjectForm {
  const base = emptyForm()
  if (typeof input !== 'object' || input === null) return base
  const o = input as Record<string, unknown>
  const str = (k: keyof ProjectForm, max: number) => (typeof o[k] === 'string' ? (o[k] as string).slice(0, max) : '')
  const reply = str('replyVia', 10)
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
    replyVia: reply === 'whatsapp' || reply === 'email' ? reply : '',
  }
}

export async function startProject(input: unknown, meta: { startedAt: number; trap: string }): Promise<StartResult> {
  // Spam traps: a filled hidden field, or a form completed faster than a person can.
  if (meta.trap) return { ok: false, message: GENERIC }
  if (!Number.isFinite(meta.startedAt) || Date.now() - meta.startedAt < MIN_FILL_MS) {
    return { ok: false, message: 'That was very quick. Please check your answers and try again.' }
  }
  const limited = rateLimit(`start:${await clientKey()}`, { limit: 5, windowMs: 60 * 60 * 1000 })
  if (!limited.ok) {
    return { ok: false, message: `You have sent a few already. Please try again later, or email ${CONTACT_EMAIL}.` }
  }

  const f = clean(input)
  const invalid = validateAll(f)
  if (invalid) return { ok: false, step: invalid.step, errors: invalid.errors }

  const url = process.env.ENQUIRY_WEBHOOK_URL
  const token = process.env.ENQUIRY_WEBHOOK_TOKEN
  if (!url || !token) {
    console.error('Enquiry not sent: ENQUIRY_WEBHOOK_URL or ENQUIRY_WEBHOOK_TOKEN is missing.')
    return { ok: false, message: GENERIC }
  }

  const ref = `NB-${crypto.randomUUID().slice(0, 6).toUpperCase()}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS)
  try {
    // Apps Script answers a POST with a redirect to its reply, so follow it.
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
        projectType: f.help.join(', ').slice(0, 80),
        budget: f.budget,
        message: `Ref ${ref}\n${composeMessage(f)}`,
      }),
    })
    const body: unknown = await res.json().catch(() => null)
    const delivered = res.ok && typeof body === 'object' && body !== null && (body as { ok?: unknown }).ok === true
    if (!delivered) {
      console.error('The enquiry inbox rejected the enquiry:', { status: res.status, body })
      return { ok: false, message: GENERIC }
    }
    return { ok: true, ref }
  } catch (error) {
    console.error('Failed to send enquiry:', error)
    return { ok: false, message: GENERIC }
  } finally {
    clearTimeout(timer)
  }
}

export type TextResult = { ok: boolean; message: string }

/**
 * "Text me": a visitor leaves their WhatsApp number and Che messages them.
 * Goes to the same inbox as a project, flagged as a text request.
 */
export async function requestText(number: string, meta: { startedAt: number; trap: string }): Promise<TextResult> {
  const fallback = 'That did not send. Tap “Message me” to open WhatsApp instead.'
  if (meta.trap) return { ok: false, message: fallback }
  if (!Number.isFinite(meta.startedAt) || Date.now() - meta.startedAt < 1_500) {
    return { ok: false, message: 'That was very quick. Please try again.' }
  }
  const limited = rateLimit(`text:${await clientKey()}`, { limit: 3, windowMs: 60 * 60 * 1000 })
  if (!limited.ok) return { ok: false, message: 'You have sent a few already. Tap “Message me” to open WhatsApp instead.' }

  const raw = String(number ?? '').slice(0, 40).trim()
  const digits = raw.replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 15) return { ok: false, message: 'Add a mobile number that has WhatsApp.' }

  const url = process.env.ENQUIRY_WEBHOOK_URL
  const token = process.env.ENQUIRY_WEBHOOK_TOKEN
  if (!url || !token) {
    console.error('Text request not sent: ENQUIRY_WEBHOOK_URL or ENQUIRY_WEBHOOK_TOKEN is missing.')
    return { ok: false, message: fallback }
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
        name: 'Text request',
        // The inbox needs an email; this one is Che's, so a reply goes nowhere odd.
        email: CONTACT_EMAIL,
        business: '',
        projectType: 'WhatsApp text request',
        budget: '',
        message: `Ref ${ref}\nPlease send a WhatsApp message to: ${raw}`,
      }),
    })
    const body: unknown = await res.json().catch(() => null)
    const ok = res.ok && typeof body === 'object' && body !== null && (body as { ok?: unknown }).ok === true
    if (!ok) {
      console.error('The inbox rejected the text request:', { status: res.status, body })
      return { ok: false, message: fallback }
    }
    return { ok: true, message: 'Got it. I will message you on WhatsApp, normally within one working day.' }
  } catch (error) {
    console.error('Failed to send text request:', error)
    return { ok: false, message: fallback }
  } finally {
    clearTimeout(timer)
  }
}
