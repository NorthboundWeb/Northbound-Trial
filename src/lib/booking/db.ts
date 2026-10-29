/**
 * The only door to the database: Supabase's PostgREST RPC endpoint.
 *
 * The bookings live in the `nb_booking` schema, which the API does not expose.
 * Nothing can read or write those tables directly; it can only call the
 * `public.nb_booking_*` functions, each of which validates its input and
 * returns only what that caller is allowed to see. Owner functions also need
 * NB_ADMIN_SECRET, which never leaves the server.
 *
 * Server-only. Do not import this from a client component.
 */

const TIMEOUT_MS = 8_000

export class BookingDbError extends Error {}

export async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new BookingDbError('SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY is not set.')

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: { apikey: key, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
      cache: 'no-store',
      signal: controller.signal,
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new BookingDbError(`${fn} failed with ${res.status}: ${detail.slice(0, 300)}`)
    }
    return (await res.json()) as T
  } finally {
    clearTimeout(timer)
  }
}

export function adminSecret() {
  const s = process.env.NB_ADMIN_SECRET
  if (!s) throw new BookingDbError('NB_ADMIN_SECRET is not set.')
  return s
}
