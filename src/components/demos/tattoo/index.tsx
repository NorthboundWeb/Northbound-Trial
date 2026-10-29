'use client'

import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, FormEvent, KeyboardEvent, MouseEvent } from 'react'
import styles from './styles.module.css'
import { FlashArt, HeroFern, STYLES, pieces } from './flash'
import type { ArtistId, Piece, Style } from './flash'

/* ------------------------------------------------------------------ */
/* Content                                                              */
/* ------------------------------------------------------------------ */

type Artist = { id: ArtistId; name: string; styles: Style[]; body: string; days: string; sample: string }

const artists: Artist[] = [
  {
    id: 'ines',
    name: 'Ines Varga',
    styles: ['Fine line', 'Botanical'],
    body: 'Single-needle work, plants and small things that sit close to the skin. Happiest drawing something that grew in your garden.',
    days: 'Tuesday to Thursday',
    sample: 'fern',
  },
  {
    id: 'rory',
    name: 'Rory Cole',
    styles: ['Blackwork', 'Geometric'],
    body: 'Solid black and ruler-straight geometry. Pieces built to read from across a room, and to still look sharp in twenty years.',
    days: 'Wednesday to Saturday',
    sample: 'hex',
  },
  {
    id: 'mae',
    name: 'Mae Okafor',
    styles: ['Dotwork', 'Geometric'],
    body: 'Stippled shading, mandalas and ornament, built up dot by dot. Soft on the skin, and scales up to a full back.',
    days: 'Tuesday, Friday and Saturday',
    sample: 'mandala',
  },
]

function artistName(id: ArtistId | 'any'): string {
  if (id === 'any') return 'First available artist'
  return artists.find((a) => a.id === id)?.name ?? ''
}

type SizeId = 'small' | 'half' | 'full'
const sizes: { id: SizeId; label: string; price: string; detail: string; deposit: number }[] = [
  { id: 'small', label: 'Small piece', price: 'From £80', detail: 'Up to palm size. Most flash fits here.', deposit: 30 },
  { id: 'half', label: 'Half day', price: '£280', detail: 'About four hours. A forearm or a calf.', deposit: 60 },
  { id: 'full', label: 'Full day', price: '£500', detail: 'Large custom work, a sleeve section or a back panel.', deposit: 100 },
]

type Shape = { fig: 0 | 1; x: number; y: number; w: number; h: number }
type Zone = { id: string; shapes: Shape[] }

const zones: Zone[] = [
  { id: 'Inner forearm', shapes: [{ fig: 0, x: 18, y: 112, w: 13, h: 54 }, { fig: 0, x: 89, y: 112, w: 13, h: 54 }] },
  { id: 'Outer forearm', shapes: [{ fig: 1, x: 18, y: 112, w: 13, h: 54 }, { fig: 1, x: 89, y: 112, w: 13, h: 54 }] },
  { id: 'Upper arm', shapes: [{ fig: 0, x: 22, y: 60, w: 13, h: 46 }, { fig: 0, x: 85, y: 60, w: 13, h: 46 }, { fig: 1, x: 22, y: 60, w: 13, h: 46 }, { fig: 1, x: 85, y: 60, w: 13, h: 46 }] },
  { id: 'Shoulder', shapes: [{ fig: 1, x: 24, y: 46, w: 18, h: 14 }, { fig: 1, x: 78, y: 46, w: 18, h: 14 }] },
  { id: 'Collarbone', shapes: [{ fig: 0, x: 40, y: 48, w: 40, h: 9 }] },
  { id: 'Sternum', shapes: [{ fig: 0, x: 53, y: 62, w: 14, h: 40 }] },
  { id: 'Ribs', shapes: [{ fig: 0, x: 38, y: 78, w: 12, h: 44 }, { fig: 0, x: 70, y: 78, w: 12, h: 44 }] },
  { id: 'Upper back', shapes: [{ fig: 1, x: 40, y: 52, w: 40, h: 40 }] },
  { id: 'Lower back', shapes: [{ fig: 1, x: 42, y: 98, w: 36, h: 36 }] },
  { id: 'Thigh', shapes: [{ fig: 0, x: 38, y: 146, w: 20, h: 62 }, { fig: 0, x: 62, y: 146, w: 20, h: 62 }] },
  { id: 'Calf', shapes: [{ fig: 1, x: 40, y: 220, w: 16, h: 54 }, { fig: 1, x: 64, y: 220, w: 16, h: 54 }] },
  { id: 'Ankle', shapes: [{ fig: 0, x: 40, y: 266, w: 16, h: 13 }, { fig: 0, x: 64, y: 266, w: 16, h: 13 }] },
]

const DAYS = ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const NAV: { id: string; label: string }[] = [
  { id: 'bf-artists', label: 'Artists' },
  { id: 'bf-work', label: 'Flash and work' },
  { id: 'bf-prices', label: 'Prices' },
  { id: 'bf-book', label: 'Booking' },
  { id: 'bf-care', label: 'Aftercare' },
]

const care: { q: string; a: string }[] = [
  { q: 'The first day', a: 'Leave the wrap on for the time your artist tells you, usually two to four hours. Then wash with clean hands, lukewarm water and unscented soap, and pat dry with kitchen roll.' },
  { q: 'The first two weeks', a: 'A thin layer of the balm we give you, two or three times a day. No baths, pools, sea or sunbeds. Showers are fine. Do not pick or scratch the flakes.' },
  { q: 'After it heals', a: 'Sun cream on it whenever it is out. Black lasts longest when it is kept out of the sun.' },
  { q: 'Touch-ups', a: 'If anything heals patchy, a touch-up within three months is free. Message us with a photo.' },
  { q: 'Before you come in', a: 'Eat properly, sleep, and skip alcohol the night before. Bring photo ID: we only tattoo over-18s.' },
]

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

function reducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function scrollToId(id: string): void {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' })
  el.focus({ preventScroll: true })
}

function FernMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path
        d="M16 30 C 16 22, 17 12, 18 3 M16.4 24 Q10 22 7 17 M16.6 24 Q22 22 25 17 M16.8 18 Q11 16 9 11 M17 18 Q22 16 24 11 M17.3 12 Q13 10 12 6 M17.5 12 Q21 10 22 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Portfolio with filters and a detail dialog                           */
/* ------------------------------------------------------------------ */

function PieceDialog({ piece, onClose, onRequest }: { piece: Piece; onClose: () => void; onRequest: (p: Piece) => void }) {
  const boxRef = useRef<HTMLDivElement | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
      return
    }
    if (e.key !== 'Tab' || !boxRef.current) return
    const items = boxRef.current.querySelectorAll<HTMLElement>('button')
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <div className={styles.scrim} onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bf-dialog-title"
        ref={boxRef}
        onKeyDown={onKey}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.dialogArt}>
          <FlashArt id={piece.id} className={styles.dialogSvg} />
        </div>
        <div className={styles.dialogBody}>
          <button type="button" className={styles.close} onClick={onClose} ref={closeRef}>
            Close
          </button>
          <p className={styles.dialogBy}>{artistName(piece.artist)}</p>
          <h3 id="bf-dialog-title" className={styles.dialogTitle}>
            {piece.title}
          </h3>
          <p className={styles.dialogNote}>{piece.note}</p>
          <dl className={styles.dialogFacts}>
            <div>
              <dt>Style</dt>
              <dd>{piece.styles.join(', ')}</dd>
            </div>
            <div>
              <dt>Size</dt>
              <dd>{piece.size}</dd>
            </div>
            <div>
              <dt>Price</dt>
              <dd>{piece.from}</dd>
            </div>
          </dl>
          <p className={styles.dialogFine}>Flash is tattooed once. After that it comes off the wall.</p>
          <button type="button" className={styles.btn} onClick={() => onRequest(piece)}>
            Request this design
          </button>
        </div>
      </div>
    </div>
  )
}

function Work({ artist, setArtist, onRequest }: { artist: ArtistId | 'all'; setArtist: (a: ArtistId | 'all') => void; onRequest: (p: Piece) => void }) {
  const [style, setStyle] = useState<Style | 'all'>('all')
  const [open, setOpen] = useState<Piece | null>(null)
  const opener = useRef<HTMLButtonElement | null>(null)

  const shown = pieces.filter((p) => (artist === 'all' || p.artist === artist) && (style === 'all' || p.styles.includes(style)))

  function close() {
    setOpen(null)
    opener.current?.focus()
  }

  return (
    <>
      <div className={styles.filters}>
        <div className={styles.filterRow} role="group" aria-label="Filter by artist">
          <span className={styles.filterLabel}>Artist</span>
          <button type="button" className={styles.filter} aria-pressed={artist === 'all'} onClick={() => setArtist('all')}>
            All
          </button>
          {artists.map((a) => (
            <button key={a.id} type="button" className={styles.filter} aria-pressed={artist === a.id} onClick={() => setArtist(a.id)}>
              {a.name.split(' ')[0]}
            </button>
          ))}
        </div>
        <div className={styles.filterRow} role="group" aria-label="Filter by style">
          <span className={styles.filterLabel}>Style</span>
          <button type="button" className={styles.filter} aria-pressed={style === 'all'} onClick={() => setStyle('all')}>
            All
          </button>
          {STYLES.map((s) => (
            <button key={s} type="button" className={styles.filter} aria-pressed={style === s} onClick={() => setStyle(s)}>
              {s}
            </button>
          ))}
        </div>
        <p className={styles.count} aria-live="polite">
          {shown.length === 0 ? 'No pieces' : shown.length === 1 ? 'One piece' : `${shown.length} pieces`}
        </p>
      </div>

      {shown.length === 0 ? (
        <div className={styles.empty}>
          <p>
            {artistName(artist === 'all' ? 'any' : artist)} has nothing in {style} on the wall right now. They will still
            draw you a custom piece.
          </p>
          <button type="button" className={styles.btnLine} onClick={() => setStyle('all')}>
            Show all their styles
          </button>
        </div>
      ) : (
        <ul className={styles.sheet}>
          {shown.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className={styles.flash}
                onClick={(e) => {
                  opener.current = e.currentTarget
                  setOpen(p)
                }}
              >
                <FlashArt id={p.id} className={styles.flashSvg} />
                <span className={styles.flashCap}>
                  <span className={styles.flashTitle}>{p.title}</span>
                  <span className={styles.flashMeta}>
                    {artistName(p.artist).split(' ')[0]}, {p.from}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open ? (
        <PieceDialog
          piece={open}
          onClose={close}
          onRequest={(p) => {
            setOpen(null)
            onRequest(p)
          }}
        />
      ) : null}
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Placement figure                                                     */
/* ------------------------------------------------------------------ */

function Body({ fig }: { fig: 0 | 1 }) {
  return (
    <g className={styles.body}>
      <circle cx="60" cy="21" r="14" />
      <rect x="54" y="33" width="12" height="12" rx="4" />
      <rect x="36" y="44" width="48" height="96" rx="16" />
      <rect x="22" y="50" width="13" height="58" rx="6.5" />
      <rect x="85" y="50" width="13" height="58" rx="6.5" />
      <rect x="18" y="108" width="13" height="60" rx="6.5" />
      <rect x="89" y="108" width="13" height="60" rx="6.5" />
      <circle cx="24.5" cy="176" r="7" />
      <circle cx="95.5" cy="176" r="7" />
      <rect x="38" y="138" width="20" height="78" rx="9" />
      <rect x="62" y="138" width="20" height="78" rx="9" />
      <rect x="40" y="214" width="16" height="66" rx="7" />
      <rect x="64" y="214" width="16" height="66" rx="7" />
      <rect x={fig === 0 ? 38 : 40} y="278" width="18" height="9" rx="4" />
      <rect x={fig === 0 ? 64 : 62} y="278" width="18" height="9" rx="4" />
    </g>
  )
}

function Placement({ value, onChange }: { value: string | null; onChange: (z: string) => void }) {
  return (
    <div className={styles.placement}>
      <svg className={styles.figure} viewBox="0 0 270 310" aria-hidden="true" focusable="false">
        {[0, 1].map((fig) => (
          <g key={fig} transform={`translate(${fig === 0 ? 0 : 150} 8)`}>
            <Body fig={fig === 0 ? 0 : 1} />
            {zones.map((z) =>
              z.shapes
                .filter((s) => s.fig === fig)
                .map((s, i) => (
                  <rect
                    key={`${z.id}-${i}`}
                    x={s.x}
                    y={s.y}
                    width={s.w}
                    height={s.h}
                    rx={4}
                    className={value === z.id ? `${styles.zone} ${styles.zoneOn}` : styles.zone}
                    onClick={() => onChange(z.id)}
                  >
                    <title>{z.id}</title>
                  </rect>
                )),
            )}
            <text x="60" y="300" textAnchor="middle" className={styles.figLabel}>
              {fig === 0 ? 'Front' : 'Back'}
            </text>
          </g>
        ))}
      </svg>
      <div className={styles.zoneList} role="group" aria-label="Placement" id="bf-placement" tabIndex={-1}>
        {zones.map((z) => (
          <button key={z.id} type="button" className={styles.zoneBtn} aria-pressed={value === z.id} onClick={() => onChange(z.id)}>
            {z.id}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Booking                                                              */
/* ------------------------------------------------------------------ */

type RefImage = { id: number; url: string; name: string; kb: number }
type Errors = Partial<Record<'idea' | 'placement' | 'name' | 'email' | 'age' | 'agree', string>>
type Prefill = { artist: ArtistId | 'any'; idea: string; size: SizeId }

const MAX_REFS = 6
const MAX_MB = 10

function Booking({ prefill }: { prefill: Prefill }) {
  const [artist, setArtist] = useState<ArtistId | 'any'>(prefill.artist)
  const [idea, setIdea] = useState(prefill.idea)
  const [size, setSize] = useState<SizeId>(prefill.size)
  const [placement, setPlacement] = useState<string | null>(null)
  const [colour, setColour] = useState<'black' | 'colour'>('black')
  const [days, setDays] = useState<string[]>([])
  const [refs, setRefs] = useState<RefImage[]>([])
  const [uploadNote, setUploadNote] = useState('')
  const [dragging, setDragging] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [age, setAge] = useState(false)
  const [agree, setAgree] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [stage, setStage] = useState<'form' | 'review' | 'done'>('form')
  const [reference, setReference] = useState('')
  const urlBag = useRef<Set<string>>(new Set())
  const nextId = useRef(1)
  const topRef = useRef<HTMLElement | null>(null)
  const shownStage = useRef(stage)

  useEffect(() => {
    const bag = urlBag.current
    return () => {
      bag.forEach((u) => URL.revokeObjectURL(u))
      bag.clear()
    }
  }, [])

  useEffect(() => {
    if (shownStage.current === stage) return
    shownStage.current = stage
    const el = topRef.current
    if (!el) return
    el.focus({ preventScroll: true })
    el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' })
  }, [stage])

  const sz = sizes.find((s) => s.id === size) ?? sizes[0]

  function addFiles(list: FileList | null) {
    if (!list) return
    const incoming = Array.from(list)
    const added: RefImage[] = []
    const skipped: string[] = []
    let room = MAX_REFS - refs.length
    for (const file of incoming) {
      if (!file.type.startsWith('image/')) {
        skipped.push(`${file.name} is not an image`)
        continue
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        skipped.push(`${file.name} is over ${MAX_MB}MB`)
        continue
      }
      if (room <= 0) {
        skipped.push(`${file.name} (limit of ${MAX_REFS} reached)`)
        continue
      }
      const url = URL.createObjectURL(file)
      urlBag.current.add(url)
      added.push({ id: nextId.current++, url, name: file.name, kb: Math.round(file.size / 1024) })
      room -= 1
    }
    if (added.length > 0) setRefs((r) => [...r, ...added])
    const parts: string[] = []
    if (added.length > 0) parts.push(`${added.length} image${added.length === 1 ? '' : 's'} added.`)
    if (skipped.length > 0) parts.push(`Skipped: ${skipped.join('; ')}.`)
    setUploadNote(parts.join(' '))
  }

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    addFiles(e.target.files)
    e.target.value = ''
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  function removeRef(id: number) {
    const found = refs.find((r) => r.id === id)
    if (found) {
      URL.revokeObjectURL(found.url)
      urlBag.current.delete(found.url)
      setUploadNote(`Removed ${found.name}.`)
    }
    setRefs((r) => r.filter((x) => x.id !== id))
  }

  function toggleDay(d: string) {
    setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]))
  }

  function review(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const found: Errors = {}
    if (idea.trim().length < 20) found.idea = 'Tell us a bit more: a sentence or two about the idea, at least 20 characters.'
    if (!placement) found.placement = 'Choose where it is going. Pick the closest if it is in between.'
    if (name.trim().length < 2) found.name = 'Enter your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) found.email = 'Enter an email like name@example.com.'
    if (!age) found.age = 'We only tattoo over-18s. Tick to confirm.'
    setErrors(found)
    const order: (keyof Errors)[] = ['idea', 'placement', 'name', 'email', 'age']
    const first = order.find((k) => found[k])
    if (first) {
      const target: Record<string, string> = { idea: 'bf-idea', placement: 'bf-placement', name: 'bf-name', email: 'bf-email', age: 'bf-age' }
      document.getElementById(target[first])?.focus()
      return
    }
    setStage('review')
  }

  function pay() {
    if (!agree) {
      setErrors((er) => ({ ...er, agree: 'Tick to say you have read the deposit terms.' }))
      return
    }
    setReference(`BF-${Date.now().toString(36).toUpperCase().slice(-6)}`)
    setStage('done')
  }

  function startOver() {
    refs.forEach((r) => {
      URL.revokeObjectURL(r.url)
      urlBag.current.delete(r.url)
    })
    setRefs([])
    setIdea('')
    setPlacement(null)
    setDays([])
    setAgree(false)
    setErrors({})
    setUploadNote('')
    setStage('form')
  }

  const summary = (
    <aside className={styles.deposit} aria-label="Deposit summary">
      <p className={styles.depositHead}>Deposit</p>
      <p className={styles.depositBig}>£{sz.deposit}</p>
      <p className={styles.depositFine}>Taken off the final price on the day.</p>
      <dl className={styles.depositList}>
        <div>
          <dt>Artist</dt>
          <dd>{artistName(artist)}</dd>
        </div>
        <div>
          <dt>Session</dt>
          <dd>
            {sz.label}, {sz.price}
          </dd>
        </div>
        <div>
          <dt>Placement</dt>
          <dd>{placement ?? 'Not chosen yet'}</dd>
        </div>
        <div>
          <dt>References</dt>
          <dd>{refs.length === 0 ? 'None yet' : `${refs.length} image${refs.length === 1 ? '' : 's'}`}</dd>
        </div>
      </dl>
    </aside>
  )

  if (stage === 'done') {
    return (
      <div className={styles.done} ref={(el) => { topRef.current = el }} tabIndex={-1} role="status">
        <FernMark className={styles.doneMark} />
        <p className={styles.doneRef}>Reference {reference}</p>
        <h3 className={styles.doneTitle}>Idea received, {name.trim().split(' ')[0]}.</h3>
        <p className={styles.doneBody}>
          {artistName(artist)} will look at your idea and references and reply by email within three working days with
          a sketch plan and dates. Your £{sz.deposit} deposit holds your place and comes off the final price.
        </p>
        <p className={styles.demoNote}>Demo only: nothing has been sent and no payment was taken.</p>
        <button type="button" className={styles.btnLine} onClick={startOver}>
          Start another idea
        </button>
      </div>
    )
  }

  if (stage === 'review') {
    return (
      <div className={styles.bookGrid}>
        <div className={styles.review} ref={(el) => { topRef.current = el }} tabIndex={-1}>
          <h3 className={styles.formH}>Check it over</h3>
          <dl className={styles.reviewList}>
            <div>
              <dt>The idea</dt>
              <dd>{idea.trim()}</dd>
            </div>
            <div>
              <dt>Artist</dt>
              <dd>{artistName(artist)}</dd>
            </div>
            <div>
              <dt>Session</dt>
              <dd>
                {sz.label}, {sz.price}
              </dd>
            </div>
            <div>
              <dt>Placement</dt>
              <dd>{placement}</dd>
            </div>
            <div>
              <dt>Ink</dt>
              <dd>{colour === 'black' ? 'Black and grey' : 'Colour'}</dd>
            </div>
            <div>
              <dt>Days that suit</dt>
              <dd>{days.length === 0 ? 'Any day' : DAYS.filter((d) => days.includes(d)).join(', ')}</dd>
            </div>
            <div>
              <dt>Reply to</dt>
              <dd>
                {name.trim()}, {email.trim()}
              </dd>
            </div>
          </dl>
          {refs.length > 0 ? (
            <ul className={styles.thumbs}>
              {refs.map((r) => (
                <li key={r.id} className={styles.thumb}>
                  {/* Object URLs from the visitor's own files; next/image cannot load these. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.url} alt={`Reference: ${r.name}`} />
                </li>
              ))}
            </ul>
          ) : null}
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => {
                setAgree(e.target.checked)
                if (e.target.checked) setErrors((er) => ({ ...er, agree: undefined }))
              }}
              aria-describedby={errors.agree ? 'bf-agree-e' : undefined}
            />
            <span>
              The deposit comes off the final price. It can move to a new date once with 72 hours’ notice, and is not
              refunded if I cancel.
            </span>
          </label>
          {errors.agree ? (
            <p className={styles.err} id="bf-agree-e" role="alert">
              {errors.agree}
            </p>
          ) : null}
          <div className={styles.formActions}>
            <button type="button" className={styles.btnLine} onClick={() => setStage('form')}>
              Edit the details
            </button>
            <button type="button" className={styles.btn} onClick={pay}>
              Pay £{sz.deposit} deposit
            </button>
          </div>
        </div>
        {summary}
      </div>
    )
  }

  return (
    <div className={styles.bookGrid}>
      <form className={styles.form} onSubmit={review} noValidate ref={(el) => { topRef.current = el }} tabIndex={-1}>
        <fieldset className={styles.fieldset}>
          <legend className={styles.formH}>The idea</legend>
          <div className={styles.field}>
            <label htmlFor="bf-idea">Describe what you have in mind</label>
            <textarea
              id="bf-idea"
              className={styles.input}
              rows={5}
              value={idea}
              placeholder="A fern that curls round my forearm, fine line, about the length of my hand…"
              aria-invalid={errors.idea ? true : undefined}
              aria-describedby={errors.idea ? 'bf-idea-e' : 'bf-idea-h'}
              onChange={(e) => setIdea(e.target.value)}
            />
            {errors.idea ? (
              <p className={styles.err} id="bf-idea-e">
                {errors.idea}
              </p>
            ) : (
              <p className={styles.hint} id="bf-idea-h">
                Rough is fine. Say what it means to you if that helps.
              </p>
            )}
          </div>

          <div className={styles.field}>
            <span className={styles.labelText} id="bf-refs-label">
              Reference images <span className={styles.optional}>Optional, up to {MAX_REFS}</span>
            </span>
            <label
              className={dragging ? `${styles.drop} ${styles.dropOn}` : styles.drop}
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                className={styles.fileInput}
                onChange={onPick}
                aria-labelledby="bf-refs-label"
                disabled={refs.length >= MAX_REFS}
              />
              <span className={styles.dropText}>
                {refs.length >= MAX_REFS ? 'That’s the most we need. Remove one to swap it.' : 'Drop photos here, or choose files'}
              </span>
              <span className={styles.dropHint}>Pinterest screenshots, your own sketch, a photo of the spot. Images only, {MAX_MB}MB each.</span>
            </label>
            <p className={styles.hint} aria-live="polite">
              {uploadNote}
            </p>
            {refs.length > 0 ? (
              <ul className={styles.thumbs}>
                {refs.map((r) => (
                  <li key={r.id} className={styles.thumb}>
                    {/* Object URLs from the visitor's own files; next/image cannot load these. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.url} alt={`Reference: ${r.name}`} />
                    <button type="button" className={styles.thumbX} onClick={() => removeRef(r.id)}>
                      <span aria-hidden="true">×</span>
                      <span className={styles.sr}>Remove {r.name}</span>
                    </button>
                    <span className={styles.thumbName}>{r.kb > 1024 ? `${(r.kb / 1024).toFixed(1)}MB` : `${r.kb}KB`}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend className={styles.formH}>Where it’s going</legend>
          <Placement
            value={placement}
            onChange={(z) => {
              setPlacement(z)
              if (errors.placement) setErrors((er) => ({ ...er, placement: undefined }))
            }}
          />
          {errors.placement ? (
            <p className={styles.err} role="alert">
              {errors.placement}
            </p>
          ) : null}
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend className={styles.formH}>Artist and session</legend>
          <div className={styles.radioRow}>
            {(['any', 'ines', 'rory', 'mae'] as const).map((a) => (
              <label key={a} className={styles.radio}>
                <input type="radio" name="bf-artist" checked={artist === a} onChange={() => setArtist(a)} />
                <span>{a === 'any' ? 'No preference' : artistName(a)}</span>
              </label>
            ))}
          </div>
          <div className={styles.sizeRow}>
            {sizes.map((s) => (
              <label key={s.id} className={styles.sizeCard}>
                <input type="radio" name="bf-size" checked={size === s.id} onChange={() => setSize(s.id)} />
                <span className={styles.sizeTop}>
                  <span className={styles.sizeName}>{s.label}</span>
                  <span className={styles.sizePrice}>{s.price}</span>
                </span>
                <span className={styles.sizeDetail}>{s.detail}</span>
                <span className={styles.sizeDep}>£{s.deposit} deposit</span>
              </label>
            ))}
          </div>
          <div className={styles.radioRow}>
            <label className={styles.radio}>
              <input type="radio" name="bf-ink" checked={colour === 'black'} onChange={() => setColour('black')} />
              <span>Black and grey</span>
            </label>
            <label className={styles.radio}>
              <input type="radio" name="bf-ink" checked={colour === 'colour'} onChange={() => setColour('colour')} />
              <span>Colour</span>
            </label>
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend className={styles.formH}>Days that suit</legend>
          <p className={styles.hint}>Leave them all unticked if any day works.</p>
          <div className={styles.radioRow}>
            {DAYS.map((d) => (
              <label key={d} className={styles.radio}>
                <input type="checkbox" checked={days.includes(d)} onChange={() => toggleDay(d)} />
                <span>{d.slice(0, 3)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend className={styles.formH}>You</legend>
          <div className={styles.twoUp}>
            <div className={styles.field}>
              <label htmlFor="bf-name">Name</label>
              <input
                id="bf-name"
                className={styles.input}
                type="text"
                autoComplete="name"
                value={name}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? 'bf-name-e' : undefined}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name ? (
                <p className={styles.err} id="bf-name-e">
                  {errors.name}
                </p>
              ) : null}
            </div>
            <div className={styles.field}>
              <label htmlFor="bf-email">Email</label>
              <input
                id="bf-email"
                className={styles.input}
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? 'bf-email-e' : undefined}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email ? (
                <p className={styles.err} id="bf-email-e">
                  {errors.email}
                </p>
              ) : null}
            </div>
          </div>
          <label className={styles.check}>
            <input
              id="bf-age"
              type="checkbox"
              checked={age}
              aria-describedby={errors.age ? 'bf-age-e' : undefined}
              onChange={(e) => setAge(e.target.checked)}
            />
            <span>I’m 18 or over and will bring photo ID.</span>
          </label>
          {errors.age ? (
            <p className={styles.err} id="bf-age-e">
              {errors.age}
            </p>
          ) : null}
        </fieldset>

        <div className={styles.formActions}>
          <p className={styles.hint}>Next: check it over, then pay the £{sz.deposit} deposit.</p>
          <button type="submit" className={styles.btn}>
            Review and pay deposit
          </button>
        </div>
      </form>
      {summary}
    </div>
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
        <a href="#bf-top" className={styles.brand} onClick={(e) => go(e, 'bf-top')}>
          <FernMark className={styles.mark} />
          <span className={styles.brandName}>Black Fern</span>
        </a>
        <nav className={styles.navLinks} aria-label="Black Fern Tattoo">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} className={styles.navLink} onClick={(e) => go(e, n.id)}>
              {n.label}
            </a>
          ))}
        </nav>
        <a href="#bf-book" className={`${styles.btn} ${styles.navCta}`} onClick={(e) => go(e, 'bf-book')}>
          Start a booking
        </a>
        <button type="button" className={styles.menuBtn} aria-expanded={open} aria-controls="bf-menu" onClick={() => setOpen((o) => !o)}>
          <span className={styles.sr}>{open ? 'Close menu' : 'Open menu'}</span>
          <span className={open ? `${styles.bars} ${styles.barsOpen}` : styles.bars} aria-hidden="true" />
        </button>
      </div>
      <div id="bf-menu" className={styles.menu} hidden={!open}>
        <nav aria-label="Black Fern Tattoo, mobile">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} className={styles.menuLink} onClick={(e) => go(e, n.id)}>
              {n.label}
            </a>
          ))}
          <a href="#bf-book" className={styles.btn} onClick={(e) => go(e, 'bf-book')}>
            Start a booking
          </a>
        </nav>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Site                                                                 */
/* ------------------------------------------------------------------ */

export function Site(): React.JSX.Element {
  const [filterArtist, setFilterArtist] = useState<ArtistId | 'all'>('all')
  const [prefill, setPrefill] = useState<Prefill & { n: number }>({ artist: 'any', idea: '', size: 'small', n: 0 })

  function seeWork(id: ArtistId) {
    setFilterArtist(id)
    scrollToId('bf-work')
  }

  function request(p: Piece) {
    setPrefill((cur) => ({
      artist: p.artist,
      idea: `Flash from the wall: “${p.title}” (${p.size}). `,
      size: p.id === 'band' ? 'half' : 'small',
      n: cur.n + 1,
    }))
    window.setTimeout(() => scrollToId('bf-book'), 0)
  }

  return (
    <div className={styles.root} id="bf-top" tabIndex={-1}>
      <Nav />

      <section className={styles.hero} aria-labelledby="bf-h1">
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Custom work and flash. Three resident artists in Manchester.</p>
          <h1 id="bf-h1" className={styles.h1}>
            Tell us the idea. We’ll draw the rest.
          </h1>
          <p className={styles.sub}>
            Browse each artist’s style, send your idea with references, and pay the deposit to lock the date.
          </p>
          <div className={styles.ctas}>
            <a href="#bf-book" className={styles.btn} onClick={(e) => { e.preventDefault(); scrollToId('bf-book') }}>
              Start a booking
            </a>
            <a href="#bf-artists" className={styles.btnLine} onClick={(e) => { e.preventDefault(); scrollToId('bf-artists') }}>
              Our artists
            </a>
          </div>
        </div>
        <div className={styles.heroArt}>
          <HeroFern className={styles.heroFern} draw />
          <div className={styles.heroCard}>
            <FlashArt id="moth" className={styles.heroCardSvg} />
            <span className={styles.heroCardCap}>Moth and new moon, by Ines</span>
          </div>
        </div>
        <ul className={styles.facts}>
          <li>Tuesday to Saturday, 11am to 7pm</li>
          <li>Deposits from £30, off the final price</li>
          <li>Over-18s only, photo ID on the day</li>
        </ul>
      </section>

      <section id="bf-artists" className={styles.section} tabIndex={-1} aria-labelledby="bf-artists-h">
        <div className={styles.head}>
          <h2 id="bf-artists-h" className={styles.h2}>
            Three artists, three hands
          </h2>
          <p className={styles.lede}>Each one draws your piece from scratch. Choose by style, not by who has the first gap.</p>
        </div>
        <ul className={styles.artists}>
          {artists.map((a) => (
            <li key={a.id} className={styles.artist}>
              <div className={styles.artistArt}>
                <FlashArt id={a.sample} className={styles.artistSvg} />
              </div>
              <div className={styles.artistText}>
                <h3 className={styles.h3}>{a.name}</h3>
                <p className={styles.artistStyles}>{a.styles.join(' and ')}</p>
                <p className={styles.artistBody}>{a.body}</p>
                <p className={styles.artistDays}>In the studio {a.days}</p>
                <button type="button" className={styles.btnLine} onClick={() => seeWork(a.id)}>
                  See {a.name.split(' ')[0]}’s work
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section id="bf-work" className={styles.section} tabIndex={-1} aria-labelledby="bf-work-h">
        <div className={styles.head}>
          <h2 id="bf-work-h" className={styles.h2}>
            The flash wall
          </h2>
          <p className={styles.lede}>Ready-drawn pieces, each tattooed once. Open one to see sizes, or ask for it as it is.</p>
        </div>
        <Work artist={filterArtist} setArtist={setFilterArtist} onRequest={request} />
      </section>

      <section id="bf-prices" className={styles.section} tabIndex={-1} aria-labelledby="bf-prices-h">
        <div className={styles.head}>
          <h2 id="bf-prices-h" className={styles.h2}>
            Prices
          </h2>
          <p className={styles.lede}>Priced by time, agreed before the needle goes on. The deposit comes off the total.</p>
        </div>
        <ul className={styles.priceList}>
          {sizes.map((s) => (
            <li key={s.id} className={styles.priceRow}>
              <span className={styles.priceName}>{s.label}</span>
              <span className={styles.priceDetail}>{s.detail}</span>
              <span className={styles.priceAmt}>{s.price}</span>
              <span className={styles.priceDep}>£{s.deposit} deposit</span>
            </li>
          ))}
        </ul>
        <p className={styles.priceFine}>
          Cover-ups and reworks start with a free consultation. Touch-ups within three months are free.
        </p>
      </section>

      <section id="bf-book" className={styles.section} tabIndex={-1} aria-labelledby="bf-book-h">
        <div className={styles.head}>
          <h2 id="bf-book-h" className={styles.h2}>
            Send us your idea
          </h2>
          <p className={styles.lede}>
            Everything the artist needs in one go: the idea, your references, where it’s going. You’ll get a reply with
            dates within three working days.
          </p>
        </div>
        <Booking key={prefill.n} prefill={prefill} />
      </section>

      <section id="bf-care" className={styles.section} tabIndex={-1} aria-labelledby="bf-care-h">
        <div className={styles.careGrid}>
          <div className={styles.head}>
            <h2 id="bf-care-h" className={styles.h2}>
              Aftercare
            </h2>
            <p className={styles.lede}>The same card you’ll take home, here for when you lose it.</p>
          </div>
          <div className={styles.care}>
            {care.map((c) => (
              <details key={c.q} className={styles.careItem}>
                <summary>{c.q}</summary>
                <p>{c.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.final} aria-labelledby="bf-final-h">
        <HeroFern className={styles.finalFern} draw={false} />
        <h2 id="bf-final-h" className={styles.finalH}>
          Got the idea? That’s enough to start.
        </h2>
        <a href="#bf-book" className={styles.btn} onClick={(e) => { e.preventDefault(); scrollToId('bf-book') }}>
          Start a booking
        </a>
      </section>

      <footer className={styles.footer}>
        <div>
          <p className={styles.footName}>Black Fern Tattoo</p>
          <p>Tattoo studio, Manchester. By appointment, with a few walk-in flash days.</p>
        </div>
        <p>Tue–Sat · 11am–7pm</p>
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
            <FernMark className={styles.mark} />
            <span className={styles.brandName}>Black Fern</span>
          </span>
          <span className={styles.navLinks}>
            {NAV.map((n) => (
              <span key={n.id} className={styles.navLink}>
                {n.label}
              </span>
            ))}
          </span>
          <span className={`${styles.btn} ${styles.navCta}`}>Start a booking</span>
        </div>
      </div>
      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Custom work and flash. Three resident artists in Manchester.</p>
          <p className={styles.h1}>Tell us the idea. We’ll draw the rest.</p>
          <p className={styles.sub}>Browse each artist’s style, send your idea with references, and pay the deposit to lock the date.</p>
          <div className={styles.ctas}>
            <span className={styles.btn}>Start a booking</span>
            <span className={styles.btnLine}>Our artists</span>
          </div>
        </div>
        <div className={styles.heroArt}>
          <HeroFern className={styles.heroFern} draw={false} />
          <div className={styles.heroCard}>
            <FlashArt id="moth" className={styles.heroCardSvg} />
            <span className={styles.heroCardCap}>Moth and new moon, by Ines</span>
          </div>
        </div>
      </div>
    </div>
  )
}
