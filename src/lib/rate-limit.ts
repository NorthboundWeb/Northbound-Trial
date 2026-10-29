/**
 * Minimal fixed-window rate limiter held in module memory.
 *
 * Deliberately simple: it sits in front of the booking and diary-login actions
 * as a first, cheap filter. The database adds its own durable limit (no more
 * than three open requests per email), so this does not have to be perfect.
 *
 * Known limitation: serverless instances do not share memory, so the effective
 * limit is per warm instance rather than global. It raises the cost of casual
 * form spam; it is not a defence against a determined distributed flood. If
 * this site ever grows a login or a payment path, replace it with a shared
 * store (Upstash, or a Postgres table) rather than extending this.
 */

type Window = { count: number; resetAt: number }

const windows = new Map<string, Window>()

const MAX_KEYS = 5_000

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): { ok: boolean; retryAfterSeconds: number } {
  const now = Date.now()
  const existing = windows.get(key)

  if (!existing || existing.resetAt <= now) {
    // Opportunistic cleanup so the map cannot grow without bound on a
    // long-lived instance.
    if (windows.size >= MAX_KEYS) {
      for (const [k, v] of windows) {
        if (v.resetAt <= now) windows.delete(k)
      }
    }

    windows.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfterSeconds: 0 }
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    }
  }

  existing.count += 1
  return { ok: true, retryAfterSeconds: 0 }
}
