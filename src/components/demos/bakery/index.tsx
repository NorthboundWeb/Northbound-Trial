'use client'

import { useEffect, useRef, useState, type FormEvent, type JSX, type MouseEvent } from 'react'
import styles from './styles.module.css'
import { HarbourMap, HeroLoaf, ItemArt, Mark } from './art'
import { CATEGORIES, DAY_PLAN, FAQS, ITEMS, MAX_QTY, type Category, type Item } from './data'
import {
  DAY_NAMES,
  collectionDays,
  dateLabel,
  dowOf,
  fmtTime,
  OPEN_DAYS,
  money,
  readClock,
  shopStatus,
  type Clock,
  type Status,
} from './time'

const LINKS = [
  { id: 'sb-order', label: 'Order ahead' },
  { id: 'sb-day', label: 'The day' },
  { id: 'sb-story', label: 'Our story' },
  { id: 'sb-visit', label: 'Visit' },
]

/** Smooth-scroll to an in-page section and move focus there for keyboard users. */
function jump(e: MouseEvent<HTMLElement>, id: string): void {
  const el = document.getElementById(id)
  if (!el) return
  e.preventDefault()
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  el.focus({ preventScroll: true })
}

function cx(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(' ')
}

type Basket = Record<string, number>

/* ------------------------------------------------------------------ */

export function Site(): JSX.Element {
  const [clock, setClock] = useState<Clock | null>(null)
  const [basket, setBasket] = useState<Basket>({})
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const tick = () => setClock(readClock())
    const first = window.setTimeout(tick, 0)
    const timer = window.setInterval(tick, 30_000)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(timer)
    }
  }, [])

  const setQty = (id: string, qty: number) => {
    setBasket((prev) => {
      const next: Basket = { ...prev }
      if (qty <= 0) delete next[id]
      else next[id] = Math.min(MAX_QTY, qty)
      return next
    })
  }

  const count = Object.values(basket).reduce((a, b) => a + b, 0)
  const status = clock ? shopStatus(clock) : null

  return (
    <div className={styles.root}>
      <div className={styles.frame}>
        <Nav count={count} open={menuOpen} onToggle={() => setMenuOpen((o) => !o)} onClose={() => setMenuOpen(false)} />
        <Hero status={status} />
        <Pledge />
        <Order basket={basket} setQty={setQty} clear={() => setBasket({})} clock={clock} count={count} />
        <Day />
        <Story />
        <Visit clock={clock} status={status} />
        <Faq />
        <Closing />
        <Footer />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function Nav({
  count,
  open,
  onToggle,
  onClose,
}: {
  count: number
  open: boolean
  onToggle: () => void
  onClose: () => void
}): JSX.Element {
  return (
    <div
      className={styles.nav}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <div className={styles.navIn}>
        <a
          href="#sb-top"
          className={styles.brand}
          onClick={(e) => {
            onClose()
            jump(e, 'sb-top')
          }}
        >
          <Mark />
          <span className={styles.brandName}>
            Saltmarsh <span>Bakehouse</span>
          </span>
        </a>
        <nav aria-label="Saltmarsh Bakehouse" className={styles.navLinks}>
          <ul id="sb-menu" className={cx(styles.links, open && styles.linksOpen)}>
            {LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  onClick={(e) => {
                    onClose()
                    jump(e, l.id)
                  }}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a
          href="#sb-basket"
          className={styles.basketLink}
          aria-label={`Basket, ${count} ${count === 1 ? 'item' : 'items'}`}
          onClick={(e) => {
            onClose()
            jump(e, 'sb-basket')
          }}
        >
          <BagIcon />
          <span aria-hidden="true">Basket</span>
          <span className={cx(styles.badge, count > 0 && styles.badgeOn)} aria-hidden="true">
            {count}
          </span>
        </a>
        <button
          type="button"
          className={styles.menuBtn}
          aria-expanded={open}
          aria-controls="sb-menu"
          onClick={onToggle}
        >
          <span className={cx(styles.burger, open && styles.burgerOpen)} aria-hidden="true" />
          <span className={styles.sr}>{open ? 'Close menu' : 'Open menu'}</span>
        </button>
      </div>
    </div>
  )
}

function BagIcon(): JSX.Element {
  return (
    <svg className={styles.bagIcon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 8h14l-1.2 12H6.2z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */

function Hero({ status }: { status: Status | null }): JSX.Element {
  return (
    <section id="sb-top" className={styles.hero} aria-labelledby="sb-h1" tabIndex={-1}>
      <div className={styles.heroText}>
        <p className={styles.live}>
          <span className={cx(styles.dot, status?.open && styles.dotOpen)} aria-hidden="true" />
          {status ? (
            <span>
              <b>{status.line}</b> · {status.detail}
            </span>
          ) : (
            <span>Open Tue–Sun · 7am–3pm</span>
          )}
        </p>
        <h1 id="sb-h1" className={styles.h1}>
          Bread worth <br />
          the <em>queue.</em>
        </h1>
        <p className={styles.lede}>
          Sourdough, buns and coffee from a little shop by the harbour. Order ahead and skip the line.
        </p>
        <div className={styles.ctas}>
          <a href="#sb-order" className={styles.btn} onClick={(e) => jump(e, 'sb-order')}>
            Order ahead
          </a>
          <a href="#sb-order" className={styles.btnLine} onClick={(e) => jump(e, 'sb-order')}>
            See the menu
          </a>
        </div>
        <dl className={styles.heroFacts}>
          <div>
            <dt>Sourdough</dt>
            <dd>£4.80</dd>
          </div>
          <div>
            <dt>Cardamom bun</dt>
            <dd>£3.20</dd>
          </div>
          <div>
            <dt>Celebration cakes</dt>
            <dd>from £38</dd>
          </div>
        </dl>
      </div>
      <figure className={styles.heroArt}>
        <HeroLoaf />
        <figcaption>
          <span>Fig. 1</span> Country sourdough, scored by hand before dawn.
        </figcaption>
      </figure>
    </section>
  )
}

function Pledge(): JSX.Element {
  const points = [
    { title: 'Order for collection', body: 'Pick a time, pay online, walk past the queue.' },
    { title: 'A real menu', body: 'A page, not a PDF. Updated the moment something sells out.' },
    { title: 'Today’s hours, first', body: 'Open or closed, right at the top.' },
  ]
  return (
    <section className={styles.promise} aria-label="Why order ahead">
      <ol>
        {points.map((p, i) => (
          <li key={p.title}>
            <span className={styles.num}>No. {i + 1}</span>
            <h2>{p.title}</h2>
            <p>{p.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

/* ------------------------------------------------------------------ */

type Line = { item: Item; qty: number }
type Errors = { basket?: string; slot?: string; name?: string; contact?: string }
type Confirmation = {
  ref: string
  name: string
  when: string
  lines: { name: string; qty: number; total: number }[]
  total: number
}

function Order({
  basket,
  setQty,
  clear,
  clock,
  count,
}: {
  basket: Basket
  setQty: (id: string, qty: number) => void
  clear: () => void
  clock: Clock | null
  count: number
}): JSX.Element {
  const [cat, setCat] = useState<Category | 'all'>('all')
  const [dayKey, setDayKey] = useState<number | null>(null)
  const [slotKey, setSlotKey] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [done, setDone] = useState<Confirmation | null>(null)
  const doneRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (done) doneRef.current?.focus()
  }, [done])

  const lines: Line[] = ITEMS.filter((i) => (basket[i.id] ?? 0) > 0).map((i) => ({ item: i, qty: basket[i.id] }))
  const total = lines.reduce((s, l) => s + l.qty * l.item.price, 0)
  const notice = lines.reduce((n, l) => Math.max(n, l.item.notice ?? 0), 0)
  const days = clock ? collectionDays(clock, notice) : []
  const day = days.find((d) => d.serial === dayKey) ?? days[0] ?? null
  const slot = day && slotKey !== null && day.slots.includes(slotKey) ? slotKey : null
  const shown = cat === 'all' ? ITEMS : ITEMS.filter((i) => i.cat === cat)

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const next: Errors = {}
    if (lines.length === 0) next.basket = 'Add something from the menu first.'
    if (!day || slot === null) next.slot = 'Choose a day and a collection time.'
    if (name.trim().length < 2) next.name = 'Add the name for the bag.'
    const c = contact.trim()
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c)
    const phoneOk = /^[+\d][\d\s-]{8,}$/.test(c) && c.replace(/\D/g, '').length >= 10
    if (!emailOk && !phoneOk) next.contact = 'Add an email or a mobile number so we can confirm.'
    setErrors(next)
    if (Object.keys(next).length > 0 || !day || slot === null) {
      const firstId = next.basket ? 'sb-basket-title' : next.slot ? 'sb-time' : next.name ? 'sb-name' : 'sb-contact'
      document.getElementById(firstId)?.focus()
      return
    }
    const ref = `SB-${Date.now().toString(36).slice(-5).toUpperCase()}`
    setDone({
      ref,
      name: name.trim(),
      when: `${day.label === 'Today' || day.label === 'Tomorrow' ? day.label.toLowerCase() + ', ' : ''}${DAY_NAMES[dowOf(day.serial)]} ${day.sub} at ${fmtTime(slot)}`,
      lines: lines.map((l) => ({ name: l.item.name, qty: l.qty, total: l.qty * l.item.price })),
      total,
    })
    clear()
  }

  const restart = () => {
    setDone(null)
    setSlotKey(null)
    setDayKey(null)
    setNotes('')
    setErrors({})
  }

  return (
    <section id="sb-order" className={styles.order} aria-labelledby="sb-order-h" tabIndex={-1}>
      <header className={styles.sectionHead}>
        <p className={styles.kicker}>Order ahead · collect from the side hatch</p>
        <h2 id="sb-order-h" className={styles.h2}>
          Today’s <em>counter</em>
        </h2>
        <p className={styles.sectionLede}>
          Everything on the shelves this morning. Sold-out bakes are marked the moment the last one goes.
        </p>
      </header>

      <div className={styles.orderGrid}>
        <div className={styles.menuCol}>
          <div className={styles.filters} role="group" aria-label="Filter the menu">
            {[{ id: 'all' as const, label: 'Everything' }, ...CATEGORIES].map((c) => (
              <button
                key={c.id}
                type="button"
                className={styles.chip}
                aria-pressed={cat === c.id}
                onClick={() => setCat(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
          <ul className={styles.menu} aria-label="Menu">
            {shown.map((item) => (
              <MenuCard key={item.id} item={item} qty={basket[item.id] ?? 0} onQty={(q) => setQty(item.id, q)} />
            ))}
          </ul>
          {count > 0 && !done && (
            <a href="#sb-basket" className={styles.mobileBar} onClick={(e) => jump(e, 'sb-basket')}>
              <span>
                Basket · {count} {count === 1 ? 'item' : 'items'}
              </span>
              <b>{money(total)} →</b>
            </a>
          )}
        </div>

        <aside id="sb-basket" className={styles.basket} aria-labelledby="sb-basket-title" tabIndex={-1}>
          <p className={styles.sr} aria-live="polite">
            {done ? `Order placed. Reference ${done.ref}.` : ''}
          </p>
          <div>
            {done ? (
              <div className={styles.done}>
                <p className={styles.kicker}>Order received · {done.ref}</p>
                <h3 ref={doneRef} tabIndex={-1} className={styles.doneTitle}>
                  Thank you, {done.name}.
                </h3>
                <p>
                  Your bag will be ready for collection <b>{done.when}</b>. Come to the side hatch and give your
                  name.
                </p>
                <ul className={styles.receipt}>
                  {done.lines.map((l) => (
                    <li key={l.name}>
                      <span>
                        {l.qty} × {l.name}
                      </span>
                      <span>{money(l.total)}</span>
                    </li>
                  ))}
                  <li className={styles.receiptTotal}>
                    <span>Total</span>
                    <span>{money(done.total)}</span>
                  </li>
                </ul>
                <p className={styles.demoNote}>Demo only: nothing has been sent and no payment has been taken.</p>
                <button type="button" className={styles.btnLine} onClick={restart}>
                  Start a new order
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className={styles.basketForm}>
                <h3 id="sb-basket-title" tabIndex={-1} className={styles.basketTitle}>
                  Your basket
                </h3>
                {lines.length === 0 ? (
                  <p className={styles.empty}>
                    Nothing in here yet. Add a loaf or two and pick a time to collect.
                  </p>
                ) : (
                  <ul className={styles.lines}>
                    {lines.map((l) => (
                      <li key={l.item.id}>
                        <div className={styles.lineMain}>
                          <span className={styles.lineName}>{l.item.name}</span>
                          <span className={styles.linePrice}>{money(l.qty * l.item.price)}</span>
                        </div>
                        <div className={styles.lineCtl}>
                          <Stepper name={l.item.name} qty={l.qty} onQty={(q) => setQty(l.item.id, q)} />
                          <button type="button" className={styles.remove} onClick={() => setQty(l.item.id, 0)}>
                            Remove<span className={styles.sr}> {l.item.name}</span>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {errors.basket && lines.length === 0 && <p className={styles.error}>{errors.basket}</p>}
                <p className={styles.total} aria-live="polite">
                  <span>Total</span>
                  <b>{money(total)}</b>
                </p>

                <fieldset className={styles.fieldset}>
                  <legend>Collect on</legend>
                  {notice > 0 && (
                    <p className={styles.hint}>
                      Celebration cakes need 48 hours’ notice, so the earliest days are hidden.
                    </p>
                  )}
                  {clock === null ? (
                    <p className={styles.hint}>Checking today’s times…</p>
                  ) : (
                    <div className={styles.days}>
                      {days.map((d) => (
                        <button
                          key={d.serial}
                          type="button"
                          className={styles.dayChip}
                          aria-pressed={day?.serial === d.serial}
                          onClick={() => {
                            setDayKey(d.serial)
                            setSlotKey(null)
                          }}
                        >
                          <b>{d.label}</b>
                          <span>{d.sub}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </fieldset>

                <div className={styles.field}>
                  <label htmlFor="sb-time">Collection time</label>
                  <select
                    id="sb-time"
                    value={slot === null ? '' : String(slot)}
                    onChange={(e) => setSlotKey(e.target.value === '' ? null : Number(e.target.value))}
                    aria-invalid={Boolean(errors.slot && slot === null)}
                    aria-describedby={errors.slot && slot === null ? 'sb-time-err' : undefined}
                    disabled={!day}
                  >
                    <option value="">Choose a time</option>
                    {day?.slots.map((t) => (
                      <option key={t} value={t}>
                        {fmtTime(t)}
                      </option>
                    ))}
                  </select>
                  {errors.slot && slot === null && (
                    <p id="sb-time-err" className={styles.error}>
                      {errors.slot}
                    </p>
                  )}
                </div>

                <div className={styles.field}>
                  <label htmlFor="sb-name">Name for the bag</label>
                  <input
                    id="sb-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'sb-name-err' : undefined}
                  />
                  {errors.name && (
                    <p id="sb-name-err" className={styles.error}>
                      {errors.name}
                    </p>
                  )}
                </div>
                <div className={styles.field}>
                  <label htmlFor="sb-contact">Email or mobile</label>
                  <input
                    id="sb-contact"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    autoComplete="email"
                    inputMode="email"
                    aria-invalid={Boolean(errors.contact)}
                    aria-describedby={errors.contact ? 'sb-contact-err' : 'sb-contact-hint'}
                  />
                  {errors.contact ? (
                    <p id="sb-contact-err" className={styles.error}>
                      {errors.contact}
                    </p>
                  ) : (
                    <p id="sb-contact-hint" className={styles.hint}>
                      For your confirmation, and a message if anything sells out.
                    </p>
                  )}
                </div>
                <div className={styles.field}>
                  <label htmlFor="sb-notes">
                    Notes <span className={styles.optional}>(optional)</span>
                  </label>
                  <textarea
                    id="sb-notes"
                    rows={2}
                    value={notes}
                    maxLength={200}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Sliced, allergies, a name on the cake…"
                  />
                </div>
                <button type="submit" className={styles.submit}>
                  Place order{total > 0 ? ` · ${money(total)}` : ''}
                </button>
                <p className={styles.demoNote}>Demo only: nothing is sent and no payment is taken.</p>
              </form>
            )}
          </div>
        </aside>
      </div>
    </section>
  )
}

function MenuCard({ item, qty, onQty }: { item: Item; qty: number; onQty: (q: number) => void }): JSX.Element {
  return (
    <li className={cx(styles.card, item.soldOut && styles.cardOut)}>
      <div className={styles.cardArt}>
        <ItemArt kind={item.art} />
        {item.soldOut && (
          <span className={styles.stamp} aria-hidden="true">
            Sold out
          </span>
        )}
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardHead}>
          <h3>{item.name}</h3>
          <span className={styles.price}>{money(item.price)}</span>
        </div>
        <p className={styles.cardNote}>{item.note}</p>
        {item.notice ? <p className={styles.tag}>{item.notice} hours’ notice</p> : null}
        <div className={styles.cardAction}>
          {item.soldOut ? (
            <p className={styles.outText}>Sold out today · back tomorrow</p>
          ) : qty === 0 ? (
            <button
              type="button"
              className={styles.add}
              onClick={() => onQty(1)}
              aria-label={`Add ${item.name}, ${money(item.price)}`}
            >
              Add <span aria-hidden="true">+</span>
            </button>
          ) : (
            <Stepper name={item.name} qty={qty} onQty={onQty} />
          )}
        </div>
      </div>
    </li>
  )
}

function Stepper({ name, qty, onQty }: { name: string; qty: number; onQty: (q: number) => void }): JSX.Element {
  return (
    <div className={styles.stepper} role="group" aria-label={`${name} quantity`}>
      <button type="button" onClick={() => onQty(qty - 1)} aria-label={`One fewer ${name}`}>
        −
      </button>
      <span className={styles.qty} aria-live="polite">
        {qty}
      </span>
      <button type="button" onClick={() => onQty(qty + 1)} disabled={qty >= MAX_QTY} aria-label={`One more ${name}`}>
        +
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function Day(): JSX.Element {
  return (
    <section id="sb-day" className={styles.day} aria-labelledby="sb-day-h" tabIndex={-1}>
      <header className={styles.sectionHead}>
        <p className={styles.kicker}>From the ovens to the hatch</p>
        <h2 id="sb-day-h" className={styles.h2}>
          A day at the <em>bakehouse</em>
        </h2>
      </header>
      <svg className={styles.arc} viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true">
        <path d="M10 112C260 -20 740 -20 990 112" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 7" />
        <circle cx="500" cy="14" r="12" fill="#e2b05a" />
      </svg>
      <ol className={styles.timeline}>
        {DAY_PLAN.map((s) => (
          <li key={s.time}>
            <span className={styles.time}>{s.time}</span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Story(): JSX.Element {
  return (
    <section id="sb-story" className={styles.story} aria-labelledby="sb-story-h" tabIndex={-1}>
      <div className={styles.storyHead}>
        <p className={styles.kicker}>Our story</p>
        <h2 id="sb-story-h" className={styles.h2}>
          Slow dough, <em>small</em> shop.
        </h2>
      </div>
      <div className={styles.storyBody}>
        <p className={styles.dropcap}>
          Saltmarsh is one oven, one long table and a window onto the yard. We mill nothing and pretend nothing: the
          flour comes from growers we can drive to, the salt from the coast, and the starter has been fed every
          afternoon since the day we opened.
        </p>
        <p>
          Most of our dough rests overnight in the cold. It makes a deeper crust and a loaf that keeps for days, and it
          means the only thing we rush is the coffee. When something runs out, it runs out. We would rather bake again
          tomorrow than cut corners today.
        </p>
        <blockquote className={styles.pull}>
          “If the bread is good, the queue looks after itself. Ordering ahead just lets you skip it.”
        </blockquote>
        <ul className={styles.values}>
          <li>
            <b>Flour</b> Stoneground, from farms within a morning’s drive
          </li>
          <li>
            <b>Waste</b> Day-old loaves half price, the rest to the food bank
          </li>
          <li>
            <b>Packaging</b> Paper bags, and a discount for your own
          </li>
        </ul>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */

const WEEK = [1, 2, 3, 4, 5, 6, 0]

function Visit({ clock, status }: { clock: Clock | null; status: Status | null }): JSX.Element {
  const today = clock ? dowOf(clock.serial) : -1
  return (
    <section id="sb-visit" className={styles.visit} aria-labelledby="sb-visit-h" tabIndex={-1}>
      <div className={styles.visitText}>
        <p className={styles.kicker}>Visit</p>
        <h2 id="sb-visit-h" className={styles.h2}>
          Find the <em>yard</em>
        </h2>
        <div className={cx(styles.statusCard, status?.open && styles.statusOpen)}>
          <span className={cx(styles.dot, status?.open && styles.dotOpen)} aria-hidden="true" />
          {status ? (
            <p>
              <b>{status.line}</b>
              <span>{status.detail}</span>
            </p>
          ) : (
            <p>
              <b>Tue–Sun, 7am–3pm</b>
              <span>Closed Mondays</span>
            </p>
          )}
        </div>
        <table className={styles.hours}>
          <caption className={styles.sr}>Opening hours</caption>
          <tbody>
            {WEEK.map((d) => {
              const open = OPEN_DAYS.includes(d)
              return (
                <tr key={d} className={cx(d === today && styles.today)}>
                  <th scope="row">
                    {DAY_NAMES[d]}
                    {d === today && <span className={styles.todayTag}>Today</span>}
                  </th>
                  <td>{open ? '7am – 3pm' : 'Closed'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <address className={styles.address}>
          2 Net Loft Yard, Whitstable
          <br />
          Two minutes from the harbour car park
        </address>
        {clock && (
          <p className={styles.hint}>
            Today is {DAY_NAMES[today]} {dateLabel(clock.serial)}.
          </p>
        )}
      </div>
      <figure className={styles.map}>
        <HarbourMap />
        <figcaption>Not to scale. Look for the green door.</figcaption>
      </figure>
    </section>
  )
}

function Faq(): JSX.Element {
  return (
    <section className={styles.faq} aria-labelledby="sb-faq-h">
      <header className={styles.sectionHead}>
        <p className={styles.kicker}>Questions</p>
        <h2 id="sb-faq-h" className={styles.h2}>
          Before you <em>come</em>
        </h2>
      </header>
      <div className={styles.faqList}>
        {FAQS.map((f) => (
          <details key={f.q} className={styles.faqItem}>
            <summary>
              <span>{f.q}</span>
              <span className={styles.plus} aria-hidden="true" />
            </summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

function Closing(): JSX.Element {
  return (
    <section className={styles.closing} aria-labelledby="sb-close-h">
      <p className={styles.kickerLight}>Tomorrow’s dough is already proving</p>
      <h2 id="sb-close-h" className={styles.closingTitle}>
        Keep a loaf <em>back</em> for you.
      </h2>
      <a href="#sb-order" className={styles.btnLight} onClick={(e) => jump(e, 'sb-order')}>
        Order ahead
      </a>
    </section>
  )
}

function Footer(): JSX.Element {
  return (
    <footer className={styles.footer}>
      <div className={styles.footBrand}>
        <Mark />
        <div>
          <p className={styles.footName}>Saltmarsh Bakehouse</p>
          <p>Bakery and café · Whitstable</p>
        </div>
      </div>
      <p>Tue–Sun · 7am–3pm · Closed Mondays</p>
      <p className={styles.concept}>Concept site by Northbound Web. This business is made up.</p>
    </footer>
  )
}

/* ------------------------------------------------------------------ */

/** Static first screen for the home-page wall: 1280 × 800, no hooks. */
export function Shot(): JSX.Element {
  return (
    <div className={cx(styles.root, styles.shot)} aria-hidden="true">
      <div className={styles.frame}>
        <div className={styles.nav}>
          <div className={styles.navIn}>
            <span className={styles.brand}>
              <Mark />
              <span className={styles.brandName}>
                Saltmarsh <span>Bakehouse</span>
              </span>
            </span>
            <div className={styles.navLinks}>
              <span className={styles.links}>
                {LINKS.map((l) => (
                  <span key={l.id} className={styles.fakeLink}>
                    {l.label}
                  </span>
                ))}
              </span>
            </div>
            <span className={styles.basketLink}>
              <BagIcon />
              <span>Basket</span>
            </span>
          </div>
        </div>
        <div className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.live}>
              <span className={cx(styles.dot, styles.dotOpen)} />
              <span>
                <b>Open today</b> · 7am – 3pm
              </span>
            </p>
            <p className={styles.h1}>
              Bread worth <br />
              the <em>queue.</em>
            </p>
            <p className={styles.lede}>
              Sourdough, buns and coffee from a little shop by the harbour. Order ahead and skip the line.
            </p>
            <div className={styles.ctas}>
              <span className={styles.btn}>Order ahead</span>
              <span className={styles.btnLine}>See the menu</span>
            </div>
          </div>
          <div className={styles.heroArt}>
            <HeroLoaf lean />
          </div>
        </div>
      </div>
    </div>
  )
}
