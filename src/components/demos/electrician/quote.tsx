'use client'

import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, FormEvent, JSX } from 'react'
import { ballpark, bytes, jobs, money } from './data'
import type { JobId, QuoteInput } from './data'
import { Arrow, JobIcon } from './parts'
import styles from './styles.module.css'

type Photo = { id: number; name: string; size: number; url: string }
type Done = { ref: string; job: string; range: string; photos: Photo[]; name: string; contact: string }

const MAX_PHOTOS = 6
const MAX_BYTES = 15 * 1024 * 1024

const sizes: { v: number; label: string }[] = [
  { v: 1, label: '1 bed' },
  { v: 2, label: '2 bed' },
  { v: 3, label: '3 bed' },
  { v: 4, label: '4+ bed' },
]

const runs: { v: QuoteInput['run']; label: string }[] = [
  { v: 'short', label: 'Under 10 m' },
  { v: 'mid', label: '10 – 20 m' },
  { v: 'long', label: 'Over 20 m' },
]

function contactOk(s: string): boolean {
  const t = s.trim()
  if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)) return true
  return /^(\+44|0)\d{9,10}$/.test(t.replace(/[\s()-]/g, ''))
}

export function Quote({ job, onJob }: { job: JobId; onJob: (j: JobId) => void }): JSX.Element {
  const [size, setSize] = useState(3)
  const [qty, setQty] = useState(4)
  const [run, setRun] = useState<QuoteInput['run']>('short')
  const [urgent, setUrgent] = useState(false)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [photoMsg, setPhotoMsg] = useState('')
  const [drag, setDrag] = useState(false)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [errors, setErrors] = useState<{ name?: string; contact?: string }>({})
  const [done, setDone] = useState<Done | null>(null)
  const urls = useRef<Set<string>>(new Set())
  const seq = useRef(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const doneRef = useRef<HTMLHeadingElement>(null)

  // Revoke every preview URL when the section goes away.
  useEffect(() => {
    const set = urls.current
    return () => {
      set.forEach((u) => URL.revokeObjectURL(u))
      set.clear()
    }
  }, [])

  useEffect(() => {
    if (done) doneRef.current?.focus()
  }, [done])

  const j = jobs.find((x) => x.id === job) ?? jobs[0]
  const [lo, hi] = ballpark({ job, size, qty, run, urgent })

  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return
    const room = MAX_PHOTOS - photos.length
    const added: Photo[] = []
    let skipped = 0
    for (const f of Array.from(list)) {
      if (!f.type.startsWith('image/') || f.size > MAX_BYTES || added.length >= room) {
        skipped += 1
        continue
      }
      const url = URL.createObjectURL(f)
      urls.current.add(url)
      seq.current += 1
      added.push({ id: seq.current, name: f.name, size: f.size, url })
    }
    setPhotos((p) => [...p, ...added])
    const total = photos.length + added.length
    setPhotoMsg(
      `${added.length} photo${added.length === 1 ? '' : 's'} added, ${total} of ${MAX_PHOTOS}.` +
        (skipped > 0 ? ` ${skipped} skipped: images only, up to 15 MB, ${MAX_PHOTOS} max.` : ''),
    )
  }

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    addFiles(e.target.files)
    if (fileRef.current) fileRef.current.value = ''
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    setDrag(false)
    addFiles(e.dataTransfer.files)
  }

  function removePhoto(p: Photo) {
    URL.revokeObjectURL(p.url)
    urls.current.delete(p.url)
    setPhotos((list) => list.filter((x) => x.id !== p.id))
    setPhotoMsg(`Removed ${p.name}.`)
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const errs: { name?: string; contact?: string } = {}
    if (name.trim().length < 2) errs.name = 'Please add your name.'
    if (!contactOk(contact)) errs.contact = 'Add an email address or a UK mobile number.'
    setErrors(errs)
    if (errs.name || errs.contact) return
    setDone({
      ref: `BL-Q${Math.floor(100000 + Math.random() * 900000)}`,
      job: j.label,
      range: `${money(lo)} – ${money(hi)}`,
      photos,
      name: name.trim(),
      contact: contact.trim(),
    })
  }

  function reset() {
    photos.forEach((p) => {
      URL.revokeObjectURL(p.url)
      urls.current.delete(p.url)
    })
    setPhotos([])
    setPhotoMsg('')
    setName('')
    setContact('')
    setErrors({})
    setDone(null)
  }

  if (done) {
    return (
      <div className={styles.quoteDone}>
        <p className={styles.label}>Request received</p>
        <h3 ref={doneRef} tabIndex={-1} className={styles.doneTitle}>
          Thanks, {done.name.split(' ')[0]}. Your photos are with an electrician.
        </h3>
        <dl className={styles.doneList}>
          <div>
            <dt>Reference</dt>
            <dd className={styles.mono}>{done.ref}</dd>
          </div>
          <div>
            <dt>Job</dt>
            <dd>{done.job}</dd>
          </div>
          <div>
            <dt>Ballpark</dt>
            <dd>{done.range}</dd>
          </div>
          <div>
            <dt>Reply to</dt>
            <dd>{done.contact}</dd>
          </div>
          <div>
            <dt>Photos</dt>
            <dd>{done.photos.length === 0 ? 'None added' : `${done.photos.length} attached`}</dd>
          </div>
        </dl>
        {done.photos.length > 0 && (
          <div className={styles.doneThumbs}>
            {done.photos.map((p) => (
              <span key={p.id} role="img" aria-label={p.name} style={{ backgroundImage: `url(${p.url})` }} />
            ))}
          </div>
        )}
        <p className={styles.mutedText}>
          We would reply the same working day with a fixed price, or suggest a short visit if we need to see more.
        </p>
        <p className={styles.demoNote}>Demo only: nothing has been sent.</p>
        <button type="button" className={styles.btnOutline} onClick={reset}>
          Start another quote
        </button>
      </div>
    )
  }

  return (
    <form className={styles.quote} onSubmit={submit} noValidate>
      <div className={styles.quoteMain}>
        <fieldset className={styles.qBlock}>
          <legend className={styles.qLegend}>
            <span>01</span> What needs doing?
          </legend>
          <div className={styles.jobGrid}>
            {jobs.map((x) => (
              <label key={x.id} className={`${styles.job} ${x.id === job ? styles.jobOn : ''}`}>
                <input
                  type="radio"
                  name="bl-job"
                  value={x.id}
                  checked={x.id === job}
                  onChange={() => onJob(x.id)}
                  className={styles.sr}
                />
                <JobIcon id={x.id} />
                <span>{x.short}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {j.ask !== 'none' && (
          <fieldset className={styles.qBlock}>
            <legend className={styles.qLegend}>
              <span>02</span>{' '}
              {j.ask === 'size' ? 'How big is the property?' : j.ask === 'qty' ? 'How many?' : 'Cable run from fuse box to parking'}
            </legend>
            {j.ask === 'size' && (
              <div className={styles.chips}>
                {sizes.map((s) => (
                  <label key={s.v} className={`${styles.chip} ${size === s.v ? styles.chipOn : ''}`}>
                    <input type="radio" name="bl-size" checked={size === s.v} onChange={() => setSize(s.v)} className={styles.sr} />
                    {s.label}
                  </label>
                ))}
              </div>
            )}
            {j.ask === 'run' && (
              <div className={styles.chips}>
                {runs.map((r) => (
                  <label key={r.v} className={`${styles.chip} ${run === r.v ? styles.chipOn : ''}`}>
                    <input type="radio" name="bl-run" checked={run === r.v} onChange={() => setRun(r.v)} className={styles.sr} />
                    {r.label}
                  </label>
                ))}
              </div>
            )}
            {j.ask === 'qty' && (
              <div className={styles.stepperQty}>
                <button type="button" onClick={() => setQty((n) => Math.max(1, n - 1))} aria-label="One fewer">
                  −
                </button>
                <label htmlFor="bl-qty" className={styles.sr}>
                  Number of {j.id === 'sockets' ? 'sockets' : 'lights'}
                </label>
                <input
                  id="bl-qty"
                  type="number"
                  min={1}
                  max={30}
                  inputMode="numeric"
                  className={styles.qtyInput}
                  value={qty}
                  onChange={(e) => {
                    const n = Number(e.target.value)
                    setQty(Number.isFinite(n) ? Math.min(30, Math.max(1, Math.round(n))) : 1)
                  }}
                />
                <button type="button" onClick={() => setQty((n) => Math.min(30, n + 1))} aria-label="One more">
                  +
                </button>
                <span className={styles.qtyUnit}>{j.id === 'sockets' ? 'sockets' : 'light fittings'}</span>
              </div>
            )}
          </fieldset>
        )}

        <fieldset className={styles.qBlock}>
          <legend className={styles.qLegend}>
            <span>{j.ask === 'none' ? '02' : '03'}</span> Add photos <i>Optional, up to {MAX_PHOTOS}</i>
          </legend>
          <p className={styles.mutedText}>Best: {j.photoTip}</p>
          <label
            className={`${styles.drop} ${drag ? styles.dropOn : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setDrag(true)
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={onPick}
              className={styles.sr}
              disabled={photos.length >= MAX_PHOTOS}
            />
            <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="9" width="28" height="21" rx="4" />
              <path d="M13 9l2-4h6l2 4" />
              <circle cx="18" cy="19" r="5.5" />
            </svg>
            <span className={styles.dropMain}>
              {photos.length >= MAX_PHOTOS ? 'Photo limit reached' : 'Take or choose photos'}
            </span>
            <span className={styles.dropSub}>or drag them here · stays on your device in this demo</span>
          </label>
          <p className={styles.sr} aria-live="polite">
            {photoMsg}
          </p>
          {photos.length > 0 && (
            <ul className={styles.thumbs}>
              {photos.map((p) => (
                <li key={p.id} className={styles.thumb}>
                  <div className={styles.thumbImg} role="img" aria-label={p.name} style={{ backgroundImage: `url(${p.url})` }} />
                  <div className={styles.thumbMeta}>
                    <span>{p.name}</span>
                    <span>{bytes(p.size)}</span>
                  </div>
                  <button type="button" className={styles.thumbX} onClick={() => removePhoto(p)} aria-label={`Remove ${p.name}`}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </fieldset>
      </div>

      <div className={styles.quoteSide}>
        <p className={styles.label}>Instant ballpark</p>
        <p className={styles.range} aria-live="polite">
          <span>{money(lo)}</span>
          <span className={styles.rangeDash}>to</span>
          <span>{money(hi)}</span>
        </p>
        <p className={styles.rangeFor}>
          {j.label}
          {j.ask === 'size' ? ` · ${sizes[size - 1].label}` : ''}
          {j.ask === 'qty' ? ` · ${qty}` : ''}
          {urgent ? ' · within a week' : ''}
        </p>
        <label className={styles.switchRow}>
          <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} className={styles.switchInput} />
          <span className={styles.switchTrack} aria-hidden="true" />
          <span>I need it within a week (+10%)</span>
        </label>
        <p className={styles.sideNote}>
          Includes labour, standard materials, testing and certificate. A ballpark, not a quote: we confirm a fixed price
          after seeing your photos.
        </p>
        <div className={styles.sideFields}>
          <div className={styles.field}>
            <label htmlFor="bl-name">Your name</label>
            <input
              id="bl-name"
              className={styles.input}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? 'bl-name-err' : undefined}
            />
            {errors.name && <p id="bl-name-err" className={styles.err}>{errors.name}</p>}
          </div>
          <div className={styles.field}>
            <label htmlFor="bl-contact">Email or mobile</label>
            <input
              id="bl-contact"
              className={styles.input}
              autoComplete="email"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              aria-invalid={errors.contact ? true : undefined}
              aria-describedby={errors.contact ? 'bl-contact-err' : undefined}
            />
            {errors.contact && <p id="bl-contact-err" className={styles.err}>{errors.contact}</p>}
          </div>
        </div>
        <button type="submit" className={styles.btnYellow}>
          Send for a fixed price <Arrow />
        </button>
        <p className={styles.sideFoot}>
          {photos.length} photo{photos.length === 1 ? '' : 's'} attached
        </p>
      </div>
    </form>
  )
}
