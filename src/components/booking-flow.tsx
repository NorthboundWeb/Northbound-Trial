'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { cancelMine, createBooking, refreshVisitor } from '@/lib/booking/actions'
import { longDay, slotKey } from '@/lib/booking/dates'
import {
  BUDGETS,
  CONTACT_EMAIL,
  HELP_OPTIONS,
  ON_THE_CALL,
  PLAN_OPTIONS,
  STEPS,
  TIMELINES,
  emptyForm,
  validateStep,
  type BookingForm,
  type MyBooking,
} from '@/lib/booking/options'
import { DayGrid, SlotGrid, StatusPill } from './day-slot'

const POLL_MS = 20_000

type Props = { days: string[]; initialTaken: string[]; initialMine: MyBooking[] }

export function BookingFlow({ days, initialTaken, initialMine }: Props) {
  const [step, setStep] = useState(0)
  const [f, setF] = useState<BookingForm>(emptyForm)
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [formMsg, setFormMsg] = useState('')
  const [taken, setTaken] = useState(initialTaken)
  const [mine, setMine] = useState(initialMine)
  const [done, setDone] = useState<MyBooking | null>(null)
  const [busy, startBusy] = useTransition()

  const heading = useRef<HTMLHeadingElement>(null)
  const trap = useRef<HTMLInputElement>(null)
  const startedAt = useRef(0)
  const firstRender = useRef(true)

  const takenSet = useMemo(() => new Set(taken), [taken])

  useEffect(() => {
    startedAt.current = Date.now()
  }, [])

  // Keep availability and the visitor's statuses fresh while the page is open.
  useEffect(() => {
    const id = setInterval(async () => {
      if (document.visibilityState !== 'visible') return
      const next = await refreshVisitor()
      setTaken(next.taken)
      setMine(next.mine)
    }, POLL_MS)
    return () => clearInterval(id)
  }, [])

  // Move focus to the new heading when the step changes, for keyboard and screen-reader users.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    heading.current?.focus({ preventScroll: true })
    window.scrollTo({ top: 0 })
  }, [step, done])

  const set = <K extends keyof BookingForm>(k: K, v: BookingForm[K]) => {
    setF((prev) => ({ ...prev, [k]: v }))
    setErrs((prev) => {
      if (!prev[k]) return prev
      const next = { ...prev }
      delete next[k]
      return next
    })
  }

  const toggleHelp = (h: string) =>
    set('help', f.help.includes(h) ? f.help.filter((x) => x !== h) : [...f.help, h])

  function next(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    const found = validateStep(step, f, days)
    if (step === 4 && f.day && f.slot && takenSet.has(slotKey(f.day, f.slot))) {
      found.slot = 'That time has just been taken. Pick another.'
    }
    if (Object.keys(found).length) {
      setErrs(found)
      setFormMsg('')
      const first = Object.keys(found)[0]
      requestAnimationFrame(() => document.getElementById(first)?.focus())
      return
    }
    setErrs({})
    if (step < 4) return setStep(step + 1)
    submit()
  }

  function submit() {
    startBusy(async () => {
      const res = await createBooking(f, { startedAt: startedAt.current, trap: trap.current?.value ?? '' })
      if (res.taken) setTaken(res.taken)
      if (res.ok) {
        setMine((m) => [res.booking, ...m.filter((x) => x.ref !== res.booking.ref)])
        setDone(res.booking)
        setFormMsg('')
        return
      }
      if (typeof res.step === 'number') setStep(res.step)
      setErrs(res.errors ?? {})
      setFormMsg(res.message ?? '')
    })
  }

  function again() {
    setDone(null)
    setF(emptyForm())
    setErrs({})
    setStep(0)
    startedAt.current = Date.now()
  }

  function cancel(ref: string) {
    startBusy(async () => {
      const res = await cancelMine(ref)
      const fresh = await refreshVisitor()
      setTaken(fresh.taken)
      setMine(fresh.mine)
      if (!res.ok) setFormMsg(`That request could not be cancelled here. Email ${CONTACT_EMAIL} and I will sort it.`)
    })
  }

  const err = (k: string) =>
    errs[k] ? (
      <p className="err" role="alert" id={`e-${k}`}>
        {errs[k]}
      </p>
    ) : null

  const field = (id: keyof BookingForm, label: string, type: string, optional: boolean, ac: string) => (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {optional && <i>optional</i>}
      </label>
      <input
        id={id}
        type={type}
        value={f[id] as string}
        autoComplete={ac}
        onChange={(e) => set(id, e.target.value)}
        aria-invalid={errs[id] ? true : undefined}
        aria-describedby={errs[id] ? `e-${id}` : undefined}
      />
      {err(id)}
    </div>
  )

  const mineList = (() => {
    const items = mine.filter((b) => !done || b.ref !== done.ref)
    if (!items.length) return null
    return (
      <section className="mine" aria-label="Your requests">
        <h2>Your requests</h2>
        <ul>
          {items.map((b) => (
            <li className="item" key={b.ref}>
              <div className="main">
                <p className="when">
                  {longDay(b.day)} at {b.slot}
                </p>
                <p className="meta">Ref {b.ref}</p>
              </div>
              <div className="acts">
                <StatusPill status={b.status} />
                {b.status !== 'cancelled' && (
                  <button className="btn small" type="button" disabled={busy} onClick={() => cancel(b.ref)}>
                    Cancel
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    )
  })()

  const side = (
    <aside className="side" aria-label="About the call">
      <h2 className="label" style={{ color: 'var(--faint)' }}>
        On the call
      </h2>
      <ol>
        {ON_THE_CALL.map(([n, head, text]) => (
          <li key={n}>
            <span className="label">{n}</span>
            <div>
              <b>{head}</b>
              <span>{text}</span>
            </div>
          </li>
        ))}
      </ol>
      <div className="sign">
        <p className="label">Builds from</p>
        <p className="big">£249</p>
        <p>Pro £249 and Ultimate £349, fixed. Half to start, half once you have approved the site, before it goes live.</p>
      </div>
      <p className="alt">
        Prefer email? <strong>{CONTACT_EMAIL}</strong> reaches the same place.
      </p>
    </aside>
  )

  if (done) {
    const b = mine.find((x) => x.ref === done.ref) ?? done
    const first = b.name.trim().split(/\s+/)[0] || 'there'
    return (
      <div className="layout">
        <div>
          <ol className="progress" aria-label="Progress">
            {STEPS.map((s) => (
              <li key={s.title} className="on" />
            ))}
          </ol>
          <p className="label kick">Request sent</p>
          <h1 className="display" tabIndex={-1} ref={heading}>
            You are on the way, {first}
            <span className="kick">.</span>
          </h1>
          <p className="sub">Your request is with me. I will confirm the time by email, normally within one working day.</p>
          <p className="label" style={{ marginTop: 16, color: 'var(--faint)' }}>
            Ref {b.ref}
          </p>
          <div className="body">
            <dl className="facts">
              <div className="fact">
                <dt>Preferred call</dt>
                <dd>
                  {longDay(b.day)} at {b.slot} (UK time)
                </dd>
              </div>
              <div className="fact">
                <dt>Status</dt>
                <dd>
                  <StatusPill status={b.status} />
                </dd>
              </div>
              <div className="fact">
                <dt>Needs</dt>
                <dd>{b.help.join(', ')}</dd>
              </div>
              <div className="fact">
                <dt>Working budget</dt>
                <dd>{b.budget}</dd>
              </div>
              <div className="fact">
                <dt>Timeline</dt>
                <dd>{b.timeline}</dd>
              </div>
            </dl>
            <ol className="steps">
              <li>
                <span className="label">Next</span>
                <div>
                  <b>I confirm the time</b>
                  <p>By email, normally within one working day. If that slot has gone I will offer the nearest one. This page updates when I do.</p>
                </div>
              </li>
              <li>
                <span className="label">Then</span>
                <div>
                  <b>We talk for 20 minutes</b>
                  <p>Your current site or socials, what the new one needs to do, and your timeline. No charge, no obligation.</p>
                </div>
              </li>
              <li>
                <span className="label">After</span>
                <div>
                  <b>A written quote</b>
                  <p>With a fixed scope and a fixed price. If a smaller package would do, I will say so.</p>
                </div>
              </li>
            </ol>
            <div className="controls" style={{ border: 0, paddingTop: 0 }}>
              <button className="btn" type="button" onClick={again}>
                Book another call
              </button>
            </div>
          </div>
          {mineList}
        </div>
        {side}
      </div>
    )
  }

  const st = STEPS[step]
  const last = step === STEPS.length - 1

  return (
    <div className="layout">
      <div>
        <ol className="progress" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
          {STEPS.map((s, i) => (
            <li key={s.title} className={i <= step ? 'on' : ''} />
          ))}
        </ol>
        <p className="label kick">
          Book a call · Step {step + 1} of {STEPS.length}
        </p>
        <h1 className="display" tabIndex={-1} ref={heading}>
          {st.title}
          <span className="kick">{st.mark}</span>
        </h1>
        <p className="sub">{st.sub}</p>

        <form className="body" noValidate onSubmit={next}>
          {/* Honeypot: hidden from people, irresistible to bots. */}
          <div className="hp" aria-hidden="true">
            <label htmlFor="website">Leave this empty</label>
            <input id="website" name="website" ref={trap} tabIndex={-1} autoComplete="off" defaultValue="" />
          </div>

          {step === 0 && (
            <>
              <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                <legend className="sr">What do you need help with?</legend>
                <div className="pills" id="help" tabIndex={-1}>
                  {HELP_OPTIONS.map((h) => (
                    <button key={h} type="button" className="pill" aria-pressed={f.help.includes(h)} onClick={() => toggleHelp(h)}>
                      {h}
                    </button>
                  ))}
                </div>
                {err('help')}
              </fieldset>
              <div className="group">
                <label className="q" htmlFor="other">
                  What else do you need?<span className="opt">optional</span>
                </label>
                <textarea
                  id="other"
                  rows={3}
                  style={{ marginTop: 16 }}
                  placeholder="Anything that would help me prepare: sites you like, features you need, what is not working now."
                  value={f.other}
                  onChange={(e) => set('other', e.target.value)}
                  aria-invalid={errs.other ? true : undefined}
                />
                {err('other')}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="cards" role="group" aria-label="Working budget" id="budget" tabIndex={-1}>
                {BUDGETS.map((b) => (
                  <button key={b.id} type="button" className="card" aria-pressed={f.budget === b.label} onClick={() => set('budget', b.label)}>
                    <span className="t">{b.label}</span>
                    <span className="d">{b.note}</span>
                  </button>
                ))}
              </div>
              {err('budget')}
              <div className="group">
                <h2>
                  Open to a monthly plan?<span className="opt">optional</span>
                </h2>
                <p className="hint">Hosting, edits and support for a set monthly fee, from £39 a month. Optional, and the first month is free.</p>
                <div className="pills">
                  {PLAN_OPTIONS.map((p) => (
                    <button key={p} type="button" className="pill sm" aria-pressed={f.plan === p} onClick={() => set('plan', f.plan === p ? '' : p)}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="pills" role="group" aria-label="Timeline" id="timeline" tabIndex={-1}>
                {TIMELINES.map((t) => (
                  <button key={t} type="button" className="pill" aria-pressed={f.timeline === t} onClick={() => set('timeline', t)}>
                    {t}
                  </button>
                ))}
              </div>
              {err('timeline')}
            </>
          )}

          {step === 3 && (
            <div className="stack">
              <div className="grid2">
                {field('name', 'Your name', 'text', false, 'name')}
                {field('business', 'Business name', 'text', true, 'organization')}
                {field('email', 'Email', 'email', false, 'email')}
                {field('phone', 'Phone', 'tel', true, 'tel')}
              </div>
              <div className="grid2" style={{ gridTemplateColumns: 'minmax(0,1fr)' }}>
                {field('site', 'Current website or Instagram', 'text', true, 'url')}
              </div>
            </div>
          )}

          {step === 4 && (
            <>
              <div>
                <p className="label" style={{ marginBottom: 12 }}>
                  Day
                </p>
                <div id="day" tabIndex={-1}>
                  <DayGrid
                    days={days}
                    selected={f.day}
                    taken={takenSet}
                    onPick={(d) => {
                      set('day', d)
                      set('slot', '')
                    }}
                  />
                </div>
                {err('day')}
              </div>
              <div style={{ marginTop: 32 }}>
                <p className="label" style={{ marginBottom: 12 }}>
                  Time
                  {f.day && (
                    <span style={{ color: 'var(--faint)', textTransform: 'none', letterSpacing: 0 }}> · {longDay(f.day)}</span>
                  )}
                </p>
                <div id="slot" tabIndex={-1}>
                  <SlotGrid day={f.day} selected={f.slot} taken={takenSet} onPick={(t) => set('slot', t)} />
                </div>
                {err('slot')}
                <p className="note" style={{ marginTop: 16 }}>
                  This is a preferred time, not a confirmed one. I check the diary and confirm by email. Sending this does not commit you to
                  anything or take payment.
                </p>
              </div>
            </>
          )}

          {formMsg && (
            <div className="banner" role="alert" style={{ marginTop: 28 }}>
              {formMsg}
            </div>
          )}

          <div className="controls">
            <div>
              {step > 0 ? (
                <button
                  className="link"
                  type="button"
                  onClick={() => {
                    setErrs({})
                    setFormMsg('')
                    setStep(step - 1)
                  }}
                >
                  Back
                </button>
              ) : (
                <span className="fine">Free 20-minute call · No obligation</span>
              )}
            </div>
            <button className="btn solid" type="submit" disabled={busy}>
              {last ? (busy ? 'Sending…' : 'Request this time') : 'Continue'}
              {!busy && <span aria-hidden="true">→</span>}
            </button>
          </div>
        </form>
        {mineList}
      </div>
      {side}
    </div>
  )
}
