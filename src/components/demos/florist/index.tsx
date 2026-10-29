'use client'

import { useEffect, useRef, useState, type FormEvent, type JSX, type MouseEvent } from 'react'
import styles from './styles.module.css'
import { Bouquet, Shopfront, Sprig } from './art'
import { FAQS, PRODUCTS, WEDDING_STEPS, productById, type Product, type Size } from './data'
import { Checkout, Countdown, Drawer, MAX_QTY, Shop, cx, type Line } from './shop'
import { readClock, type Clock } from './time'

const LINKS = [
  { id: 'ws-shop', label: 'Shop' },
  { id: 'ws-weddings', label: 'Weddings' },
  { id: 'ws-subs', label: 'Subscriptions' },
  { id: 'ws-studio', label: 'Studio' },
]

const HERO = { palette: ['#c9577f', '#e8b4bc', '#f3d3c4', '#7a2e5c'] as const, seed: 7 }
const HERO_SIDE = { palette: ['#e9b949', '#f6efe3', '#8fa9d4', '#e8b4bc'] as const, seed: 52 }

function scrollToId(id: string): void {
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  el.focus({ preventScroll: true })
}

function jump(e: MouseEvent<HTMLElement>, id: string): void {
  if (!document.getElementById(id)) return
  e.preventDefault()
  scrollToId(id)
}

/* ------------------------------------------------------------------ */

export function Site(): JSX.Element {
  const [clock, setClock] = useState<Clock | null>(null)
  const [lines, setLines] = useState<Line[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const triggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const tick = () => setClock(readClock())
    const first = window.setTimeout(tick, 0)
    const timer = window.setInterval(tick, 15_000)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(timer)
    }
  }, [])

  const addLine = (id: string, size: Size, vase: boolean, qty: number) => {
    const key = `${id}|${size}|${vase ? 1 : 0}`
    setLines((prev) => {
      if (prev.some((l) => l.key === key)) {
        return prev.map((l) => (l.key === key ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l))
      }
      return [...prev, { key, id, size, vase, qty }]
    })
  }

  const setQty = (key: string, qty: number) => {
    setLines((prev) =>
      qty <= 0 ? prev.filter((l) => l.key !== key) : prev.map((l) => (l.key === key ? { ...l, qty: Math.min(MAX_QTY, qty) } : l)),
    )
  }

  const openProduct = (id: string, el: HTMLElement) => {
    triggerRef.current = el
    setOpenId(id)
  }

  // The page behind the drawer is inert while it is open, so focus can only
  // move back once React has re-rendered without the drawer.
  const closeDrawer = () => {
    setOpenId(null)
    window.setTimeout(() => triggerRef.current?.focus(), 0)
  }

  const viewBasket = () => {
    setOpenId(null)
    window.setTimeout(() => scrollToId('ws-checkout'), 0)
  }

  const count = lines.reduce((n, l) => n + l.qty, 0)
  const product = openId ? productById(openId) : undefined

  return (
    <div className={styles.root}>
      <div className={styles.frame} inert={product ? true : undefined}>
        <Nav count={count} open={menuOpen} onToggle={() => setMenuOpen((o) => !o)} onClose={() => setMenuOpen(false)} />
        <Hero />
        <Ribbon />
        <section id="ws-shop" className={styles.section} aria-labelledby="ws-shop-h" tabIndex={-1}>
          <div className={styles.head}>
            <p className={styles.eyebrow}>The shop</p>
            <h2 id="ws-shop-h" className={styles.h2}>
              This week’s <em>flowers</em>
            </h2>
            <p className={styles.headLede}>
              Drawn from what came in at the market. Tap any of them for sizes, what’s inside and a vase.
            </p>
          </div>
          <Shop onOpen={openProduct} />
        </section>
        <section id="ws-checkout" className={styles.section} aria-labelledby="ws-checkout-h" tabIndex={-1}>
          <div className={styles.head}>
            <p className={styles.eyebrow}>Checkout</p>
            <h2 id="ws-checkout-h" className={styles.h2}>
              Basket &amp; <em>delivery</em>
            </h2>
          </div>
          <Checkout lines={lines} setQty={setQty} clear={() => setLines([])} clock={clock} onShop={() => scrollToId('ws-shop')} />
        </section>
        <How />
        <Subscriptions onAdd={(id) => addLine(id, 'standard', false, 1)} lines={lines} />
        <Weddings />
        <Studio />
        <Faq />
        <Closing />
        <Footer />
      </div>
      {product && (
        <Drawer
          key={product.id}
          product={product}
          onClose={closeDrawer}
          onAdd={(size, vase, qty) => addLine(product.id, size, vase, qty)}
          onViewBasket={viewBasket}
        />
      )}
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
        <nav aria-label="Wild Stem" className={styles.navLeft}>
          <ul id="ws-menu" className={cx(styles.links, open && styles.linksOpen)}>
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
          href="#ws-top"
          className={styles.wordmark}
          onClick={(e) => {
            onClose()
            jump(e, 'ws-top')
          }}
        >
          <Sprig />
          <span>Wild Stem</span>
        </a>
        <div className={styles.navRight}>
          <span className={styles.navNote}>Bath · same-day by 1pm</span>
          <a
            href="#ws-checkout"
            className={styles.basketBtn}
            aria-label={`Basket, ${count} ${count === 1 ? 'item' : 'items'}`}
            onClick={(e) => {
              onClose()
              jump(e, 'ws-checkout')
            }}
          >
            <span aria-hidden="true">Basket</span>
            <span className={cx(styles.basketCount, count > 0 && styles.basketCountOn)} aria-hidden="true">
              {count}
            </span>
          </a>
          <button type="button" className={styles.menuBtn} aria-expanded={open} aria-controls="ws-menu" onClick={onToggle}>
            <span aria-hidden="true">{open ? 'Close' : 'Menu'}</span>
            <span className={styles.sr}>{open ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function Hero(): JSX.Element {
  return (
    <section id="ws-top" className={styles.hero} aria-labelledby="ws-h1" tabIndex={-1}>
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>Same-day delivery across the city</p>
        <h1 id="ws-h1" className={styles.h1}>
          Flowers that look like they were <em>picked this morning.</em>
        </h1>
        <p className={styles.lede}>
          Seasonal bouquets, weddings and weekly arrangements. Order by 1pm for delivery today.
        </p>
        <div className={styles.ctas}>
          <a href="#ws-shop" className={styles.btnSolid} onClick={(e) => jump(e, 'ws-shop')}>
            Send flowers
          </a>
          <a href="#ws-weddings" className={styles.btnGhost} onClick={(e) => jump(e, 'ws-weddings')}>
            Weddings
          </a>
        </div>
      </div>
      <div className={styles.heroVisual}>
        <div className={styles.heroArch}>
          <Bouquet
            kind="bouquet"
            palette={HERO.palette}
            seed={HERO.seed}
            big
            label="Drawing of a loose, hand-tied bouquet of pink ranunculus, anemones and eucalyptus in kraft paper"
          />
        </div>
        <div className={styles.heroSmall} aria-hidden="true">
          <Bouquet kind="vase" palette={HERO_SIDE.palette} seed={HERO_SIDE.seed} />
        </div>
        <Countdown tone="badge" />
        <p className={styles.heroCaption}>
          <span>No. 14</span> This week’s seasonal bouquet
        </p>
      </div>
    </section>
  )
}

function Ribbon(): JSX.Element {
  const points = [
    { title: 'Order by 1pm', body: 'Delivered the same day, with a photo when it arrives.' },
    { title: 'Card message', body: 'Written by hand, typed by you at checkout.' },
    { title: 'Subscriptions', body: 'Weekly or monthly flowers, pause any time.' },
  ]
  return (
    <section className={styles.ribbon} aria-label="How Wild Stem works">
      <ul>
        {points.map((p) => (
          <li key={p.title}>
            <h2>{p.title}</h2>
            <p>{p.body}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

function How(): JSX.Element {
  const steps = [
    { title: 'You order', body: 'By 1pm for today, or choose a date up to a week ahead. Add a card message as you go.' },
    { title: 'We make it', body: 'Every bouquet is tied by hand at the bench that morning, never pre-made.' },
    { title: 'Our van delivers', body: 'Across BA1 and BA2, in water, in a box that keeps them upright.' },
    { title: 'You get a photo', body: 'An email with a picture at the door, so you know they arrived and how they looked.' },
  ]
  return (
    <section className={styles.how} aria-labelledby="ws-how-h">
      <div className={styles.head}>
        <p className={styles.eyebrow}>Delivery</p>
        <h2 id="ws-how-h" className={styles.h2}>
          From our bench to <em>their door</em>
        </h2>
      </div>
      <ol className={styles.steps}>
        {steps.map((s, i) => (
          <li key={s.title}>
            <span className={styles.stepNum} aria-hidden="true">
              {i + 1}
            </span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Subscriptions({ onAdd, lines }: { onAdd: (id: string) => void; lines: Line[] }): JSX.Element {
  const subs = PRODUCTS.filter((p) => p.kind === 'subscription')
  return (
    <section id="ws-subs" className={styles.subs} aria-labelledby="ws-subs-h" tabIndex={-1}>
      <div className={styles.head}>
        <p className={styles.eyebrow}>Subscriptions</p>
        <h2 id="ws-subs-h" className={styles.h2}>
          Flowers on <em>repeat</em>
        </h2>
        <p className={styles.headLede}>
          The florist’s choice, on the same day each time. Pause, skip or stop online before 5pm the day before.
        </p>
      </div>
      <ul className={styles.subGrid}>
        {subs.map((p, i) => (
          <SubCard key={p.id} p={p} featured={i === 0} inBasket={lines.some((l) => l.id === p.id)} onAdd={() => onAdd(p.id)} />
        ))}
      </ul>
    </section>
  )
}

function SubCard({ p, featured, inBasket, onAdd }: { p: Product; featured: boolean; inBasket: boolean; onAdd: () => void }): JSX.Element {
  return (
    <li className={cx(styles.subCard, featured && styles.subFeatured)}>
      <div className={styles.subArt}>
        <Bouquet kind="vase" palette={p.palette} seed={p.seed} />
      </div>
      <h3>{p.name}</h3>
      <p className={styles.subPrice}>
        £{p.price} <span>per delivery</span>
      </p>
      <p className={styles.subBody}>{p.blurb}</p>
      <button type="button" className={featured ? styles.btnSolid : styles.btnGhost} onClick={onAdd}>
        {inBasket ? 'Added · add another' : 'Start with this'}
      </button>
      <p className={styles.subNote} aria-live="polite">
        {inBasket ? 'In your basket. Pick the first date at checkout.' : 'First delivery date chosen at checkout.'}
      </p>
    </li>
  )
}

/* ------------------------------------------------------------------ */

type WedErrors = Partial<Record<'names' | 'date' | 'email', string>>

function Weddings(): JSX.Element {
  const [names, setNames] = useState('')
  const [date, setDate] = useState('')
  const [venue, setVenue] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<WedErrors>({})
  const [done, setDone] = useState<{ ref: string; names: string; date: string; venue: string } | null>(null)

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const next: WedErrors = {}
    if (names.trim().length < 2) next.names = 'Add your names.'
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) next.date = 'Choose your wedding date.'
    else if (date <= today) next.date = 'That date has passed. Choose a date in the future.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) next.email = 'Add an email so we can reply.'
    setErrors(next)
    const first = (['names', 'date', 'email'] as const).find((k) => next[k])
    if (first) {
      document.getElementById(`ws-w-${first}`)?.focus()
      return
    }
    const [y, m, d] = date.split('-')
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    setDone({
      ref: `WS-W${Date.now().toString(36).slice(-5).toUpperCase()}`,
      names: names.trim(),
      date: `${Number(d)} ${months[Number(m) - 1]} ${y}`,
      venue: venue.trim(),
    })
  }

  return (
    <section id="ws-weddings" className={styles.weddings} aria-labelledby="ws-wed-h" tabIndex={-1}>
      <div className={styles.wedInner}>
        <div className={styles.wedCopy}>
          <p className={styles.eyebrowLight}>Weddings</p>
          <h2 id="ws-wed-h" className={styles.h2Light}>
            For the day you will <em>look back on.</em>
          </h2>
          <p className={styles.wedLede}>
            Bouquets, buttonholes, arches and tables, from <b>£450</b> with the consultation included. We take a small
            number of weddings each month so every one gets our full attention.
          </p>
          <ol className={styles.wedSteps}>
            {WEDDING_STEPS.map((s, i) => (
              <li key={s.title}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className={styles.wedFormWrap}>
          {done ? (
            <div className={styles.wedDone} role="status">
              <p className={styles.eyebrow}>Request noted · {done.ref}</p>
              <h3>Thank you, {done.names}.</h3>
              <p>
                We will email within two working days to book your consultation for a wedding on <b>{done.date}</b>
                {done.venue ? ` at ${done.venue}` : ''}.
              </p>
              <p className={styles.demoNote}>Demo only: nothing has been sent.</p>
              <button type="button" className={styles.btnGhost} onClick={() => setDone(null)}>
                Start again
              </button>
            </div>
          ) : (
            <form className={styles.wedForm} onSubmit={submit} noValidate>
              <h3 className={styles.wedFormTitle}>Book a consultation</h3>
              <WedField id="ws-w-names" label="Your names" value={names} onChange={setNames} error={errors.names} autoComplete="name" />
              <WedField id="ws-w-date" label="Wedding date" value={date} onChange={setDate} error={errors.date} type="date" />
              <WedField id="ws-w-venue" label="Venue (optional)" value={venue} onChange={setVenue} />
              <WedField id="ws-w-email" label="Email" value={email} onChange={setEmail} error={errors.email} type="email" autoComplete="email" />
              <button type="submit" className={styles.btnSolid}>
                Ask about our date
              </button>
              <p className={styles.demoNote}>Demo only: nothing is sent.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

function WedField({
  id,
  label,
  value,
  onChange,
  error,
  type = 'text',
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  type?: 'text' | 'email' | 'date'
  autoComplete?: string
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

/* ------------------------------------------------------------------ */

function Studio(): JSX.Element {
  const hours = [
    ['Monday – Friday', '8am – 5pm'],
    ['Saturday', '8am – 5pm'],
    ['Sunday', 'Closed'],
  ]
  return (
    <section id="ws-studio" className={styles.studio} aria-labelledby="ws-studio-h" tabIndex={-1}>
      <figure className={styles.studioArt}>
        <Shopfront />
      </figure>
      <div className={styles.studioCopy}>
        <p className={styles.eyebrow}>The studio</p>
        <h2 id="ws-studio-h" className={styles.h2}>
          Come and <em>choose</em> in person
        </h2>
        <p className={styles.headLede}>
          A small workroom with a shop at the front. Buckets by the door, the bench at the back, and someone happy to
          make you something while you wait.
        </p>
        <table className={styles.hours}>
          <caption className={styles.sr}>Studio opening hours</caption>
          <tbody>
            {hours.map(([d, h]) => (
              <tr key={d}>
                <th scope="row">{d}</th>
                <td>{h}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <address className={styles.address}>
          Unit 3, The Old Dye Works, Bath
          <br />
          Collections from 11am · 01225 000 000
        </address>
      </div>
    </section>
  )
}

function Faq(): JSX.Element {
  return (
    <section className={styles.faq} aria-labelledby="ws-faq-h">
      <div className={styles.head}>
        <p className={styles.eyebrow}>Good to know</p>
        <h2 id="ws-faq-h" className={styles.h2}>
          Questions, <em>answered</em>
        </h2>
      </div>
      <div className={styles.faqList}>
        {FAQS.map((f) => (
          <details key={f.q} className={styles.faqItem}>
            <summary>
              <span>{f.q}</span>
              <span className={styles.faqIcon} aria-hidden="true" />
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
    <section className={styles.closing} aria-labelledby="ws-close-h">
      <div className={styles.closingArt} aria-hidden="true">
        <Bouquet kind="bouquet" palette={['#f1c6cd', '#fbf6f2', '#e8b4bc', '#c9577f']} seed={33} />
      </div>
      <div>
        <h2 id="ws-close-h" className={styles.closingTitle}>
          Someone deserves <em>flowers today.</em>
        </h2>
        <Countdown tone="line" />
        <a href="#ws-shop" className={styles.btnLight} onClick={(e) => jump(e, 'ws-shop')}>
          Send flowers
        </a>
      </div>
    </section>
  )
}

function Footer(): JSX.Element {
  return (
    <footer className={styles.footer}>
      <div className={styles.footMark}>
        <Sprig />
        <span>Wild Stem</span>
      </div>
      <p>Florist · Bath</p>
      <p>Mon–Sat · 8am–5pm</p>
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
            <div className={styles.navLeft}>
              <span className={styles.links}>
                {LINKS.map((l) => (
                  <span key={l.id} className={styles.fakeLink}>
                    {l.label}
                  </span>
                ))}
              </span>
            </div>
            <span className={styles.wordmark}>
              <span>Wild Stem</span>
            </span>
            <div className={styles.navRight}>
              <span className={styles.navNote}>Bath · same-day by 1pm</span>
              <span className={styles.basketBtn}>Basket</span>
            </div>
          </div>
        </div>
        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Same-day delivery across the city</p>
            <p className={styles.h1}>
              Flowers that look like they were <em>picked this morning.</em>
            </p>
            <p className={styles.lede}>Seasonal bouquets, weddings and weekly arrangements. Order by 1pm for delivery today.</p>
            <div className={styles.ctas}>
              <span className={styles.btnSolid}>Send flowers</span>
              <span className={styles.btnGhost}>Weddings</span>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroArch}>
              <Bouquet kind="bouquet" palette={HERO.palette} seed={HERO.seed} lean />
            </div>
            <div className={styles.cutBadge}>
              <span>Order by</span>
              <b>1pm</b>
              <span>for same day</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
