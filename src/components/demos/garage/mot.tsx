'use client'

import { useState } from 'react'
import type { FormEvent, JSX } from 'react'
import { addDays, addMonths, dayDiff, longDate, lookupReg, parseISO } from './data'
import type { Vehicle } from './data'
import { Arrow, Tick } from './parts'
import styles from './styles.module.css'

type Mode = 'last' | 'first'

type Calc =
  | { kind: 'none' }
  | { kind: 'error'; msg: string }
  | {
      kind: 'ok'
      expiry: string
      earliest: string
      remindOn: string
      daysLeft: number
      status: 'overdue' | 'window' | 'ok'
      pctToday: number
      pctWindow: number
      note: string
    }

function compute(mode: Mode, value: string): Calc {
  if (!value) return { kind: 'none' }
  const d = parseISO(value)
  if (!d) return { kind: 'error', msg: 'Enter a full date.' }
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (dayDiff(today, d) > 0) return { kind: 'error', msg: 'That date is in the future.' }
  let note = ''
  let expiry: Date
  if (mode === 'last') {
    if (dayDiff(d, today) > 366 * 2) return { kind: 'error', msg: 'That test is over two years old, so the MOT has run out. Book a test.' }
    expiry = addDays(addMonths(d, 12), -1)
    note = 'A certificate runs for a year, less one day.'
  } else {
    expiry = addMonths(d, 36)
    if (dayDiff(expiry, today) > 0) {
      return { kind: 'error', msg: 'That car is over three years old, so it needs a yearly MOT. Switch to “Last MOT date”.' }
    }
    note = 'A new car needs its first MOT by the third anniversary of registration.'
  }
  const earliest = addDays(addMonths(expiry, -1), 1)
  const daysLeft = dayDiff(today, expiry)
  const span = Math.max(1, dayDiff(d, expiry))
  const pct = (x: Date) => Math.min(100, Math.max(0, (dayDiff(d, x) / span) * 100))
  return {
    kind: 'ok',
    expiry: longDate(expiry),
    earliest: longDate(earliest),
    remindOn: longDate(addMonths(expiry, -1)),
    daysLeft,
    status: daysLeft < 0 ? 'overdue' : dayDiff(earliest, today) >= 0 ? 'window' : 'ok',
    pctToday: pct(today),
    pctWindow: pct(earliest),
    note,
  }
}

export function MotCalc({ vehicle, onBook }: { vehicle: Vehicle | null; onBook: () => void }): JSX.Element {
  const [mode, setMode] = useState<Mode>('last')
  const [date, setDate] = useState('')
  const [calc, setCalc] = useState<Calc>({ kind: 'none' })
  const [mobile, setMobile] = useState('')
  const [regEdit, setRegEdit] = useState<string | null>(null)
  const [errs, setErrs] = useState<{ mobile?: string; reg?: string; date?: string }>({})
  const [done, setDone] = useState<{ ref: string; mobile: string; reg: string; on: string } | null>(null)

  const reg = regEdit ?? vehicle?.plate ?? ''

  function update(m: Mode, value: string) {
    setMode(m)
    setDate(value)
    setCalc(compute(m, value))
  }

  function signUp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const next: { mobile?: string; reg?: string; date?: string } = {}
    if (calc.kind !== 'ok') next.date = 'Work out your MOT date above first.'
    if (!/^(\+447|07)\d{9}$/.test(mobile.replace(/[\s()-]/g, ''))) next.mobile = 'Enter a UK mobile, like 07700 900123.'
    const now = new Date()
    const r = lookupReg(reg, now.getFullYear(), now.getMonth() + 1)
    if (!r.ok) next.reg = r.error
    setErrs(next)
    if (Object.keys(next).length > 0 || calc.kind !== 'ok' || !r.ok) return
    setDone({
      ref: `NG-R${Math.floor(10000 + Math.random() * 90000)}`,
      mobile: mobile.trim(),
      reg: r.v.plate,
      on: calc.remindOn,
    })
  }

  return (
    <div className={styles.motGrid}>
      <div className={styles.motCard}>
        <fieldset className={styles.seg}>
          <legend className={styles.sr}>What date do you know?</legend>
          <label className={mode === 'last' ? styles.segOn : undefined}>
            <input type="radio" name="ng-mode" checked={mode === 'last'} onChange={() => update('last', date)} className={styles.sr} />
            Last MOT date
          </label>
          <label className={mode === 'first' ? styles.segOn : undefined}>
            <input type="radio" name="ng-mode" checked={mode === 'first'} onChange={() => update('first', date)} className={styles.sr} />
            New car: first registered
          </label>
        </fieldset>
        <label htmlFor="ng-date" className={styles.fieldLabel}>
          {mode === 'last' ? 'Date of your last MOT' : 'Date first registered'}
        </label>
        <input
          id="ng-date"
          type="date"
          className={styles.input}
          value={date}
          onChange={(e) => update(mode, e.target.value)}
          aria-describedby="ng-calc-out"
        />

        <div id="ng-calc-out" className={styles.calcOut} aria-live="polite">
          {calc.kind === 'none' && <p className={styles.mutedText}>Pick a date to see when your MOT runs out.</p>}
          {calc.kind === 'error' && <p className={styles.regErr}>{calc.msg}</p>}
          {calc.kind === 'ok' && (
            <div key={calc.expiry} className={styles.calcRes}>
              <p className={styles.calcK}>MOT runs out</p>
              <p className={styles.calcBig}>{calc.expiry}</p>
              <p
                className={`${styles.calcStatus} ${
                  calc.status === 'overdue' ? styles.stBad : calc.status === 'window' ? styles.stWarn : styles.stOk
                }`}
              >
                {calc.status === 'overdue'
                  ? `Expired ${Math.abs(calc.daysLeft)} day${Math.abs(calc.daysLeft) === 1 ? '' : 's'} ago. Only drive it to a booked test.`
                  : calc.status === 'window'
                    ? `${calc.daysLeft} day${calc.daysLeft === 1 ? '' : 's'} left. You are in the early window: book now and keep your date.`
                    : `${calc.daysLeft} days left.`}
              </p>
              <div className={styles.strip} aria-hidden="true">
                <span className={styles.stripWin} style={{ left: `${calc.pctWindow}%` }} />
                <span className={styles.stripToday} style={{ left: `${calc.pctToday}%` }}>
                  <i>Today</i>
                </span>
              </div>
              <dl className={styles.calcList}>
                <div>
                  <dt>Earliest test that keeps your date</dt>
                  <dd>{calc.earliest}</dd>
                </div>
                <div>
                  <dt>We would text you on</dt>
                  <dd>{calc.remindOn}</dd>
                </div>
              </dl>
              <p className={styles.mutedSmall}>{calc.note}</p>
              {calc.status !== 'ok' && (
                <button type="button" className={styles.btnGreen} onClick={onBook}>
                  Book an MOT <Arrow />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={styles.remCard}>
        {done ? (
          <div className={styles.remDone} aria-live="polite">
            <span className={styles.remTick}>
              <Tick />
            </span>
            <p className={styles.remTitle}>Reminder set</p>
            <p>
              We would text <b>{done.mobile}</b> on <b>{done.on}</b> about <b>{done.reg}</b>, then once a year after each
              test.
            </p>
            <p className={styles.mono}>Ref {done.ref}</p>
            <p className={styles.demoNote}>Demo only: nothing has been sent.</p>
            <button type="button" className={styles.btnLine} onClick={() => setDone(null)}>
              Set another reminder
            </button>
          </div>
        ) : (
          <form onSubmit={signUp} noValidate>
            <p className={styles.remTitle}>Free yearly reminder</p>
            <p className={styles.mutedText}>One text a month before it is due. Nothing else, ever.</p>
            <div className={styles.remFields}>
              <div className={styles.field}>
                <label htmlFor="ng-rem-reg" className={styles.fieldLabel}>
                  Registration
                </label>
                <input
                  id="ng-rem-reg"
                  className={`${styles.input} ${styles.monoInput}`}
                  value={reg}
                  onChange={(e) => setRegEdit(e.target.value.toUpperCase())}
                  autoComplete="off"
                  aria-invalid={errs.reg ? true : undefined}
                  aria-describedby={errs.reg ? 'ng-rem-reg-err' : undefined}
                />
                {errs.reg && <p id="ng-rem-reg-err" className={styles.regErr}>{errs.reg}</p>}
              </div>
              <div className={styles.field}>
                <label htmlFor="ng-rem-mob" className={styles.fieldLabel}>
                  Mobile
                </label>
                <input
                  id="ng-rem-mob"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  className={styles.input}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  aria-invalid={errs.mobile ? true : undefined}
                  aria-describedby={errs.mobile ? 'ng-rem-mob-err' : undefined}
                />
                {errs.mobile && <p id="ng-rem-mob-err" className={styles.regErr}>{errs.mobile}</p>}
              </div>
            </div>
            {errs.date && <p className={styles.regErr} role="alert">{errs.date}</p>}
            <button type="submit" className={styles.btnDark}>
              Text me a reminder
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
