'use client'

import { useEffect, useRef, useState } from 'react'
import type { FormEvent, MouseEvent } from 'react'
import styles from './styles.module.css'
import {
  barberById,
  barbers,
  clock,
  fmt,
  hours,
  initialLive,
  mineWait,
  services,
  slotBusy,
  slotMinutes,
  step,
  waitFor,
} from './data'
import type { Barber, Live, Row } from './data'

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const NAV: { id: string; label: string }[] = [
  { id: 'ff-wait', label: 'Wait times' },
  { id: 'ff-prices', label: 'Prices' },
  { id: 'ff-barbers', label: 'Barbers' },
  { id: 'ff-book', label: 'Book' },
  { id: 'ff-visit', label: 'Visit' },
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

function validMobile(v: string): boolean {
  return /^(?:\+44|0)7\d{9}$/.test(v.replace(/[\s()-]/g, ''))
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`
}

/* ------------------------------------------------------------------ */
/* Drawn bits                                                           */
/* ------------------------------------------------------------------ */

function Tool({ kind }: { kind: Barber['tool'] }) {
  if (kind === 'clippers') {
    return (
      <svg className={styles.tool} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
        <path d="M42 34 h36 a6 6 0 0 1 6 6 v52 a18 18 0 0 1 -18 18 h-12 a18 18 0 0 1 -18 -18 v-52 a6 6 0 0 1 6 -6z" />
        <path d="M40 34 v-12 h40 v12" />
        <path d="M44 22 v-8 M50 22 v-8 M56 22 v-8 M62 22 v-8 M68 22 v-8 M74 22 v-8" />
        <path d="M52 56 h16 M52 64 h16" />
        <circle cx="60" cy="88" r="7" />
      </svg>
    )
  }
  if (kind === 'scissors') {
    return (
      <svg className={styles.tool} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
        <circle cx="38" cy="92" r="13" />
        <circle cx="82" cy="92" r="13" />
        <path d="M46 82 L84 12" />
        <path d="M74 82 L36 12" />
        <circle cx="60" cy="52" r="3" />
      </svg>
    )
  }
  if (kind === 'razor') {
    return (
      <svg className={styles.tool} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
        <path d="M18 70 C 40 60, 70 60, 104 64 L104 78 C 80 80, 52 82, 26 84 Z" />
        <path d="M26 84 C 30 96, 26 104, 16 110" />
        <path d="M18 70 C 12 80, 12 96, 16 110" />
        <circle cx="22" cy="76" r="3" />
        <path d="M40 70 L98 68" />
      </svg>
    )
  }
  return (
    <svg className={styles.tool} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <rect x="14" y="40" width="92" height="16" rx="4" />
      <path d="M20 56 v32 M28 56 v32 M36 56 v32 M44 56 v32 M52 56 v32 M60 56 v26 M68 56 v26 M76 56 v26 M84 56 v26 M92 56 v26 M100 56 v26" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Wait board                                                           */
/* ------------------------------------------------------------------ */

function status(row: Row): { label: string; free: boolean } {
  if (row.onBreak > 0) return { label: `On a break, back in ${fmt(row.onBreak)}`, free: false }
  if (row.remaining > 0) return { label: `In the chair, ${fmt(row.remaining)} left`, free: false }
  return { label: 'Chair free', free: true }
}

function Board({ live, mineId, staticBoard }: { live: Live; mineId: string | null; staticBoard: boolean }) {
  return (
    <div className={styles.board}>
      <div className={styles.boardTop}>
        <span className={staticBoard ? styles.liveDot : `${styles.liveDot} ${styles.livePulse}`} aria-hidden="true" />
        <span className={styles.boardTitle}>Chairs right now</span>
        {staticBoard ? null : <span className={styles.boardSim}>Simulated for this demo</span>}
      </div>
      <table className={styles.boardTable}>
        {staticBoard ? null : <caption className={styles.sr}>Wait time for each barber, updating every second</caption>}
        <thead>
          <tr>
            <th scope="col">Barber</th>
            <th scope="col" className={styles.right}>
              Wait
            </th>
          </tr>
        </thead>
        <tbody>
          {live.rows.map((r) => {
            const b = barberById(r.id)
            const st = status(r)
            const w = waitFor(r)
            return (
              <tr key={r.id} className={mineId === r.id ? styles.mineRow : undefined}>
                <th scope="row">
                  <span className={styles.boardName}>{b.name}</span>
                  <span className={st.free ? `${styles.boardStatus} ${styles.boardFree}` : styles.boardStatus}>{st.label}. {r.queue === 0 ? 'Nobody waiting' : `${r.queue} waiting`}
                  </span>
                </th>
                <td className={styles.right}>
                  <span className={w === 0 ? `${styles.flap} ${styles.flapFree}` : styles.flap}>{w === 0 ? 'NOW' : fmt(w)}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Join the queue                                                       */
/* ------------------------------------------------------------------ */

type JoinProps = {
  live: Live
  onJoin: (barberId: string | 'any', name: string, serviceId: string) => void
  onLeave: () => void
}

function JoinQueue({ live, onJoin, onLeave }: JoinProps) {
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [serviceId, setServiceId] = useState('fade')
  const [who, setWho] = useState<string>('any')
  const [errors, setErrors] = useState<{ name?: string; mobile?: string }>({})
  const mine = live.mine

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const found: { name?: string; mobile?: string } = {}
    if (name.trim().length < 2) found.name = 'Enter your name so the barber can call you.'
    if (!validMobile(mobile)) found.mobile = 'Enter a UK mobile, like 07700 900123. The text goes here.'
    setErrors(found)
    if (found.name) {
      document.getElementById('ff-q-name')?.focus()
      return
    }
    if (found.mobile) {
      document.getElementById('ff-q-mobile')?.focus()
      return
    }
    onJoin(who, name.trim(), serviceId)
  }

  if (mine) {
    const b = barberById(mine.barberId)
    const svc = services.find((s) => s.id === mine.serviceId)
    const wait = mineWait(live)
    return (
      <div className={styles.ticket}>
        <p className={styles.ticketRef}>Queue ticket {mine.ref}</p>
        {mine.up ? (
          <p className={styles.ticketBig}>You’re up.</p>
        ) : (
          <p className={styles.ticketBig}>
            {mine.pos === 0 ? 'Next in line' : `${ordinal(mine.pos + 1)} in line`}
          </p>
        )}
        <dl className={styles.ticketFacts}>
          <div>
            <dt>Barber</dt>
            <dd>{b.name}</dd>
          </div>
          <div>
            <dt>Service</dt>
            <dd>{svc ? svc.name : ''}</dd>
          </div>
          <div>
            <dt>{mine.up ? 'Chair' : 'About'}</dt>
            <dd className={styles.mono}>{mine.up ? 'Head in now' : fmt(wait)}</dd>
          </div>
        </dl>
        <p className={styles.ticketMsg} aria-live="polite">
          {mine.up
            ? `${b.name} is ready for you, ${mine.name}. This is where we would text you.`
            : mine.pos === 0
              ? `You’re next with ${b.name}. We’d text you now, so start walking over.`
              : `We’ll text you when you’re next, ${mine.name}. No need to sit in the shop.`}
        </p>
        <p className={styles.demoNote}>Demo only: nothing has been sent.</p>
        <button type="button" className={styles.btnLine} onClick={onLeave}>
          {mine.up ? 'Done, clear my ticket' : 'Leave the queue'}
        </button>
      </div>
    )
  }

  return (
    <form className={styles.join} onSubmit={submit} noValidate>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Who with?</legend>
        <div className={styles.chips}>
          <label className={styles.chip}>
            <input type="radio" name="ff-who" value="any" checked={who === 'any'} onChange={() => setWho('any')} />
            <span>First free</span>
          </label>
          {barbers.map((b) => (
            <label key={b.id} className={styles.chip}>
              <input type="radio" name="ff-who" value={b.id} checked={who === b.id} onChange={() => setWho(b.id)} />
              <span>
                {b.name} <small>{fmt(waitFor(live.rows.find((r) => r.id === b.id) ?? live.rows[0]))}</small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className={styles.field}>
        <label htmlFor="ff-q-service">What are you having?</label>
        <select id="ff-q-service" className={styles.input} value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
          {services
            .filter((s) => s.id !== 'design')
            .map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}, £{s.price}
              </option>
            ))}
        </select>
      </div>
      <div className={styles.twoUp}>
        <div className={styles.field}>
          <label htmlFor="ff-q-name">Name</label>
          <input
            id="ff-q-name"
            className={styles.input}
            type="text"
            autoComplete="given-name"
            value={name}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? 'ff-q-name-e' : undefined}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name ? (
            <p className={styles.err} id="ff-q-name-e">
              {errors.name}
            </p>
          ) : null}
        </div>
        <div className={styles.field}>
          <label htmlFor="ff-q-mobile">Mobile</label>
          <input
            id="ff-q-mobile"
            className={styles.input}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={mobile}
            aria-invalid={errors.mobile ? true : undefined}
            aria-describedby={errors.mobile ? 'ff-q-mobile-e' : undefined}
            onChange={(e) => setMobile(e.target.value)}
          />
          {errors.mobile ? (
            <p className={styles.err} id="ff-q-mobile-e">
              {errors.mobile}
            </p>
          ) : null}
        </div>
      </div>
      <button type="submit" className={styles.btn}>
        Join the queue
      </button>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/* Book a chair                                                         */
/* ------------------------------------------------------------------ */

type Day = { key: number; dow: number; short: string; num: number; long: string; isToday: boolean }

function buildDays(now: number): Day[] {
  const base = new Date(now)
  const out: Day[] = []
  for (let i = 0; out.length < 7 && i < 10; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i)
    if (d.getDay() === 0) continue
    out.push({
      key: d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(),
      dow: d.getDay(),
      short: i === 0 ? 'Today' : d.toLocaleDateString('en-GB', { weekday: 'short' }),
      num: d.getDate(),
      long: d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }),
      isToday: i === 0,
    })
  }
  return out
}

/** Which barbers can take this slot index on a day. */
function freeBarbers(day: Day, i: number, nowMin: number, who: string): Barber[] {
  if (day.isToday && slotMinutes[i] < nowMin + 20) return []
  const pool = who === 'any' ? barbers : barbers.filter((b) => b.id === who)
  return pool.filter((b) => b.off !== day.dow && !slotBusy(day.key, barbers.indexOf(b), i))
}

const DOW_NAMES = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays']

type Booked = { ref: string; barber: string; day: string; time: string; service: string; price: number; name: string }

function BookChair({ who, setWho }: { who: string; setWho: (id: string) => void }) {
  const [days, setDays] = useState<Day[]>([])
  const [nowMin, setNowMin] = useState(0)
  const [dayKey, setDayKey] = useState<number | null>(null)
  const [slot, setSlot] = useState<number | null>(null)
  const [serviceId, setServiceId] = useState('fade')
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [errors, setErrors] = useState<{ slot?: string; name?: string; mobile?: string }>({})
  const [booked, setBooked] = useState<Booked | null>(null)
  const doneRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const t = window.setTimeout(() => {
      const now = Date.now()
      const d = new Date(now)
      const list = buildDays(now)
      setDays(list)
      setNowMin(d.getHours() * 60 + d.getMinutes())
      const nm = d.getHours() * 60 + d.getMinutes()
      const first = list.find((dd) => slotMinutes.some((_, i) => freeBarbers(dd, i, nm, 'any').length > 0))
      setDayKey(first ? first.key : list[0] ? list[0].key : null)
    }, 0)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (booked) doneRef.current?.focus()
  }, [booked])

  const day = days.find((d) => d.key === dayKey) ?? null

  function freeAt(i: number): Barber[] {
    return day ? freeBarbers(day, i, nowMin, who) : []
  }

  const chosen = who === 'any' ? null : barberById(who)
  const offToday = chosen !== null && day !== null && chosen.off === day.dow
  const svc = services.find((s) => s.id === serviceId) ?? services[0]
  const anyFree = day ? slotMinutes.some((_, i) => freeAt(i).length > 0) : false

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const found: { slot?: string; name?: string; mobile?: string } = {}
    if (slot === null) found.slot = 'Pick a time first.'
    if (name.trim().length < 2) found.name = 'Enter your name.'
    if (!validMobile(mobile)) found.mobile = 'Enter a UK mobile, like 07700 900123.'
    setErrors(found)
    if (found.slot) {
      document.getElementById('ff-times')?.focus()
      return
    }
    if (found.name) {
      document.getElementById('ff-b-name')?.focus()
      return
    }
    if (found.mobile) {
      document.getElementById('ff-b-mobile')?.focus()
      return
    }
    if (slot === null || !day) return
    const free = freeAt(slot)
    const barber = free[0]
    if (!barber) return
    setBooked({
      ref: `FF-${Date.now().toString(36).toUpperCase().slice(-5)}`,
      barber: barber.name,
      day: day.long,
      time: clock(slotMinutes[slot]),
      service: svc.name,
      price: svc.price,
      name: name.trim(),
    })
  }

  if (booked) {
    return (
      <div className={styles.booked} ref={doneRef} tabIndex={-1} role="status">
        <p className={styles.ticketRef}>Booking {booked.ref}</p>
        <p className={styles.bookedBig}>
          {booked.day}, {booked.time}.
        </p>
        <p className={styles.bookedSub}>
          {booked.service} with {booked.barber}, £{booked.price} paid in the shop. See you then, {booked.name}.
        </p>
        <p className={styles.demoNote}>Demo only: nothing has been sent.</p>
        <button
          type="button"
          className={styles.btnLine}
          onClick={() => {
            setBooked(null)
            setSlot(null)
            setName('')
            setMobile('')
          }}
        >
          Book another chair
        </button>
      </div>
    )
  }

  return (
    <form className={styles.book} onSubmit={submit} noValidate>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          <span className={styles.stepNo}>1</span> Barber
        </legend>
        <div className={styles.barberPick}>
          {[{ id: 'any', name: 'Anyone' }, ...barbers].map((b) => (
            <label key={b.id} className={styles.pickCard}>
              <input
                type="radio"
                name="ff-book-who"
                value={b.id}
                checked={who === b.id}
                onChange={() => {
                  setWho(b.id)
                  setSlot(null)
                }}
              />
              <span>{b.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          <span className={styles.stepNo}>2</span> Day
        </legend>
        {days.length === 0 ? (
          <p className={styles.quiet}>Loading the week…</p>
        ) : (
          <div className={styles.dayStrip}>
            {days.map((d) => (
              <label key={d.key} className={styles.dayCard}>
                <input
                  type="radio"
                  name="ff-book-day"
                  value={d.key}
                  checked={dayKey === d.key}
                  onChange={() => {
                    setDayKey(d.key)
                    setSlot(null)
                  }}
                />
                <span className={styles.dayShort}>{d.short}</span>
                <span className={styles.dayNum}>{d.num}</span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend} id="ff-times-legend">
          <span className={styles.stepNo}>3</span> Time
        </legend>
        <div id="ff-times" tabIndex={-1} className={styles.timesWrap} aria-describedby={errors.slot ? 'ff-slot-e' : undefined}>
          {offToday && chosen ? (
            <p className={styles.quiet}>
              {chosen.name} is off on {DOW_NAMES[chosen.off]}. Pick another day, or choose Anyone.
            </p>
          ) : day && !anyFree ? (
            <p className={styles.quiet}>Nothing left on this day. Try the next one, or join the walk-in queue.</p>
          ) : (
            <div className={styles.times}>
              {slotMinutes.map((m, i) => {
                const free = freeAt(i)
                return (
                  <label key={m} className={free.length === 0 ? `${styles.timeCard} ${styles.timeOff}` : styles.timeCard}>
                    <input
                      type="radio"
                      name="ff-book-time"
                      value={m}
                      disabled={free.length === 0}
                      checked={slot === i}
                      onChange={() => {
                        setSlot(i)
                        if (errors.slot) setErrors((er) => ({ ...er, slot: undefined }))
                      }}
                    />
                    <span>{clock(m)}</span>
                  </label>
                )
              })}
            </div>
          )}
          {errors.slot ? (
            <p className={styles.err} id="ff-slot-e">
              {errors.slot}
            </p>
          ) : null}
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          <span className={styles.stepNo}>4</span> You
        </legend>
        <div className={styles.threeUp}>
          <div className={styles.field}>
            <label htmlFor="ff-b-service">Service</label>
            <select id="ff-b-service" className={styles.input} value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
              {services
                .filter((s) => s.id !== 'design')
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}, £{s.price}
                  </option>
                ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="ff-b-name">Name</label>
            <input
              id="ff-b-name"
              className={styles.input}
              type="text"
              autoComplete="name"
              value={name}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? 'ff-b-name-e' : undefined}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name ? (
              <p className={styles.err} id="ff-b-name-e">
                {errors.name}
              </p>
            ) : null}
          </div>
          <div className={styles.field}>
            <label htmlFor="ff-b-mobile">Mobile</label>
            <input
              id="ff-b-mobile"
              className={styles.input}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={mobile}
              aria-invalid={errors.mobile ? true : undefined}
              aria-describedby={errors.mobile ? 'ff-b-mobile-e' : undefined}
              onChange={(e) => setMobile(e.target.value)}
            />
            {errors.mobile ? (
              <p className={styles.err} id="ff-b-mobile-e">
                {errors.mobile}
              </p>
            ) : null}
          </div>
        </div>
      </fieldset>

      <div className={styles.bookBar}>
        <p className={styles.bookSummary}>
          {slot !== null && day
            ? `${svc.name} · ${day.short === 'Today' ? 'today' : day.long} at ${clock(slotMinutes[slot])} · £${svc.price}`
            : 'Pick a barber, a day and a time.'}
        </p>
        <button type="submit" className={styles.btn}>
          Book the chair
        </button>
      </div>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/* Nav                                                                  */
/* ------------------------------------------------------------------ */

function Nav() {
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
        <a href="#ff-top" className={styles.brand} onClick={(e) => go(e, 'ff-top')}>
          <span className={styles.brandName}>Fade &amp; Fellow</span>
        </a>
        <nav className={styles.navLinks} aria-label="Fade and Fellow">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} className={styles.navLink} onClick={(e) => go(e, n.id)}>
              {n.label}
            </a>
          ))}
        </nav>
        <a href="#ff-book" className={`${styles.btn} ${styles.navCta}`} onClick={(e) => go(e, 'ff-book')}>
          Book a chair
        </a>
        <button
          type="button"
          className={styles.menuBtn}
          aria-expanded={open}
          aria-controls="ff-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>
      <div id="ff-menu" className={styles.menu} hidden={!open}>
        <nav aria-label="Fade and Fellow, mobile">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} className={styles.menuLink} onClick={(e) => go(e, n.id)}>
              {n.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Site                                                                 */
/* ------------------------------------------------------------------ */

export function Site(): React.JSX.Element {
  const [live, setLive] = useState<Live>(initialLive)
  const [bookWho, setBookWho] = useState('any')
  const [today, setToday] = useState<number | null>(null)

  useEffect(() => {
    const id = window.setInterval(() => setLive((l) => step(l)), 1000)
    const t = window.setTimeout(() => setToday(new Date(Date.now()).getDay()), 0)
    return () => {
      window.clearInterval(id)
      window.clearTimeout(t)
    }
  }, [])

  function join(barberId: string | 'any', name: string, serviceId: string) {
    const stamp = Date.now().toString(36).toUpperCase().slice(-4)
    setLive((l) => {
      let target = barberId
      if (target === 'any') {
        let best = l.rows[0]
        for (const r of l.rows) if (waitFor(r) < waitFor(best)) best = r
        target = best.id
      }
      const rows = l.rows.map((r) => (r.id === target ? { ...r, queue: r.queue + 1 } : r))
      const row = l.rows.find((r) => r.id === target) ?? l.rows[0]
      return { ...l, rows, mine: { barberId: target, name, serviceId, pos: row.queue, up: false, ref: `Q-${stamp}` } }
    })
  }

  function leave() {
    setLive((l) => {
      const m = l.mine
      if (!m) return l
      const rows = m.up ? l.rows : l.rows.map((r) => (r.id === m.barberId ? { ...r, queue: Math.max(0, r.queue - 1) } : r))
      return { ...l, rows, mine: null }
    })
  }

  function bookWith(id: string) {
    setBookWho(id)
    scrollToId('ff-book')
  }

  return (
    <div className={styles.root} id="ff-top" tabIndex={-1}>
      <Nav />

      <section className={styles.hero} aria-labelledby="ff-h1">
        <div className={styles.heroIn}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>Walk-ins welcome, or skip the wait. Sheffield.</p>
            <h1 id="ff-h1" className={styles.h1}>
              <span>Sharp cuts.</span>
              <span>No waiting</span>
              <span>around.</span>
            </h1>
            <p className={styles.sub}>See live wait times, book the next free chair, and get a text when you’re up.</p>
            <div className={styles.ctas}>
              <a href="#ff-book" className={styles.btn} onClick={(e) => { e.preventDefault(); scrollToId('ff-book') }}>
                Book a chair
              </a>
              <a href="#ff-wait" className={styles.btnLine} onClick={(e) => { e.preventDefault(); scrollToId('ff-wait') }}>
                Join the walk-in queue
              </a>
            </div>
          </div>
          <Board live={live} mineId={live.mine ? live.mine.barberId : null} staticBoard={false} />
        </div>
      </section>

      <section id="ff-wait" className={styles.section} tabIndex={-1} aria-labelledby="ff-wait-h">
        <div className={styles.split}>
          <div>
            <h2 id="ff-wait-h" className={styles.h2}>
              Join the queue from your sofa.
            </h2>
            <p className={styles.lede}>
              Your place is held while you finish your coffee. When you’re next, we text you. Turn up within ten
              minutes and the chair is yours.
            </p>
            <ol className={styles.rules}>
              <li>Pick a barber, or whoever is free first.</li>
              <li>Watch your place move on the board.</li>
              <li>Get the text, walk over, sit down.</li>
            </ol>
          </div>
          <JoinQueue live={live} onJoin={join} onLeave={leave} />
        </div>
      </section>

      <section id="ff-prices" className={styles.section} tabIndex={-1} aria-labelledby="ff-prices-h">
        <h2 id="ff-prices-h" className={styles.h2}>
          Prices
        </h2>
        <p className={styles.lede}>Card or cash. Paid in the shop, after the cut.</p>
        <ul className={styles.priceGrid}>
          {services.map((s) => (
            <li key={s.id} className={styles.priceItem}>
              <span className={styles.priceName}>{s.name}</span>
              <span className={styles.priceAmt}>{s.id === 'design' ? `+£${s.price}` : `£${s.price}`}</span>
              <span className={styles.priceNote}>
                {s.note}. {s.minutes} min
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section id="ff-barbers" className={styles.section} tabIndex={-1} aria-labelledby="ff-barbers-h">
        <h2 id="ff-barbers-h" className={styles.h2}>
          Four chairs. Four calendars.
        </h2>
        <p className={styles.lede}>Everyone cuts everything. These are the things each of them is first to put their hand up for.</p>
        <ul className={styles.barbers}>
          {barbers.map((b) => (
            <li key={b.id} className={styles.barber}>
              <Tool kind={b.tool} />
              <h3 className={styles.h3}>{b.name}</h3>
              <p className={styles.barberFocus}>{b.focus}</p>
              <p className={styles.barberBody}>{b.body}</p>
              <p className={styles.barberOff}>Off on {DOW_NAMES[b.off]}</p>
              <button type="button" className={styles.btnLine} onClick={() => bookWith(b.id)}>
                Book with {b.name}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section id="ff-book" className={styles.section} tabIndex={-1} aria-labelledby="ff-book-h">
        <h2 id="ff-book-h" className={styles.h2}>
          Book a chair
        </h2>
        <p className={styles.lede}>Rather know exactly when? Pick a slot. Greyed-out times are taken.</p>
        <BookChair who={bookWho} setWho={setBookWho} />
      </section>

      <section id="ff-visit" className={styles.section} tabIndex={-1} aria-labelledby="ff-visit-h">
        <div className={styles.split}>
          <div>
            <h2 id="ff-visit-h" className={styles.h2}>
              Find the shop
            </h2>
            <p className={styles.lede}>
              14 Shalesmoor Works, Sheffield S3. Look for the gold pole. Street parking after 6pm, and the tram stop is
              two minutes away.
            </p>
            <table className={styles.hours}>
              <caption className={styles.sr}>Opening hours</caption>
              <tbody>
                {hours.map((h) => (
                  <tr key={h.day} className={today === h.dow ? styles.today : undefined}>
                    <th scope="row">
                      {h.day}
                      {today === h.dow ? <span className={styles.todayTag}>Today</span> : null}
                    </th>
                    <td>{h.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <svg className={styles.map} viewBox="0 0 400 320" role="img" aria-label="Sketch map: the shop sits on the corner by the tram stop">
            <rect x="0" y="0" width="400" height="320" className={styles.mapBg} />
            <path d="M-10 210 L410 150" className={styles.road} />
            <path d="M150 -10 L190 330" className={styles.road} />
            <path d="M-10 90 L160 60" className={styles.lane} />
            <path d="M260 330 L300 160" className={styles.lane} />
            <path d="M-10 250 L410 190" className={styles.tram} />
            <rect x="96" y="252" width="40" height="12" rx="3" className={styles.tramStop} />
            <text x="96" y="284" className={styles.mapText}>Tram stop</text>
            <circle cx="214" cy="150" r="14" className={styles.pin} />
            <circle cx="214" cy="150" r="5" className={styles.pinDot} />
            <text x="236" y="132" className={styles.mapTitle}>Fade &amp; Fellow</text>
            <text x="20" y="196" className={styles.mapText} transform="rotate(-8 20 196)">Shalesmoor</text>
          </svg>
        </div>
      </section>

      <section className={styles.final} aria-labelledby="ff-final-h">
        <div className={styles.stripe} aria-hidden="true" />
        <h2 id="ff-final-h" className={styles.finalH}>
          Next chair’s yours.
        </h2>
        <div className={styles.ctas}>
          <a href="#ff-book" className={styles.btn} onClick={(e) => { e.preventDefault(); scrollToId('ff-book') }}>
            Book a chair
          </a>
          <a href="#ff-wait" className={styles.btnLine} onClick={(e) => { e.preventDefault(); scrollToId('ff-wait') }}>
            Join the queue
          </a>
        </div>
      </section>

      <footer className={styles.footer}>
        <p className={styles.footName}>Fade &amp; Fellow</p>
        <p>Barber, Sheffield</p>
        <p>Mon–Sat · 9am–7pm</p>
        <p className={styles.footNote}>Concept site by Northbound Web. This business is made up.</p>
      </footer>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Shot                                                                 */
/* ------------------------------------------------------------------ */

export function Shot(): React.JSX.Element {
  return (
    <div className={`${styles.root} ${styles.shot}`} aria-hidden="true">
      <div className={styles.nav}>
        <div className={styles.navIn}>
          <span className={styles.brand}>
              <span className={styles.brandName}>Fade &amp; Fellow</span>
          </span>
          <span className={styles.navLinks}>
            {NAV.map((n) => (
              <span key={n.id} className={styles.navLink}>
                {n.label}
              </span>
            ))}
          </span>
          <span className={`${styles.btn} ${styles.navCta}`}>Book a chair</span>
        </div>
      </div>
      <div className={styles.hero}>
        <div className={styles.heroIn}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>Walk-ins welcome, or skip the wait. Sheffield.</p>
            <p className={styles.h1}>
              <span>Sharp cuts.</span>
              <span>No waiting</span>
              <span>around.</span>
            </p>
            <p className={styles.sub}>See live wait times, book the next free chair, and get a text when you’re up.</p>
            <div className={styles.ctas}>
              <span className={styles.btn}>Book a chair</span>
              <span className={styles.btnLine}>Join the walk-in queue</span>
            </div>
          </div>
          <Board live={initialLive} mineId={null} staticBoard />
        </div>
      </div>
    </div>
  )
}
