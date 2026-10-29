'use client'

import { useEffect, useRef, useState } from 'react'
import type { JSX, MouseEvent as ReactMouseEvent, RefObject } from 'react'
import styles from './styles.module.css'
import { CAPACITY, COACHES, DAYS, FAQS, PLANS, SESSIONS, TYPES, money } from './data'
import type { PlanId, Session, TypeId } from './data'
import { BarbellArt, CoachTile, Mark } from './art'

const NAV: { id: string; label: string }[] = [
  { id: 'if-timetable', label: 'Timetable' },
  { id: 'if-plans', label: 'Memberships' },
  { id: 'if-coaches', label: 'Coaches' },
  { id: 'if-how', label: 'How it works' },
  { id: 'if-find', label: 'Find us' },
]

const INITIAL_TAKEN: Record<string, number> = Object.fromEntries(SESSIONS.map((s) => [s.id, s.taken]))

function typeName(id: TypeId): string {
  return (TYPES.find((t) => t.id === id) ?? TYPES[0]).name
}

function prefersReduced(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function scrollToId(id: string): void {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth', block: 'start' })
  el.focus({ preventScroll: true })
}

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

function mondayIndex(d: Date): number {
  return (d.getDay() + 6) % 7
}

/** Short date label for day `i` (0 = Monday) of the week containing `ref`. */
function weekDateLabel(ref: Date, i: number): string {
  const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - mondayIndex(ref) + i)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

type Started = { ref: string; planId: PlanId; name: string; price: string; unit: string; perWeek: number }

export function Site(): JSX.Element {
  const root = useRef<HTMLDivElement>(null)
  useReveal(root, styles.waiting)

  const [menuOpen, setMenuOpen] = useState(false)
  const [now, setNow] = useState<Date | null>(null)
  const [day, setDay] = useState(0)
  const [filter, setFilter] = useState<TypeId | 'all'>('all')
  const [taken, setTaken] = useState<Record<string, number>>(INITIAL_TAKEN)
  const [mine, setMine] = useState<string[]>([])
  const [waitlist, setWaitlist] = useState<string[]>([])
  const [live, setLive] = useState('')

  const [planId, setPlanId] = useState<PlanId>('unlimited')
  const [perWeek, setPerWeek] = useState(3)
  const [started, setStarted] = useState<Started | null>(null)
  const startedRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const t = window.setTimeout(() => {
      const d = new Date()
      setNow(d)
      setDay(mondayIndex(d))
    }, 0)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (started) startedRef.current?.focus()
  }, [started])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  function go(e: ReactMouseEvent<HTMLAnchorElement>, id: string): void {
    e.preventDefault()
    setMenuOpen(false)
    scrollToId(id)
  }

  // ----- Timetable -----
  const todayIdx = now ? mondayIndex(now) : -1
  function dateFor(i: number): string {
    return now ? weekDateLabel(now, i) : ''
  }

  function left(s: Session): number {
    return CAPACITY - (taken[s.id] ?? 0)
  }

  function book(s: Session): void {
    const l = left(s)
    if (l <= 0 || mine.includes(s.id)) return
    setTaken({ ...taken, [s.id]: (taken[s.id] ?? 0) + 1 })
    setMine([...mine, s.id])
    setWaitlist(waitlist.filter((w) => w !== s.id))
    setLive(`Booked ${typeName(s.type)}, ${DAYS[s.day]} ${s.time}. ${l - 1 === 0 ? 'That was the last space.' : `${l - 1} left.`}`)
  }

  function cancel(s: Session): void {
    if (!mine.includes(s.id)) return
    setTaken({ ...taken, [s.id]: Math.max(0, (taken[s.id] ?? 0) - 1) })
    setMine(mine.filter((m) => m !== s.id))
    setLive(`Cancelled ${typeName(s.type)}, ${DAYS[s.day]} ${s.time}. Your space is back on the board.`)
  }

  function toggleWait(s: Session): void {
    if (waitlist.includes(s.id)) {
      setWaitlist(waitlist.filter((w) => w !== s.id))
      setLive(`Off the waitlist for ${typeName(s.type)}, ${DAYS[s.day]} ${s.time}.`)
    } else {
      setWaitlist([...waitlist, s.id])
      setLive(`On the waitlist for ${typeName(s.type)}, ${DAYS[s.day]} ${s.time}. We’d text you if a space opens.`)
    }
  }

  const myList = SESSIONS.filter((s) => mine.includes(s.id))
  const activePlan = started ? started.planId : null
  let weekCost = ''
  let weekNote = ''
  if (myList.length) {
    if (activePlan === 'unlimited') {
      weekCost = '£0'
      weekNote = 'Covered by Unlimited.'
    } else if (activePlan === 'pack') {
      weekCost = '£0'
      weekNote = `${myList.length} of 10 sessions from your pack.`
    } else {
      const total = 10 + 12 * (myList.length - 1)
      weekCost = money(total)
      weekNote =
        myList.length === 1 ? 'Your first session is the £10 taster.' : `£10 taster, then £12 a session.`
    }
  }

  // Next class (for the hero ticket)
  let next: Session | undefined
  let nextWhen = ''
  if (now) {
    const hm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    for (let k = 0; k < 7 && !next; k++) {
      const d = (todayIdx + k) % 7
      next = SESSIONS.find((s) => s.day === d && (k > 0 || s.time > hm) && left(s) > 0)
      if (next) nextWhen = k === 0 ? 'Today' : k === 1 ? 'Tomorrow' : DAYS[d]
    }
  }

  // ----- Plans -----
  function monthly(id: PlanId): number {
    const p = PLANS.find((x) => x.id === id) ?? PLANS[0]
    if (p.monthly !== null) return p.monthly
    return Math.round(((p.perSession ?? 0) * perWeek * 52) / 12)
  }
  const groupPlans = PLANS.filter((p) => p.group)
  const best = groupPlans.reduce((a, b) => (monthly(b.id) < monthly(a.id) ? b : a), groupPlans[0])
  const plan = PLANS.find((p) => p.id === planId) ?? PLANS[0]

  function startPlan(): void {
    setStarted({
      ref: `IF-${Math.floor(1000 + Math.random() * 9000)}`,
      planId: plan.id,
      name: plan.name,
      price: plan.price,
      unit: plan.unit,
      perWeek,
    })
  }

  const nextShot = next

  return (
    <div className={styles.site} ref={root}>
      <a className={styles.skipLink} href="#if-timetable" onClick={(e) => go(e, 'if-timetable')}>
        Skip to the timetable
      </a>

      {/* ---------- Nav ---------- */}
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <a className={styles.brand} href="#if-top" onClick={(e) => go(e, 'if-top')}>
            <Mark className={styles.mark} />
            <span>
              Ironfield<b>PT</b>
            </span>
          </a>
          <nav className={styles.links} aria-label="Ironfield PT">
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`} onClick={(e) => go(e, n.id)}>
                {n.label}
              </a>
            ))}
          </nav>
          <a className={`${styles.btn} ${styles.navCta}`} href="#if-timetable" onClick={(e) => go(e, 'if-timetable')}>
            Book a taster
          </a>
          <button
            type="button"
            className={styles.menuBtn}
            aria-expanded={menuOpen}
            aria-controls="if-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span aria-hidden="true" className={styles.menuGlyph} data-open={menuOpen ? 'true' : 'false'} />
            <span className={styles.srOnly}>{menuOpen ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
        <nav id="if-menu" className={styles.mobileMenu} aria-label="Ironfield PT menu" hidden={!menuOpen}>
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={(e) => go(e, n.id)}>
              {n.label}
            </a>
          ))}
          <a className={styles.btn} href="#if-timetable" onClick={(e) => go(e, 'if-timetable')}>
            Book a taster · £10
          </a>
        </nav>
      </header>

      {/* ---------- Hero ---------- */}
      <section id="if-top" tabIndex={-1} className={styles.hero} aria-labelledby="if-h1">
        <p className={styles.kicker}>
          <span>Small-group and one-to-one</span>
          <span>Bristol</span>
          <span>Mon–Sun 6am–8pm</span>
        </p>
        <h1 id="if-h1" className={styles.h1}>
          <span className={styles.h1a}>Get strong.</span> <span className={styles.h1b}>Stay consistent.</span>
        </h1>
        <div className={styles.heroBottom}>
          <div className={styles.heroCopy}>
            <p className={styles.lede}>
              Book sessions, track your plan and message your coach, all in one place. Six people a class, never more.
            </p>
            <div className={styles.ctaRow}>
              <a className={styles.btn} href="#if-timetable" onClick={(e) => go(e, 'if-timetable')}>
                Book a taster · £10
              </a>
              <a className={`${styles.btn} ${styles.btnLine}`} href="#if-timetable" onClick={(e) => go(e, 'if-timetable')}>
                Timetable
              </a>
            </div>
            <dl className={styles.stats}>
              <div>
                <dt>Per class</dt>
                <dd>6 max</dd>
              </div>
              <div>
                <dt>Sessions</dt>
                <dd>45 min</dd>
              </div>
              <div>
                <dt>Open</dt>
                <dd>7 days</dd>
              </div>
            </dl>
          </div>
          <div className={styles.heroArt}>
            <BarbellArt className={styles.barbell} />
            <div className={styles.ticket}>
              <span className={styles.ticketLabel}>Next class with space</span>
              {nextShot ? (
                <>
                  <b>{typeName(nextShot.type)}</b>
                  <span>
                    {nextWhen} {nextShot.time} · {nextShot.coach} · {left(nextShot)} left
                  </span>
                </>
              ) : (
                <b>Loading…</b>
              )}
            </div>
          </div>
        </div>
      </section>

      <ul className={styles.band} aria-label="What you get">
        <li>
          <b>Live timetable</b> See spaces left and book in two taps.
        </li>
        <li>
          <b>Member log-in</b> Your plan and progress in one place.
        </li>
        <li>
          <b>Packs and memberships</b> Paid online, renewed automatically.
        </li>
      </ul>

      {/* ---------- Timetable ---------- */}
      <section id="if-timetable" tabIndex={-1} className={styles.section} aria-labelledby="if-tt-h">
        <div className={styles.secHead}>
          <span className={styles.num}>01</span>
          <h2 id="if-tt-h" className={styles.h2}>
            This week
          </h2>
          <p className={styles.secLede}>Six spaces in every class. Book, cancel, or join the waitlist when it’s full.</p>
        </div>

        <div className={styles.filters} role="group" aria-label="Filter by class">
          <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
            All classes
          </button>
          {TYPES.map((t) => (
            <button key={t.id} type="button" aria-pressed={filter === t.id} onClick={() => setFilter(t.id)} data-type={t.id}>
              <span className={styles.swatch} data-type={t.id} aria-hidden="true" />
              {t.name}
            </button>
          ))}
        </div>
        {filter !== 'all' ? (
          <p className={styles.typeBlurb}>{(TYPES.find((t) => t.id === filter) ?? TYPES[0]).blurb}</p>
        ) : null}

        <div className={styles.dayTabs} role="group" aria-label="Day">
          {DAYS.map((d, i) => (
            <button key={d} type="button" aria-pressed={day === i} onClick={() => setDay(i)}>
              <span>{d.slice(0, 3)}</span>
              {i === todayIdx ? <small>Today</small> : null}
            </button>
          ))}
        </div>

        <div className={styles.ttWrap}>
          <div className={styles.week}>
            {DAYS.map((d, i) => {
              const list = SESSIONS.filter((s) => s.day === i && (filter === 'all' || s.type === filter))
              return (
                <div
                  key={d}
                  className={styles.col}
                  data-active={day === i ? 'true' : 'false'}
                  data-today={i === todayIdx ? 'true' : 'false'}
                  role="group"
                  aria-label={d}
                >
                  <p className={styles.colHead}>
                    <b>{d.slice(0, 3)}</b>
                    <span>{i === todayIdx ? 'Today' : dateFor(i)}</span>
                  </p>
                  {list.length === 0 ? <p className={styles.none}>Nothing on</p> : null}
                  {list.map((s) => {
                    const l = left(s)
                    const isMine = mine.includes(s.id)
                    const waiting = waitlist.includes(s.id)
                    return (
                      <article key={s.id} className={styles.cls} data-type={s.type} data-mine={isMine ? 'true' : 'false'}>
                        <p className={styles.clsTime}>{s.time}</p>
                        <h3 className={styles.clsName}>{typeName(s.type)}</h3>
                        <p className={styles.clsCoach}>with {s.coach}</p>
                        <div className={styles.pips} aria-hidden="true">
                          {Array.from({ length: CAPACITY }, (_, k) => (
                            <span key={k} data-on={k < CAPACITY - l ? 'true' : 'false'} />
                          ))}
                        </div>
                        <p className={styles.left} data-full={l === 0 ? 'true' : 'false'}>
                          {isMine ? 'You’re in' : l === 0 ? 'Full' : `${l} of ${CAPACITY} left`}
                        </p>
                        {isMine ? (
                          <button
                            type="button"
                            className={`${styles.clsBtn} ${styles.clsCancel}`}
                            onClick={() => cancel(s)}
                            aria-label={`Cancel ${typeName(s.type)}, ${d} ${s.time}`}
                          >
                            Cancel
                          </button>
                        ) : l === 0 ? (
                          <button
                            type="button"
                            className={`${styles.clsBtn} ${styles.clsWait}`}
                            aria-pressed={waiting}
                            onClick={() => toggleWait(s)}
                            aria-label={`${waiting ? 'Leave waitlist' : 'Join waitlist'} for ${typeName(s.type)}, ${d} ${s.time}`}
                          >
                            {waiting ? 'On waitlist' : 'Waitlist'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={styles.clsBtn}
                            onClick={() => book(s)}
                            aria-label={`Book ${typeName(s.type)}, ${d} ${s.time}, ${l} ${l === 1 ? 'space' : 'spaces'} left`}
                          >
                            Book
                          </button>
                        )}
                      </article>
                    )
                  })}
                </div>
              )
            })}
          </div>

          <aside className={styles.mine} aria-labelledby="if-mine-h">
            <h3 id="if-mine-h" className={styles.mineH}>
              Your week
            </h3>
            {myList.length === 0 ? (
              <p className={styles.mineEmpty}>Nothing booked yet. Pick a class with a space and press Book.</p>
            ) : (
              <ul className={styles.mineList}>
                {myList.map((s) => (
                  <li key={s.id}>
                    <span>
                      <b>{typeName(s.type)}</b>
                      <small>
                        {DAYS[s.day].slice(0, 3)} {s.time} · {s.coach}
                      </small>
                    </span>
                    <button type="button" onClick={() => cancel(s)} aria-label={`Cancel ${typeName(s.type)}, ${DAYS[s.day]} ${s.time}`}>
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {myList.length ? (
              <div className={styles.mineTotal}>
                <span>{myList.length} session{myList.length === 1 ? '' : 's'}</span>
                <b>{weekCost}</b>
                <small>{weekNote}</small>
              </div>
            ) : null}
            <p className={styles.mineLive} aria-live="polite">
              {live}
            </p>
            {myList.length ? <p className={styles.demo}>Demo only: nothing has been sent.</p> : null}
          </aside>
        </div>
      </section>

      {/* ---------- Plans ---------- */}
      <section id="if-plans" tabIndex={-1} className={`${styles.section} ${styles.dark}`} aria-labelledby="if-plans-h">
        <div className={styles.inner}>
          <div className={styles.secHead} data-reveal>
            <span className={styles.num}>02</span>
            <h2 id="if-plans-h" className={styles.h2}>
              Pick a plan
            </h2>
            <p className={styles.secLede}>Tell us how often you’ll train and we’ll show what each option costs a month.</p>
          </div>

          <div className={styles.slider}>
            <label htmlFor="if-per-week">How often will you train?</label>
            <input
              id="if-per-week"
              type="range"
              min={1}
              max={5}
              step={1}
              value={perWeek}
              onChange={(e) => setPerWeek(Number(e.target.value))}
              aria-valuetext={`${perWeek} sessions a week`}
            />
            <output htmlFor="if-per-week" className={styles.sliderOut}>
              {perWeek}× <span>a week</span>
            </output>
          </div>

          <div className={styles.plans}>
            {PLANS.map((p) => {
              const est = monthly(p.id)
              const isBest = p.group && p.id === best.id
              return (
                <label key={p.id} className={styles.plan} data-best={isBest ? 'true' : 'false'}>
                  <input type="radio" name="if-plan" checked={planId === p.id} onChange={() => setPlanId(p.id)} />
                  {isBest ? <span className={styles.bestTag}>Best value at {perWeek}× a week</span> : null}
                  <span className={styles.planName}>{p.name}</span>
                  <span className={styles.planPrice}>
                    {p.price} <small>{p.unit}</small>
                  </span>
                  <ul>
                    {p.lines.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                  <span className={styles.planEst}>
                    About <b>{money(est)}</b> a month
                    {p.group ? '' : ` for ${perWeek} one-to-one${perWeek === 1 ? '' : 's'} a week`}
                  </span>
                </label>
              )
            })}
          </div>

          <div className={styles.planBar} aria-live="polite">
            {started ? (
              <div className={styles.planDone}>
                <p className={styles.ticketLabel}>Started · {started.ref}</p>
                <h3 className={styles.h3} ref={startedRef} tabIndex={-1}>
                  {started.name}: {started.price}
                  {started.unit.startsWith('£') ? ` (${started.unit})` : ` ${started.unit}`}.
                </h3>
                <p>
                  {started.planId === 'unlimited'
                    ? 'Renews monthly on today’s date. Cancel any time before the renewal date. Your timetable bookings are now covered.'
                    : started.planId === 'pack'
                      ? 'Ten sessions to use within three months. Bookings come off the pack.'
                      : started.planId === 'pt'
                        ? 'Jo or Dani will message you to set your first one-to-one.'
                        : 'Pay for each class when you book. Your first is the £10 taster.'}
                </p>
                <p className={styles.demo}>Demo only: nothing has been sent and no card was charged.</p>
                <button type="button" className={`${styles.btn} ${styles.btnLine}`} onClick={() => setStarted(null)}>
                  Choose again
                </button>
              </div>
            ) : (
              <>
                <p>
                  <b>{plan.name}</b> · about {money(monthly(plan.id))} a month at {perWeek}× a week
                </p>
                <button type="button" className={styles.btn} onClick={startPlan}>
                  Start {plan.name.toLowerCase()}
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ---------- Coaches ---------- */}
      <section id="if-coaches" tabIndex={-1} className={styles.section} aria-labelledby="if-coaches-h">
        <div className={styles.secHead} data-reveal>
          <span className={styles.num}>03</span>
          <h2 id="if-coaches-h" className={styles.h2}>
            Coaches
          </h2>
        </div>
        <div className={styles.coaches}>
          {COACHES.map((c, i) => (
            <article key={c.name} className={styles.coach} data-reveal>
              <CoachTile initial={c.initial} variant={i === 0 ? 0 : i === 1 ? 1 : 2} className={styles.coachArt} />
              <h3 className={styles.h3}>{c.name}</h3>
              <p className={styles.coachFocus}>{c.focus}</p>
              <p>{c.line}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- How ---------- */}
      <section id="if-how" tabIndex={-1} className={styles.section} aria-labelledby="if-how-h">
        <div className={styles.secHead} data-reveal>
          <span className={styles.num}>04</span>
          <h2 id="if-how-h" className={styles.h2}>
            How it works
          </h2>
        </div>
        <ol className={styles.steps}>
          {[
            { t: 'Book a taster', b: '£10 for your first class. Any class, any coach.' },
            { t: 'Pick a plan', b: 'Pay as you go, a pack, Unlimited or one-to-one.' },
            { t: 'Follow the plan', b: 'Every class is written down. Weights go up on purpose.' },
            { t: 'Track it', b: 'Your bookings, lifts and messages in your member log-in.' },
          ].map((s, i) => (
            <li key={s.t} className={styles.step} data-reveal>
              <span className={styles.stepN}>{String(i + 1).padStart(2, '0')}</span>
              <h3 className={styles.h3}>{s.t}</h3>
              <p>{s.b}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className={styles.section} aria-labelledby="if-faq-h">
        <div className={styles.faqGrid}>
          <div className={styles.secHead} data-reveal>
            <span className={styles.num}>05</span>
            <h2 id="if-faq-h" className={styles.h2}>
              Questions
            </h2>
          </div>
          <div className={styles.faq}>
            {FAQS.map((f) => (
              <details key={f.q} className={styles.qa}>
                <summary>
                  <span>{f.q}</span>
                  <span className={styles.qaIcon} aria-hidden="true" />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Find us ---------- */}
      <section id="if-find" tabIndex={-1} className={styles.section} aria-labelledby="if-find-h">
        <div className={styles.find} data-reveal>
          <div className={styles.findAddr}>
            <span className={styles.num}>06</span>
            <h2 id="if-find-h" className={styles.h2}>
              Find us
            </h2>
            <p className={styles.addr}>
              Unit 7, Ironfield Works
              <br />
              Bristol
            </p>
            <p>Four spaces in the yard. Bike racks inside the door. Showers and lockers.</p>
          </div>
          <dl className={styles.hours}>
            {DAYS.map((d, i) => (
              <div key={d} data-today={i === todayIdx ? 'true' : 'false'}>
                <dt>{d}</dt>
                <dd>6am – 8pm</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className={styles.cta} aria-labelledby="if-cta-h">
        <h2 id="if-cta-h" className={styles.ctaH}>
          First session <span>£10.</span>
        </h2>
        <p>Any class this week. Bring trainers and water. We’ll do the rest.</p>
        <a className={styles.btn} href="#if-timetable" onClick={(e) => go(e, 'if-timetable')}>
          Book a taster
        </a>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footRow}>
          <span className={styles.brand}>
            <Mark className={styles.mark} />
            <span>
              Ironfield<b>PT</b>
            </span>
          </span>
          <span>Personal training · Bristol</span>
          <span>Mon–Sun · 6am–8pm</span>
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
          <Mark className={styles.shotMark} />
          Ironfield<b>PT</b>
        </span>
        <span className={styles.shotLinks}>Timetable   ·   Memberships   ·   Coaches   ·   How it works   ·   Find us</span>
        <span className={styles.shotBtn}>Book a taster</span>
      </div>
      <p className={styles.shotKicker}>Small-group and one-to-one · Bristol · Mon–Sun 6am–8pm</p>
      <p className={styles.shotH1}>
        <span>Get strong.</span>
        <span className={styles.shotOutline}>Stay consistent.</span>
      </p>
      <div className={styles.shotBottom}>
        <div>
          <p className={styles.shotLede}>
            Book sessions, track your plan and message your coach, all in one place. Six people a class, never more.
          </p>
          <span className={styles.shotBtn}>Book a taster · £10</span>
        </div>
        <BarbellArt className={styles.shotArt} />
      </div>
    </div>
  )
}
