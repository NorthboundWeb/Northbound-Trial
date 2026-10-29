'use client'

import { useEffect, useRef, useState, type FormEvent, type JSX, type KeyboardEvent } from 'react'
import styles from './styles.module.css'
import { Bouquet } from './art'
import {
  DELIVERY_PENCE,
  FREE_OVER,
  OCCASIONS,
  PRICE_BANDS,
  PRODUCTS,
  SIZES,
  TYPES,
  VASE_PRICE,
  productById,
  type Kind,
  type Occasion,
  type PriceBand,
  type Product,
  type Size,
} from './data'
import { cutoffInfo, deliveryDates, hms, pounds, readClock, type Clock } from './time'

export type Line = { key: string; id: string; size: Size; vase: boolean; qty: number }

export const MAX_QTY = 10

export function cx(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(' ')
}

/** Unit price in whole pounds. */
export function unitPrice(p: Product, size: Size, vase: boolean): number {
  const extra = p.sizes ? (SIZES.find((s) => s.id === size)?.extra ?? 0) : 0
  return p.price + extra + (vase && p.kind === 'bouquet' ? VASE_PRICE : 0)
}

function archBg(p: Product): string {
  return `radial-gradient(120% 80% at 50% 92%, ${p.palette[2]}88, transparent 70%), linear-gradient(180deg, #f6ebee, #f1e4ea)`
}

function inBand(price: number, band: PriceBand): boolean {
  if (band === 'under40') return price < 40
  if (band === '40to60') return price >= 40 && price <= 60
  if (band === 'over60') return price > 60
  return true
}

const KIND_LABEL: Record<Kind, string> = {
  bouquet: 'Hand-tied bouquet',
  vase: 'Arranged in a vase',
  plant: 'Potted plant',
  dried: 'Dried flowers',
  subscription: 'Subscription',
}

/* ------------------------------------------------------------------ countdown */

/** Ticks once a second: the 1pm same-day cut-off. */
export function Countdown({ tone }: { tone: 'badge' | 'line' }): JSX.Element {
  const [clock, setClock] = useState<Clock | null>(null)
  useEffect(() => {
    const tick = () => setClock(readClock())
    const first = window.setTimeout(tick, 0)
    const timer = window.setInterval(tick, 1000)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(timer)
    }
  }, [])
  const info = clock ? cutoffInfo(clock) : null

  if (tone === 'line') {
    if (!info) return <p className={styles.cutLine}>Order by 1pm, Monday to Saturday, for delivery the same day.</p>
    return info.sameDay ? (
      <p className={styles.cutLine}>
        <span className={styles.pulse} aria-hidden="true" />
        Order in <b className={styles.mono}>{hms(info.left)}</b> for delivery <b>today</b>.
      </p>
    ) : (
      <p className={styles.cutLine}>
        Today’s 1pm cut-off has passed. Order now for delivery <b>{info.next}</b>.
      </p>
    )
  }

  return (
    <div className={styles.cutBadge}>
      {info === null ? (
        <>
          <span>Order by</span>
          <b>1pm</b>
          <span>for same day</span>
        </>
      ) : info.sameDay ? (
        <>
          <span>Order within</span>
          <b className={styles.mono}>{hms(info.left)}</b>
          <span>for delivery today</span>
        </>
      ) : (
        <>
          <span>Order now</span>
          <b>{info.next === 'tomorrow' ? 'Tomorrow' : info.next}</b>
          <span>next delivery</span>
        </>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ shop */

type SortBy = 'featured' | 'low' | 'high'

export function Shop({ onOpen }: { onOpen: (id: string, el: HTMLElement) => void }): JSX.Element {
  const [occ, setOcc] = useState<Occasion | 'all'>('all')
  const [type, setType] = useState<Kind | 'all'>('all')
  const [band, setBand] = useState<PriceBand>('any')
  const [sort, setSort] = useState<SortBy>('featured')

  const visible = PRODUCTS.filter((p) => !p.hidden)
  const list = visible.filter(
    (p) => (occ === 'all' || p.occasions.includes(occ)) && (type === 'all' || p.kind === type) && inBand(p.price, band),
  )
  const shown = sort === 'featured' ? list : [...list].sort((a, b) => (sort === 'low' ? a.price - b.price : b.price - a.price))
  const filtered = occ !== 'all' || type !== 'all' || band !== 'any'

  const reset = () => {
    setOcc('all')
    setType('all')
    setBand('any')
  }

  return (
    <div className={styles.shop}>
      <div className={styles.filterBar}>
        <div className={styles.occasions} role="group" aria-label="Occasion">
          {OCCASIONS.map((o) => (
            <button key={o.id} type="button" className={styles.pill} aria-pressed={occ === o.id} onClick={() => setOcc(o.id)}>
              {o.label}
            </button>
          ))}
        </div>
        <div className={styles.selects}>
          <label className={styles.selectWrap}>
            <span className={styles.sr}>Type</span>
            <select
              value={type}
              onChange={(e) => {
                const t = TYPES.find((x) => x.id === e.target.value)
                if (t) setType(t.id)
              }}
            >
              {TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.selectWrap}>
            <span className={styles.sr}>Price</span>
            <select
              value={band}
              onChange={(e) => {
                const b = PRICE_BANDS.find((x) => x.id === e.target.value)
                if (b) setBand(b.id)
              }}
            >
              {PRICE_BANDS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.selectWrap}>
            <span className={styles.sr}>Sort by</span>
            <select
              value={sort}
              onChange={(e) => {
                const v = e.target.value
                if (v === 'featured' || v === 'low' || v === 'high') setSort(v)
              }}
            >
              <option value="featured">Featured</option>
              <option value="low">Price, low to high</option>
              <option value="high">Price, high to low</option>
            </select>
          </label>
        </div>
      </div>
      <p className={styles.count} aria-live="polite">
        Showing {shown.length} of {visible.length}
        {filtered && (
          <button type="button" className={styles.textBtn} onClick={reset}>
            Clear filters
          </button>
        )}
      </p>
      {shown.length === 0 ? (
        <div className={styles.noResults}>
          <p>Nothing matches all of those. Try a different price, or let us choose.</p>
          <button type="button" className={styles.btnGhost} onClick={reset}>
            Show everything
          </button>
        </div>
      ) : (
        <ul className={styles.grid}>
          {shown.map((p, i) => (
            <li key={p.id} className={styles.product} style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
              <button
                type="button"
                className={styles.productBtn}
                aria-haspopup="dialog"
                onClick={(e) => onOpen(p.id, e.currentTarget)}
              >
                <span className={styles.arch} style={{ backgroundImage: archBg(p) }}>
                  <Bouquet kind={p.kind} palette={p.palette} seed={p.seed} />
                  {p.badge && <span className={styles.badge}>{p.badge}</span>}
                  <span className={styles.view} aria-hidden="true">
                    View
                  </span>
                </span>
                <span className={styles.productMeta}>
                  <span className={styles.productName}>{p.name}</span>
                  <span className={styles.productPrice}>{p.sizes ? `from £${p.price}` : `£${p.price}`}</span>
                </span>
                <span className={styles.productKind}>{KIND_LABEL[p.kind]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ drawer */

export function Drawer({
  product,
  onClose,
  onAdd,
  onViewBasket,
}: {
  product: Product
  onClose: () => void
  onAdd: (size: Size, vase: boolean, qty: number) => void
  onViewBasket: () => void
}): JSX.Element {
  const [size, setSize] = useState<Size>('standard')
  const [vase, setVase] = useState(false)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  const canVase = product.kind === 'bouquet'
  const unit = unitPrice(product, size, vase)

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
      return
    }
    if (e.key !== 'Tab' || !panelRef.current) return
    const list = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href]'),
    ).filter((el) => !el.hasAttribute('disabled'))
    if (list.length === 0) return
    const first = list[0]
    const last = list[list.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <div className={styles.drawerWrap}>
      <div className={styles.scrim} onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ws-drawer-title"
        onKeyDown={onKey}
      >
        <button ref={closeRef} type="button" className={styles.close} onClick={onClose}>
          <span aria-hidden="true">×</span>
          <span className={styles.sr}>Close</span>
        </button>
        <div className={styles.drawerArt} style={{ backgroundImage: archBg(product) }}>
          <Bouquet kind={product.kind} palette={product.palette} seed={product.seed} label={`Drawing of ${product.name}`} />
        </div>
        <div className={styles.drawerBody}>
          <p className={styles.eyebrow}>{KIND_LABEL[product.kind]}</p>
          <h2 id="ws-drawer-title" className={styles.drawerTitle}>
            {product.name}
          </h2>
          <p className={styles.drawerPrice} aria-live="polite">
            £{unit * qty}
            {qty > 1 && <span> · £{unit} each</span>}
          </p>
          <p className={styles.drawerBlurb}>{product.blurb}</p>
          <p className={styles.stemsTitle}>Usually in it</p>
          <ul className={styles.stems}>
            {product.stems.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>

          {product.sizes && (
            <fieldset className={styles.sizes}>
              <legend>Size</legend>
              {SIZES.map((s) => (
                <label key={s.id} className={cx(styles.sizeOpt, size === s.id && styles.sizeOn)}>
                  <input
                    type="radio"
                    name="ws-size"
                    value={s.id}
                    checked={size === s.id}
                    onChange={() => {
                      setSize(s.id)
                      setAdded(false)
                    }}
                  />
                  <span className={styles.sizeName}>{s.label}</span>
                  <span className={styles.sizePrice}>£{product.price + s.extra}</span>
                  <span className={styles.sizeNote}>{s.note}</span>
                </label>
              ))}
            </fieldset>
          )}

          {canVase && (
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={vase}
                onChange={(e) => {
                  setVase(e.target.checked)
                  setAdded(false)
                }}
              />
              <span>
                Add a glass vase <b>+£{VASE_PRICE}</b>
                <small>Arrives in water, ready to put down</small>
              </span>
            </label>
          )}

          <div className={styles.addRow}>
            <div className={styles.stepper} role="group" aria-label="Quantity">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="One fewer">
                −
              </button>
              <span aria-live="polite">{qty}</span>
              <button type="button" onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))} disabled={qty >= MAX_QTY} aria-label="One more">
                +
              </button>
            </div>
            <button
              type="button"
              className={styles.btnSolid}
              onClick={() => {
                onAdd(size, vase, qty)
                setAdded(true)
              }}
            >
              Add to basket · £{unit * qty}
            </button>
          </div>
          <div aria-live="polite">
            {added && (
              <div className={styles.addedNote}>
                <p>
                  <b>Added.</b> {qty} × {product.name}
                  {product.sizes ? `, ${SIZES.find((s) => s.id === size)?.label.toLowerCase()}` : ''}
                  {canVase && vase ? ', with vase' : ''}.
                </p>
                <div className={styles.addedActions}>
                  <button type="button" className={styles.btnGhost} onClick={onViewBasket}>
                    View basket
                  </button>
                  <button type="button" className={styles.textBtn} onClick={onClose}>
                    Keep looking
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ checkout */

type Method = 'delivery' | 'collect'
type Errors = Partial<Record<'basket' | 'recipient' | 'address' | 'postcode' | 'sender' | 'email', string>>
type Done = {
  ref: string
  lines: { label: string; total: number }[]
  totalPence: number
  method: Method
  when: string
  recipient: string
  postcode: string
  card: string
  sender: string
}

const POSTCODE = /^BA[12]\s?\d[A-Z]{2}$/i
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function lineLabel(l: Line, p: Product): string {
  if (p.kind === 'subscription') return `${p.name}, first delivery (then ${p.every})`
  const parts = [p.name]
  if (p.sizes) parts.push(SIZES.find((s) => s.id === l.size)?.label.toLowerCase() ?? '')
  if (l.vase && p.kind === 'bouquet') parts.push('with vase')
  return parts.join(', ')
}

export function Checkout({
  lines,
  setQty,
  clear,
  clock,
  onShop,
}: {
  lines: Line[]
  setQty: (key: string, qty: number) => void
  clear: () => void
  clock: Clock | null
  onShop: () => void
}): JSX.Element {
  const [method, setMethod] = useState<Method>('delivery')
  const [dateKey, setDateKey] = useState<number | null>(null)
  const [recipient, setRecipient] = useState('')
  const [address, setAddress] = useState('')
  const [postcode, setPostcode] = useState('')
  const [sender, setSender] = useState('')
  const [email, setEmail] = useState('')
  const [card, setCard] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [done, setDone] = useState<Done | null>(null)
  const doneRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (done) doneRef.current?.focus()
  }, [done])

  const dates = clock ? deliveryDates(clock, 8) : []
  const date = dates.find((d) => d.serial === dateKey) ?? dates[0] ?? null

  const priced = lines
    .map((l) => {
      const p = productById(l.id)
      return p ? { line: l, product: p, unit: unitPrice(p, l.size, l.vase) } : null
    })
    .filter((x): x is { line: Line; product: Product; unit: number } => x !== null)

  const subtotal = priced.reduce((s, x) => s + x.unit * x.line.qty * 100, 0)
  const fee = method === 'delivery' && subtotal > 0 && subtotal < FREE_OVER * 100 ? DELIVERY_PENCE : 0
  const total = subtotal + fee

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const next: Errors = {}
    if (priced.length === 0) next.basket = 'Your basket is empty. Choose some flowers first.'
    if (method === 'delivery') {
      if (recipient.trim().length < 2) next.recipient = 'Who are they for?'
      if (address.trim().length < 4) next.address = 'Add the street address.'
      if (!POSTCODE.test(postcode.trim())) next.postcode = 'We deliver to BA1 and BA2 postcodes, for example BA1 2AB.'
    }
    if (sender.trim().length < 2) next.sender = 'Add your name.'
    if (!EMAIL.test(email.trim())) next.email = 'Add an email for your confirmation and delivery photo.'
    setErrors(next)
    const keys = Object.keys(next)
    if (keys.length > 0 || !date) {
      const order = ['basket', 'recipient', 'address', 'postcode', 'sender', 'email']
      const first = order.find((k) => keys.includes(k))
      if (first) document.getElementById(`ws-${first}`)?.focus()
      return
    }
    setDone({
      ref: `WS-${Date.now().toString(36).slice(-6).toUpperCase()}`,
      lines: priced.map((x) => ({ label: `${x.line.qty} × ${lineLabel(x.line, x.product)}`, total: x.unit * x.line.qty * 100 })),
      totalPence: total,
      method,
      when: date.long,
      recipient: method === 'delivery' ? recipient.trim() : sender.trim(),
      postcode: postcode.trim().toUpperCase(),
      card: card.trim(),
      sender: sender.trim(),
    })
    clear()
  }

  const restart = () => {
    setDone(null)
    setCard('')
    setRecipient('')
    setAddress('')
    setPostcode('')
    setErrors({})
  }

  if (done) {
    return (
      <div className={styles.checkoutDone}>
        <div className={styles.doneCard}>
          <p className={styles.eyebrow}>Order placed · {done.ref}</p>
          <h3 ref={doneRef} tabIndex={-1} className={styles.doneTitle}>
            Thank you, {done.sender}.
          </h3>
          <p>
            {done.method === 'delivery' ? (
              <>
                We will deliver to <b>{done.recipient}</b> ({done.postcode}) on <b>{done.when}</b>, and email you a
                photo when they arrive.
              </>
            ) : (
              <>
                Your flowers will be ready to collect from the studio on <b>{done.when}</b> from 11am.
              </>
            )}
          </p>
          <ul className={styles.receipt}>
            {done.lines.map((l) => (
              <li key={l.label}>
                <span>{l.label}</span>
                <span>{pounds(l.total)}</span>
              </li>
            ))}
            <li className={styles.receiptTotal}>
              <span>Total</span>
              <span>{pounds(done.totalPence)}</span>
            </li>
          </ul>
          {done.card && (
            <div className={styles.cardPreview} role="note" aria-label="Card message">
              <p>{done.card}</p>
              <span>— {done.sender}</span>
            </div>
          )}
          <p className={styles.demoNote}>Demo only: nothing has been sent and no payment has been taken.</p>
          <button type="button" className={styles.btnGhost} onClick={restart}>
            Send another
          </button>
        </div>
      </div>
    )
  }

  return (
    <form className={styles.checkout} onSubmit={submit} noValidate>
      <div className={styles.basketCol}>
        <h3 id="ws-basket-title" className={styles.colTitle}>
          Your basket
        </h3>
        {priced.length === 0 ? (
          <div className={styles.emptyBasket}>
            <p id="ws-basket" tabIndex={-1}>
              Nothing here yet.
            </p>
            {errors.basket && <p className={styles.error}>{errors.basket}</p>}
            <button type="button" className={styles.btnGhost} onClick={onShop}>
              Browse the shop
            </button>
          </div>
        ) : (
          <ul className={styles.lines}>
            {priced.map(({ line, product, unit }) => (
              <li key={line.key}>
                <span className={styles.lineArt} style={{ backgroundImage: archBg(product) }}>
                  <Bouquet kind={product.kind === 'subscription' ? 'bouquet' : product.kind} palette={product.palette} seed={product.seed} lean />
                </span>
                <div className={styles.lineInfo}>
                  <p className={styles.lineName}>{lineLabel(line, product)}</p>
                  <div className={styles.lineCtl}>
                    <div className={styles.stepper} role="group" aria-label={`${product.name} quantity`}>
                      <button type="button" onClick={() => setQty(line.key, line.qty - 1)} aria-label={`One fewer ${product.name}`}>
                        −
                      </button>
                      <span aria-live="polite">{line.qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(line.key, line.qty + 1)}
                        disabled={line.qty >= MAX_QTY}
                        aria-label={`One more ${product.name}`}
                      >
                        +
                      </button>
                    </div>
                    <button type="button" className={styles.textBtn} onClick={() => setQty(line.key, 0)}>
                      Remove<span className={styles.sr}> {product.name}</span>
                    </button>
                  </div>
                </div>
                <span className={styles.linePrice}>£{unit * line.qty}</span>
              </li>
            ))}
          </ul>
        )}
        <dl className={styles.totals} aria-live="polite">
          <div>
            <dt>Flowers</dt>
            <dd>{pounds(subtotal)}</dd>
          </div>
          <div>
            <dt>{method === 'delivery' ? 'Delivery' : 'Collection'}</dt>
            <dd>{fee === 0 ? (method === 'delivery' && subtotal > 0 ? 'Free' : '£0') : pounds(fee)}</dd>
          </div>
          <div className={styles.grand}>
            <dt>Total</dt>
            <dd>{pounds(total)}</dd>
          </div>
        </dl>
        {method === 'delivery' && subtotal > 0 && subtotal < FREE_OVER * 100 && (
          <p className={styles.hint}>Free delivery on orders over £{FREE_OVER}.</p>
        )}
      </div>

      <div className={styles.detailsCol}>
        <fieldset className={styles.methodSet}>
          <legend className={styles.colTitle}>How should they arrive?</legend>
          <div className={styles.methods}>
            {(['delivery', 'collect'] as const).map((m) => (
              <label key={m} className={cx(styles.methodOpt, method === m && styles.methodOn)}>
                <input type="radio" name="ws-method" value={m} checked={method === m} onChange={() => setMethod(m)} />
                <b>{m === 'delivery' ? 'Delivered' : 'Collect from studio'}</b>
                <span>{m === 'delivery' ? `BA1 & BA2 · £5.95, free over £${FREE_OVER}` : 'Free · from 11am'}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.dateSet}>
          <legend className={styles.label}>{method === 'delivery' ? 'Delivery date' : 'Collection date'}</legend>
          <Countdown tone="line" />
          {clock === null ? (
            <p className={styles.hint}>Loading dates…</p>
          ) : (
            <div className={styles.dates}>
              {dates.map((d) => (
                <button
                  key={d.serial}
                  type="button"
                  className={styles.dateChip}
                  aria-pressed={date?.serial === d.serial}
                  aria-label={d.long}
                  onClick={() => setDateKey(d.serial)}
                >
                  <span>{d.top}</span>
                  <b>{d.day}</b>
                  <span>{d.month}</span>
                </button>
              ))}
            </div>
          )}
        </fieldset>

        {method === 'delivery' && (
          <div className={styles.fieldGrid}>
            <Field id="ws-recipient" label="Recipient’s name" value={recipient} onChange={setRecipient} error={errors.recipient} autoComplete="off" />
            <Field id="ws-address" label="Street address" value={address} onChange={setAddress} error={errors.address} autoComplete="street-address" />
            <Field
              id="ws-postcode"
              label="Postcode"
              value={postcode}
              onChange={setPostcode}
              error={errors.postcode}
              autoComplete="postal-code"
              hint="BA1 or BA2"
            />
          </div>
        )}

        <div className={styles.cardBlock}>
          <div className={styles.field}>
            <label htmlFor="ws-card" className={styles.label}>
              Card message <span className={styles.optional}>(optional)</span>
            </label>
            <textarea
              id="ws-card"
              rows={4}
              maxLength={200}
              value={card}
              onChange={(e) => setCard(e.target.value)}
              aria-describedby="ws-card-count"
              placeholder="Happy birthday, love from all of us…"
            />
            <p id="ws-card-count" className={styles.hint}>
              {200 - card.length} characters left · written by hand on a cotton card
            </p>
          </div>
          <div className={styles.cardPreview} aria-hidden="true">
            <p>{card.trim() || 'Your words, written by hand.'}</p>
            <span>— {sender.trim() || 'you'}</span>
          </div>
        </div>

        <div className={styles.fieldGrid}>
          <Field id="ws-sender" label="Your name" value={sender} onChange={setSender} error={errors.sender} autoComplete="name" />
          <Field
            id="ws-email"
            label="Your email"
            value={email}
            onChange={setEmail}
            error={errors.email}
            autoComplete="email"
            type="email"
            hint="For the confirmation and the delivery photo"
          />
        </div>

        <button type="submit" className={styles.btnSolid}>
          Place order{total > 0 ? ` · ${pounds(total)}` : ''}
        </button>
        <p className={styles.demoNote}>Demo only: nothing is sent and no payment is taken.</p>
      </div>
    </form>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  autoComplete,
  type = 'text',
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  hint?: string
  autoComplete?: string
  type?: 'text' | 'email'
}): JSX.Element {
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined
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
        aria-describedby={describedBy}
      />
      {error ? (
        <p id={`${id}-err`} className={styles.error}>
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
