'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CONTACT_EMAIL } from '@/lib/booking/options'
import { whatsappHref } from '@/lib/contact'
import {
  BUILD_GROUPS,
  buildValue,
  LAST_BOOKABLE_DAYS,
  MAX_PHOTOS,
  OFFER,
  PHOTO_MAX_BYTES,
  PHOTO_MAX_EDGE,
  REPLY_OPTIONS,
  STEPS,
  addDays,
  composeRequest,
  dayDiff,
  dayKind,
  emptyStart,
  fmtDay,
  validateStep,
  type DayKind,
  type Photo,
  type StartForm,
  type StepId,
} from '@/lib/start/options'
import { clearDraft, loadDraft, loadPhotos, saveDraft, savePhotos, type Draft } from '@/lib/start/draft'
import { goWithCurtain } from './curtain'
import { SWIPE_BACK_EVENT } from './swipe-back'
import { TopBar } from './top-bar'

/**
 * "Start a project": the free-build request.
 *
 * Eight short screens. A step rail across the top and a live summary down the
 * side are both clickable, so wherever you click takes you to the screen that
 * deals with it. Each screen is a history entry (?step=photos and so on), so
 * back, the phone's edge swipe and the site's swipe gesture step back one.
 */

const IDS = STEPS.map((s) => s.id)
const idx = (id: StepId) => IDS.indexOf(id)

const DETAIL_PROMPTS = [
  'Who your customers are',
  'Pages you need',
  'Features (bookings, shop, forms…)',
  'Colours or style you like',
  'Sites you like the look of',
]

const KIND_LABEL: Record<DayKind, string> = {
  past: '',
  processing: 'Processing',
  building: 'Building',
  maybe: 'May change',
  open: '',
}

async function compress(file: File): Promise<Photo | null> {
  if (!file.type.startsWith('image/')) return null
  try {
    const bmp = await createImageBitmap(file)
    const scale = Math.min(1, PHOTO_MAX_EDGE / Math.max(bmp.width, bmp.height))
    const w = Math.max(1, Math.round(bmp.width * scale))
    const h = Math.max(1, Math.round(bmp.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(bmp, 0, 0, w, h)
    bmp.close()
    let quality = 0.82
    let blob: Blob | null = null
    for (let i = 0; i < 4; i++) {
      blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', quality))
      if (blob && blob.size <= PHOTO_MAX_BYTES) break
      quality -= 0.15
    }
    if (!blob || blob.size > PHOTO_MAX_BYTES) return null
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const fr = new FileReader()
      fr.onload = () => resolve(String(fr.result))
      fr.onerror = () => reject(fr.error)
      fr.readAsDataURL(blob as Blob)
    })
    return {
      id: `${file.name}-${file.size}-${file.lastModified}`,
      name: file.name,
      type: 'image/jpeg',
      data: dataUrl.split(',')[1] ?? '',
      preview: dataUrl,
      bytes: blob.size,
    }
  } catch {
    return null
  }
}

export function StartFlow() {
  const [step, setStep] = useState<StepId>('offer')
  const [f, setF] = useState<StartForm>(emptyStart)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [photoMsg, setPhotoMsg] = useState('')
  const [processing, setProcessing] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [sent, setSent] = useState<{ ref: string; name: string; replyVia: string; date: string; href: string; files: File[] } | null>(null)
  const [shareMsg, setShareMsg] = useState('')
  const [canShare, setCanShare] = useState(false)
  const [today, setToday] = useState('')
  const [openGroup, setOpenGroup] = useState('')
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [saved, setSaved] = useState(false)

  const heading = useRef<HTMLHeadingElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const detailsBox = useRef<HTMLTextAreaElement>(null)
  const firstRender = useRef(true)
  const sentRef = useRef(sent)
  const ready = useRef(false)

  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const jump = q.get('build')
    if (jump && BUILD_GROUPS.some((g) => g.id === jump)) {
      // Arrived from a chip on the home page: open straight onto that heading.
      window.history.replaceState(null, '', window.location.pathname)
      window.history.pushState(null, '', '?step=build')
      setTimeout(() => {
        setStep('build')
        setOpenGroup(jump)
      }, 0)
    } else if (q.has('step')) window.history.replaceState(null, '', window.location.pathname)
    const t0 = setTimeout(() => {
      const d = loadDraft()
      if (d && (d.f.build?.length || d.f.details?.trim() || d.f.name?.trim() || d.photoCount)) setDraft(d)
      ready.current = true
    }, 0)
    const t = setTimeout(() => setToday(new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())), 0)
    return () => {
      clearTimeout(t)
      clearTimeout(t0)
    }
  }, [])

  useEffect(() => {
    if (!ready.current || sent || draft) return
    const t = setTimeout(() => {
      const blank = !f.build.length && !f.details.trim() && !f.name.trim() && !f.business.trim() && !f.website.trim() && !photos.length
      if (blank) return
      saveDraft(f, step, photos.length)
      setSaved(true)
    }, 500)
    return () => clearTimeout(t)
  }, [f, step, photos.length, sent, draft])

  useEffect(() => {
    if (!ready.current || sent || draft) return
    void savePhotos(photos)
  }, [photos, sent, draft])

  useEffect(() => {
    sentRef.current = sent
    if (!sent?.files.length) return
    const t = setTimeout(() => setCanShare(typeof navigator.canShare === 'function' && navigator.canShare({ files: sent.files })), 0)
    return () => clearTimeout(t)
  }, [sent])

  useEffect(() => {
    const read = (): StepId => {
      const q = new URLSearchParams(window.location.search).get('step')
      return (IDS as readonly string[]).includes(q ?? '') ? (q as StepId) : 'offer'
    }
    const onPop = () => {
      if (sentRef.current) return goWithCurtain('/')
      setErrs({})
        setStep(read())
    }
    const onSwipe = (e: Event) => {
      if (sentRef.current) return
      if (read() !== 'offer') {
        e.preventDefault()
        window.history.back()
      }
    }
    window.addEventListener('popstate', onPop)
    window.addEventListener(SWIPE_BACK_EVENT, onSwipe)
    return () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener(SWIPE_BACK_EVENT, onSwipe)
    }
  }, [])

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    heading.current?.focus({ preventScroll: true })
    window.scrollTo({ top: 0 })
  }, [step, sent])

  const set = <K extends keyof StartForm>(k: K, v: StartForm[K]) => {
    setF((prev) => ({ ...prev, [k]: v }))
    setErrs((prev) => {
      if (!prev[k as string]) return prev
      const next = { ...prev }
      delete next[k as string]
      return next
    })
  }

  async function resume() {
    if (!draft) return
    const d = draft
    setF({ ...emptyStart(), ...d.f, socials: d.f.socials?.length ? d.f.socials : [''] })
    if (d.photoCount) setPhotos(await loadPhotos())
    setDraft(null)
    const to = d.step === 'offer' ? 'build' : d.step
    window.history.pushState(null, '', `?step=${to}`)
    setStep(to)
  }

  function discardDraft() {
    void clearDraft()
    setDraft(null)
    setSaved(false)
  }

  function goTo(id: StepId) {
    if (id === step) return
    if (draft) discardDraft()
    setErrs({})
    setSummaryOpen(false)
    window.history.pushState(null, '', id === 'offer' ? window.location.pathname : `?step=${id}`)
    setStep(id)
  }

  function next() {
    const found = validateStep(step, f, today)
    if (Object.keys(found).length) {
      setErrs(found)
      const first = Object.keys(found)[0]
      requestAnimationFrame(() => document.getElementById(`sf-${first}`)?.focus())
      return
    }
    if (step === 'review') return submit()
    goTo(IDS[idx(step) + 1])
  }

  function back() {
    if (new URLSearchParams(window.location.search).get('step')) window.history.back()
    else goTo(IDS[Math.max(0, idx(step) - 1)])
  }

  async function addFiles(list: FileList | File[]) {
    const files = Array.from(list)
    if (!files.length) return
    setProcessing(true)
    setPhotoMsg('')
    const room = MAX_PHOTOS - photos.length
    const take = files.slice(0, Math.max(0, room))
    const skipped: string[] = []
    if (files.length > room) skipped.push(`${files.length - room} over the limit of ${MAX_PHOTOS}`)
    const done: Photo[] = []
    for (const file of take) {
      const p = await compress(file)
      if (p) done.push(p)
      else skipped.push(file.name)
    }
    setPhotos((prev) => {
      const seen = new Set(prev.map((p) => p.id))
      return [...prev, ...done.filter((p) => !seen.has(p.id))].slice(0, MAX_PHOTOS)
    })
    setProcessing(false)
    setPhotoMsg(
      done.length
        ? `Added ${done.length} photo${done.length === 1 ? '' : 's'}.${skipped.length ? ` Skipped: ${skipped.join(', ')}.` : ''}`
        : skipped.length
          ? `Could not add: ${skipped.join(', ')}. Photos only (JPG, PNG, HEIC from most phones works).`
          : ''
    )
  }

  function addPrompt(p: string) {
    const line = `${p}: `
    const cur = f.details
    const nextText = cur && !cur.endsWith('\n') ? `${cur}\n${line}` : `${cur}${line}`
    set('details', nextText)
    requestAnimationFrame(() => {
      const el = detailsBox.current
      if (!el) return
      el.focus()
      el.setSelectionRange(nextText.length, nextText.length)
    })
  }

  /** Sends the request as a WhatsApp message to Che. Runs inside the click, so the new tab is not blocked. */
  function submit() {
    const ref = `NB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    const href = whatsappHref(`${composeRequest(f, today, photos.length)}\n\nRef ${ref}`)
    const files = photos.map((p) => {
      const bin = atob(p.data)
      const bytes = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
      return new File([bytes], `${p.name.replace(/\.[^.]+$/, '') || 'photo'}.jpg`, { type: 'image/jpeg' })
    })
    window.open(href, '_blank', 'noopener,noreferrer')
    void clearDraft()
    setSent({ ref, name: f.name, replyVia: f.replyVia, date: f.date, href, files })
  }

  async function sharePhotos() {
    if (!sent?.files.length) return
    try {
      await navigator.share({ files: sent.files, title: `Photos for ${sent.ref}` })
      setShareMsg('Shared. Pick my chat in WhatsApp if it did not open there.')
    } catch (e) {
      if ((e as Error)?.name !== 'AbortError') setShareMsg('Your browser could not share them. Attach them in the WhatsApp chat with the paperclip.')
    }
  }

  // ---- calendar ---------------------------------------------------------------
  const months = useMemo(() => {
    if (!today) return []
    const out: { key: string; label: string; cells: (string | null)[] }[] = []
    const [y0, m0] = today.split('-').map(Number)
    for (let k = 0; k < 5; k++) {
      const y = y0 + Math.floor((m0 - 1 + k) / 12)
      const m = ((m0 - 1 + k) % 12) + 1
      const first = `${y}-${String(m).padStart(2, '0')}-01`
      const lead = (new Date(`${first}T12:00:00Z`).getUTCDay() + 6) % 7
      const days = new Date(Date.UTC(y, m, 0)).getUTCDate()
      const cells: (string | null)[] = Array.from({ length: lead }, () => null)
      for (let d = 1; d <= days; d++) cells.push(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
      out.push({ key: first, label: fmtDay(first, { month: 'long', year: 'numeric' }), cells })
    }
    return out
  }, [today])

  const err = (k: string) =>
    errs[k] ? (
      <p className="err" role="alert" id={`sf-e-${k}`}>
        {errs[k]}
      </p>
    ) : null

  const input = (k: 'business' | 'trade' | 'website' | 'portfolio' | 'name' | 'email' | 'phone', label: string, opts: { type?: string; ac?: string; optional?: boolean; placeholder?: string; hint?: string } = {}) => (
    <div className="field">
      <label htmlFor={`sf-${k}`}>
        {label}
        {opts.optional && <i>Optional</i>}
      </label>
      <input
        id={`sf-${k}`}
        type={opts.type ?? 'text'}
        autoComplete={opts.ac ?? 'off'}
        placeholder={opts.placeholder}
        value={f[k]}
        onChange={(e) => set(k, e.target.value)}
        aria-invalid={errs[k] ? true : undefined}
        aria-describedby={errs[k] ? `sf-e-${k}` : undefined}
      />
      {opts.hint && !errs[k] && <p className="note">{opts.hint}</p>}
      {err(k)}
    </div>
  )

  // ---- summary (clickable) -------------------------------------------------------
  const filledSocials = f.socials.filter((s) => s.trim())
  const summary: { id: StepId; label: string; value: string; done: boolean }[] = [
    { id: 'build', label: 'Build', value: f.build.join(', ') || 'Not chosen yet', done: f.build.length > 0 },
    {
      id: 'details',
      label: 'Details',
      value: f.details.trim() ? `${f.business.trim() ? `${f.business.trim()}: ` : ''}${f.details.trim().slice(0, 70)}${f.details.trim().length > 70 ? '…' : ''}` : 'Nothing yet',
      done: f.details.trim().length >= 20,
    },
    { id: 'photos', label: 'Photos', value: photos.length ? `${photos.length} added` : 'None (optional)', done: photos.length > 0 },
    {
      id: 'links',
      label: 'Links',
      value: [f.website.trim() && 'Website', filledSocials.length && `${filledSocials.length} social`, f.portfolio.trim() && 'Portfolio'].filter(Boolean).join(' · ') || 'None (optional)',
      done: !!(f.website.trim() || filledSocials.length || f.portfolio.trim()),
    },
    { id: 'date', label: 'Wanted by', value: f.date ? fmtDay(f.date, { weekday: 'short', day: 'numeric', month: 'short' }) : 'Pick a date', done: !!f.date },
    { id: 'you', label: 'You', value: f.name.trim() ? `${f.name.trim()} · ${f.replyVia === 'whatsapp' ? 'WhatsApp' : f.replyVia === 'email' ? 'Email' : 'reply?'}` : 'Not filled in', done: !!(f.name.trim() && f.replyVia && (f.replyVia !== 'email' || f.email.trim())) },
  ]
  const doneCount = summary.filter((s) => s.done).length

  // ---- sent ------------------------------------------------------------------------
  if (sent) {
    const first = sent.name.trim().split(/\s+/)[0] || 'friend'
    const how = sent.replyVia === 'email' ? 'by email' : 'in the same chat'
    const d0 = today || sent.date
    const n = sent.files.length
    return (
      <>
        <TopBar count="Almost done" progress={1} />
        <div className="stage sf-stage step-in" id="main">
          <p className="label">Ref {sent.ref}</p>
          <h1 className="display" tabIndex={-1} ref={heading} style={{ marginTop: 14 }}>
            Press send in WhatsApp, {first}<span className="kick">.</span>
          </h1>
          <p className="sub">
            Your request is typed out in a WhatsApp chat with me. Press send there and I will reply {how}. Nothing to pay for your first website unless you love it.
          </p>
          <div className="sf-sendbox">
            <a className="btn solid" href={sent.href} target="_blank" rel="noopener noreferrer">
              Open WhatsApp again
            </a>
            {n > 0 &&
              (canShare ? (
                <button type="button" className="btn" onClick={sharePhotos}>
                  Send my {n} photo{n === 1 ? '' : 's'}
                </button>
              ) : (
                <p className="note">Then attach your {n} photo{n === 1 ? '' : 's'} in the chat with the paperclip.</p>
              ))}
          </div>
          {shareMsg && (
            <p className="note" aria-live="polite" style={{ marginTop: 10 }}>
              {shareMsg}
            </p>
          )}
          <ol className="sf-timeline" aria-label="What happens next">
            <li className="k-processing">
              <b>{fmtDay(d0, { weekday: 'short', day: 'numeric', month: 'short' })}</b>
              <span>Processing your request (up to 24 hours)</span>
            </li>
            <li className="k-building">
              <b>
                {fmtDay(addDays(d0, 1), { weekday: 'short', day: 'numeric' })} – {fmtDay(addDays(d0, 3), { weekday: 'short', day: 'numeric', month: 'short' })}
              </b>
              <span>Building (estimated 72 hours)</span>
            </li>
            <li className="k-open">
              <b>{fmtDay(sent.date, { weekday: 'short', day: 'numeric', month: 'short' })}</b>
              <span>Your website, ready to look at</span>
            </li>
          </ol>
          <p className="note" style={{ marginTop: 24 }}>
            If you love it, you buy it. If you do not, that is the end of it: I will not contact you again. No WhatsApp? Email the same details to{' '}
            <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Free website request ${sent.ref}`)}&body=${encodeURIComponent(composeRequest(f, d0, n))}`}>{CONTACT_EMAIL}</a>.
          </p>
        </div>
        <div className="actions">
          <div className="actions-in">
            <Link className="btn grow" href="/work">
              See what I have built
            </Link>
          </div>
        </div>
      </>
    )
  }

  const at = idx(step)
  const isOffer = step === 'offer'

  return (
    <>
      <TopBar count={isOffer ? 'Free build' : `${at} / ${STEPS.length - 1}`} progress={at / (STEPS.length - 1)} />
      <div className="sf-wrap" id="main">
        <nav className="sf-rail" aria-label="Steps">
          <ol>
            {STEPS.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={`sf-rail-btn${s.id === step ? ' on' : ''}${i < at ? ' past' : ''}`}
                  aria-current={s.id === step ? 'step' : undefined}
                  onClick={() => goTo(s.id)}
                >
                  <span aria-hidden="true">{i === 0 ? '★' : i}</span>
                  {s.label}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className="sf-grid">
          <form
            className="sf-main"
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              next()
            }}
            aria-label={`Start a project: ${STEPS[at].label}`}
            id="sf-form"
          >
            <div className="step-in" key={step}>
              {isOffer && (
                <>
                  {draft && (
                    <div className="sf-resume" role="region" aria-label="Saved request">
                      <div>
                        <b>Welcome back{draft.f.name?.trim() ? `, ${draft.f.name.trim().split(/\s+/)[0]}` : ''}.</b>
                        <span>I kept what you had filled in on this device.</span>
                      </div>
                      <div className="sf-resume-btns">
                        <button type="button" className="btn solid small" onClick={() => void resume()}>
                          Carry on
                        </button>
                        <button type="button" className="btn small" onClick={discardDraft}>
                          Start again
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="label sf-kick">No deposit · No obligation</p>
                  <h1 className="display sf-hero" tabIndex={-1} ref={heading}>
                    {OFFER.headline}
                  </h1>
                  <p className="sub">Your first website is on me. Tell me what you need and I build it. If you love it, you buy it. If you do not, I will not contact you again. After that, new websites and systems start with a 50% deposit.</p>
                  <div className="sf-offer">
                    {OFFER.points.map((p) => (
                      <button key={p.id} type="button" className="sf-offer-card" onClick={() => goTo('build')}>
                        <b>{p.title}</b>
                        <span>{p.body}</span>
                        <i aria-hidden="true">Start →</i>
                      </button>
                    ))}
                  </div>
                  <button type="button" className="sf-time" onClick={() => goTo('date')}>
                    <span className="sf-time-bar" aria-hidden="true">
                      <span className="k-processing">1</span>
                      <span className="k-building">2</span>
                      <span className="k-building">3</span>
                      <span className="k-building">4</span>
                      <span className="k-maybe">5</span>
                      <span className="k-maybe">6</span>
                      <span className="k-maybe">7</span>
                    </span>
                    <span className="sf-time-text">
                      <b>{OFFER.timing.processing}</b> {OFFER.timing.build} <u>Pick your date →</u>
                    </span>
                  </button>
                </>
              )}

              {step === 'build' && (
                <>
                  <h1 className="display" tabIndex={-1} ref={heading}>
                    What should I build?
                  </h1>
                  <p className="sub">Tap a heading to open it, then pick what fits. Choose as many as you like. I build websites and systems of any size.</p>
                  <div className="body">
                    <div className="sf-acc" id="sf-build" tabIndex={-1}>
                      {BUILD_GROUPS.map((g) => {
                        const open = openGroup === g.id
                        const chosen = f.build.filter((v) => v === g.title || v.startsWith(`${g.title}: `))
                        const toggle = (v: string) => set('build', f.build.includes(v) ? f.build.filter((x) => x !== v) : [...f.build, v])
                        const direct = g.items.length === 0
                        return (
                          <div key={g.id} className={`sf-acc-item${open ? ' open' : ''}${chosen.length ? ' has' : ''}`}>
                            <h2>
                              <button
                                type="button"
                                id={`sf-acc-b-${g.id}`}
                                className="sf-acc-head"
                                aria-expanded={direct ? undefined : open}
                                aria-controls={direct ? undefined : `sf-acc-p-${g.id}`}
                                aria-pressed={direct ? chosen.length > 0 : undefined}
                                onClick={() => {
                                  if (direct) {
                                    setOpenGroup('')
                                    toggle(buildValue(g))
                                  } else setOpenGroup(open ? '' : g.id)
                                }}
                              >
                                <span className="sf-acc-t">
                                  <b>{g.title}</b>
                                  <small>{g.blurb}</small>
                                </span>
                                {chosen.length > 0 && !direct && <em className="sf-acc-n">{chosen.length}</em>}
                                <i aria-hidden="true" className={direct ? 'tick' : 'chev'}>
                                  {direct ? (chosen.length ? '✓' : '+') : ''}
                                </i>
                              </button>
                            </h2>
                            {!direct && (
                              <div id={`sf-acc-p-${g.id}`} role="region" aria-labelledby={`sf-acc-b-${g.id}`} className="sf-acc-panel" hidden={!open}>
                                <div className="sf-acc-in">
                                  {g.items.map((item) => {
                                    const v = buildValue(g, item)
                                    return (
                                      <button key={item} type="button" className="pill" aria-pressed={f.build.includes(v)} onClick={() => toggle(v)}>
                                        {item}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    {err('build')}
                  </div>
                </>
              )}

              {step === 'details' && (
                <>
                  <h1 className="display" tabIndex={-1} ref={heading}>
                    Give me as much detail as you can.
                  </h1>
                  <p className="sub">The more I know, the closer the first version will be. Tap a prompt to add it.</p>
                  <div className="body stack">
                    <div className="grid2">
                      {input('business', 'Business name', { optional: true, ac: 'organization' })}
                      {input('trade', 'What you do', { optional: true, placeholder: 'e.g. mobile dog groomer in Leeds' })}
                    </div>
                    <div className="sf-prompts" role="group" aria-label="Add a prompt">
                      {DETAIL_PROMPTS.map((p) => (
                        <button key={p} type="button" className="pill sm" onClick={() => addPrompt(p)}>
                          + {p}
                        </button>
                      ))}
                    </div>
                    <div className="field">
                      <label htmlFor="sf-details">Your details</label>
                      <textarea
                        id="sf-details"
                        ref={detailsBox}
                        rows={9}
                        value={f.details}
                        onChange={(e) => set('details', e.target.value)}
                        placeholder="What the business does, who it is for, what the website or system needs to do, anything you love or hate about other sites…"
                        aria-invalid={errs.details ? true : undefined}
                        aria-describedby="sf-meter"
                      />
                      <div className="sf-meter" id="sf-meter">
                        <span style={{ width: `${Math.min(100, (f.details.trim().length / 600) * 100)}%` }} />
                        <em>
                          {f.details.trim().length < 20
                            ? 'Just getting started'
                            : f.details.trim().length < 200
                              ? 'Good start, keep going'
                              : f.details.trim().length < 600
                                ? 'Plenty to work with'
                                : 'Brilliant, that is loads'}
                        </em>
                      </div>
                      {err('details')}
                    </div>
                  </div>
                </>
              )}

              {step === 'photos' && (
                <>
                  <h1 className="display" tabIndex={-1} ref={heading}>
                    Got any photos?
                  </h1>
                  <p className="sub">Your work, your premises, your logo, your team. Up to {MAX_PHOTOS}. After you press send, you can drop them into our WhatsApp chat. No photos? Skip this, I can work without them.</p>
                  <div className="body">
                    <div
                      className={`sf-drop${dragging ? ' over' : ''}`}
                      onDragOver={(e) => {
                        e.preventDefault()
                        setDragging(true)
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault()
                        setDragging(false)
                        void addFiles(e.dataTransfer.files)
                      }}
                    >
                      <input
                        ref={fileInput}
                        id="sf-files"
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr"
                        onChange={(e) => {
                          if (e.target.files) void addFiles(e.target.files)
                          e.target.value = ''
                        }}
                      />
                      <button type="button" className="btn solid" onClick={() => fileInput.current?.click()} disabled={processing || photos.length >= MAX_PHOTOS}>
                        {processing ? 'Preparing…' : photos.length ? 'Add more photos' : 'Choose photos'}
                      </button>
                      <p className="note">or drag them here · {photos.length}/{MAX_PHOTOS}</p>
                    </div>
                    <p className="note" aria-live="polite" style={{ marginTop: 10 }}>
                      {photoMsg}
                    </p>
                    {photos.length > 0 && (
                      <ul className="sf-photos">
                        {photos.map((p) => (
                          <li key={p.id}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.preview} alt={p.name} />
                            <button type="button" aria-label={`Remove ${p.name}`} onClick={() => setPhotos((prev) => prev.filter((x) => x.id !== p.id))}>
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              )}

              {step === 'links' && (
                <>
                  <h1 className="display" tabIndex={-1} ref={heading}>
                    Where can I see you now?
                  </h1>
                  <p className="sub">Your current website, social pages and any portfolio. All optional, but it helps a lot.</p>
                  <div className="body stack">
                    {input('website', 'Existing website', { optional: true, type: 'url', ac: 'url', placeholder: 'yourbusiness.co.uk' })}
                    <div className="field">
                      <span className="sf-label">
                        Social media pages <i>Optional</i>
                      </span>
                      {f.socials.map((s, i) => (
                        <div key={i} className="sf-social">
                          <label htmlFor={`sf-social-${i}`} className="sr">
                            Social page {i + 1}
                          </label>
                          <input
                            id={`sf-social-${i}`}
                            type="text"
                            value={s}
                            placeholder={i === 0 ? '@yourbusiness or instagram.com/yourbusiness' : 'Another page'}
                            onChange={(e) => {
                              const v = [...f.socials]
                              v[i] = e.target.value
                              set('socials', v)
                            }}
                            aria-invalid={errs[`social-${i}`] ? true : undefined}
                          />
                          {f.socials.length > 1 && (
                            <button type="button" className="sf-x" aria-label={`Remove social page ${i + 1}`} onClick={() => set('socials', f.socials.filter((_, j) => j !== i))}>
                              ×
                            </button>
                          )}
                          {err(`social-${i}`)}
                        </div>
                      ))}
                      {f.socials.length < 6 && (
                        <button type="button" className="link" onClick={() => set('socials', [...f.socials, ''])}>
                          + Add another page
                        </button>
                      )}
                    </div>
                    {input('portfolio', 'Portfolio', { optional: true, type: 'url', placeholder: 'Behance, Google Drive, anything' })}
                  </div>
                </>
              )}

              {step === 'date' && (
                <>
                  <h1 className="display" tabIndex={-1} ref={heading}>
                    When do you want your website?
                  </h1>
                  <p className="sub">
                    {OFFER.timing.processing} {OFFER.timing.build}
                  </p>
                  <div className="body">
                    <ul className="sf-legend" aria-label="Key">
                      <li className="k-processing">Processing</li>
                      <li className="k-building">Building</li>
                      <li className="k-maybe">Date may change for big requests</li>
                      <li className="k-open">Free to pick</li>
                    </ul>
                    {months.length > 0 && (
                      <>
                      <div className="sf-cal" id="sf-date" tabIndex={0} role="group" aria-label="Delivery date calendar. Scroll to see later months.">
                        <div className="sf-dows" aria-hidden="true">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                            <span key={d} className="sf-dow">
                              {d}
                            </span>
                          ))}
                        </div>
                        {months.map((m) => (
                          <section key={m.key} className="sf-month" aria-label={m.label}>
                            <h3 className="sf-month-h">{m.label}</h3>
                            <div className="sf-cal-grid">
                              {m.cells.map((iso, i) => {
                                if (!iso) return <span key={`b${i}`} aria-hidden="true" />
                                const k = dayKind(today, iso)
                                const far = dayDiff(today, iso) > LAST_BOOKABLE_DAYS
                                const pickable = (k === 'maybe' || k === 'open') && !far
                                const day = Number(iso.slice(8))
                                return (
                                  <button
                                    key={iso}
                                    type="button"
                                    className={`sf-day k-${k}${f.date === iso ? ' sel' : ''}`}
                                    disabled={!pickable}
                                    aria-pressed={pickable ? f.date === iso : undefined}
                                    aria-label={`${fmtDay(iso, { weekday: 'long', day: 'numeric', month: 'long' })}${KIND_LABEL[k] ? `, ${KIND_LABEL[k]}` : ''}`}
                                    onClick={() => set('date', iso)}
                                  >
                                    <span>{day}</span>
                                    {KIND_LABEL[k] && <small>{KIND_LABEL[k]}</small>}
                                  </button>
                                )
                              })}
                            </div>
                          </section>
                        ))}
                      </div>
                      <p className="note sf-cal-hint" aria-hidden="true">
                        Scroll for later months ↓
                      </p>
                      </>
                    )}
                    {err('date')}
                    <p className="note" aria-live="polite" style={{ marginTop: 14 }}>
                      {f.date
                        ? dayKind(today, f.date) === 'maybe'
                          ? `${fmtDay(f.date, { weekday: 'long', day: 'numeric', month: 'long' })}: possible, but a large request could take a day or two longer.`
                          : `${fmtDay(f.date, { weekday: 'long', day: 'numeric', month: 'long' })}: plenty of time.`
                        : 'Days 1 to 4 are taken up by processing and building. Pick any day after that.'}
                    </p>
                  </div>
                </>
              )}

              {step === 'you' && (
                <>
                  <h1 className="display" tabIndex={-1} ref={heading}>
                    Who am I building this for?
                  </h1>
                  <p className="sub">No calls. Your request goes to me as a WhatsApp message, and I reply there or by email.</p>
                  <div className="body stack">
                    <div className="grid2">
                      {input('name', 'Your name', { ac: 'name' })}
                      {input('email', 'Email', { type: 'email', ac: 'email', optional: f.replyVia !== 'email' })}
                    </div>
                    <div className="cards" role="group" aria-label="How should I reply" id="sf-replyVia" tabIndex={-1}>
                      {REPLY_OPTIONS.map((r) => (
                        <button key={r.id} type="button" className="card" aria-pressed={f.replyVia === r.id} onClick={() => set('replyVia', r.id)}>
                          <span className="t">{r.label}</span>
                          <span className="d">{r.note}</span>
                        </button>
                      ))}
                    </div>
                    {err('replyVia')}
                  </div>
                </>
              )}

              {step === 'review' && (
                <>
                  <h1 className="display" tabIndex={-1} ref={heading}>
                    Ready when you are.
                  </h1>
                  <p className="sub">Tap anything to change it. Sending opens WhatsApp with it all typed out for me. Nothing to pay, and no obligation.</p>
                  <div className="body sf-review">
                    {summary.map((s) => (
                      <button key={s.id} type="button" className={`sf-review-row${s.done ? '' : ' empty'}`} onClick={() => goTo(s.id)}>
                        <span className="label">{s.label}</span>
                        <b>{s.value}</b>
                        <i aria-hidden="true">Edit</i>
                      </button>
                    ))}
                    {photos.length > 0 && (
                      <button type="button" className="sf-review-photos" onClick={() => goTo('photos')} aria-label="Edit photos">
                        {photos.map((p) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={p.id} src={p.preview} alt="" />
                        ))}
                      </button>
                    )}
                  </div>
                </>
              )}

            </div>
          </form>

          {!isOffer && (
            <aside className={`sf-summary${summaryOpen ? ' open' : ''}`} aria-label="Your request so far">
              <button type="button" className="sf-summary-toggle" aria-expanded={summaryOpen} onClick={() => setSummaryOpen((o) => !o)}>
                Your request · {doneCount}/{summary.length}
              </button>
              <ul>
                {summary.map((s) => (
                  <li key={s.id}>
                    <button type="button" className={`${s.id === step ? 'on' : ''}${s.done ? ' done' : ''}`} onClick={() => goTo(s.id)}>
                      <span className="label">{s.label}</span>
                      <b>{s.value}</b>
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </div>

      <div className="actions">
        <div className="actions-in">
          {!isOffer && (
            <button className="back" type="button" onClick={back}>
              Back
            </button>
          )}
          <button className="btn solid grow" type="submit" form="sf-form" disabled={processing}>
            {isOffer ? 'Get my free website' : step === 'review' ? 'Send on WhatsApp' : step === 'photos' && !photos.length ? 'Skip for now' : 'Continue'}
          </button>
        </div>
        {!isOffer && saved && <p className="fine">Saved on this device. You can close this and come back.</p>}
        {isOffer && <p className="fine">First website free · No deposit · No calls</p>}
      </div>
    </>
  )
}
