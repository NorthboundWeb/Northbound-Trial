'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, JSX, MouseEvent as ReactMouseEvent, RefObject } from 'react'
import styles from './styles.module.css'
import {
  DAY_NAMES,
  DISTRICTS,
  EXTRAS,
  FAQS,
  FREQS,
  HOUSES,
  ONE_OFFS,
  SKYLIGHT_PRICE,
  addDays,
  dateKey,
  districtOf,
  formatPostcode,
  longDate,
  money,
  nextWeekday,
  shortDate,
  validPostcode,
} from './data'
import type { AccessId, FreqId, HouseId } from './data'
import { HouseIcon, IconCard, IconPole, IconSkip, IconTag, Mark, StreetScene } from './art'

const NAV: { id: string; label: string }[] = [
  { id: 'cw-quote', label: 'Prices' },
  { id: 'cw-how', label: 'How it works' },
  { id: 'cw-skip', label: 'Skip a round' },
  { id: 'cw-area', label: 'Areas' },
  { id: 'cw-faq', label: 'FAQ' },
]

const QUICK: HouseId[] = ['terrace', 'semi3', 'det4']

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

type Account = {
  ref: string | null
  name: string
  address: string
  postcode: string
  day: number
  first: Date
  weeks: number
  price: number
}

type Field = 'name' | 'address' | 'postcode' | 'mobile'

export function Site(): JSX.Element {
  const root = useRef<HTMLDivElement>(null)
  useReveal(root, styles.waiting)

  const [menuOpen, setMenuOpen] = useState(false)

  // Quote
  const [houseId, setHouseId] = useState<HouseId>('semi3')
  const [freqId, setFreqId] = useState<FreqId>('four')
  const [extras, setExtras] = useState<string[]>([])
  const [skylights, setSkylights] = useState(0)
  const [oneOffs, setOneOffs] = useState<string[]>([])

  // Sign-up
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [postcode, setPostcode] = useState('')
  const [mobile, setMobile] = useState('')
  const [access, setAccess] = useState<AccessId>('open')
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [joined, setJoined] = useState<Account | null>(null)
  const confirmRef = useRef<HTMLHeadingElement>(null)

  // Skip a round
  const [today, setToday] = useState<Date | null>(null)
  const [skipped, setSkipped] = useState<string[]>([])
  const [reminders, setReminders] = useState(true)
  const [skipNote, setSkipNote] = useState('')

  // Areas
  const [dayFilter, setDayFilter] = useState<number | null>(null)
  const [check, setCheck] = useState('')

  useEffect(() => {
    const t = window.setTimeout(() => setToday(new Date()), 0)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (joined) confirmRef.current?.focus()
  }, [joined])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const house = HOUSES.find((h) => h.id === houseId) ?? HOUSES[0]
  const freq = FREQS.find((f) => f.id === freqId) ?? FREQS[0]
  const chosenExtras = EXTRAS.filter((x) => extras.includes(x.id))
  const chosenOneOffs = ONE_OFFS.filter((x) => oneOffs.includes(x.id))
  const perClean =
    house.price + freq.add + chosenExtras.reduce((s, x) => s + x.price, 0) + skylights * SKYLIGHT_PRICE
  const oneOffTotal = chosenOneOffs.reduce((s, x) => s + x.price, 0)
  const firstVisit = perClean + oneOffTotal
  const yearly = freq.weeks ? Math.round((perClean * 52) / freq.weeks) : 0
  const cleansAYear = freq.weeks === 4 ? '13 cleans' : freq.weeks === 8 ? '6 or 7 cleans' : ''

  const demoAccount = useMemo<Account | null>(
    () =>
      today
        ? {
            ref: null,
            name: 'Sam',
            address: '14 Larkspur Row',
            postcode: 'SN3 4QX',
            day: 3,
            first: nextWeekday(today, 3, 1),
            weeks: 4,
            price: 16,
          }
        : null,
    [today],
  )
  const account = joined ?? demoAccount
  const upcoming = useMemo<Date[]>(() => {
    if (!account) return []
    if (!account.weeks) return [account.first]
    return [0, 1, 2, 3, 4].map((i) => addDays(account.first, i * account.weeks * 7))
  }, [account])
  const nextClean = upcoming.find((d) => !skipped.includes(dateKey(d)))

  function go(e: ReactMouseEvent<HTMLAnchorElement>, id: string): void {
    e.preventDefault()
    setMenuOpen(false)
    scrollToId(id)
  }

  function toggle(list: string[], id: string): string[] {
    return list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
  }

  function toggleSkip(d: Date): void {
    const k = dateKey(d)
    if (skipped.includes(k)) {
      setSkipped(skipped.filter((x) => x !== k))
      setSkipNote(`Back on: ${longDate(d)}.`)
      return
    }
    const next = [...skipped, k]
    let run = 0
    let longest = 0
    for (const u of upcoming) {
      run = next.includes(dateKey(u)) ? run + 1 : 0
      longest = Math.max(longest, run)
    }
    if (longest > 2) {
      setSkipNote('That would be three rounds in a row. Message us and we’ll pause the round instead.')
      return
    }
    setSkipped(next)
    const after = upcoming.find((u) => !next.includes(dateKey(u)))
    setSkipNote(
      `Skipped ${longDate(d)}. Nothing to pay for that round.${after ? ` Next clean: ${longDate(after)}.` : ''}`,
    )
  }

  function submit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    const next: Partial<Record<Field, string>> = {}
    if (!name.trim()) next.name = 'Your name, please.'
    if (!address.trim()) next.address = 'The first line of the address we’re cleaning.'
    const district = districtOf(postcode)
    const area = DISTRICTS.find((d) => d.code === district)
    if (!validPostcode(postcode)) next.postcode = 'That doesn’t look like a full UK postcode, e.g. SN3 4QX.'
    else if (!area) next.postcode = `We don’t cover ${district} yet. Our rounds are SN1–SN5, SN25 and SN26.`
    const digits = mobile.replace(/[\s()-]/g, '')
    if (!/^(07\d{9}|\+447\d{9})$/.test(digits)) next.mobile = 'A UK mobile, so we can text the card link.'
    setErrors(next)
    if (Object.keys(next).length > 0 || !area) return
    const first = nextWeekday(new Date(), area.day, 3)
    setSkipped([])
    setSkipNote('')
    setJoined({
      ref: `CW-${Math.floor(10000 + Math.random() * 90000)}`,
      name: name.trim(),
      address: address.trim(),
      postcode: formatPostcode(postcode),
      day: area.day,
      first,
      weeks: freq.weeks,
      price: perClean,
    })
  }

  function startOver(): void {
    setJoined(null)
    setName('')
    setAddress('')
    setPostcode('')
    setMobile('')
    setErrors({})
    setSkipped([])
    setSkipNote('')
  }

  const checkDistrict = districtOf(check)
  const checkArea = DISTRICTS.find((d) => d.code === checkDistrict)
  let checkMsg = ''
  if (check.trim().length >= 5) {
    if (!validPostcode(check)) checkMsg = 'Keep typing: we need the full postcode.'
    else if (checkArea) checkMsg = `Yes. ${checkArea.code} is on our ${DAY_NAMES[checkArea.day]} round.`
    else checkMsg = `Not yet. ${checkDistrict} is outside our rounds for now.`
  }

  return (
    <div className={styles.site} ref={root}>
      <a className={styles.skipLink} href="#cw-quote" onClick={(e) => go(e, 'cw-quote')}>
        Skip to the price calculator
      </a>

      {/* ---------- Nav ---------- */}
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <a className={styles.brand} href="#cw-top" onClick={(e) => go(e, 'cw-top')}>
            <Mark className={styles.mark} />
            <span>Clearwater</span>
          </a>
          <nav className={styles.links} aria-label="Clearwater">
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`} onClick={(e) => go(e, n.id)}>
                {n.label}
              </a>
            ))}
          </nav>
          <a className={`${styles.btn} ${styles.navCta}`} href="#cw-quote" onClick={(e) => go(e, 'cw-quote')}>
            Get my price
          </a>
          <button
            type="button"
            className={styles.menuBtn}
            aria-expanded={menuOpen}
            aria-controls="cw-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
        <nav id="cw-menu" className={styles.mobileMenu} aria-label="Clearwater menu" hidden={!menuOpen}>
          {NAV.map((n, i) => (
            <a key={n.id} href={`#${n.id}`} onClick={(e) => go(e, n.id)}>
              <span className={styles.menuNum}>{String(i + 1).padStart(2, '0')}</span>
              {n.label}
            </a>
          ))}
          <a className={styles.btn} href="#cw-quote" onClick={(e) => go(e, 'cw-quote')}>
            Get my price
          </a>
        </nav>
      </header>

      {/* ---------- Hero ---------- */}
      <section id="cw-top" tabIndex={-1} className={styles.hero} aria-labelledby="cw-h1">
        <div className={styles.heroCopy}>
          <p className={styles.chip}>
            <span className={styles.chipDot} aria-hidden="true" />
            Swindon rounds · Every four or eight weeks
          </p>
          <h1 id="cw-h1" className={styles.h1}>
            Price your clean in <span className={styles.underline}>ten seconds.</span>
          </h1>
          <p className={styles.lede}>
            Pick your house type and how often. See the price, book the round, pay by card after each clean.
          </p>
        </div>

        <div className={styles.quick} role="group" aria-labelledby="cw-quick-l">
          <p id="cw-quick-l" className={styles.quickLabel}>
            Your house
          </p>
          <div className={styles.quickOpts}>
            {QUICK.map((id) => {
              const h = HOUSES.find((x) => x.id === id) ?? HOUSES[0]
              return (
                <button
                  key={id}
                  type="button"
                  className={styles.quickBtn}
                  aria-pressed={houseId === id}
                  onClick={() => setHouseId(id)}
                >
                  <HouseIcon shape={h.shape} className={styles.quickIcon} />
                  <span>{h.label}</span>
                </button>
              )
            })}
          </div>
          <div className={styles.quickPrice} aria-live="polite">
            <b key={perClean}>{money(perClean)}</b>
            <span>{freq.weeks ? `every ${freq.weeks} weeks` : 'one-off'}</span>
          </div>
          <a className={styles.btn} href="#cw-quote" onClick={(e) => go(e, 'cw-quote')}>
            Get my price
          </a>
        </div>

        <div className={styles.street}>
          <StreetScene className={styles.streetSvg} sheen sheenClass={styles.sheen} />
        </div>
      </section>

      <ul className={styles.points}>
        <li>
          <IconTag className={styles.pointIcon} />
          <b>Instant prices</b>
          <span>No visit needed for a standard house.</span>
        </li>
        <li>
          <IconCard className={styles.pointIcon} />
          <b>Pay after each clean</b>
          <span>A card link by text when we’ve been.</span>
        </li>
        <li>
          <IconSkip className={styles.pointIcon} />
          <b>Skip a round</b>
          <span>One tap if you’re away.</span>
        </li>
      </ul>

      {/* ---------- Quote ---------- */}
      <section id="cw-quote" tabIndex={-1} className={styles.section} aria-labelledby="cw-quote-h">
        <div className={styles.secHead} data-reveal>
          <p className={styles.label}>01 · Instant quote</p>
          <h2 id="cw-quote-h" className={styles.h2}>
            Your price, before anyone climbs anything.
          </h2>
        </div>

        <div className={styles.quote}>
          <div className={styles.quoteForm}>
            <fieldset className={styles.fs}>
              <legend>
                <span className={styles.legendNum}>A</span> House type
              </legend>
              <div className={styles.houseGrid}>
                {HOUSES.map((h) => (
                  <label key={h.id} className={styles.card}>
                    <input
                      type="radio"
                      name="cw-house"
                      checked={houseId === h.id}
                      onChange={() => setHouseId(h.id)}
                    />
                    <HouseIcon shape={h.shape} className={styles.cardIcon} />
                    <b>{h.label}</b>
                    <small>{h.sub}</small>
                    <span className={styles.cardPrice}>{money(h.price)}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className={styles.fs}>
              <legend>
                <span className={styles.legendNum}>B</span> How often
              </legend>
              <div className={styles.freqGrid}>
                {FREQS.map((f) => (
                  <label key={f.id} className={styles.card}>
                    <input type="radio" name="cw-freq" checked={freqId === f.id} onChange={() => setFreqId(f.id)} />
                    <b>{f.label}</b>
                    <small>{f.sub}</small>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className={styles.fs}>
              <legend>
                <span className={styles.legendNum}>C</span> Extras, every clean
              </legend>
              <div className={styles.extraList}>
                {EXTRAS.map((x) => (
                  <label key={x.id} className={styles.row}>
                    <input type="checkbox" checked={extras.includes(x.id)} onChange={() => setExtras(toggle(extras, x.id))} />
                    <span className={styles.box} aria-hidden="true" />
                    <span className={styles.rowText}>
                      <b>{x.label}</b>
                      <small>{x.note}</small>
                    </span>
                    <span className={styles.rowPrice}>+{money(x.price)}</span>
                  </label>
                ))}
                <div className={styles.row}>
                  <span className={styles.rowText}>
                    <b id="cw-sky-l">Skylights or roof windows</b>
                    <small>Reachable from the ground · +{money(SKYLIGHT_PRICE)} each</small>
                  </span>
                  <span className={styles.stepper} role="group" aria-labelledby="cw-sky-l">
                    <button
                      type="button"
                      onClick={() => setSkylights((n) => Math.max(0, n - 1))}
                      disabled={skylights === 0}
                      aria-label="One fewer skylight"
                    >
                      −
                    </button>
                    <output aria-live="polite">{skylights}</output>
                    <button
                      type="button"
                      onClick={() => setSkylights((n) => Math.min(8, n + 1))}
                      disabled={skylights === 8}
                      aria-label="One more skylight"
                    >
                      +
                    </button>
                  </span>
                </div>
              </div>
            </fieldset>

            <fieldset className={styles.fs}>
              <legend>
                <span className={styles.legendNum}>D</span> One-off jobs, first visit
              </legend>
              <div className={styles.extraList}>
                {ONE_OFFS.map((x) => (
                  <label key={x.id} className={styles.row}>
                    <input type="checkbox" checked={oneOffs.includes(x.id)} onChange={() => setOneOffs(toggle(oneOffs, x.id))} />
                    <span className={styles.box} aria-hidden="true" />
                    <span className={styles.rowText}>
                      <b>{x.label}</b>
                      <small>{x.note}</small>
                    </span>
                    <span className={styles.rowPrice}>{money(x.price)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <aside className={styles.ticket} aria-labelledby="cw-ticket-h">
            <p id="cw-ticket-h" className={styles.label}>
              Your price
            </p>
            <div className={styles.big} aria-live="polite" aria-atomic="true">
              <b key={perClean}>{money(perClean)}</b>
              <span>{freq.weeks ? `per clean, every ${freq.weeks} weeks` : 'for a one-off clean'}</span>
            </div>
            <dl className={styles.ticketLines}>
              <div>
                <dt>{house.label}</dt>
                <dd>{money(house.price)}</dd>
              </div>
              {freq.add ? (
                <div>
                  <dt>{freq.label}</dt>
                  <dd>+{money(freq.add)}</dd>
                </div>
              ) : null}
              {chosenExtras.map((x) => (
                <div key={x.id}>
                  <dt>{x.label}</dt>
                  <dd>+{money(x.price)}</dd>
                </div>
              ))}
              {skylights ? (
                <div>
                  <dt>
                    {skylights} skylight{skylights === 1 ? '' : 's'}
                  </dt>
                  <dd>+{money(skylights * SKYLIGHT_PRICE)}</dd>
                </div>
              ) : null}
            </dl>
            {oneOffTotal ? (
              <p className={styles.ticketNote}>
                First visit {money(firstVisit)}, including {chosenOneOffs.map((x) => x.label.toLowerCase()).join(' and ')}.
              </p>
            ) : null}
            {yearly ? (
              <p className={styles.ticketNote}>
                About {money(yearly)} a year ({cleansAYear}), paid one clean at a time.
              </p>
            ) : null}
            <a className={`${styles.btn} ${styles.btnFull}`} href="#cw-join" onClick={(e) => go(e, 'cw-join')}>
              {freq.weeks ? 'Join the round' : 'Book the clean'}
            </a>
            <p className={styles.fine}>Standard houses only. Extensions or very large glass get a quick photo check.</p>
          </aside>
        </div>
      </section>

      {/* ---------- Join ---------- */}
      <section id="cw-join" tabIndex={-1} className={`${styles.section} ${styles.joinSec}`} aria-labelledby="cw-join-h">
        {joined ? (
          <div className={styles.confirm} role="status">
            <p className={styles.label}>You’re on the round · {joined.ref}</p>
            <h2 id="cw-join-h" className={styles.h2} ref={confirmRef} tabIndex={-1}>
              First clean {longDate(joined.first)}.
            </h2>
            <dl className={styles.confirmGrid}>
              <div>
                <dt>Address</dt>
                <dd>
                  {joined.address}, {joined.postcode}
                </dd>
              </div>
              <div>
                <dt>Round</dt>
                <dd>
                  {DAY_NAMES[joined.day]}s{joined.weeks ? `, every ${joined.weeks} weeks` : ', one-off'}
                </dd>
              </div>
              <div>
                <dt>Price</dt>
                <dd>{money(joined.price)} per clean</dd>
              </div>
              <div>
                <dt>Payment</dt>
                <dd>Card link by text after each clean</dd>
              </div>
            </dl>
            <p className={styles.demoNote}>Demo only: nothing has been sent.</p>
            <div className={styles.ctaRow}>
              <a className={styles.btn} href="#cw-skip" onClick={(e) => go(e, 'cw-skip')}>
                See your upcoming cleans
              </a>
              <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={startOver}>
                Start again
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.join}>
            <div className={styles.joinIntro} data-reveal>
              <p className={styles.label}>02 · Join the round</p>
              <h2 id="cw-join-h" className={styles.h2}>
                Book it in. We’ll text before we come.
              </h2>
              <div className={styles.joinSummary}>
                <HouseIcon shape={house.shape} className={styles.joinIcon} />
                <div>
                  <b>
                    {house.label} · {money(perClean)}
                  </b>
                  <span>{freq.label}</span>
                </div>
                <a className={styles.textLink} href="#cw-quote" onClick={(e) => go(e, 'cw-quote')}>
                  Change
                </a>
              </div>
              <p className={styles.muted}>
                No contract. No direct debit. A reminder text the day before, a card link after.
              </p>
            </div>

            <form className={styles.form} onSubmit={submit} noValidate>
              <div className={styles.field}>
                <label htmlFor="cw-name">Name</label>
                <input
                  id="cw-name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={errors.name ? 'cw-e-name' : undefined}
                />
                {errors.name ? (
                  <p id="cw-e-name" className={styles.err}>
                    {errors.name}
                  </p>
                ) : null}
              </div>
              <div className={styles.field}>
                <label htmlFor="cw-address">First line of address</label>
                <input
                  id="cw-address"
                  autoComplete="address-line1"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  aria-invalid={errors.address ? true : undefined}
                  aria-describedby={errors.address ? 'cw-e-address' : undefined}
                />
                {errors.address ? (
                  <p id="cw-e-address" className={styles.err}>
                    {errors.address}
                  </p>
                ) : null}
              </div>
              <div className={styles.fieldPair}>
                <div className={styles.field}>
                  <label htmlFor="cw-postcode">Postcode</label>
                  <input
                    id="cw-postcode"
                    autoComplete="postal-code"
                    autoCapitalize="characters"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    aria-invalid={errors.postcode ? true : undefined}
                    aria-describedby={errors.postcode ? 'cw-e-postcode' : undefined}
                  />
                  {errors.postcode ? (
                    <p id="cw-e-postcode" className={styles.err}>
                      {errors.postcode}
                    </p>
                  ) : null}
                </div>
                <div className={styles.field}>
                  <label htmlFor="cw-mobile">Mobile</label>
                  <input
                    id="cw-mobile"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    aria-invalid={errors.mobile ? true : undefined}
                    aria-describedby={errors.mobile ? 'cw-e-mobile' : undefined}
                  />
                  {errors.mobile ? (
                    <p id="cw-e-mobile" className={styles.err}>
                      {errors.mobile}
                    </p>
                  ) : null}
                </div>
              </div>
              <fieldset className={styles.accessFs}>
                <legend>Getting round the back</legend>
                {(
                  [
                    { id: 'open', label: 'Gate’s open or unlocked' },
                    { id: 'locked', label: 'Locked: text me for the code' },
                    { id: 'front', label: 'Front only, please' },
                  ] as { id: AccessId; label: string }[]
                ).map((a) => (
                  <label key={a.id} className={styles.radio}>
                    <input type="radio" name="cw-access" checked={access === a.id} onChange={() => setAccess(a.id)} />
                    <span className={styles.dot} aria-hidden="true" />
                    {a.label}
                  </label>
                ))}
              </fieldset>
              <button type="submit" className={`${styles.btn} ${styles.btnFull}`}>
                {freq.weeks ? `Join the round · ${money(perClean)} a clean` : `Book the clean · ${money(perClean)}`}
              </button>
            </form>
          </div>
        )}
      </section>

      {/* ---------- Skip a round ---------- */}
      <section id="cw-skip" tabIndex={-1} className={`${styles.section} ${styles.skipSec}`} aria-labelledby="cw-skip-h">
        <div className={styles.skipGrid}>
          <div className={styles.skipCopy} data-reveal>
            <p className={styles.label}>03 · Away for a bit?</p>
            <h2 id="cw-skip-h" className={styles.h2}>
              Skip a round in one tap.
            </h2>
            <p className={styles.muted}>
              Every reminder text has a link to this page. Skip up to the evening before and you’re not charged for
              that round. Try it: this is {joined ? 'your round' : 'a pretend customer’s round'}.
            </p>
          </div>

          <div className={styles.phone} data-reveal>
            <div className={styles.phoneTop}>
              <Mark className={styles.phoneMark} />
              <div>
                <b>{account ? account.address : 'Loading…'}</b>
                <span>
                  {account
                    ? `${account.postcode} · ${DAY_NAMES[account.day]}s · ${money(account.price)} a clean`
                    : ''}
                </span>
              </div>
            </div>
            <div className={styles.nextBox}>
              <span className={styles.label}>Next clean</span>
              <b>{nextClean ? longDate(nextClean) : 'None booked'}</b>
            </div>
            <ul className={styles.rounds}>
              {upcoming.map((d) => {
                const off = skipped.includes(dateKey(d))
                return (
                  <li key={dateKey(d)} data-off={off ? 'true' : 'false'}>
                    <span className={styles.roundDate}>
                      <b>{shortDate(d)}</b>
                      <small>{off ? 'Skipped · nothing to pay' : `${money(account ? account.price : 0)} · card link after`}</small>
                    </span>
                    <button
                      type="button"
                      className={styles.skipBtn}
                      aria-pressed={off}
                      onClick={() => toggleSkip(d)}
                      aria-label={off ? `Undo skip for ${longDate(d)}` : `Skip ${longDate(d)}`}
                    >
                      {off ? 'Undo' : 'Skip'}
                    </button>
                  </li>
                )
              })}
            </ul>
            <label className={styles.switch}>
              <input type="checkbox" checked={reminders} onChange={(e) => setReminders(e.target.checked)} />
              <span className={styles.track} aria-hidden="true" />
              <span>Reminder text the day before</span>
            </label>
            <p className={styles.phoneLive} aria-live="polite">
              {skipNote || (reminders ? 'Reminders on.' : 'Reminders off. We’ll still text the card link.')}
            </p>
            <p className={styles.demoNoteSmall}>Demo only: nothing has been sent.</p>
          </div>
        </div>
      </section>

      {/* ---------- How ---------- */}
      <section id="cw-how" tabIndex={-1} className={styles.section} aria-labelledby="cw-how-h">
        <div className={styles.secHead} data-reveal>
          <p className={styles.label}>04 · How it works</p>
          <h2 id="cw-how-h" className={styles.h2}>
            Three steps. None of them a phone call.
          </h2>
        </div>
        <ol className={styles.steps}>
          <li data-reveal>
            <IconTag className={styles.stepIcon} />
            <span className={styles.stepN}>01</span>
            <h3 className={styles.h3}>Price it here</h3>
            <p>House type, how often, any extras. The price you see is the price you pay.</p>
          </li>
          <li data-reveal>
            <IconPole className={styles.stepIcon} />
            <span className={styles.stepN}>02</span>
            <h3 className={styles.h3}>We clean</h3>
            <p>Pure water through a pole from the ground. Glass, frames and sills, front and back.</p>
          </li>
          <li data-reveal>
            <IconCard className={styles.stepIcon} />
            <span className={styles.stepN}>03</span>
            <h3 className={styles.h3}>Pay by text</h3>
            <p>A card link arrives when we’ve finished. Pay within seven days, whenever suits.</p>
          </li>
        </ol>
        <div className={styles.water} data-reveal>
          <div className={styles.drop} aria-hidden="true">
            <svg viewBox="0 0 120 150">
              <path d="M60 6C40 44 14 72 14 100a46 46 0 0 0 92 0C106 72 80 44 60 6z" fill="#0284c7" />
              <path d="M38 98a22 22 0 0 0 22 22" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h3 className={styles.h3}>Why pure water?</h3>
            <p>
              Tap water leaves minerals behind, which is what makes spots. We filter it down to nothing but water, so
              it lifts the dirt and dries clear. No soap, no smears, nothing on your plants.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Areas ---------- */}
      <section id="cw-area" tabIndex={-1} className={styles.section} aria-labelledby="cw-area-h">
        <div className={styles.secHead} data-reveal>
          <p className={styles.label}>05 · Where we go</p>
          <h2 id="cw-area-h" className={styles.h2}>
            One street, one day, every round.
          </h2>
        </div>
        <div className={styles.area}>
          <div>
            <div className={styles.dayChips} role="group" aria-label="Show rounds by day">
              <button type="button" aria-pressed={dayFilter === null} onClick={() => setDayFilter(null)}>
                All
              </button>
              {[1, 2, 3, 4, 5].map((d) => (
                <button key={d} type="button" aria-pressed={dayFilter === d} onClick={() => setDayFilter(d)}>
                  {DAY_NAMES[d].slice(0, 3)}
                </button>
              ))}
            </div>
            <ul className={styles.tiles}>
              {DISTRICTS.map((d) => (
                <li key={d.code} data-dim={dayFilter !== null && dayFilter !== d.day ? 'true' : 'false'}>
                  <b>{d.code}</b>
                  <span>{d.area}</span>
                  <small>{DAY_NAMES[d.day]}</small>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.checker}>
            <label htmlFor="cw-check" className={styles.h3}>
              Do you cover me?
            </label>
            <input
              id="cw-check"
              placeholder="e.g. SN25 2AB"
              autoCapitalize="characters"
              value={check}
              onChange={(e) => setCheck(e.target.value)}
            />
            <p className={styles.checkMsg} aria-live="polite" data-ok={checkArea ? 'true' : 'false'}>
              {checkMsg || 'Type your postcode to see your round day.'}
            </p>
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section id="cw-faq" tabIndex={-1} className={styles.section} aria-labelledby="cw-faq-h">
        <div className={styles.secHead} data-reveal>
          <p className={styles.label}>06 · Questions</p>
          <h2 id="cw-faq-h" className={styles.h2}>
            Asked at the door.
          </h2>
        </div>
        <div className={styles.faq}>
          {FAQS.map((f, i) => (
            <details key={f.q} className={styles.qa}>
              <summary>
                <span className={styles.qn}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.qq}>{f.q}</span>
                <span className={styles.chev} aria-hidden="true" />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className={styles.cta} aria-labelledby="cw-cta-h">
        <h2 id="cw-cta-h" className={styles.ctaH}>
          Clear glass, without the faff.
        </h2>
        <p>
          Your {house.label.toLowerCase()} is {money(perClean)} {freq.weeks ? `every ${freq.weeks} weeks` : 'as a one-off'}.
          Book it now and we’ll text before the first clean.
        </p>
        <div className={styles.ctaRow}>
          <a className={`${styles.btn} ${styles.btnWhite}`} href="#cw-join" onClick={(e) => go(e, 'cw-join')}>
            Join the round
          </a>
          <a className={`${styles.btn} ${styles.btnOnDark}`} href="#cw-quote" onClick={(e) => go(e, 'cw-quote')}>
            Change my price
          </a>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footRow}>
          <span className={styles.brand}>
            <Mark className={styles.mark} />
            <span>Clearwater</span>
          </span>
          <span>Window cleaning · Swindon</span>
          <span>Rounds Mon–Fri · Messages answered 8am–6pm</span>
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
          Clearwater
        </span>
        <span className={styles.shotLinks}>Prices   ·   How it works   ·   Skip a round   ·   Areas   ·   FAQ</span>
        <span className={styles.shotBtn}>Get my price</span>
      </div>
      <div className={styles.shotHero}>
        <p className={styles.shotChip}>Swindon rounds · Every four or eight weeks</p>
        <p className={styles.shotH1}>
          Price your clean in <span>ten seconds.</span>
        </p>
        <p className={styles.shotLede}>
          Pick your house type and how often. See the price, book the round, pay by card after each clean.
        </p>
        <div className={styles.shotQuick}>
          <span className={styles.shotOpt}>Terrace</span>
          <span className={`${styles.shotOpt} ${styles.shotOn}`}>Semi</span>
          <span className={styles.shotOpt}>Detached</span>
          <b>£16</b>
          <span className={styles.shotBtn}>Get my price</span>
        </div>
      </div>
      <StreetScene className={styles.shotStreet} />
    </div>
  )
}
