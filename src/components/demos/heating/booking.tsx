'use client'

import { useEffect, useRef, useState } from 'react'
import type { FormEvent, JSX } from 'react'
import { buildCalendar, problems, slots, slotState } from './data'
import type { Calendar, ProblemId } from './data'
import { Arrow, Check, ProblemIcon } from './parts'
import styles from './styles.module.css'

type Details = { name: string; phone: string; postcode: string; notes: string; vulnerable: boolean }
type Errors = Partial<Record<'problem' | 'day' | 'slot' | 'name' | 'phone' | 'postcode', string>>

const stepNames = ['Problem', 'Day', 'Time', 'Details', 'Confirm']

const emptyDetails: Details = { name: '', phone: '', postcode: '', notes: '', vulnerable: false }

function checkDetails(d: Details): Errors {
  const e: Errors = {}
  if (d.name.trim().length < 2) e.name = 'Please enter your name.'
  const phone = d.phone.replace(/[\s()-]/g, '')
  if (!/^(\+44|0)\d{9,10}$/.test(phone)) e.phone = 'Enter a UK mobile or landline, like 07700 900123.'
  if (!/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(d.postcode.trim())) e.postcode = 'Enter a full postcode, like WF1 2AB.'
  return e
}

export function Booking({
  problem,
  onProblem,
}: {
  problem: ProblemId | null
  onProblem: (p: ProblemId) => void
}): JSX.Element {
  const [cal, setCal] = useState<Calendar | null>(null)
  const [step, setStep] = useState(0)
  const [dayIso, setDayIso] = useState<string | null>(null)
  const [slotId, setSlotId] = useState<string | null>(null)
  const [details, setDetails] = useState<Details>(emptyDetails)
  const [errors, setErrors] = useState<Errors>({})
  const [done, setDone] = useState<string | null>(null)
  const headRef = useRef<HTMLHeadingElement>(null)
  const moved = useRef(false)

  useEffect(() => {
    const t = window.setTimeout(() => setCal(buildCalendar(Date.now())), 0)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!moved.current) return
    headRef.current?.focus()
  }, [step, done])

  const day = cal?.days.find((d) => d.iso === dayIso) ?? null
  const slot = slots.find((s) => s.id === slotId) ?? null
  const prob = problems.find((p) => p.id === problem) ?? null

  function goTo(n: number) {
    moved.current = true
    setErrors({})
    setStep(n)
  }

  function next() {
    const e: Errors = {}
    if (step === 0 && !problem) e.problem = 'Choose what the problem is.'
    if (step === 1 && !day) e.day = 'Choose a day.'
    if (step === 2 && (!day || !slot || slotState(day, slot) !== 'free')) e.slot = 'Choose a free time window.'
    if (step === 3) Object.assign(e, checkDetails(details))
    setErrors(e)
    if (Object.keys(e).length > 0) return
    goTo(step + 1)
  }

  function confirm(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    if (step < 4) {
      next()
      return
    }
    const ref = `TH-${Math.floor(10000 + Math.random() * 90000)}`
    moved.current = true
    setDone(ref)
  }

  function restart() {
    moved.current = true
    setDone(null)
    setStep(0)
    setDayIso(null)
    setSlotId(null)
    setDetails(emptyDetails)
    setErrors({})
  }

  function pickDay(iso: string) {
    setDayIso(iso)
    const d = cal?.days.find((x) => x.iso === iso)
    if (d && slot && slotState(d, slot) !== 'free') setSlotId(null)
    setErrors({})
  }

  const outside = details.postcode.trim().length >= 5 && !/^WF/i.test(details.postcode.trim())

  if (done) {
    return (
      <div className={styles.bookCard}>
        <div className={styles.doneHead}>
          <span className={styles.doneTick}>
            <Check />
          </span>
          <div>
            <h3 ref={headRef} tabIndex={-1} className={styles.bookTitle}>
              Visit requested
            </h3>
            <p className={styles.muted}>
              Reference <b className={styles.mono}>{done}</b>
            </p>
          </div>
        </div>
        <dl className={styles.summary} aria-live="polite">
          <div>
            <dt>Problem</dt>
            <dd>{prob?.label}</dd>
          </div>
          <div>
            <dt>When</dt>
            <dd>
              {day?.long}, {slot?.label}
            </dd>
          </div>
          <div>
            <dt>Name</dt>
            <dd>{details.name}</dd>
          </div>
          <div>
            <dt>Text updates to</dt>
            <dd>{details.phone}</dd>
          </div>
          <div>
            <dt>Postcode</dt>
            <dd>{details.postcode.toUpperCase()}</dd>
          </div>
        </dl>
        <p className={styles.doneNext}>
          We would text {details.phone} to confirm, then again when the engineer sets off. The fixed price is agreed
          before any work starts.
        </p>
        <p className={styles.demoNote}>Demo only: nothing has been sent.</p>
        <button type="button" className={styles.btnGhost} onClick={restart}>
          Book another visit
        </button>
      </div>
    )
  }

  return (
    <form className={styles.bookCard} onSubmit={confirm} noValidate>
      <ol className={styles.stepper}>
        {stepNames.map((n, i) => (
          <li key={n} className={i === step ? styles.stepOn : i < step ? styles.stepDone : undefined}>
            {i < step ? (
              <button type="button" onClick={() => goTo(i)} aria-label={`Back to step ${i + 1}: ${n}`}>
                <span className={styles.stepNum}>
                  <Check />
                </span>
                <span className={styles.stepName}>{n}</span>
              </button>
            ) : (
              <span aria-current={i === step ? 'step' : undefined}>
                <span className={styles.stepNum}>{i + 1}</span>
                <span className={styles.stepName}>{n}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
      <div className={styles.progress} aria-hidden="true">
        <span style={{ width: `${((step + 1) / 5) * 100}%` }} />
      </div>

      <div key={step} className={styles.stepBody}>
        {step === 0 && (
          <fieldset className={styles.fs}>
            <legend>
              <h3 ref={headRef} tabIndex={-1} className={styles.bookTitle}>
                What is the problem?
              </h3>
            </legend>
            <div className={styles.probGrid}>
              {problems.map((p) => (
                <label key={p.id} className={`${styles.prob} ${problem === p.id ? styles.probOn : ''}`}>
                  <input
                    type="radio"
                    name="th-problem"
                    value={p.id}
                    checked={problem === p.id}
                    onChange={() => {
                      onProblem(p.id)
                      setErrors({})
                    }}
                    className={styles.sr}
                  />
                  <span className={styles.probIcon}>
                    <ProblemIcon id={p.id} />
                  </span>
                  <span className={styles.probLabel}>{p.label}</span>
                  <span className={styles.probHint}>{p.hint}</span>
                  <span className={styles.probPrice}>{p.price}</span>
                </label>
              ))}
            </div>
            {errors.problem && <p className={styles.err} role="alert">{errors.problem}</p>}
          </fieldset>
        )}

        {step === 1 && (
          <fieldset className={styles.fs}>
            <legend>
              <h3 ref={headRef} tabIndex={-1} className={styles.bookTitle}>
                Which day suits?
              </h3>
            </legend>
            <p className={styles.muted}>Monday to Saturday. Book before 11am for a visit today.</p>
            {cal ? (
              <div className={styles.dayGrid}>
                {cal.days.map((d) => (
                  <label key={d.iso} className={`${styles.dayBtn} ${dayIso === d.iso ? styles.dayOn : ''}`}>
                    <input
                      type="radio"
                      name="th-day"
                      value={d.iso}
                      checked={dayIso === d.iso}
                      onChange={() => pickDay(d.iso)}
                      className={styles.sr}
                      aria-label={d.long}
                    />
                    <span className={styles.dayDow}>{d.dow}</span>
                    <span className={styles.dayNum}>{d.date}</span>
                    <span className={styles.dayMon}>{d.month}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className={styles.loading}>Loading the diary…</p>
            )}
            {errors.day && <p className={styles.err} role="alert">{errors.day}</p>}
          </fieldset>
        )}

        {step === 2 && day && (
          <fieldset className={styles.fs}>
            <legend>
              <h3 ref={headRef} tabIndex={-1} className={styles.bookTitle}>
                Pick a two-hour window
              </h3>
            </legend>
            <p className={styles.muted}>{day.long}. We text when the engineer sets off.</p>
            <div className={styles.slotGrid}>
              {slots.map((s) => {
                const st = slotState(day, s)
                const free = st === 'free'
                return (
                  <label
                    key={s.id}
                    className={`${styles.slotBtn} ${slotId === s.id ? styles.slotOn : ''} ${free ? '' : styles.slotOff}`}
                  >
                    <input
                      type="radio"
                      name="th-slot"
                      value={s.id}
                      checked={slotId === s.id}
                      disabled={!free}
                      onChange={() => {
                        setSlotId(s.id)
                        setErrors({})
                      }}
                      className={styles.sr}
                    />
                    <span className={styles.slotTime}>{s.label}</span>
                    <span className={styles.slotState}>{free ? 'Free' : st === 'full' ? 'Booked' : 'Too soon'}</span>
                  </label>
                )
              })}
            </div>
            {errors.slot && <p className={styles.err} role="alert">{errors.slot}</p>}
          </fieldset>
        )}

        {step === 3 && (
          <fieldset className={styles.fs}>
            <legend>
              <h3 ref={headRef} tabIndex={-1} className={styles.bookTitle}>
                Your details
              </h3>
            </legend>
            <div className={styles.fields}>
              <div className={styles.field}>
                <label htmlFor="th-name">Name</label>
                <input
                  id="th-name"
                  className={styles.input}
                  autoComplete="name"
                  value={details.name}
                  onChange={(e) => setDetails({ ...details, name: e.target.value })}
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={errors.name ? 'th-name-err' : undefined}
                />
                {errors.name && <p id="th-name-err" className={styles.err}>{errors.name}</p>}
              </div>
              <div className={styles.field}>
                <label htmlFor="th-phone">Mobile for text updates</label>
                <input
                  id="th-phone"
                  className={styles.input}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={details.phone}
                  onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                  aria-invalid={errors.phone ? true : undefined}
                  aria-describedby={errors.phone ? 'th-phone-err' : undefined}
                />
                {errors.phone && <p id="th-phone-err" className={styles.err}>{errors.phone}</p>}
              </div>
              <div className={styles.field}>
                <label htmlFor="th-pc">Postcode</label>
                <input
                  id="th-pc"
                  className={styles.input}
                  autoComplete="postal-code"
                  value={details.postcode}
                  onChange={(e) => setDetails({ ...details, postcode: e.target.value })}
                  aria-invalid={errors.postcode ? true : undefined}
                  aria-describedby={errors.postcode ? 'th-pc-err' : outside ? 'th-pc-note' : undefined}
                />
                {errors.postcode && <p id="th-pc-err" className={styles.err}>{errors.postcode}</p>}
                {!errors.postcode && outside && (
                  <p id="th-pc-note" className={styles.note}>
                    That is outside our usual WF area. We will confirm by text whether we can reach you.
                  </p>
                )}
              </div>
              <div className={`${styles.field} ${styles.fieldWide}`}>
                <label htmlFor="th-notes">
                  Anything the engineer should know? <i>Optional</i>
                </label>
                <textarea
                  id="th-notes"
                  className={styles.input}
                  rows={3}
                  placeholder="Error code, where the boiler is, parking…"
                  value={details.notes}
                  onChange={(e) => setDetails({ ...details, notes: e.target.value })}
                />
              </div>
              <label className={`${styles.tick} ${styles.fieldWide}`}>
                <input
                  type="checkbox"
                  checked={details.vulnerable}
                  onChange={(e) => setDetails({ ...details, vulnerable: e.target.checked })}
                />
                <span>Someone vulnerable is at home (we will put you first)</span>
              </label>
            </div>
          </fieldset>
        )}

        {step === 4 && (
          <div className={styles.fs}>
            <h3 ref={headRef} tabIndex={-1} className={styles.bookTitle}>
              Check and confirm
            </h3>
            <dl className={styles.summary}>
              <div>
                <dt>Problem</dt>
                <dd>
                  {prob?.label} <span className={styles.muted}>· {prob?.price}</span>
                </dd>
                <button type="button" className={styles.linkBtn} onClick={() => goTo(0)}>
                  Change
                </button>
              </div>
              <div>
                <dt>When</dt>
                <dd>
                  {day?.long}, {slot?.label}
                </dd>
                <button type="button" className={styles.linkBtn} onClick={() => goTo(1)}>
                  Change
                </button>
              </div>
              <div>
                <dt>You</dt>
                <dd>
                  {details.name} · {details.phone} · {details.postcode.toUpperCase()}
                  {details.vulnerable ? ' · Priority' : ''}
                </dd>
                <button type="button" className={styles.linkBtn} onClick={() => goTo(3)}>
                  Change
                </button>
              </div>
            </dl>
            <p className={styles.muted}>Nothing to pay now. You get a fixed price before any work starts.</p>
          </div>
        )}
      </div>

      <div className={styles.bookNav}>
        {step > 0 ? (
          <button type="button" className={styles.btnGhost} onClick={() => goTo(step - 1)}>
            Back
          </button>
        ) : (
          <span />
        )}
        <button type="submit" className={styles.btnRed}>
          {step === 4 ? 'Confirm visit' : 'Continue'} <Arrow />
        </button>
      </div>
    </form>
  )
}
