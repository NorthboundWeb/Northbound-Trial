'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { cancelMine, createBooking, refreshVisitor } from '@/lib/booking/actions'
import { longDay, slotKey } from '@/lib/booking/dates'
import {
  BUDGETS,
  CONTACT_EMAIL,
  HELP_OPTIONS,
  PLAN_OPTIONS,
  STEPS,
  TIMELINES,
  emptyForm,
  validateStep,
  type BookingForm,
  type MyBooking,
} from '@/lib/booking/options'
import { goWithCurtain } from './curtain'
import { DayGrid, SlotGrid, StatusPill } from './day-slot'
import { SWIPE_BACK_EVENT } from './swipe-back'
import { HelpIcon } from './icons'
import { TopBar } from './top-bar'

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
  const total = STEPS.length

  useEffect(() => {
    startedAt.current = Date.now()
    // A reload mid-flow has lost the answers, so start again at step 1 with a clean URL.
    if (window.location.search.includes('step=')) window.history.replaceState(null, '', window.location.pathname)
  }, [])

  // Each step is a history entry (?step=2 and so on), so the back button, the
  // phone's own edge swipe and our swipe gesture all go back one question.
  const doneRef = useRef(done)
  const reached = useRef(0)
  useEffect(() => {
    doneRef.current = done
  }, [done])
  useEffect(() => {
    const onPop = () => {
      if (doneRef.current) {
        // Already booked: going back leaves the flow rather than reopening old answers.
        goWithCurtain('/')
        return
      }
      const n = Number(new URLSearchParams(window.location.search).get('step') ?? '1') - 1
      const target = Number.isFinite(n) ? Math.min(Math.max(n, 0), reached.current) : 0
      setErrs({})
      setFormMsg('')
      setStep(target)
    }
    const onSwipe = (e: Event) => {
      if (doneRef.current) return
      const at = Number(new URLSearchParams(window.location.search).get('step') ?? '1') - 1
      if (at > 0) {
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

  function goTo(n: number) {
    reached.current = Math.max(reached.current, n)
    window.history.pushState(null, '', n === 0 ? window.location.pathname : `?step=${n + 1}`)
    setStep(n)
  }

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

  const toggleHelp = (h: string) => set('help', f.help.includes(h) ? f.help.filter((x) => x !== h) : [...f.help, h])

  function next(e?: React.FormEvent) {
    e?.preventDefault()
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
    if (step < total - 1) return goTo(step + 1)
    submit()
  }

  function back() {
    setErrs({})
    setFormMsg('')
    // The step we came from is the previous history entry; popstate sets the step.
    if (new URLSearchParams(window.location.search).get('step')) window.history.back()
    else setStep(Math.max(0, step - 1))
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
      if (typeof res.step === 'number' && res.step !== step) {
        window.history.replaceState(null, '', res.step === 0 ? window.location.pathname : `?step=${res.step + 1}`)
        setStep(res.step)
      }
      setErrs(res.errors ?? {})
      setFormMsg(res.message ?? '')
    })
  }

  function again() {
    setDone(null)
    setF(emptyForm())
    setErrs({})
    setStep(0)
    reached.current = 0
    window.history.replaceState(null, '', window.location.pathname)
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
        {optional && <i>Optional</i>}
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

  if (done) {
    const b = mine.find((x) => x.ref === done.ref) ?? done
    const first = b.name.trim().split(/\s+/)[0] || 'there'
    return (
      <>
        <TopBar count="Done" progress={1} />
        <main id="main" className="stage step-in">
          <p className="label">Request sent · Ref {b.ref}</p>
          <h1 className="display" tabIndex={-1} ref={heading} style={{ marginTop: 14 }}>
            You are on the way, {first}
            <span className="kick">.</span>
          </h1>
          <p className="sub">Your request is with me. I will confirm the time by email, normally within one working day.</p>
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
          </div>
          {mineList}
        </main>
        <div className="actions">
          <div className="actions-in">
            <button className="btn grow" type="button" onClick={again}>
              Book another call
            </button>
          </div>
        </div>
      </>
    )
  }

  const st = STEPS[step]
  const last = step === total - 1

  return (
    <>
      <TopBar count={`${step + 1} / ${total}`} progress={(step + 1) / total} />
      <main id="main" className="stage">
        <form id="flow" noValidate onSubmit={next} aria-label={`Book a call, step ${step + 1} of ${total}`}>
          {/* Honeypot: hidden from people, irresistible to bots. */}
          <div className="hp" aria-hidden="true">
            <label htmlFor="website">Leave this empty</label>
            <input id="website" name="website" ref={trap} tabIndex={-1} autoComplete="off" defaultValue="" />
          </div>

          <div className="step-in" key={step}>
            <h1 className="display" tabIndex={-1} ref={heading}>
              {st.title}
              {st.mark === '?' ? '?' : ''}
            </h1>
            <p className="sub">{st.sub}</p>

            <div className="body">
              {step === 0 && (
                <>
                  <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                    <legend className="sr">What do you need help with?</legend>
                    <div className="pills" id="help" tabIndex={-1}>
                      {HELP_OPTIONS.map((h) => (
                        <button key={h} type="button" className="pill" aria-pressed={f.help.includes(h)} onClick={() => toggleHelp(h)}>
                          <HelpIcon name={h} />
                          {h}
                        </button>
                      ))}
                    </div>
                    {err('help')}
                  </fieldset>
                  <div className="group">
                    <label className="q" htmlFor="other">
                      Anything else I should know?<span className="opt">Optional</span>
                    </label>
                    <textarea
                      id="other"
                      rows={3}
                      style={{ marginTop: 12 }}
                      placeholder="Sites you like, features you need, what is not working now."
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
                      Open to a monthly plan?<span className="opt">Optional</span>
                    </h2>
                    <p className="hint">Hosting, edits and support from £39 a month. Optional, and the first month is free.</p>
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
                  <div className="pills col" role="group" aria-label="Timeline" id="timeline" tabIndex={-1}>
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
                  {field('site', 'Current website or Instagram', 'text', true, 'url')}
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
                  <div style={{ marginTop: 28 }}>
                    <p className="label" style={{ marginBottom: 12 }}>
                      Time{f.day ? ` · ${longDay(f.day)}` : ''}
                    </p>
                    <div id="slot" tabIndex={-1}>
                      <SlotGrid day={f.day} selected={f.slot} taken={takenSet} onPick={(t) => set('slot', t)} />
                    </div>
                    {err('slot')}
                    <p className="note" style={{ marginTop: 16 }}>
                      This is a preferred time until I confirm it by email. Sending this does not commit you to anything or take payment.
                    </p>
                  </div>
                </>
              )}

              {formMsg && (
                <div className="banner" role="alert" style={{ marginTop: 24 }}>
                  {formMsg}
                </div>
              )}
            </div>
          </div>
        </form>
        {mineList}
      </main>

      <div className="actions">
        <div className="actions-in">
          {step > 0 && (
            <button className="back" type="button" onClick={back}>
              Back
            </button>
          )}
          <button className="btn solid grow" type="submit" form="flow" disabled={busy}>
            {last ? (busy ? 'Sending…' : 'Request this time') : 'Continue'}
          </button>
        </div>
        {step === 0 && <p className="fine">Free 20-minute call · No obligation</p>}
      </div>
    </>
  )
}
