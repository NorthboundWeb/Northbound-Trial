'use server'

/**
 * The site's "Email me" form, and "send my request by email" from the start
 * flow. Public POST endpoints: validated here, then handed to the Google Apps
 * Script (apps-script/portal.gs), which emails Che with Reply-To set to the
 * sender and logs the message in the Sheet's Messages tab.
 */

import { callScript, scriptReady } from '@/lib/portal/script'
import { limited } from '@/lib/portal/session'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MIN_FILL_MS = 3_000
const FAIL = 'That did not send. Please message me on WhatsApp instead.'

export type EmailState = { status: 'idle' | 'sent' | 'error'; message: string; errors?: Record<string, string> }

type Input = { name: string; email: string; subject: string; message: string; startedAt: number; trap: string }

async function deliver(i: Input): Promise<EmailState> {
  if (i.trap) return { status: 'sent', message: 'Thanks. I will reply by email.' }
  if (!Number.isFinite(i.startedAt) || Date.now() - i.startedAt < MIN_FILL_MS) {
    return { status: 'error', message: 'That was very quick. Please check your message and send it again.' }
  }
  const errors: Record<string, string> = {}
  const name = i.name.trim().slice(0, 120)
  const email = i.email.trim().toLowerCase().slice(0, 200)
  const message = i.message.trim().slice(0, 6000)
  if (name.length < 2) errors.name = 'Add your name.'
  if (!EMAIL_RE.test(email)) errors.email = 'That email address does not look complete.'
  if (message.length < 10) errors.message = 'Tell me a little more.'
  if (Object.keys(errors).length) return { status: 'error', message: 'Please check the highlighted fields.', errors }
  if (await limited('email', 4, 60 * 60 * 1000)) return { status: 'error', message: 'You have sent a few already. Please try again later, or message me on WhatsApp.' }
  if (!scriptReady()) {
    console.error('Email form not sent: PORTAL_SCRIPT_URL or PORTAL_SCRIPT_TOKEN is missing.')
    return { status: 'error', message: FAIL }
  }
  try {
    const out = await callScript('contact', { name, email, subject: i.subject.trim().slice(0, 140) || 'Website message', message })
    if (!out.ok) throw new Error(out.error ?? 'contact failed')
  } catch (error) {
    console.error('Email form failed:', error)
    return { status: 'error', message: FAIL }
  }
  return { status: 'sent', message: `Thanks, ${name.split(/\s+/)[0]}. It is in my inbox and I will reply to ${email}.` }
}

export async function sendEmailForm(_prev: EmailState, form: FormData): Promise<EmailState> {
  return deliver({
    name: String(form.get('name') ?? ''),
    email: String(form.get('email') ?? ''),
    subject: String(form.get('subject') ?? ''),
    message: String(form.get('message') ?? ''),
    startedAt: Number(form.get('startedAt')),
    trap: String(form.get('company') ?? ''),
  })
}

/** The start flow's full request, sent by email instead of WhatsApp. */
export async function emailRequest(input: { name: string; email: string; ref: string; message: string; startedAt: number }): Promise<EmailState> {
  return deliver({
    name: String(input.name ?? ''),
    email: String(input.email ?? ''),
    subject: `Free website request ${String(input.ref ?? '').slice(0, 20)}`,
    message: String(input.message ?? ''),
    startedAt: Number(input.startedAt),
    trap: '',
  })
}
