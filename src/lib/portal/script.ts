/**
 * The Google Apps Script web app (apps-script/portal.gs) that stores client
 * projects in a Google Sheet and sends email. Server-only: the URL and token
 * are secrets and must never be renamed to NEXT_PUBLIC_*.
 */

export type ScriptResult = { ok: boolean; error?: string; reason?: string; [key: string]: unknown }

export const scriptReady = () => Boolean(process.env.PORTAL_SCRIPT_URL && process.env.PORTAL_SCRIPT_TOKEN)

export async function callScript(action: string, args: Record<string, unknown> = {}): Promise<ScriptResult> {
  const url = process.env.PORTAL_SCRIPT_URL
  const token = process.env.PORTAL_SCRIPT_TOKEN
  if (!url || !token) throw new Error('PORTAL_SCRIPT_URL or PORTAL_SCRIPT_TOKEN is not set')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 25_000)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action, args }),
      redirect: 'follow',
      cache: 'no-store',
      signal: controller.signal,
    })
    const out: unknown = await res.json().catch(() => null)
    if (!out || typeof out !== 'object') throw new Error(`The Sheet script answered ${res.status} without JSON`)
    return out as ScriptResult
  } finally {
    clearTimeout(timer)
  }
}
