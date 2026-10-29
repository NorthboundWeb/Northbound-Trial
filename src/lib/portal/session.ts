/**
 * Signed-cookie sessions for the client area. The cookie holds the email and
 * an expiry, signed with SESSION_SECRET (HMAC-SHA256). Sign-in links carry a
 * random token; only its SHA-256 hash is stored in the Sheet.
 */

import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { cookies, headers } from 'next/headers'
import { site } from '@/lib/site'

export const SESSION_COOKIE = 'nb_session'
const MAX_AGE = 60 * 60 * 24 * 30

export type Session = { email: string; admin: boolean }

/**
 * SESSION_SECRET if set, otherwise a key derived from PORTAL_SCRIPT_TOKEN, so
 * the client area needs only the two Sheet values to work.
 */
function secretOrEmpty() {
  const own = process.env.SESSION_SECRET
  if (own && own.length >= 32) return own
  const token = process.env.PORTAL_SCRIPT_TOKEN
  return token && token.length >= 32 ? createHmac('sha256', token).update('nb-session-v1').digest('base64url') : ''
}

export const sessionsReady = () => secretOrEmpty() !== ''

function secret() {
  const s = secretOrEmpty()
  if (!s) throw new Error('PORTAL_SCRIPT_TOKEN (or SESSION_SECRET) is missing')
  return s
}

const sign = (value: string) => createHmac('sha256', secret()).update(value).digest('base64url')

export function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

export const isAdmin = (email: string) => adminEmails().includes(email.trim().toLowerCase())

export async function getSession(): Promise<Session | null> {
  if (!sessionsReady()) return null
  const raw = (await cookies()).get(SESSION_COOKIE)?.value
  if (!raw) return null
  const [body, sig] = raw.split('.')
  if (!body || !sig) return null
  const a = Buffer.from(sig)
  const b = Buffer.from(sign(body))
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as { e?: unknown; x?: unknown }
    if (typeof p.e !== 'string' || typeof p.x !== 'number' || p.x < Date.now()) return null
    return { email: p.e, admin: isAdmin(p.e) }
  } catch {
    return null
  }
}

/** Only call from a Server Action or Route Handler. */
export async function startSession(email: string) {
  const body = Buffer.from(JSON.stringify({ e: email.trim().toLowerCase(), x: Date.now() + MAX_AGE * 1000 })).toString('base64url')
  ;(await cookies()).set(SESSION_COOKIE, `${body}.${sign(body)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  })
}

export async function endSession() {
  ;(await cookies()).delete(SESSION_COOKIE)
}

export const hashToken = (raw: string) => createHash('sha256').update(raw).digest('hex')

export function newLoginToken() {
  const raw = randomBytes(32).toString('base64url')
  return { raw, hash: hashToken(raw) }
}

/** Where sign-in links point: the real domain in production, the current host on previews. */
export async function siteOrigin() {
  if (process.env.VERCEL_ENV === 'production') return site.url
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'https'
  return host ? `${proto}://${host}` : site.url
}

/** A tiny per-instance limiter: enough to blunt a script hammering a form. */
const hits = new Map<string, number[]>()
export async function limited(bucket: string, max: number, windowMs: number) {
  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
  const key = `${bucket}:${ip}`
  const now = Date.now()
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  list.push(now)
  hits.set(key, list)
  if (hits.size > 5000) hits.clear()
  return list.length > max
}
