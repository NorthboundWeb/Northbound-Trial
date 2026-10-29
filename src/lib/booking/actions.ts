'use server'

/**
 * "Text me": a public POST endpoint (the free-build request is the route
 * handler at src/app/api/start). Everything is re-validated here, then posted to the Google Apps Script
 * inbox (apps-script/enquiries.gs), which emails it to Che and adds a row to
 * the "Northbound enquiries" Google Sheet. The script re-checks everything
 * itself and HTML-escapes it before it goes into an email.
 *
 * ENQUIRY_WEBHOOK_URL and ENQUIRY_WEBHOOK_TOKEN are server-side only. Never
 * rename either to NEXT_PUBLIC_*.
 */

import { headers } from 'next/headers'
import { rateLimit } from '@/lib/rate-limit'
import { CONTACT_EMAIL } from './options'

const WEBHOOK_TIMEOUT_MS = 8_000

async function clientKey() {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
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
