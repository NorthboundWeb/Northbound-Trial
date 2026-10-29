/**
 * Two small cookies, both httpOnly so page scripts cannot read them.
 *
 * - `nb_tickets`: the (ref, token) pairs for this visitor's own requests. The
 *   token is the only proof that a request is theirs; the database stores
 *   just its hash.
 * - `nb_diary`: set after the owner enters DIARY_PASSWORD. Its value is an
 *   HMAC of a timestamp, so it cannot be forged without DIARY_SESSION_KEY.
 *
 * Server-only.
 */

import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

const TICKETS = 'nb_tickets'
const DIARY = 'nb_diary'
const MAX_TICKETS = 10
const DIARY_TTL_MS = 12 * 60 * 60 * 1000

export type Ticket = { ref: string; token: string }

const secure = process.env.NODE_ENV === 'production'

export async function readTickets(): Promise<Ticket[]> {
  const raw = (await cookies()).get(TICKETS)?.value
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (t): t is Ticket =>
          typeof t === 'object' && t !== null && typeof t.ref === 'string' && typeof t.token === 'string'
      )
      .slice(0, MAX_TICKETS)
  } catch {
    return []
  }
}

export async function addTicket(t: Ticket) {
  const list = [t, ...(await readTickets()).filter((x) => x.ref !== t.ref)].slice(0, MAX_TICKETS)
  ;(await cookies()).set(TICKETS, JSON.stringify(list), {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 60 * 60 * 24 * 60,
  })
}

function sign(value: string) {
  const key = process.env.DIARY_SESSION_KEY
  if (!key) throw new Error('DIARY_SESSION_KEY is not set.')
  return createHmac('sha256', key).update(value).digest('hex')
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

export function passwordMatches(attempt: string) {
  const real = process.env.DIARY_PASSWORD
  if (!real) return false
  // Compare digests so the length of the real password is not leaked.
  return safeEqual(sign(`pw:${attempt}`), sign(`pw:${real}`))
}

export async function startDiarySession() {
  const issued = String(Date.now())
  ;(await cookies()).set(DIARY, `${issued}.${sign(`diary:${issued}`)}`, {
    httpOnly: true,
    sameSite: 'strict',
    secure,
    path: '/',
    maxAge: DIARY_TTL_MS / 1000,
  })
}

export async function endDiarySession() {
  ;(await cookies()).delete(DIARY)
}

export async function isDiaryOwner() {
  const raw = (await cookies()).get(DIARY)?.value
  if (!raw || !process.env.DIARY_SESSION_KEY) return false
  const [issued, mac] = raw.split('.')
  if (!issued || !mac) return false
  if (!(Date.now() - Number(issued) < DIARY_TTL_MS)) return false
  return safeEqual(mac, sign(`diary:${issued}`))
}
