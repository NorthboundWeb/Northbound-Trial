'use client'

import { useEffect, useRef, useState, type FormEvent, type JSX, type KeyboardEvent } from 'react'
import styles from './styles.module.css'
import {
  ADDONS,
  BOOKING_FEE,
  COMPARE,
  EXTRA_HOUR,
  MAX_EXTRA_HOURS,
  PACKAGES,
  gbp,
  packageById,
  quote,
  type Addons,
  type AddonId,
  type PackageId,
} from './data'
import {
  MONTH_NAMES,
  STATUS_TEXT,
  daysInMonth,
  dowOf,
  fromSerial,
  longDate,
  nearestFree,
  serialOfIso,
  shortDate,
  statusOf,
  toSerial,
  type DayStatus,
} from './time'

export function cx(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(' ')
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const STATUS_CLASS: Record<DayStatus, string> = {
  past: styles.dPast,
  booked: styles.dBooked,
  limited: styles.dLimited,
  free: styles.dFree,
}

type Month = { y: number; m: number }

function monthOf(serial: number): Month {
  const { y, m } = fromSerial(serial)
  return { y, m }
}

function shiftMonth(v: Month, by: number): Month {
  const idx = v.y * 12 + (v.m - 1) + by
  return { y: Math.floor(idx / 12), m: (idx % 12) + 1 }
}

/* ------------------------------------------------------------------ calendar */

export function Calendar({
  today,
  selected,
  onSelect,
  onEnquire,
}: {
  today: number | null
  selected: number | null
  onSelect: (serial: number) => void
  onEnquire: (serial: number) => void
}): JSX.Element {
  const [view, setView] = useState<Month | null>(null)
  const [focusDay, setFocusDay] = useState<number | null>(null)
  const refs = useRef<Record<number, HTMLButtonElement | null>>({})
  const wantFocus = useRef(false)

  const start = today !== null ? monthOf(today + 1) : null
  const shown = view ?? (selected !== null ? monthOf(selected) : start)
  const viewKey = shown ? shown.y * 12 + shown.m : 0

  useEffect(() => {
    if (!wantFocus.current || focusDay === null) return
    wantFocus.current = false
    refs.current[focusDay]?.focus()
  }, [focusDay, viewKey])

  if (!shown || !start || today === null) {
    return (
      <div className={styles.calendar}>
        <div className={styles.calSkeleton}>Loading the diary…</div>
      </div>
    )
  }

  const minIdx = start.y * 12 + start.m
  const maxIdx = minIdx + 24
  const canPrev = viewKey > minIdx
  const canNext = viewKey < maxIdx
  const first = toSerial(shown.y, shown.m, 1)
  const offset = (dowOf(first) + 6) % 7
  const n = daysInMonth(shown.y, shown.m)
  const selDay = selected !== null && selected >= first && selected < first + n ? selected - first + 1 : null
  const todayDay = today >= first && today < first + n ? today - first + 2 : null
  const tabDay = focusDay !== null && focusDay <= n ? focusDay : (selDay ?? (todayDay !== null && todayDay <= n ? todayDay : 1))

  const cells: (number | null)[] = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= n; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  const go = (by: number) => {
    const next = shiftMonth(shown, by)
    const idx = next.y * 12 + next.m
    if (idx < minIdx || idx > maxIdx) return
    setView(next)
    setFocusDay(null)
  }

  const pick = (serial: number) => {
    onSelect(serial)
    setView(monthOf(serial))
    setFocusDay(fromSerial(serial).d)
  }

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, d: number) => {
    const col = (offset + d - 1) % 7
    let nd = d
    let by = 0
    switch (e.key) {
      case 'ArrowLeft':
        nd = d - 1
        break
      case 'ArrowRight':
        nd = d + 1
        break
      case 'ArrowUp':
        nd = d - 7
        break
      case 'ArrowDown':
        nd = d + 7
        break
      case 'Home':
        nd = d - col
        break
      case 'End':
        nd = d + (6 - col)
        break
      case 'PageUp':
        by = -1
        break
      case 'PageDown':
        by = 1
        break
      default:
        return
    }
    e.preventDefault()
    let target = shown
    if (by !== 0) {
      target = shiftMonth(shown, by)
      nd = Math.min(d, daysInMonth(target.y, target.m))
    } else if (nd < 1) {
      target = shiftMonth(shown, -1)
      nd = daysInMonth(target.y, target.m) + nd
    } else if (nd > n) {
      target = shiftMonth(shown, 1)
      nd = nd - n
    }
    const idx = target.y * 12 + target.m
    if (idx < minIdx || idx > maxIdx) return
    if (idx !== viewKey) setView(target)
    nd = Math.max(1, Math.min(nd, daysInMonth(target.y, target.m)))
    wantFocus.current = true
    setFocusDay(nd)
  }

  const st = selected !== null ? statusOf(selected, today) : null
  const suggestions = selected !== null && (st === 'booked' || st === 'past') ? nearestFree(Math.max(selected, today + 1), today, 3) : []

  return (
    <div className={styles.calWrap}>
      <div className={styles.calendar}>
        <div className={styles.calHead}>
          <button type="button" className={styles.calNav} onClick={() => go(-1)} disabled={!canPrev} aria-label="Previous month">
            ←
          </button>
          <h3 id="hl-cal-title" className={styles.calTitle} aria-live="polite">
            {MONTH_NAMES[shown.m - 1]} <span>{shown.y}</span>
          </h3>
          <button type="button" className={styles.calNav} onClick={() => go(1)} disabled={!canNext} aria-label="Next month">
            →
          </button>
        </div>
        <div role="grid" aria-labelledby="hl-cal-title" className={styles.grid}>
          <div role="row" className={styles.week}>
            {WEEKDAYS.map((w) => (
              <span key={w} role="columnheader" className={styles.weekday}>
                <abbr title={w}>{w.slice(0, 1)}</abbr>
              </span>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div role="row" key={wi} className={styles.week}>
              {week.map((d, di) => {
                if (d === null) return <span key={`e${di}`} role="gridcell" className={styles.blank} />
                const s = first + d - 1
                const status = statusOf(s, today)
                const isSel = selected === s
                return (
                  <span key={d} role="gridcell" aria-selected={isSel}>
                    <button
                      ref={(el) => {
                        refs.current[d] = el
                      }}
                      type="button"
                      tabIndex={d === tabDay ? 0 : -1}
                      className={cx(styles.day, STATUS_CLASS[status], isSel && styles.daySel)}
                      aria-label={`${longDate(s)}, ${STATUS_TEXT[status].label}`}
                      aria-disabled={status === 'past' ? true : undefined}
                      onClick={() => {
                        setFocusDay(d)
                        if (status !== 'past') onSelect(s)
                      }}
                      onKeyDown={(e) => onKey(e, d)}
                    >
                      {d}
                    </button>
                  </span>
                )
              })}
            </div>
          ))}
        </div>
        <ul className={styles.legend} aria-label="Key">
          <li>
            <span className={cx(styles.swatch, styles.dFree)} aria-hidden="true" /> Free
          </li>
          <li>
            <span className={cx(styles.swatch, styles.dLimited)} aria-hidden="true" /> Afternoon only
          </li>
          <li>
            <span className={cx(styles.swatch, styles.dBooked)} aria-hidden="true" /> Booked
          </li>
        </ul>
        <p className={styles.calHint}>Arrow keys move between days. Page Up and Page Down change month.</p>
      </div>

      <div className={styles.result} aria-live="polite">
        {selected === null || st === null ? (
          <div className={styles.resultEmpty}>
            <p className={styles.label}>Your date</p>
            <p className={styles.resultLead}>Pick a day on the calendar to see straight away whether it is free.</p>
            <p className={styles.small}>Saturdays from May to September go first. Fridays, Sundays and weekdays are often still open.</p>
          </div>
        ) : (
          <div className={styles.resultBody} key={selected}>
            <p className={cx(styles.statusPill, STATUS_CLASS[st])}>{STATUS_TEXT[st].label}</p>
            <h3 className={styles.resultDate}>{longDate(selected)}</h3>
            <p className={styles.resultText}>{STATUS_TEXT[st].body}</p>
            {(st === 'free' || st === 'limited') && (
              <button type="button" className={styles.btnSolid} onClick={() => onEnquire(selected)}>
                Enquire about this date
              </button>
            )}
            {suggestions.length > 0 && (
              <div className={styles.suggest}>
                <p className={styles.label}>Nearest free dates</p>
                <div className={styles.suggestList}>
                  {suggestions.map((s) => (
                    <button key={s} type="button" className={styles.suggestBtn} onClick={() => pick(s)}>
                      {shortDate(s)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ packages */

export function Packages({
  pkg,
  setPkg,
  addons,
  setAddons,
  onUse,
}: {
  pkg: PackageId
  setPkg: (p: PackageId) => void
  addons: Addons
  setAddons: (a: Addons) => void
  onUse: () => void
}): JSX.Element {
  const q = quote(pkg, addons)
  const selIndex = PACKAGES.findIndex((p) => p.id === pkg)

  const toggle = (id: AddonId) => {
    const next: Addons = { ...addons }
    next[id] = !addons[id]
    setAddons(next)
  }

  const hours = (h: number) => setAddons({ ...addons, hours: Math.max(0, Math.min(MAX_EXTRA_HOURS, h)) })

  return (
    <div className={styles.packages}>
      <fieldset className={styles.pkgSet}>
        <legend className={styles.sr}>Choose a package</legend>
        <div className={styles.pkgCards}>
          {PACKAGES.map((p, i) => (
            <label key={p.id} className={cx(styles.pkgCard, pkg === p.id && styles.pkgOn)}>
              <input type="radio" name="hl-package" value={p.id} checked={pkg === p.id} onChange={() => setPkg(p.id)} />
              <span className={styles.pkgNum}>No. {String(i + 1).padStart(2, '0')}</span>
              <span className={styles.pkgName}>{p.name}</span>
              <span className={styles.pkgPrice}>{gbp(p.price)}</span>
              <span className={styles.pkgHours}>{p.hours}</span>
              <span className={styles.pkgLine}>{p.line}</span>
              <span className={styles.pkgPick} aria-hidden="true">
                {pkg === p.id ? 'Selected' : 'Choose'}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.compareWrap}>
        <table className={styles.compare}>
          <caption className={styles.sr}>What each package includes</caption>
          <thead>
            <tr>
              <td />
              {PACKAGES.map((p, i) => (
                <th key={p.id} scope="col" className={cx(i === selIndex && styles.colOn)}>
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {row.cells.map((c, i) => (
                  <td key={i} className={cx(i === selIndex && styles.colOn)}>
                    {c === 'yes' ? (
                      <>
                        <span className={styles.tick} aria-hidden="true" />
                        <span className={styles.sr}>Included</span>
                      </>
                    ) : (
                      c
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.builder}>
        <fieldset className={styles.addons}>
          <legend className={styles.label}>Add-ons</legend>
          {ADDONS.map((a) => {
            const included = a.id === 'second' && pkg === 'full'
            return (
              <label key={a.id} className={cx(styles.addon, (addons[a.id] || included) && styles.addonOn, included && styles.addonIncl)}>
                <input type="checkbox" checked={included || addons[a.id]} disabled={included} onChange={() => toggle(a.id)} />
                <span className={styles.addonText}>
                  <b>{a.name}</b>
                  <span>{included ? 'Included with the full day' : a.note}</span>
                </span>
                <span className={styles.addonPrice}>{included ? 'Included' : `+${gbp(a.price)}`}</span>
              </label>
            )
          })}
          <div className={cx(styles.addon, addons.hours > 0 && styles.addonOn)}>
            <span className={styles.addonText}>
              <b id="hl-hours-label">Extra hours</b>
              <span>{gbp(EXTRA_HOUR)} an hour, up to three</span>
            </span>
            <div className={styles.stepper} role="group" aria-labelledby="hl-hours-label">
              <button type="button" onClick={() => hours(addons.hours - 1)} disabled={addons.hours <= 0} aria-label="One hour fewer">
                −
              </button>
              <span aria-live="polite">{addons.hours}</span>
              <button type="button" onClick={() => hours(addons.hours + 1)} disabled={addons.hours >= MAX_EXTRA_HOURS} aria-label="One hour more">
                +
              </button>
            </div>
          </div>
        </fieldset>

        <aside className={styles.summary} aria-label="Your total">
          <p className={styles.label}>Your total</p>
          <ul className={styles.sumLines}>
            {q.lines.map((l) => (
              <li key={l.label}>
                <span>{l.label}</span>
                <span>{gbp(l.price)}</span>
              </li>
            ))}
          </ul>
          <p className={styles.sumTotal} aria-live="polite">
            <span>Total</span>
            <b>{gbp(q.total)}</b>
          </p>
          <p className={styles.small}>
            A {gbp(BOOKING_FEE)} booking fee holds the date and comes off this total. The balance is due a month before.
          </p>
          <button type="button" className={styles.btnSolid} onClick={onUse}>
            Use this in my enquiry
          </button>
        </aside>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ enquiry */

type Errors = Partial<Record<'names' | 'email' | 'date' | 'venue', string>>
type Done = {
  ref: string
  names: string
  date: string
  status: DayStatus | null
  venue: string
  pkg: string
  extras: string[]
  total: number
}

const GUESTS = ['Just us', 'Under 30', '30 to 80', '80 to 150', 'More than 150']

export function Enquiry({
  today,
  date,
  setDate,
  pkg,
  addons,
  onEditPackage,
}: {
  today: number | null
  date: string
  setDate: (iso: string) => void
  pkg: PackageId
  addons: Addons
  onEditPackage: () => void
}): JSX.Element {
  const [names, setNames] = useState('')
  const [email, setEmail] = useState('')
  const [venue, setVenue] = useState('')
  const [guests, setGuests] = useState('')
  const [message, setMessage] = useState('')
  const [noDate, setNoDate] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [done, setDone] = useState<Done | null>(null)
  const doneRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (done) doneRef.current?.focus()
  }, [done])

  const q = quote(pkg, addons)
  const serial = serialOfIso(date)
  const status = serial !== null && today !== null ? statusOf(serial, today) : null

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const next: Errors = {}
    if (names.trim().length < 2) next.names = 'Add both your names.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) next.email = 'Add an email so I can reply.'
    if (!noDate) {
      if (serial === null) next.date = 'Choose your date, or tick “We have not set a date yet”.'
      else if (status === 'past') next.date = 'That date has passed. Choose a future date.'
    }
    if (venue.trim().length < 2) next.venue = 'Add the venue, or the area if you are still looking.'
    setErrors(next)
    const first = (['names', 'email', 'date', 'venue'] as const).find((k) => next[k])
    if (first) {
      document.getElementById(`hl-${first}`)?.focus()
      return
    }
    const p = packageById(pkg)
    setDone({
      ref: `HL-${Date.now().toString(36).slice(-5).toUpperCase()}`,
      names: names.trim(),
      date: noDate || serial === null ? 'Date to be decided' : longDate(serial),
      status: noDate ? null : status,
      venue: venue.trim(),
      pkg: p.name,
      extras: q.lines.slice(1).map((l) => l.label),
      total: q.total,
    })
  }

  if (done) {
    return (
      <div className={styles.enqDone}>
        <p className={styles.label}>Enquiry received · {done.ref}</p>
        <h3 ref={doneRef} tabIndex={-1} className={styles.enqDoneTitle}>
          Thank you, {done.names}.
        </h3>
        <p className={styles.resultText}>
          I reply to every enquiry within two working days, usually with a few times for a short call.
          {done.status === 'free' && ' Your date is free, and I will hold it for seven days while we talk.'}
          {done.status === 'limited' && ' Your date is free from 2pm, which suits an elopement or a half day.'}
          {done.status === 'booked' && ' That date is already booked, so I will suggest the nearest free days.'}
        </p>
        <dl className={styles.enqSummary}>
          <div>
            <dt>Date</dt>
            <dd>{done.date}</dd>
          </div>
          <div>
            <dt>Where</dt>
            <dd>{done.venue}</dd>
          </div>
          <div>
            <dt>Package</dt>
            <dd>
              {done.pkg}
              {done.extras.length > 0 && ` with ${done.extras.join(', ').toLowerCase()}`}
            </dd>
          </div>
          <div>
            <dt>Estimate</dt>
            <dd>{gbp(done.total)}</dd>
          </div>
        </dl>
        <p className={styles.demoNote}>Demo only: nothing has been sent.</p>
        <button
          type="button"
          className={styles.btnGhost}
          onClick={() => {
            setDone(null)
            setMessage('')
          }}
        >
          Send another
        </button>
      </div>
    )
  }

  return (
    <form className={styles.enqForm} onSubmit={submit} noValidate>
      <div className={styles.enqGrid}>
        <Field id="hl-names" label="Your names" value={names} onChange={setNames} error={errors.names} autoComplete="name" placeholder="Sam & Alex" />
        <Field id="hl-email" label="Email" value={email} onChange={setEmail} error={errors.email} autoComplete="email" type="email" />
        <div className={styles.field}>
          <label htmlFor="hl-date" className={styles.label}>
            Wedding date
          </label>
          <input
            id="hl-date"
            type="date"
            value={date}
            disabled={noDate}
            onChange={(e) => setDate(e.target.value)}
            aria-invalid={Boolean(errors.date)}
            aria-describedby={errors.date ? 'hl-date-err' : 'hl-date-status'}
          />
          {errors.date ? (
            <p id="hl-date-err" className={styles.error}>
              {errors.date}
            </p>
          ) : (
            <p id="hl-date-status" className={styles.small} aria-live="polite">
              {noDate
                ? 'No problem. Tell me the season you have in mind below.'
                : status
                  ? `${STATUS_TEXT[status].label} in the diary.`
                  : 'Filled in for you if you used the calendar.'}
            </p>
          )}
          <label className={styles.inlineCheck}>
            <input type="checkbox" checked={noDate} onChange={(e) => setNoDate(e.target.checked)} />
            We have not set a date yet
          </label>
        </div>
        <Field id="hl-venue" label="Venue or area" value={venue} onChange={setVenue} error={errors.venue} placeholder="A barn near the coast" />
        <div className={styles.field}>
          <label htmlFor="hl-guests" className={styles.label}>
            Guests <span className={styles.optional}>(roughly)</span>
          </label>
          <select id="hl-guests" value={guests} onChange={(e) => setGuests(e.target.value)}>
            <option value="">Not sure yet</option>
            {GUESTS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div className={cx(styles.field, styles.wide)}>
          <label htmlFor="hl-message" className={styles.label}>
            Tell me about your day <span className={styles.optional}>(optional)</span>
          </label>
          <textarea id="hl-message" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1200} />
        </div>
      </div>
      <div className={styles.enqPkg}>
        <div>
          <p className={styles.label}>Package</p>
          <p className={styles.enqPkgName}>
            {packageById(pkg).name}
            {q.lines.length > 1 && <span> + {q.lines.length - 1} add-on{q.lines.length > 2 ? 's' : ''}</span>}
          </p>
          <p className={styles.small}>Estimate {gbp(q.total)}</p>
        </div>
        <button type="button" className={styles.textBtn} onClick={onEditPackage}>
          Change
        </button>
      </div>
      <button type="submit" className={styles.btnSolid}>
        Send enquiry
      </button>
      <p className={styles.demoNote}>Demo only: nothing is sent.</p>
    </form>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  autoComplete,
  placeholder,
  type = 'text',
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  autoComplete?: string
  placeholder?: string
  type?: 'text' | 'email'
}): JSX.Element {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-err` : undefined}
      />
      {error && (
        <p id={`${id}-err`} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  )
}
