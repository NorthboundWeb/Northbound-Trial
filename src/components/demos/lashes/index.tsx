'use client'

import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent, MouseEvent } from 'react'
import styles from './styles.module.css'
import {
  DEPOSIT,
  areas,
  categories,
  duration,
  faqs,
  heroLashes,
  heroLidPath,
  money,
  shotLashes,
  slotTimes,
  smallLid,
  styleLashes,
  takenSlots,
  treatments,
} from './data'
import type { Category, Treatment } from './data'

/* ------------------------------------------------------------------ */
/* Shared bits                                                          */
/* ------------------------------------------------------------------ */

const NAV: { id: string; label: string }[] = [
  { id: 'kl-prices', label: 'Prices' },
  { id: 'kl-styles', label: 'Lash styles' },
  { id: 'kl-how', label: 'How it works' },
  { id: 'kl-areas', label: 'Areas' },
  { id: 'kl-faq', label: 'FAQ' },
]

function reducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function scrollToId(id: string): void {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' })
  el.focus({ preventScroll: true })
}

function Mark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <circle cx="20" cy="20" r="19" fill="currentColor" opacity="0.1" />
      <path d="M7 17 Q20 30 33 17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M11 21.5 l-2.5 4.5 M15.5 24.3 l-1.3 5 M20 25.3 v5.2 M24.5 24.3 l1.4 5 M29 21.5 l2.8 4.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function EyeArt({ lashes, animate }: { lashes: string[]; animate: boolean }) {
  return (
    <svg className={styles.eye} viewBox="0 0 600 290" aria-hidden="true" focusable="false">
      <path className={styles.crease} d="M110 42 Q300 140 490 42" />
      <path className={styles.lid} d={heroLidPath} />
      {lashes.map((d, i) => (
        <path
          key={i}
          d={d}
          pathLength={1}
          className={animate ? `${styles.lash} ${styles.lashDraw}` : styles.lash}
          style={animate ? { animationDelay: `${0.35 + i * 0.035}s` } : undefined}
        />
      ))}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Booking state                                                        */
/* ------------------------------------------------------------------ */

type Day = {
  offset: number
  key: number
  weekday: string
  dayNum: number
  month: string
  long: string
  closed: boolean
  full: boolean
}

type Details = { name: string; email: string; mobile: string; postcode: string; notes: string }
type Field = keyof Details

const EMPTY: Details = { name: '', email: '', mobile: '', postcode: '', notes: '' }

const STEP_TITLES: string[] = [
  'Choose a treatment',
  'Pick a day',
  'Pick a time',
  'Patch test',
  'Where should I come?',
  'Deposit',
]

function buildDays(now: number): Day[] {
  const base = new Date(now)
  const out: Day[] = []
  for (let i = 0; i < 24; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i)
    const key = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
    const dow = d.getDay()
    const fullish = Math.sin(key * 3.7) * 1000
    out.push({
      offset: i,
      key,
      weekday: d.toLocaleDateString('en-GB', { weekday: 'short' }),
      dayNum: d.getDate(),
      month: d.toLocaleDateString('en-GB', { month: 'short' }),
      long: d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }),
      closed: dow === 0,
      full: dow !== 0 && fullish - Math.floor(fullish) < 0.14,
    })
  }
  return out
}

function patchDayFor(days: Day[], offset: number): Day | null {
  for (let o = offset - 2; o >= Math.max(1, offset - 4); o--) {
    const d = days[o]
    if (d && !d.closed) return d
  }
  return null
}

function validate(d: Details): Partial<Record<Field, string>> {
  const e: Partial<Record<Field, string>> = {}
  if (d.name.trim().length < 2) e.name = 'Enter your name so I know who to ask for.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim())) e.email = 'Enter an email like name@example.com.'
  const m = d.mobile.replace(/[\s()-]/g, '')
  if (!/^(?:\+44|0)7\d{9}$/.test(m)) e.mobile = 'Enter a UK mobile, like 07700 900123. Reminders go here.'
  if (!/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(d.postcode.trim())) e.postcode = 'Enter a full postcode, like SO23 8AB.'
  return e
}

/* ------------------------------------------------------------------ */
/* Price list with tabs                                                 */
/* ------------------------------------------------------------------ */

function PriceTabs({ onBook }: { onBook: (id: string) => void }) {
  const [tab, setTab] = useState<Category>('sets')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const current = categories.find((c) => c.id === tab) ?? categories[0]
  const rows = treatments.filter((t) => t.category === tab)

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const i = categories.findIndex((c) => c.id === tab)
    let next = -1
    if (e.key === 'ArrowRight') next = (i + 1) % categories.length
    else if (e.key === 'ArrowLeft') next = (i - 1 + categories.length) % categories.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = categories.length - 1
    if (next < 0) return
    e.preventDefault()
    setTab(categories[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <div className={styles.prices}>
      <div className={styles.tabs} role="tablist" aria-label="Price list" onKeyDown={onKey}>
        {categories.map((c, i) => (
          <button
            key={c.id}
            ref={(el) => {
              tabRefs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`kl-tab-${c.id}`}
            aria-selected={tab === c.id}
            aria-controls="kl-tabpanel"
            tabIndex={tab === c.id ? 0 : -1}
            className={styles.tab}
            onClick={() => setTab(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div
        className={styles.tabPanel}
        role="tabpanel"
        id="kl-tabpanel"
        aria-labelledby={`kl-tab-${tab}`}
        tabIndex={0}
        key={tab}
      >
        <p className={styles.tabBlurb}>{current.blurb}</p>
        <ul className={styles.priceList}>
          {rows.map((t) => (
            <li key={t.id} className={styles.priceRow}>
              <div className={styles.priceHead}>
                <span className={styles.priceName}>{t.name}</span>
                <span className={styles.leader} aria-hidden="true" />
                <span className={styles.priceAmt}>{money(t.price)}</span>
              </div>
              <div className={styles.priceMeta}>
                <span>
                  {t.minutes > 0 ? <span className={styles.priceTime}>{duration(t.minutes)}</span> : null}
                  {t.note}
                </span>
                {t.bookable ? (
                  <button type="button" className={styles.bookLink} onClick={() => onBook(t.id)}>
                    Book<span className={styles.sr}> {t.name}</span>
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Booking flow                                                         */
/* ------------------------------------------------------------------ */

type BookingProps = {
  step: number
  setStep: (n: number) => void
  treatmentId: string | null
  setTreatmentId: (id: string) => void
}

function Booking({ step, setStep, treatmentId, setTreatmentId }: BookingProps) {
  const [days, setDays] = useState<Day[]>([])
  const [dayOffset, setDayOffset] = useState<number | null>(null)
  const [slot, setSlot] = useState<number | null>(null)
  const [returning, setReturning] = useState<'yes' | 'no' | null>(null)
  const [details, setDetails] = useState<Details>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [agree, setAgree] = useState(false)
  const [agreeError, setAgreeError] = useState(false)
  const [reference, setReference] = useState('')
  const headRef = useRef<HTMLHeadingElement | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const shownStep = useRef(step)

  useEffect(() => {
    const t = window.setTimeout(() => setDays(buildDays(Date.now())), 0)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (shownStep.current === step) return
    shownStep.current = step
    headRef.current?.focus({ preventScroll: true })
    const card = cardRef.current
    if (card) {
      const top = card.getBoundingClientRect().top
      if (top < 100 || top > window.innerHeight * 0.6) {
        window.scrollBy({ top: top - 120, behavior: reducedMotion() ? 'auto' : 'smooth' })
      }
    }
  }, [step])

  const treatment: Treatment | null = treatments.find((t) => t.id === treatmentId) ?? null
  const day: Day | null = dayOffset === null ? null : days[dayOffset] ?? null
  const patchDay: Day | null = day ? patchDayFor(days, day.offset) : null
  const taken: boolean[] = day ? takenSlots(day.key) : []
  const patchBlocked = returning === 'no' && day !== null && patchDay === null

  function chooseTreatment(id: string) {
    setTreatmentId(id)
    setSlot(null)
    setStep(1)
  }
  function chooseDay(o: number) {
    setDayOffset(o)
    setSlot(null)
    setStep(2)
  }
  function chooseSlot(i: number) {
    setSlot(i)
    setStep(3)
  }
  function onDetails(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const found = validate(details)
    setErrors(found)
    const firstBad = (Object.keys(found) as Field[])[0]
    if (firstBad) {
      document.getElementById(`kl-f-${firstBad}`)?.focus()
      return
    }
    setStep(5)
  }
  function pay() {
    if (!agree) {
      setAgreeError(true)
      return
    }
    const stamp = Date.now().toString(36).toUpperCase()
    setReference(`KL-${stamp.slice(-6)}`)
    setStep(6)
  }
  function restart() {
    setDayOffset(null)
    setSlot(null)
    setReturning(null)
    setDetails(EMPTY)
    setErrors({})
    setAgree(false)
    setAgreeError(false)
    setReference('')
    setStep(0)
  }
  function update(field: Field, value: string) {
    setDetails((d) => ({ ...d, [field]: value }))
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }))
  }

  const total = treatment ? treatment.price : 0
  const bookable = treatments.filter((t) => t.bookable)
  const done = step === 6

  function fieldProps(field: Field) {
    return {
      id: `kl-f-${field}`,
      value: details[field],
      'aria-invalid': errors[field] ? true : undefined,
      'aria-describedby': errors[field] ? `kl-e-${field}` : undefined,
      className: styles.input,
    }
  }

  return (
    <div className={styles.bookGrid}>
      <div className={styles.bookCard} ref={cardRef}>
        {!done ? (
          <>
            <div className={styles.progress}>
              <span className={styles.progressText}>
                Step {step + 1} of {STEP_TITLES.length}
              </span>
              <span className={styles.progressBar} aria-hidden="true">
                {STEP_TITLES.map((_, i) => (
                  <span key={i} className={i <= step ? styles.segOn : styles.seg} />
                ))}
              </span>
            </div>
            <h3 className={styles.stepTitle} ref={headRef} tabIndex={-1}>
              {STEP_TITLES[step]}
            </h3>
          </>
        ) : null}

        <div className={styles.stepBody} key={step}>
          {step === 0 ? (
            <div className={styles.choiceList} role="group" aria-label="Treatments">
              {bookable.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={styles.choice}
                  aria-pressed={treatmentId === t.id}
                  onClick={() => chooseTreatment(t.id)}
                >
                  <span className={styles.choiceName}>{t.name}</span>
                  <span className={styles.choiceMeta}>
                    {duration(t.minutes)} · {money(t.price)}
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {step === 1 ? (
            days.length === 0 ? (
              <p className={styles.quiet}>Opening the diary…</p>
            ) : (
              <>
                <p className={styles.quiet}>Sundays off. Greyed-out days are fully booked.</p>
                <div className={styles.days} role="group" aria-label="Available days">
                  {days.slice(1).map((d) => {
                    const off = d.closed || d.full
                    return (
                      <button
                        key={d.key}
                        type="button"
                        className={styles.dayBtn}
                        aria-pressed={dayOffset === d.offset}
                        disabled={off}
                        aria-label={`${d.long}${d.closed ? ', closed' : d.full ? ', fully booked' : ''}`}
                        onClick={() => chooseDay(d.offset)}
                      >
                        <span className={styles.dayW}>{d.weekday}</span>
                        <span className={styles.dayN}>{d.dayNum}</span>
                        <span className={styles.dayM}>{d.closed ? 'Off' : d.full ? 'Full' : d.month}</span>
                      </button>
                    )
                  })}
                </div>
              </>
            )
          ) : null}

          {step === 2 && day ? (
            <>
              <p className={styles.quiet}>Times I can arrive on {day.long}.</p>
              <div className={styles.slots} role="group" aria-label="Arrival times">
                {slotTimes.map((s, i) => {
                  const tooLate = treatment !== null && treatment.minutes >= 105 && i === slotTimes.length - 1
                  const off = taken[i] || tooLate
                  return (
                    <button
                      key={s}
                      type="button"
                      className={styles.slotBtn}
                      aria-pressed={slot === i}
                      disabled={off}
                      onClick={() => chooseSlot(i)}
                    >
                      {s}
                      {off ? <small>{tooLate ? 'Too late for this set' : 'Taken'}</small> : null}
                    </button>
                  )
                })}
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <p className={styles.quiet}>
                Have you had lashes or brows done with Kestrel in the last six months?
              </p>
              <div className={styles.pair} role="group" aria-label="Patch test">
                <button
                  type="button"
                  className={styles.choice}
                  aria-pressed={returning === 'yes'}
                  onClick={() => setReturning('yes')}
                >
                  <span className={styles.choiceName}>Yes, I have</span>
                  <span className={styles.choiceMeta}>No patch test needed</span>
                </button>
                <button
                  type="button"
                  className={styles.choice}
                  aria-pressed={returning === 'no'}
                  onClick={() => setReturning('no')}
                >
                  <span className={styles.choiceName}>No, or it is my first time</span>
                  <span className={styles.choiceMeta}>A free 10-minute test first</span>
                </button>
              </div>
              <div aria-live="polite" className={styles.patchNote}>
                {returning === 'no' && patchDay ? (
                  <p>
                    I’ll pop round for a patch test on <b>{patchDay.long}</b>, between 5pm and 7pm. It takes ten
                    minutes and is free. If you would rather a different time, reply to the confirmation email.
                  </p>
                ) : null}
                {patchBlocked ? (
                  <p className={styles.warn}>
                    A patch test has to be at least 48 hours before your first appointment, and{' '}
                    {day ? day.long : 'that day'} is too soon for one. Pick a day a little later.
                  </p>
                ) : null}
                {returning === 'yes' ? <p>Lovely. Same as last time, then.</p> : null}
              </div>
            </>
          ) : null}

          {step === 4 ? (
            <form className={styles.form} onSubmit={onDetails} noValidate id="kl-details">
              <div className={styles.field}>
                <label htmlFor="kl-f-name">Your name</label>
                <input {...fieldProps('name')} type="text" autoComplete="name" onChange={(e) => update('name', e.target.value)} />
                {errors.name ? <p className={styles.err} id="kl-e-name">{errors.name}</p> : null}
              </div>
              <div className={styles.twoUp}>
                <div className={styles.field}>
                  <label htmlFor="kl-f-email">Email</label>
                  <input {...fieldProps('email')} type="email" autoComplete="email" inputMode="email" onChange={(e) => update('email', e.target.value)} />
                  {errors.email ? <p className={styles.err} id="kl-e-email">{errors.email}</p> : null}
                </div>
                <div className={styles.field}>
                  <label htmlFor="kl-f-mobile">Mobile, for reminders</label>
                  <input {...fieldProps('mobile')} type="tel" autoComplete="tel" inputMode="tel" onChange={(e) => update('mobile', e.target.value)} />
                  {errors.mobile ? <p className={styles.err} id="kl-e-mobile">{errors.mobile}</p> : null}
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="kl-f-postcode">Postcode</label>
                <input
                  {...fieldProps('postcode')}
                  type="text"
                  autoComplete="postal-code"
                  autoCapitalize="characters"
                  onChange={(e) => update('postcode', e.target.value)}
                />
                {errors.postcode ? <p className={styles.err} id="kl-e-postcode">{errors.postcode}</p> : null}
              </div>
              <div className={styles.field}>
                <label htmlFor="kl-f-notes">
                  Anything I should know? <span className={styles.optional}>Optional</span>
                </label>
                <textarea
                  id="kl-f-notes"
                  className={styles.input}
                  rows={3}
                  value={details.notes}
                  placeholder="Parking, a buzzer, a dog that likes visitors…"
                  onChange={(e) => update('notes', e.target.value)}
                />
              </div>
            </form>
          ) : null}

          {step === 5 && treatment && day && slot !== null ? (
            <>
              <dl className={styles.summary}>
                <div>
                  <dt>Treatment</dt>
                  <dd>{treatment.name}</dd>
                </div>
                <div>
                  <dt>When</dt>
                  <dd>
                    {day.long}, {slotTimes[slot]}
                  </dd>
                </div>
                <div>
                  <dt>Patch test</dt>
                  <dd>{returning === 'no' && patchDay ? `${patchDay.long}, 5pm–7pm` : 'Not needed'}</dd>
                </div>
                <div>
                  <dt>Where</dt>
                  <dd>{details.postcode.trim().toUpperCase()}</dd>
                </div>
              </dl>
              <div className={styles.bill}>
                <div>
                  <span>Treatment total</span>
                  <span>{money(total)}</span>
                </div>
                <div className={styles.billDue}>
                  <span>Deposit to pay now</span>
                  <span>£{DEPOSIT}</span>
                </div>
                <div>
                  <span>Left to pay on the day</span>
                  <span>£{Math.max(0, total - DEPOSIT)}</span>
                </div>
              </div>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => {
                    setAgree(e.target.checked)
                    if (e.target.checked) setAgreeError(false)
                  }}
                  aria-describedby={agreeError ? 'kl-e-agree' : undefined}
                />
                <span>
                  I understand the deposit moves with me if I give 48 hours’ notice, and is kept if I cancel later
                  than that.
                </span>
              </label>
              {agreeError ? (
                <p className={styles.err} id="kl-e-agree" role="alert">
                  Tick the box to say you have read the cancellation terms.
                </p>
              ) : null}
            </>
          ) : null}

          {done && treatment && day && slot !== null ? (
            <div className={styles.done} role="status" aria-live="polite">
              <svg className={styles.doneMark} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
                <circle cx="32" cy="32" r="30" />
                <path d="M20 33 l8 8 l16 -18" />
              </svg>
              <h3 className={styles.stepTitle} ref={headRef} tabIndex={-1}>
                You’re booked in, {details.name.trim().split(' ')[0]}.
              </h3>
              <p className={styles.quiet}>
                Reference <b className={styles.ref}>{reference}</b>
              </p>
              <ul className={styles.doneList}>
                <li>
                  {treatment.name} on {day.long} at {slotTimes[slot]}
                </li>
                {returning === 'no' && patchDay ? <li>Patch test on {patchDay.long}, 5pm–7pm</li> : null}
                <li>£{DEPOSIT} deposit paid, £{Math.max(0, total - DEPOSIT)} on the day</li>
                <li>Reminders by text a day before and two hours before</li>
              </ul>
              <p className={styles.demoNote}>Demo only: nothing has been sent and no payment was taken.</p>
              <button type="button" className={styles.btnGhost} onClick={restart}>
                Make another booking
              </button>
            </div>
          ) : null}
        </div>

        {!done ? (
          <div className={styles.stepActions}>
            {step > 0 ? (
              <button type="button" className={styles.backBtn} onClick={() => setStep(step - 1)}>
                Back
              </button>
            ) : (
              <span />
            )}
            {step === 3 ? (
              patchBlocked ? (
                <button type="button" className={styles.btn} onClick={() => setStep(1)}>
                  Choose a later day
                </button>
              ) : (
                <button type="button" className={styles.btn} disabled={returning === null} onClick={() => setStep(4)}>
                  Continue
                </button>
              )
            ) : null}
            {step === 4 ? (
              <button type="submit" form="kl-details" className={styles.btn}>
                Review deposit
              </button>
            ) : null}
            {step === 5 ? (
              <button type="button" className={styles.btn} onClick={pay}>
                Pay £{DEPOSIT} deposit
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <aside className={styles.ticket} aria-label="Your booking so far">
        <p className={styles.ticketHead}>Your booking</p>
        <ul className={styles.ticketList}>
          <li>
            <span>Treatment</span>
            <b>{treatment ? treatment.name : '—'}</b>
          </li>
          <li>
            <span>Day</span>
            <b>{day ? day.long : '—'}</b>
          </li>
          <li>
            <span>Time</span>
            <b>{slot !== null ? slotTimes[slot] : '—'}</b>
          </li>
          <li>
            <span>Patch test</span>
            <b>{returning === null ? '—' : returning === 'no' && patchDay ? patchDay.long : 'Not needed'}</b>
          </li>
        </ul>
        <div className={styles.ticketTotal}>
          <span>Deposit today</span>
          <b>{treatment ? `£${DEPOSIT}` : '—'}</b>
        </div>
        <p className={styles.ticketFine}>
          {treatment
            ? `Taken off your ${money(total)} total. The rest is paid on the day.`
            : 'A £15 deposit holds the slot. It comes off the total.'}
        </p>
      </aside>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Nav                                                                  */
/* ------------------------------------------------------------------ */

function Nav({ onBook }: { onBook: () => void }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  function go(e: MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault()
    setOpen(false)
    scrollToId(id)
  }

  return (
    <div className={styles.nav}>
      <div className={styles.navIn}>
        <a href="#kl-top" className={styles.brand} onClick={(e) => go(e, 'kl-top')}>
          <Mark className={styles.mark} />
          <span className={styles.brandName}>
            Kestrel <span className={styles.brandSub}>Lash Studio</span>
          </span>
        </a>
        <nav className={styles.navLinks} aria-label="Kestrel Lash Studio">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} className={styles.navLink} onClick={(e) => go(e, n.id)}>
              {n.label}
            </a>
          ))}
        </nav>
        <button type="button" className={`${styles.btn} ${styles.navCta}`} onClick={onBook}>
          Book now
        </button>
        <button
          type="button"
          className={styles.menuBtn}
          aria-expanded={open}
          aria-controls="kl-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className={styles.sr}>{open ? 'Close menu' : 'Open menu'}</span>
          <span className={open ? `${styles.burger} ${styles.burgerOpen}` : styles.burger} aria-hidden="true" />
        </button>
      </div>
      <div id="kl-menu" className={styles.menu} hidden={!open}>
        <nav aria-label="Kestrel Lash Studio, mobile">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} className={styles.menuLink} onClick={(e) => go(e, n.id)}>
              {n.label}
            </a>
          ))}
          <button
            type="button"
            className={styles.btn}
            onClick={() => {
              setOpen(false)
              onBook()
            }}
          >
            Book now
          </button>
        </nav>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Site                                                                 */
/* ------------------------------------------------------------------ */

const HOW: { title: string; body: string }[] = [
  { title: 'Book and pay the deposit', body: 'Pick a treatment, a day and a time here. The £15 holds it and comes off the total.' },
  { title: 'Patch test, if it is your first time', body: 'Booked for you at least 48 hours before. Ten minutes on your doorstep, no charge.' },
  { title: 'I arrive with everything', body: 'A proper lash bed, a lamp and all the kit. You need a plug socket and a bit of floor.' },
  { title: 'Aftercare and your infill', body: 'A care card on the day, and a text when it is time to book your infill.' },
]

export function Site(): React.JSX.Element {
  const [step, setStep] = useState(0)
  const [treatmentId, setTreatmentId] = useState<string | null>(null)

  function openBooking() {
    scrollToId('kl-book')
  }
  function bookTreatment(id: string) {
    setTreatmentId(id)
    setStep(1)
    scrollToId('kl-book')
  }

  return (
    <div className={styles.root} id="kl-top" tabIndex={-1}>
      <Nav onBook={openBooking} />

      <section className={styles.hero} aria-labelledby="kl-h1">
        <p className={`${styles.kicker} ${styles.rise}`}>Lashes and brows, at your door across Hampshire</p>
        <h1 id="kl-h1" className={`${styles.h1} ${styles.rise}`}>
          <span>Book in seconds.</span> <span>Not in DMs.</span>
        </h1>
        <p className={`${styles.sub} ${styles.rise}`}>
          Classic, hybrid and volume sets at your door. Pick a time, pay a small deposit, done.
        </p>
        <div className={`${styles.ctas} ${styles.rise}`}>
          <button type="button" className={styles.btn} onClick={openBooking}>
            Book now
          </button>
          <a href="#kl-prices" className={styles.btnGhost} onClick={(e) => { e.preventDefault(); scrollToId('kl-prices') }}>
            Prices
          </a>
        </div>
        <div className={styles.art}>
          <EyeArt lashes={heroLashes} animate />
          <div className={`${styles.chip} ${styles.chipIn}`} aria-hidden="true">
            <span className={styles.chipDot} />
            <span>
              <b>Deposit paid</b> Hybrid full set, Thursday 10:30am
            </span>
          </div>
        </div>
      </section>

      <section id="kl-prices" className={styles.section} tabIndex={-1} aria-labelledby="kl-prices-h">
        <div className={styles.sectionHead}>
          <h2 id="kl-prices-h" className={styles.h2}>
            Prices
          </h2>
          <p className={styles.lede}>
            The price is the price: travel within 10 miles of Winchester is included, and there is nothing added at
            the door.
          </p>
        </div>
        <PriceTabs onBook={bookTreatment} />
      </section>

      <section id="kl-styles" className={`${styles.section} ${styles.styles}`} tabIndex={-1} aria-labelledby="kl-styles-h">
        <div className={styles.sectionHead}>
          <h2 id="kl-styles-h" className={styles.h2}>
            Classic, hybrid or volume?
          </h2>
          <p className={styles.lede}>The difference is how many fine lashes go on each of yours. Not sure? Book hybrid and we’ll adjust on the day.</p>
        </div>
        <ul className={styles.compacts}>
          {styleLashes.map((s) => (
            <li key={s.id} className={styles.compact}>
              <div className={styles.mirror}>
                <svg viewBox="0 0 240 140" aria-hidden="true" focusable="false">
                  <path className={styles.lidSmall} d={smallLid} />
                  {s.strokes.map((d, i) => (
                    <path key={i} d={d} className={styles.lashSmall} />
                  ))}
                </svg>
              </div>
              <h3 className={styles.h3}>{s.name}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="kl-how" className={styles.section} tabIndex={-1} aria-labelledby="kl-how-h">
        <div className={styles.sectionHead}>
          <h2 id="kl-how-h" className={styles.h2}>
            How a home visit works
          </h2>
        </div>
        <ol className={styles.how}>
          {HOW.map((h, i) => (
            <li key={h.title}>
              <span className={styles.howNum} aria-hidden="true">
                {i + 1}
              </span>
              <h3 className={styles.h3}>{h.title}</h3>
              <p>{h.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="kl-book" className={`${styles.section} ${styles.bookSection}`} tabIndex={-1} aria-labelledby="kl-book-h">
        <div className={styles.sectionHead}>
          <h2 id="kl-book-h" className={styles.h2}>
            Book an appointment
          </h2>
          <p className={styles.lede}>Three taps to a time, then your details. Reminders go out a day before and two hours before.</p>
        </div>
        <Booking step={step} setStep={setStep} treatmentId={treatmentId} setTreatmentId={setTreatmentId} />
      </section>

      <section id="kl-areas" className={styles.section} tabIndex={-1} aria-labelledby="kl-areas-h">
        <div className={styles.areas}>
          <div>
            <h2 id="kl-areas-h" className={styles.h2}>
              Where I travel
            </h2>
            <p className={styles.lede}>
              Everywhere within 10 miles of Winchester at no extra cost. Further out is £5, and I go as far as
              Andover and the edge of Southampton.
            </p>
            <ul className={styles.towns}>
              {areas.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <dl className={styles.hours}>
              <div>
                <dt>Days</dt>
                <dd>Monday to Saturday</dd>
              </div>
              <div>
                <dt>Times</dt>
                <dd>First arrival 9am, last 6pm</dd>
              </div>
            </dl>
          </div>
          <svg className={styles.radius} viewBox="0 0 400 400" role="img" aria-label="Diagram: a 10-mile circle around Winchester, with nearby towns inside it">
            <circle cx="200" cy="200" r="190" className={styles.ring3} />
            <circle cx="200" cy="200" r="130" className={styles.ring2} />
            <circle cx="200" cy="200" r="6" className={styles.centre} />
            <text x="214" y="196" className={styles.mapLabelBig}>Winchester</text>
            <circle cx="215" cy="122" r="4" className={styles.town} />
            <text x="226" y="126" className={styles.mapLabel}>Kings Worthy</text>
            <circle cx="292" cy="172" r="4" className={styles.town} />
            <text x="302" y="176" className={styles.mapLabel}>Alresford</text>
            <circle cx="236" cy="256" r="4" className={styles.town} />
            <text x="246" y="260" className={styles.mapLabel}>Twyford</text>
            <circle cx="168" cy="292" r="4" className={styles.town} />
            <text x="178" y="296" className={styles.mapLabel}>Eastleigh</text>
            <circle cx="104" cy="250" r="4" className={styles.town} />
            <text x="94" y="240" className={styles.mapLabel} textAnchor="end">Romsey</text>
            <text x="200" y="56" className={styles.mapRing} textAnchor="middle">10 miles, no travel charge</text>
            <text x="200" y="372" className={styles.mapRing} textAnchor="middle">Further out, £5</text>
          </svg>
        </div>
      </section>

      <section id="kl-faq" className={styles.section} tabIndex={-1} aria-labelledby="kl-faq-h">
        <div className={styles.sectionHead}>
          <h2 id="kl-faq-h" className={styles.h2}>
            Questions people ask
          </h2>
        </div>
        <div className={styles.faq}>
          {faqs.map((f) => (
            <details key={f.q} className={styles.faqItem}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.final} aria-labelledby="kl-final-h">
        <Mark className={styles.finalMark} />
        <h2 id="kl-final-h" className={styles.finalH}>
          Your next set, without the back-and-forth.
        </h2>
        <p>Pick a time that suits you. I’ll bring everything else.</p>
        <button type="button" className={styles.btnLight} onClick={openBooking}>
          Book now
        </button>
      </section>

      <footer className={styles.footer}>
        <div>
          <p className={styles.footName}>Kestrel Lash Studio</p>
          <p>Mobile lash and brow technician, Hampshire</p>
        </div>
        <div>
          <p>Mon–Sat · by appointment</p>
          <p>Messages answered between appointments</p>
        </div>
        <p className={styles.footNote}>Concept site by Northbound Web. This business is made up.</p>
      </footer>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Shot: first screen only, static, 1280 x 800                          */
/* ------------------------------------------------------------------ */

export function Shot(): React.JSX.Element {
  return (
    <div className={`${styles.root} ${styles.shot}`} aria-hidden="true">
      <div className={styles.nav}>
        <div className={styles.navIn}>
          <span className={styles.brand}>
            <Mark className={styles.mark} />
            <span className={styles.brandName}>
              Kestrel <span className={styles.brandSub}>Lash Studio</span>
            </span>
          </span>
          <span className={styles.navLinks}>
            {NAV.map((n) => (
              <span key={n.id} className={styles.navLink}>
                {n.label}
              </span>
            ))}
          </span>
          <span className={`${styles.btn} ${styles.navCta}`}>Book now</span>
        </div>
      </div>
      <div className={styles.hero}>
        <p className={styles.kicker}>Lashes and brows, at your door across Hampshire</p>
        <p className={styles.h1}>
          <span>Book in seconds.</span> <span>Not in DMs.</span>
        </p>
        <p className={styles.sub}>Classic, hybrid and volume sets at your door. Pick a time, pay a small deposit, done.</p>
        <div className={styles.ctas}>
          <span className={styles.btn}>Book now</span>
          <span className={styles.btnGhost}>Prices</span>
        </div>
        <div className={styles.art}>
          <EyeArt lashes={shotLashes} animate={false} />
          <div className={styles.chip}>
            <span className={styles.chipDot} />
            <span>
              <b>Deposit paid</b> Hybrid full set, Thursday 10:30am
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
