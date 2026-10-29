import { callScript } from './script'
import { STAGES, stageIndex } from './stages'

export type Update = { id: string; body: string; created_at: string }

export type Project = {
  id: string
  ref: string
  client_name: string
  client_email: string
  business: string
  title: string
  stage: number
  progress: number
  due_date: string
  preview_url: string
  live_url: string
  note: string
  created_at: string
  updated_at: string
  updates: Update[]
}

const str = (v: unknown) => (v === null || v === undefined ? '' : String(v))

/** Only http(s) links are shown, so a typo in the Sheet can never become a script link. */
export const safeUrl = (v: string) => {
  const s = v.trim()
  if (!s) return ''
  const withProto = /^https?:\/\//i.test(s) ? s : `https://${s}`
  try {
    const u = new URL(withProto)
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : ''
  } catch {
    return ''
  }
}

function normalise(raw: Record<string, unknown>): Project {
  const stage = stageIndex(raw.stage)
  const n = Number(str(raw.progress).replace('%', ''))
  const updates = Array.isArray(raw.updates) ? (raw.updates as Record<string, unknown>[]) : []
  return {
    id: str(raw.id),
    ref: str(raw.ref),
    client_name: str(raw.client_name),
    client_email: str(raw.client_email),
    business: str(raw.business),
    title: str(raw.title) || 'Your website',
    stage,
    progress: Number.isFinite(n) && str(raw.progress) !== '' ? Math.max(0, Math.min(100, Math.round(n))) : STAGES[stage].progress,
    due_date: /^\d{4}-\d{2}-\d{2}/.test(str(raw.due_date)) ? str(raw.due_date).slice(0, 10) : '',
    preview_url: safeUrl(str(raw.preview_url)),
    live_url: safeUrl(str(raw.live_url)),
    note: str(raw.note),
    created_at: str(raw.created_at),
    updated_at: str(raw.updated_at),
    updates: updates.map((u) => ({ id: str(u.id), body: str(u.body), created_at: str(u.created_at) })).filter((u) => u.body.trim()),
  }
}

export async function listProjects(email?: string): Promise<Project[]> {
  const out = await callScript('list', email ? { email } : {})
  if (!out.ok || !Array.isArray(out.projects)) throw new Error(out.error ?? 'Could not read projects')
  return (out.projects as Record<string, unknown>[]).map(normalise)
}

export const fmtDate = (iso: string, withTime = false) => {
  if (!iso) return ''
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(d)
}
