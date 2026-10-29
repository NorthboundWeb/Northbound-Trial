/**
 * Autosave for the Start a project flow. The text answers go in localStorage
 * and the (already shrunk) photos in IndexedDB, both on this device only, so a
 * refresh, a closed tab or a dropped signal does not lose anything. Every call
 * is wrapped: private windows and blocked storage just mean no draft.
 */

import type { Photo, StartForm, StepId } from './options'

const KEY = 'nb-start-draft'
const DB = 'nb-start'
const STORE = 'photos'

export type Draft = { f: StartForm; step: StepId; savedAt: number; photoCount: number }

export function loadDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const d = JSON.parse(raw) as Draft
    if (!d || typeof d !== 'object' || typeof d.f !== 'object' || d.f === null) return null
    if (Date.now() - d.savedAt > 30 * 24 * 60 * 60 * 1000) return null
    return d
  } catch {
    return null
  }
}

export function saveDraft(f: StartForm, step: StepId, photoCount: number) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ f, step, savedAt: Date.now(), photoCount } satisfies Draft))
  } catch {
    // Storage full or blocked: the draft is simply not kept.
  }
}

function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function savePhotos(photos: Photo[]) {
  try {
    const d = await db()
    const tx = d.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(
      photos.map(({ id, name, type, data, bytes }) => ({ id, name, type, data, bytes })),
      'list'
    )
    await new Promise<void>((res, rej) => {
      tx.oncomplete = () => res()
      tx.onerror = () => rej(tx.error)
    })
    d.close()
  } catch {
    // No IndexedDB: photos are not kept across a refresh.
  }
}

export async function loadPhotos(): Promise<Photo[]> {
  try {
    const d = await db()
    const out = await new Promise<unknown>((res, rej) => {
      const r = d.transaction(STORE).objectStore(STORE).get('list')
      r.onsuccess = () => res(r.result)
      r.onerror = () => rej(r.error)
    })
    d.close()
    if (!Array.isArray(out)) return []
    return out
      .filter((p): p is Omit<Photo, 'preview'> => !!p && typeof p.data === 'string' && typeof p.id === 'string')
      .map((p) => ({ ...p, preview: `data:${p.type};base64,${p.data}` }))
  } catch {
    return []
  }
}

export async function clearDraft() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
  try {
    const d = await db()
    d.transaction(STORE, 'readwrite').objectStore(STORE).delete('list')
    d.close()
  } catch {
    // ignore
  }
}
