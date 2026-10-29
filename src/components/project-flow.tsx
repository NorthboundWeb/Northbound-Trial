'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, useTransition } from 'react'
import { startProject } from '@/lib/booking/actions'
import { messageHref } from '@/lib/contact'
import {
  BUDGETS,
  CONTACT_EMAIL,
  HELP_OPTIONS,
  PLAN_OPTIONS,
  REPLY_OPTIONS,
  STEPS,
  TIMELINES,
  emptyForm,
  validateStep,
  type ProjectForm,
} from '@/lib/booking/options'
import { goWithCurtain } from './curtain'
import { HelpIcon } from './icons'
import { SWIPE_BACK_EVENT } from './swipe-back'
import { TopBar } from './top-bar'

/**
 * "Start a project": five short questions, then the answers go to Che's
 * inbox and Google Sheet. No call to book: he replies by WhatsApp or email.
 *
 * Each step is a history entry (?step=2 and so on), so the back button, the
 * phone's own edge swipe and the site's swipe gesture go back one question.
 */
export function ProjectFlow() {
  const [step, setStep] = useState(0)
  const [f, setF] = useState<ProjectForm>(emptyForm)
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [formMsg, setFormMsg] = useState('')
  const [sent, setSent] = useState<{ ref: string; name: string; replyVia: string } | null>(null)
  const [busy, startBusy] = useTransition()

  const heading = useRef<HTMLHeadingElement>(null)
  const trap = useRef<HTMLInputElement>(null)
  const startedAt = useRef(0)
  const firstRender = useRef(true)
  const reached = useRef(0)
  const sentRef = useRef(sent)
  const total = STEPS.length

  useEffect(() => {
    startedAt.current = Date.now()
    // A reload mid-flow has lost the answers, so start again with a clean URL.
    if (window.location.search.includes('step=')) window.history.replaceState(null, '', window.location.pathname)
  }, [])

  useEffect(() => {
    sentRef.current = sent
  }, [sent])

  useEffect(() => {
    const onPop = () => {
      if (sentRef.current) {
        goWithCurtain('/')
        return
      }
      const n = Number(new URLSearchParams(window.location.search).get('step') ?? '1') - 1
      setErrs({})
      setFormMsg('')
      setStep(Number.isFinite(n) ? Math.min(Math.max(n, 0), reached.current) : 0)
    }
    const onSwipe = (e: Event) => {
      if (sentRef.current) return
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

  // Move focus to the new heading when the step changes, for keyboard and screen-reader users.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    heading.current?.focus({ preventScroll: true })
    window.scrollTo({ top: 0 })
  }, [step, sent])

  const set = <K extends keyof ProjectForm>(k: K, v: ProjectForm[K]) => {
    setF((prev) => ({ ...prev, [k]: v }))
    setErrs((prev) => {
      if (!prev[k]) return prev
      const next = { ...prev }
      delete next[k]
      return next
    })
  }

  const toggleHelp = (h: string) => set('help', f.help.includes(h) ? f.help.filter((x) => x !== h) : [...f.help, h])

  function goTo(n: number) {
    reached.current = Math.max(reached.current, n)
    window.history.pushState(null, '', n === 0 ? window.location.pathname : `?step=${n + 1}`)
    setStep(n)
  }

  function next(e?: React.FormEvent) {
    e?.preventDefault()
    if (busy) return
    const found = validateStep(step, f)
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
    if (new URLSearchParams(window.location.search).get('step')) window.history.back()
    else setStep(Math.max(0, step - 1))
  }

  function submit() {
    startBusy(async () => {
      const res = await startProject(f, { startedAt: startedAt.current, trap: trap.current?.value ?? '' })
      if (res.ok) {
        setSent({ ref: res.ref, name: f.name, replyVia: f.replyVia })
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

  const err = (k: string) =>
    errs[k] ? (
      <p className="err" role="alert" id={`e-${k}`}>
        {errs[k]}
      </p>
    ) : null

  const field = (id: keyof ProjectForm, label: string, type: string, optional: boolean, ac: string, hint?: string) => (
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
        onChange={(e) => set(id, e.target.value as never)}
        aria-invalid={errs[id] ? true : undefined}
        aria-describedby={errs[id] ? `e-${id}` : hint ? `h-${id}` : undefined}
      />
      {hint && !errs[id] && (
        <p className="note" id={`h-${id}`}>
          {hint}
        </p>
      )}
      {err(id)}
    </div>
  )

  if (sent) {
    const first = sent.name.trim().split(/\s+/)[0] || 'there'
    const how = sent.replyVia === 'whatsapp' ? 'on WhatsApp' : 'by email'
    return (
      <>
        <TopBar count="Sent" progress={1} />
        <main id="main" className="stage step-in">
          <p className="label">Sent · Ref {sent.ref}</p>
          <h1 className="display" tabIndex={-1} ref={heading} style={{ marginTop: 14 }}>
            Thanks, {first}
            <span className="kick">.</span>
          </h1>
          <p className="sub">Your project is with me. I will reply {how}, normally within one working day.</p>
          <ol className="steps">
            <li>
              <span className="label">Next</span>
              <div>
                <b>I read it properly</b>
                <p>And come back {how} with any questions, or with a suggestion if a smaller package would do.</p>
              </div>
            </li>
            <li>
              <span className="label">Then</span>
              <div>
                <b>A written quote</b>
                <p>Fixed scope and a fixed price, before anything starts. No obligation.</p>
              </div>
            </li>
            <li>
              <span className="label">After</span>
              <div>
                <b>Half to start, half at the end</b>
                <p>A 50% deposit begins the work; the balance is due once you have approved the site, before it goes live.</p>
              </div>
            </li>
          </ol>
          <p className="note" style={{ marginTop: 24 }}>
            Need to add something? Quote ref {sent.ref} on{' '}
            <a href={messageHref()} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>{' '}
            or at <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(sent.ref)}`}>{CONTACT_EMAIL}</a>.
          </p>
        </main>
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

  const st = STEPS[step]
  const last = step === total - 1

  return (
    <>
      <TopBar count={`${step + 1} / ${total}`} progress={(step + 1) / total} />
      <main id="main" className="stage">
        <form id="flow" noValidate onSubmit={next} aria-label={`Start a project, step ${step + 1} of ${total}`}>
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
                  </div>
                  {field('email', 'Email', 'email', false, 'email')}
                  {field('site', 'Current website or Instagram', 'text', true, 'url')}
                </div>
              )}

              {step === 4 && (
                <div className="stack">
                  <div className="cards" role="group" aria-label="How should I reply" id="replyVia" tabIndex={-1}>
                    {REPLY_OPTIONS.map((r) => (
                      <button key={r.id} type="button" className="card" aria-pressed={f.replyVia === r.id} onClick={() => set('replyVia', r.id)}>
                        <span className="t">{r.label}</span>
                        <span className="d">{r.note}</span>
                      </button>
                    ))}
                  </div>
                  {err('replyVia')}
                  {f.replyVia === 'whatsapp' &&
                    field('phone', 'Mobile number with WhatsApp', 'tel', false, 'tel', 'Only used to message you. I do not make calls.')}
                  <p className="note">
                    Sending this does not commit you to anything or take payment. Your details go to my inbox and are only used to reply to
                    you.
                  </p>
                </div>
              )}

              {formMsg && (
                <div className="banner" role="alert" style={{ marginTop: 24 }}>
                  {formMsg}
                </div>
              )}
            </div>
          </div>
        </form>
      </main>

      <div className="actions">
        <div className="actions-in">
          {step > 0 && (
            <button className="back" type="button" onClick={back}>
              Back
            </button>
          )}
          <button className="btn solid grow" type="submit" form="flow" disabled={busy}>
            {last ? (busy ? 'Sending…' : 'Send my project') : 'Continue'}
          </button>
        </div>
        {step === 0 && <p className="fine">Free · No calls · Written quote</p>}
      </div>
    </>
  )
}
