'use server'

/**
 * Client area actions. Every admin action re-checks the session on the
 * server; nothing here trusts the browser.
 */

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { callScript, scriptReady } from '@/lib/portal/script'
import { endSession, getSession, hashToken, isAdmin, limited, newLoginToken, sessionsReady, siteOrigin, startSession } from '@/lib/portal/session'
import { STAGES, stageIndex } from '@/lib/portal/stages'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export type LinkState = { status: 'idle' | 'sent' | 'error'; message: string }

export async function requestLink(_prev: LinkState, form: FormData): Promise<LinkState> {
  if (String(form.get('website') ?? '')) return { status: 'sent', message: 'If that email has a project with me, a link is on its way.' }
  const email = String(form.get('email') ?? '').trim().toLowerCase().slice(0, 200)
  if (!EMAIL_RE.test(email)) return { status: 'error', message: 'That email address does not look complete.' }
  if (await limited('link', 5, 15 * 60 * 1000)) return { status: 'error', message: 'Too many tries. Please wait a few minutes.' }
  if (!scriptReady() || !sessionsReady()) {
    return { status: 'error', message: 'The client area is being set up. Message me on WhatsApp for an update in the meantime.' }
  }
  try {
    const known = isAdmin(email) || (await callScript('has_projects', { email })).has === true
    if (known) {
      const { raw, hash } = newLoginToken()
      const link = `${await siteOrigin()}/portal/verify?token=${raw}`
      const out = await callScript('create_token', { email, token_hash: hash, ttl_minutes: 20, max_per_hour: 5, send_email: true, link })
      if (!out.ok && out.reason === 'rate') return { status: 'error', message: 'A few links have gone to that address already. Check your inbox, or try again in an hour.' }
      if (!out.ok) throw new Error(out.error ?? 'create_token failed')
    }
  } catch (error) {
    console.error('Sign-in link failed:', error)
    return { status: 'error', message: 'That did not go through. Please try again, or message me on WhatsApp.' }
  }
  // The same answer either way, so the form never reveals who is a client.
  return { status: 'sent', message: `If ${email} has a project with me, a sign-in link is on its way. It works once and lasts 20 minutes. Check your spam folder too.` }
}

/** The email link lands on a page with a button, so link-scanning mail filters cannot use it up. */
export async function confirmLink(form: FormData) {
  const raw = String(form.get('token') ?? '')
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(raw)) redirect('/portal?link=bad')
  let email = ''
  try {
    const out = await callScript('consume_token', { token_hash: hashToken(raw) })
    if (out.ok && typeof out.email === 'string') email = out.email
  } catch (error) {
    console.error('Sign-in confirm failed:', error)
  }
  if (!email) redirect('/portal?link=bad')
  await startSession(email)
  redirect(isAdmin(email) ? '/portal/admin' : '/portal')
}

export async function signOut() {
  await endSession()
  redirect('/portal')
}

// ---- admin -------------------------------------------------------------------

async function requireAdmin() {
  const s = await getSession()
  if (!s?.admin) redirect('/portal')
  return s
}

const field = (form: FormData, k: string, max = 300) => String(form.get(k) ?? '').trim().slice(0, max)

export async function saveProject(form: FormData) {
  await requireAdmin()
  const id = field(form, 'id', 60)
  const email = field(form, 'client_email', 200).toLowerCase()
  if (!EMAIL_RE.test(email)) return
  const stage = stageIndex(field(form, 'stage', 40))
  const progressRaw = field(form, 'progress', 4)
  const due = field(form, 'due_date', 10)
  await callScript('save_project', {
    id: id || undefined,
    ref: id ? undefined : `NB-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    client_name: field(form, 'client_name', 120) || email.split('@')[0],
    client_email: email,
    business: field(form, 'business', 120),
    title: field(form, 'title', 160) || 'Website',
    stage: STAGES[stage].name,
    progress: /^\d{1,3}$/.test(progressRaw) ? String(Math.min(100, Number(progressRaw))) : '',
    due_date: /^\d{4}-\d{2}-\d{2}$/.test(due) ? due : '',
    preview_url: field(form, 'preview_url', 400),
    live_url: field(form, 'live_url', 400),
    note: field(form, 'note', 2000),
  })
  revalidatePath('/portal/admin')
}

export async function addUpdate(form: FormData) {
  await requireAdmin()
  const projectId = field(form, 'project_id', 60)
  const body = field(form, 'body', 2000)
  if (!projectId || !body) return
  await callScript('add_update', { project_id: projectId, body })
  revalidatePath('/portal/admin')
}

export async function deleteUpdate(form: FormData) {
  await requireAdmin()
  const id = field(form, 'id', 60)
  if (id) await callScript('delete_update', { id })
  revalidatePath('/portal/admin')
}

export async function deleteProject(form: FormData) {
  await requireAdmin()
  const id = field(form, 'id', 60)
  if (id && form.get('confirm') === 'yes') await callScript('delete_project', { id })
  revalidatePath('/portal/admin')
}

/** A one-time sign-in link for a client, valid for 7 days, to send them on WhatsApp. */
export async function makeClientLink(email: string, name: string): Promise<{ ok: boolean; link?: string; message?: string }> {
  await requireAdmin()
  const clean = String(email).trim().toLowerCase()
  if (!EMAIL_RE.test(clean)) return { ok: false, message: 'That project has no valid email.' }
  const { raw, hash } = newLoginToken()
  const out = await callScript('create_token', { email: clean, token_hash: hash, ttl_minutes: 60 * 24 * 7, max_per_hour: 20, name })
  if (!out.ok) return { ok: false, message: out.reason === 'rate' ? 'Too many links for this client this hour.' : 'Could not make a link.' }
  return { ok: true, link: `${await siteOrigin()}/portal/verify?token=${raw}` }
}
