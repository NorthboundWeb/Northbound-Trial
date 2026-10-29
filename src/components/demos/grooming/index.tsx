'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, JSX, MouseEvent as ReactMouseEvent, RefObject } from 'react'
import styles from './styles.module.css'
import {
  ADDONS,
  COATS,
  FAQS,
  GROOMERS,
  HOURS,
  MATTING,
  SERVICES,
  SIZES,
  SLOTS,
  duration,
  hash,
  money,
} from './data'
import type { CoatId, GroomerId, MattingId, ServiceId, SizeId } from './data'
import { DogPortrait, DogSide, GroomerBadge, IconBath, IconDoor, IconScissors, IconText, MapArt } from './art'

const NAV: { id: string; label: string }[] = [
  { id: 'bb-prices', label: 'Prices' },
  { id: 'bb-calc', label: 'Calculator' },
  { id: 'bb-groomers', label: 'Groomers' },
  { id: 'bb-book', label: 'Book' },
  { id: 'bb-faq', label: 'FAQ' },
  { id: 'bb-visit', label: 'Visit' },
]

function prefersReduced(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function scrollToId(id: string): void {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth', block: 'start' })
  el.focus({ preventScroll: true })
}

/** Adds a "waiting" class to anything below the fold, removed as it scrolls in. */
function useReveal(root: RefObject<HTMLDivElement | null>, waiting: string): void {
  useEffect(() => {
    const el = root.current
    if (!el || prefersReduced() || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            en.target.classList.remove(waiting)
            io.unobserve(en.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    el.querySelectorAll<HTMLElement>('[data-reveal]').forEach((item) => {
      if (item.getBoundingClientRect().top > window.innerHeight) {
        item.classList.add(waiting)
        io.observe(item)
      }
    })
    return () => io.disconnect()
  }, [root, waiting])
}

type Day = { key: string; date: Date; dow: string; num: number; month: string; long: string }

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** The next opening days (Tuesday to Saturday), starting tomorrow. */
function openDays(from: Date, count: number): Day[] {
  const out: Day[] = []
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  while (out.length < count) {
    cursor.setDate(cursor.getDate() + 1)
    const w = cursor.getDay()
    if (w >= 2 && w <= 6) {
      const d = new Date(cursor.getTime())
      out.push({
        key: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
        date: d,
        dow: d.toLocaleDateString('en-GB', { weekday: 'short' }),
        num: d.getDate(),
        month: d.toLocaleDateString('en-GB', { month: 'short' }),
        long: d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }),
      })
    }
  }
  return out
}

function slotKey(day: string, groomer: GroomerId, time: string): string {
  return `${day}|${groomer}|${time}`
}

function isTaken(day: string, groomer: GroomerId, time: string, mine: string[]): boolean {
  const k = slotKey(day, groomer, time)
  return mine.includes(k) || hash(k) % 100 < 44
}

type Slot = { groomer: GroomerId; time: string }
type Field = 'owner' | 'dog' | 'mobile' | 'slot'
type Confirmed = {
  ref: string
  owner: string
  dog: string
  groomer: string
  day: string
  time: string
  service: string
  size: string
  total: number
  mins: number
  heavy: boolean
}

export function Site(): JSX.Element {
  const root = useRef<HTMLDivElement>(null)
  useReveal(root, styles.waiting)

  const [menuOpen, setMenuOpen] = useState(false)

  // Calculator
  const [size, setSize] = useState<SizeId>('medium')
  const [coatId, setCoatId] = useState<CoatId>('curly')
  const [serviceId, setServiceId] = useState<ServiceId>('full')
  const [matting, setMatting] = useState<MattingId>('none')
  const [addons, setAddons] = useState<string[]>([])

  // Booking
  const [today, setToday] = useState<Date | null>(null)
  const [dayKey, setDayKey] = useState<string | null>(null)
  const [slot, setSlot] = useState<Slot | null>(null)
  const [mine, setMine] = useState<string[]>([])
  const [owner, setOwner] = useState('')
  const [dog, setDog] = useState('')
  const [mobile, setMobile] = useState('')
  const [notes, setNotes] = useState('')
  const [firstVisit, setFirstVisit] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null)
  const [note, setNote] = useState('')
  const confirmRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const t = window.setTimeout(() => setToday(new Date()), 0)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (confirmed) confirmRef.current?.focus()
  }, [confirmed])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const days = useMemo<Day[]>(() => (today ? openDays(today, 10) : []), [today])
  const activeDay = days.find((d) => d.key === dayKey) ?? days[0]

  const service = SERVICES.find((s) => s.id === serviceId) ?? SERVICES[0]
  const coat = COATS.find((c) => c.id === coatId) ?? COATS[0]
  const mat = MATTING.find((m) => m.id === matting) ?? MATTING[0]
  const sizeInfo = SIZES.find((s) => s.id === size) ?? SIZES[0]
  const base = service.prices[size]
  const coatExtra = service.coat ? coat.extra : 0
  const matExtra = service.id === 'nails' ? 0 : mat.extra
  const chosenAddons = ADDONS.filter((a) => addons.includes(a.id))
  const addonTotal = chosenAddons.reduce((sum, a) => sum + a.price, 0)
  const total = base + coatExtra + matExtra + addonTotal
  const heavy = matting === 'heavy' && service.id !== 'nails'
  const mins =
    service.minutes[size] + (service.coat ? coat.minutes : 0) + (matting === 'some' && service.id !== 'nails' ? 15 : 0)

  function go(e: ReactMouseEvent<HTMLAnchorElement>, id: string): void {
    e.preventDefault()
    setMenuOpen(false)
    scrollToId(id)
  }

  function toggleAddon(id: string): void {
    setAddons((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))
  }

  function chooseDay(key: string): void {
    setDayKey(key)
    setSlot(null)
    setNote('')
  }

  function firstFree(): void {
    const start = Math.max(
      0,
      days.findIndex((d) => d.key === activeDay?.key),
    )
    for (let i = start; i < days.length; i++) {
      for (const time of SLOTS) {
        for (const g of GROOMERS) {
          if (!isTaken(days[i].key, g.id, time, mine)) {
            setDayKey(days[i].key)
            setSlot({ groomer: g.id, time })
            setErrors((prev) => ({ ...prev, slot: undefined }))
            setNote(`First free: ${g.name}, ${days[i].long} at ${time}.`)
            return
          }
        }
      }
    }
    setNote('Nothing free in the next two weeks. Message us and we’ll find a gap.')
  }

  function submit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    const next: Partial<Record<Field, string>> = {}
    if (!slot || !activeDay) next.slot = 'Pick a day and a drop-off time first.'
    if (!owner.trim()) next.owner = 'Tell us your name.'
    if (!dog.trim()) next.dog = 'What’s your dog called?'
    const digits = mobile.replace(/[\s()-]/g, '')
    if (!/^(07\d{9}|\+447\d{9})$/.test(digits)) next.mobile = 'A UK mobile, like 07700 900123, so we can text you.'
    setErrors(next)
    if (Object.keys(next).length > 0 || !slot || !activeDay) return
    const g = GROOMERS.find((x) => x.id === slot.groomer) ?? GROOMERS[0]
    setMine((prev) => [...prev, slotKey(activeDay.key, slot.groomer, slot.time)])
    setConfirmed({
      ref: `BB-${Math.floor(1000 + Math.random() * 9000)}`,
      owner: owner.trim(),
      dog: dog.trim(),
      groomer: g.name,
      day: activeDay.long,
      time: slot.time,
      service: service.name,
      size: sizeInfo.label,
      total,
      mins,
      heavy,
    })
    setSlot(null)
  }

  function reset(): void {
    setConfirmed(null)
    setOwner('')
    setDog('')
    setMobile('')
    setNotes('')
    setFirstVisit(false)
    setErrors({})
    setNote('')
  }

  const selectedGroomer = slot ? GROOMERS.find((g) => g.id === slot.groomer) : undefined

  return (
    <div className={styles.site} ref={root}>
      <a className={styles.skip} href="#bb-book" onClick={(e) => go(e, 'bb-book')}>
        Skip to booking
      </a>

      {/* ---------- Navigation ---------- */}
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <a className={styles.brand} href="#bb-top" onClick={(e) => go(e, 'bb-top')}>
            <span className={styles.brandMark} aria-hidden="true">
              <svg viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="20" fill="#0f766e" />
                <path d="M11 24c0-5 4-8 9-8s9 3 9 8-4 7-9 7-9-2-9-7z" fill="#fff" />
                <circle cx="12" cy="13" r="3.4" fill="#fff" />
                <circle cx="20" cy="10" r="3.4" fill="#fff" />
                <circle cx="28" cy="13" r="3.4" fill="#fff" />
              </svg>
            </span>
            <span className={styles.brandName}>
              Bramble <i>&amp;</i> Bone
            </span>
          </a>
          <nav aria-label="Bramble & Bone" className={styles.navLinks}>
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`} onClick={(e) => go(e, n.id)}>
                {n.label}
              </a>
            ))}
          </nav>
          <a className={`${styles.btn} ${styles.navCta}`} href="#bb-book" onClick={(e) => go(e, 'bb-book')}>
            Book a groom
          </a>
          <button
            type="button"
            className={styles.menuBtn}
            aria-expanded={menuOpen}
            aria-controls="bb-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className={styles.burger} data-open={menuOpen ? 'true' : 'false'} aria-hidden="true">
              <span />
              <span />
            </span>
            <span className={styles.srOnly}>{menuOpen ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
        <nav
          id="bb-menu"
          aria-label="Bramble & Bone menu"
          className={styles.mobileMenu}
          data-open={menuOpen ? 'true' : 'false'}
          hidden={!menuOpen}
        >
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={(e) => go(e, n.id)}>
              {n.label}
            </a>
          ))}
          <a className={styles.btn} href="#bb-book" onClick={(e) => go(e, 'bb-book')}>
            Book a groom
          </a>
        </nav>
      </header>

      {/* ---------- Hero ---------- */}
      <section id="bb-top" tabIndex={-1} className={styles.hero} aria-labelledby="bb-h1">
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>
            <span className={styles.kickDot} aria-hidden="true" /> Dog grooming · Two groomers · Harrogate
          </p>
          <h1 id="bb-h1" className={styles.h1}>
            Clean dog. <em>Happy dog.</em>
          </h1>
          <p className={styles.lede}>
            Full grooms, baths and nails. Prices by size, booked online with either groomer, and a text the minute
            your dog is ready.
          </p>
          <div className={styles.ctaRow}>
            <a className={styles.btn} href="#bb-book" onClick={(e) => go(e, 'bb-book')}>
              Book a groom
            </a>
            <a className={`${styles.btn} ${styles.btnGhost}`} href="#bb-prices" onClick={(e) => go(e, 'bb-prices')}>
              See prices
            </a>
          </div>
          <dl className={styles.facts}>
            <div>
              <dt>Small grooms</dt>
              <dd>from £32</dd>
            </div>
            <div>
              <dt>Open</dt>
              <dd>Tue–Sat</dd>
            </div>
            <div>
              <dt>Hours</dt>
              <dd>8.30–5</dd>
            </div>
          </dl>
        </div>
        <div className={styles.heroArt}>
          <div className={styles.blob} aria-hidden="true" />
          <DogPortrait className={styles.dog} />
          <div className={styles.textCard} aria-hidden="true">
            <span className={styles.textFrom}>Bramble &amp; Bone · 2:41pm</span>
            <span>Biscuit is fluffy, dry and ready to collect.</span>
          </div>
          <div className={styles.tag} aria-hidden="true">
            <span>Medium groom</span>
            <b>£40</b>
          </div>
        </div>
      </section>

      <ul className={styles.points} aria-label="Why book here">
        <li>
          <b>Two calendars, one page</b>
          <span>Book whichever groomer is free first.</span>
        </li>
        <li>
          <b>Prices by size</b>
          <span>No phoning round to find out what it costs.</span>
        </li>
        <li>
          <b>Collection texts</b>
          <span>A message when your dog is ready.</span>
        </li>
      </ul>

      {/* ---------- Prices ---------- */}
      <section id="bb-prices" tabIndex={-1} className={styles.section} aria-labelledby="bb-prices-h">
        <div className={styles.secHead} data-reveal>
          <p className={styles.eyebrow}>Prices</p>
          <h2 id="bb-prices-h" className={styles.h2}>
            Priced by size, <em>not by guesswork.</em>
          </h2>
          <p className={styles.secLede}>
            These are smooth-coat prices. Curly, wiry and double coats take longer, so the calculator below adds a
            little for those.
          </p>
        </div>

        <div className={styles.tableWrap} data-reveal>
          <table className={styles.table}>
            <caption className={styles.srOnly}>Grooming prices by dog size</caption>
            <thead>
              <tr>
                <th scope="col">Service</th>
                {SIZES.map((s) => (
                  <th scope="col" key={s.id}>
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SERVICES.map((sv) => (
                <tr key={sv.id}>
                  <th scope="row">
                    <b>{sv.name}</b>
                    <span>{sv.note}</span>
                  </th>
                  {SIZES.map((s) => (
                    <td key={s.id}>{money(sv.prices[s.id])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ol className={styles.sizes} aria-label="Size guide" data-reveal>
          {SIZES.map((s) => (
            <li key={s.id}>
              <span className={styles.sizeArt} aria-hidden="true">
                <DogSide className={styles.sizeDog} />
                <span className={styles.sizeShadow} style={{ width: `${s.scale * 70}%` }} />
              </span>
              <b>{s.label}</b>
              <span className={styles.sizeWeight}>{s.weight}</span>
              <span className={styles.sizeEx}>{s.examples}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Calculator ---------- */}
      <section id="bb-calc" tabIndex={-1} className={`${styles.section} ${styles.calcSec}`} aria-labelledby="bb-calc-h">
        <div className={styles.secHead} data-reveal>
          <p className={styles.eyebrow}>Price calculator</p>
          <h2 id="bb-calc-h" className={styles.h2}>
            What will <em>your</em> dog cost?
          </h2>
          <p className={styles.secLede}>Four quick choices. The price updates as you go, and carries into the booking.</p>
        </div>

        <div className={styles.calc}>
          <div className={styles.calcForm}>
            <fieldset className={styles.fs}>
              <legend>1. Size</legend>
              <div className={styles.optGrid4}>
                {SIZES.map((s) => (
                  <label key={s.id} className={styles.opt}>
                    <input
                      type="radio"
                      name="bb-size"
                      value={s.id}
                      checked={size === s.id}
                      onChange={() => setSize(s.id)}
                    />
                    <span className={styles.optDog} aria-hidden="true">
                      <DogSide className={styles.optDogSvg} />
                    </span>
                    <b>{s.label}</b>
                    <small>{s.weight}</small>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className={styles.fs}>
              <legend>2. Service</legend>
              <div className={styles.optGrid2}>
                {SERVICES.map((sv) => (
                  <label key={sv.id} className={styles.opt}>
                    <input
                      type="radio"
                      name="bb-service"
                      value={sv.id}
                      checked={serviceId === sv.id}
                      onChange={() => setServiceId(sv.id)}
                    />
                    <b>
                      {sv.name} <span className={styles.optPrice}>{money(sv.prices[size])}</span>
                    </b>
                    <small>{duration(sv.minutes[size])} for a {sizeInfo.label.toLowerCase()} dog</small>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className={styles.fs} disabled={!service.coat}>
              <legend>3. Coat</legend>
              {!service.coat ? <p className={styles.fsNote}>Coat doesn’t change the price of a {service.name.toLowerCase()}.</p> : null}
              <div className={styles.optGrid4}>
                {COATS.map((c) => (
                  <label key={c.id} className={styles.opt}>
                    <input
                      type="radio"
                      name="bb-coat"
                      value={c.id}
                      checked={coatId === c.id}
                      onChange={() => setCoatId(c.id)}
                    />
                    <span className={styles.swatch} data-coat={c.id} aria-hidden="true" />
                    <b>{c.label}</b>
                    <small>
                      {c.note}
                      {c.extra ? ` · +${money(c.extra)}` : ''}
                    </small>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className={styles.fs} disabled={service.id === 'nails'}>
              <legend>4. Knots and matting</legend>
              <div className={styles.optGrid3}>
                {MATTING.map((m) => (
                  <label key={m.id} className={styles.opt}>
                    <input
                      type="radio"
                      name="bb-mat"
                      value={m.id}
                      checked={matting === m.id}
                      onChange={() => setMatting(m.id)}
                    />
                    <b>{m.label}</b>
                    <small>
                      {m.note}
                      {m.extra ? ` · +${money(m.extra)}` : ''}
                    </small>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className={styles.fs}>
              <legend>Extras</legend>
              <div className={styles.optGrid3}>
                {ADDONS.map((a) => (
                  <label key={a.id} className={`${styles.opt} ${styles.optCheck}`}>
                    <input type="checkbox" checked={addons.includes(a.id)} onChange={() => toggleAddon(a.id)} />
                    <span className={styles.tick} aria-hidden="true" />
                    <b>
                      {a.label} <span className={styles.optPrice}>+{money(a.price)}</span>
                    </b>
                    <small>{a.note}</small>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <aside className={styles.receipt} aria-labelledby="bb-quote-h">
            <p id="bb-quote-h" className={styles.receiptTitle}>
              Your quote
            </p>
            <div className={styles.receiptTotal} aria-live="polite" aria-atomic="true">
              <span className={styles.srOnly}>Estimated price:</span>
              <b key={total}>{money(total)}</b>
              <span>about {duration(mins)}</span>
            </div>
            <ul className={styles.lines}>
              <li>
                <span>
                  {service.name}, {sizeInfo.label.toLowerCase()}
                </span>
                <span>{money(base)}</span>
              </li>
              {coatExtra ? (
                <li>
                  <span>{coat.label} coat</span>
                  <span>+{money(coatExtra)}</span>
                </li>
              ) : null}
              {matExtra ? (
                <li>
                  <span>De-matting</span>
                  <span>+{money(matExtra)}</span>
                </li>
              ) : null}
              {chosenAddons.map((a) => (
                <li key={a.id}>
                  <span>{a.label}</span>
                  <span>+{money(a.price)}</span>
                </li>
              ))}
            </ul>
            {heavy ? (
              <p className={styles.warn}>
                Matted to the skin? We’ll message before we start. A short clip is often the kindest fix.
              </p>
            ) : null}
            <a className={`${styles.btn} ${styles.btnFull}`} href="#bb-book" onClick={(e) => go(e, 'bb-book')}>
              Book this groom
            </a>
            <p className={styles.small}>Final price is confirmed at drop-off if the coat isn’t as described.</p>
          </aside>
        </div>
      </section>

      {/* ---------- Groomers ---------- */}
      <section id="bb-groomers" tabIndex={-1} className={styles.section} aria-labelledby="bb-groomers-h">
        <div className={styles.secHead} data-reveal>
          <p className={styles.eyebrow}>The groomers</p>
          <h2 id="bb-groomers-h" className={styles.h2}>
            Two tables. <em>Two specialists.</em>
          </h2>
        </div>
        <div className={styles.groomers}>
          {GROOMERS.map((g) => (
            <article key={g.id} className={styles.groomer} data-tone={g.tone} data-reveal>
              <GroomerBadge className={styles.badge} tool={g.id === 'hattie' ? 'scissors' : 'brush'} />
              <div>
                <h3 className={styles.h3}>{g.name}</h3>
                <p className={styles.focus}>{g.focus}</p>
                <p>{g.likes}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- Booking ---------- */}
      <section id="bb-book" tabIndex={-1} className={`${styles.section} ${styles.bookSec}`} aria-labelledby="bb-book-h">
        <div className={styles.secHead}>
          <p className={styles.eyebrow}>Book a groom</p>
          <h2 id="bb-book-h" className={styles.h2}>
            Both calendars, <em>side by side.</em>
          </h2>
          <p className={styles.secLede}>
            Pick a day, then a drop-off time with either groomer. Greyed-out times are already taken.
          </p>
        </div>

        {confirmed ? (
          <div className={styles.confirm} role="status">
            <div className={styles.confirmArt} aria-hidden="true">
              <DogPortrait className={styles.confirmDog} bubbles={false} />
            </div>
            <div>
              <p className={styles.eyebrow}>Booked · {confirmed.ref}</p>
              <h3 className={styles.h3Big} ref={confirmRef} tabIndex={-1}>
                See {confirmed.dog} on {confirmed.day}.
              </h3>
              <dl className={styles.summary}>
                <div>
                  <dt>Drop-off</dt>
                  <dd>
                    {confirmed.time} with {confirmed.groomer}
                  </dd>
                </div>
                <div>
                  <dt>Groom</dt>
                  <dd>
                    {confirmed.service}, {confirmed.size.toLowerCase()} dog
                  </dd>
                </div>
                <div>
                  <dt>Estimate</dt>
                  <dd>
                    {money(confirmed.total)} · about {duration(confirmed.mins)}
                  </dd>
                </div>
                <div>
                  <dt>Booked by</dt>
                  <dd>{confirmed.owner}</dd>
                </div>
              </dl>
              {confirmed.heavy ? (
                <p className={styles.warn}>We’ll message you about the matting before we start.</p>
              ) : null}
              <p>We’ll text you the moment {confirmed.dog} is ready to collect. Pay on collection, card or cash.</p>
              <p className={styles.demoNote}>Demo only: nothing has been sent.</p>
              <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={reset}>
                Book another dog
              </button>
            </div>
          </div>
        ) : (
          <form className={styles.book} onSubmit={submit} noValidate>
            <div className={styles.bookCal}>
              <div className={styles.calHead}>
                <h3 className={styles.h3}>Choose a day</h3>
                <button type="button" className={styles.linkBtn} onClick={firstFree} disabled={!today}>
                  Find the first free slot
                </button>
              </div>
              {today ? (
                <div className={styles.days} role="group" aria-label="Day">
                  {days.map((d) => {
                    let free = 0
                    for (const g of GROOMERS) for (const t of SLOTS) if (!isTaken(d.key, g.id, t, mine)) free++
                    const on = activeDay?.key === d.key
                    return (
                      <button
                        key={d.key}
                        type="button"
                        className={styles.day}
                        aria-pressed={on}
                        onClick={() => chooseDay(d.key)}
                        aria-label={`${d.long}, ${free ? `${free} times free` : 'fully booked'}`}
                      >
                        <span className={styles.dayDow}>{d.dow}</span>
                        <span className={styles.dayNum}>{d.num}</span>
                        <span className={styles.dayMonth}>{d.month}</span>
                        <span className={styles.dayFree} data-full={free === 0 ? 'true' : 'false'}>
                          {free ? `${free} free` : 'Full'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <p className={styles.loading}>Loading the calendar…</p>
              )}

              {activeDay ? (
                <div className={styles.columns}>
                  {GROOMERS.map((g) => (
                    <div key={g.id} className={styles.column} data-tone={g.tone}>
                      <p className={styles.colHead}>
                        <GroomerBadge className={styles.colBadge} tool={g.id === 'hattie' ? 'scissors' : 'brush'} />
                        <span>
                          <b>{g.name}</b>
                          <small>{g.focus}</small>
                        </span>
                      </p>
                      <div className={styles.slots} role="group" aria-label={`${g.name}, ${activeDay.long}`}>
                        {SLOTS.map((t) => {
                          const taken = isTaken(activeDay.key, g.id, t, mine)
                          const on = slot?.groomer === g.id && slot.time === t
                          return (
                            <button
                              key={t}
                              type="button"
                              className={styles.slot}
                              disabled={taken}
                              aria-pressed={on}
                              aria-label={`${t} with ${g.name}${taken ? ', taken' : ''}`}
                              onClick={() => {
                                setSlot({ groomer: g.id, time: t })
                                setErrors((prev) => ({ ...prev, slot: undefined }))
                                setNote('')
                              }}
                            >
                              <span>{t}</span>
                              <small>{taken ? 'Taken' : on ? 'Chosen' : 'Free'}</small>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              <p className={styles.live} aria-live="polite">
                {note}
              </p>
            </div>

            <div className={styles.bookForm}>
              <div className={styles.picked} aria-live="polite">
                <p className={styles.receiptTitle}>Your groom</p>
                <p className={styles.pickedMain}>
                  {service.name}, {sizeInfo.label.toLowerCase()} dog · <b>{money(total)}</b>
                </p>
                <p className={styles.pickedSub}>
                  {slot && activeDay && selectedGroomer
                    ? `${activeDay.long} at ${slot.time} with ${selectedGroomer.name}`
                    : 'No time picked yet'}
                </p>
                <a className={styles.linkBtn} href="#bb-calc" onClick={(e) => go(e, 'bb-calc')}>
                  Change size or service
                </a>
                {errors.slot ? (
                  <p className={styles.err} id="bb-err-slot">
                    {errors.slot}
                  </p>
                ) : null}
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label htmlFor="bb-owner">Your name</label>
                  <input
                    id="bb-owner"
                    autoComplete="name"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    aria-invalid={errors.owner ? true : undefined}
                    aria-describedby={errors.owner ? 'bb-err-owner' : undefined}
                  />
                  {errors.owner ? (
                    <p className={styles.err} id="bb-err-owner">
                      {errors.owner}
                    </p>
                  ) : null}
                </div>
                <div className={styles.field}>
                  <label htmlFor="bb-dog">Dog’s name</label>
                  <input
                    id="bb-dog"
                    value={dog}
                    onChange={(e) => setDog(e.target.value)}
                    aria-invalid={errors.dog ? true : undefined}
                    aria-describedby={errors.dog ? 'bb-err-dog' : undefined}
                  />
                  {errors.dog ? (
                    <p className={styles.err} id="bb-err-dog">
                      {errors.dog}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="bb-mobile">Mobile, for the collection text</label>
                <input
                  id="bb-mobile"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  aria-invalid={errors.mobile ? true : undefined}
                  aria-describedby={errors.mobile ? 'bb-err-mobile' : undefined}
                />
                {errors.mobile ? (
                  <p className={styles.err} id="bb-err-mobile">
                    {errors.mobile}
                  </p>
                ) : null}
              </div>
              <div className={styles.field}>
                <label htmlFor="bb-notes">
                  Anything we should know? <span className={styles.optional}>Optional</span>
                </label>
                <textarea
                  id="bb-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Sensitive paws, hates the dryer, loves cheese…"
                />
              </div>
              <label className={styles.check}>
                <input type="checkbox" checked={firstVisit} onChange={(e) => setFirstVisit(e.target.checked)} />
                <span className={styles.tick} aria-hidden="true" />
                <span>First groom with us (we’ll allow a little extra time)</span>
              </label>
              <button type="submit" className={`${styles.btn} ${styles.btnFull}`}>
                Confirm booking
              </button>
              <p className={styles.small}>Pay on collection. Free to cancel up to 24 hours before.</p>
            </div>
          </form>
        )}
      </section>

      {/* ---------- How it works ---------- */}
      <section className={styles.section} aria-labelledby="bb-how-h">
        <div className={styles.secHead} data-reveal>
          <p className={styles.eyebrow}>On the day</p>
          <h2 id="bb-how-h" className={styles.h2}>
            How a groom <em>goes.</em>
          </h2>
        </div>
        <ol className={styles.steps}>
          {[
            { icon: <IconDoor className={styles.stepIcon} />, t: 'Drop off', b: 'Two minutes at the door: any sore spots, the length you like.' },
            { icon: <IconBath className={styles.stepIcon} />, t: 'Bath and dry', b: 'Warm water, gentle shampoo, a quiet dryer.' },
            { icon: <IconScissors className={styles.stepIcon} />, t: 'Trim and nails', b: 'The cut you asked for, ears cleaned, nails filed.' },
            { icon: <IconText className={styles.stepIcon} />, t: 'Text to collect', b: 'We message the moment your dog is ready.' },
          ].map((s, i) => (
            <li key={s.t} className={styles.step} data-reveal>
              <span className={styles.stepNum}>{i + 1}</span>
              {s.icon}
              <h3 className={styles.h3}>{s.t}</h3>
              <p>{s.b}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- FAQ ---------- */}
      <section id="bb-faq" tabIndex={-1} className={styles.section} aria-labelledby="bb-faq-h">
        <div className={styles.faqWrap}>
          <div className={styles.secHead} data-reveal>
            <p className={styles.eyebrow}>Questions</p>
            <h2 id="bb-faq-h" className={styles.h2}>
              Good to <em>know.</em>
            </h2>
          </div>
          <div className={styles.faq}>
            {FAQS.map((f) => (
              <details key={f.q} className={styles.qa}>
                <summary>
                  <span>{f.q}</span>
                  <span className={styles.plus} aria-hidden="true" />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Visit ---------- */}
      <section id="bb-visit" tabIndex={-1} className={styles.section} aria-labelledby="bb-visit-h">
        <div className={styles.visit} data-reveal>
          <div className={styles.visitCopy}>
            <p className={styles.eyebrow}>Visit</p>
            <h2 id="bb-visit-h" className={styles.h2}>
              Find the <em>yard.</em>
            </h2>
            <p>
              4 Bramble Yard, Harrogate
              <br />
              Parking right outside the door, with a grass strip for a last wee.
            </p>
            <table className={styles.hours}>
              <caption className={styles.srOnly}>Opening hours</caption>
              <tbody>
                {HOURS.map((h) => (
                  <tr key={h.day} data-closed={h.time === 'Closed' ? 'true' : 'false'}>
                    <th scope="row">{h.day}</th>
                    <td>{h.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.mapFrame}>
            <MapArt className={styles.map} />
            <span className={styles.mapLabel}>Bramble Yard</span>
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className={styles.cta} aria-labelledby="bb-cta-h">
        <DogPortrait className={styles.ctaDog} bubbles={false} />
        <div>
          <h2 id="bb-cta-h" className={styles.ctaH}>
            Muddy walk at the weekend? <em>We’ve got Tuesday.</em>
          </h2>
          <div className={styles.ctaRow}>
            <a className={`${styles.btn} ${styles.btnLight}`} href="#bb-book" onClick={(e) => go(e, 'bb-book')}>
              Book a groom
            </a>
            <a className={`${styles.btn} ${styles.btnOutlineLight}`} href="#bb-calc" onClick={(e) => go(e, 'bb-calc')}>
              Work out the price
            </a>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footInner}>
          <p className={styles.footBrand}>
            Bramble <i>&amp;</i> Bone
          </p>
          <p>Dog grooming · Harrogate</p>
          <p>Tue–Sat · 8.30am–5pm</p>
        </div>
        <p className={styles.footNote}>Concept site by Northbound Web. This business is made up.</p>
      </footer>
    </div>
  )
}

/** First screen for the home page wall. Static, 1280×800, no hooks. */
export function Shot(): JSX.Element {
  return (
    <div className={styles.shot}>
      <div className={styles.shotNav}>
        <span className={styles.shotBrand}>
          <span className={styles.shotMark} />
          Bramble <i>&amp;</i> Bone
        </span>
        <span className={styles.shotLinks}>Prices   ·   Calculator   ·   Groomers   ·   Book   ·   FAQ   ·   Visit</span>
        <span className={styles.shotBtn}>Book a groom</span>
      </div>
      <div className={styles.shotHero}>
        <div className={styles.shotCopy}>
          <p className={styles.shotKicker}>Dog grooming · Two groomers · Harrogate</p>
          <p className={styles.shotH1}>
            Clean dog. <em>Happy dog.</em>
          </p>
          <p className={styles.shotLede}>
            Full grooms, baths and nails. Prices by size, booked online with either groomer, and a text the minute your
            dog is ready.
          </p>
          <div className={styles.shotCtas}>
            <span className={styles.shotBtn}>Book a groom</span>
            <span className={styles.shotGhost}>See prices</span>
          </div>
        </div>
        <div className={styles.shotArt}>
          <div className={styles.shotBlob} />
          <DogPortrait className={styles.shotDog} />
          <div className={styles.shotText}>
            <small>Bramble &amp; Bone · 2:41pm</small>
            Biscuit is fluffy, dry and ready to collect.
          </div>
        </div>
      </div>
    </div>
  )
}
