'use client'

import { useEffect, useState, type JSX, type MouseEvent } from 'react'
import styles from './styles.module.css'
import { FAQS, NO_ADDONS, STEPS, type Addons, type PackageId } from './data'
import { Calendar, Enquiry, Packages, cx } from './planner'
import { GrainDefs, Mark, Scene, type SceneKind } from './scenes'
import { isoOf, readToday } from './time'

const LINKS = [
  { id: 'hl-approach', label: 'Approach' },
  { id: 'hl-work', label: 'Work' },
  { id: 'hl-packages', label: 'Packages' },
  { id: 'hl-dates', label: 'Dates' },
]

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
  const [today, setToday] = useState<number | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [enquiryDate, setEnquiryDate] = useState('')
  const [pkg, setPkg] = useState<PackageId>('half')
  const [addons, setAddons] = useState<Addons>(NO_ADDONS)

  useEffect(() => {
    const tick = () => setToday(readToday())
    const first = window.setTimeout(tick, 0)
    const timer = window.setInterval(tick, 60_000)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(timer)
    }
  }, [])

  const enquireAbout = (serial: number) => {
    setEnquiryDate(isoOf(serial))
    scrollToId('hl-enquire')
  }

  return (
    <div className={styles.root}>
      <GrainDefs />
      <div className={styles.frame}>
        <Nav open={menuOpen} onToggle={() => setMenuOpen((o) => !o)} onClose={() => setMenuOpen(false)} />
        <Hero />
        <Approach />
        <Work />

        <section id="hl-dates" className={styles.section} aria-labelledby="hl-dates-h" tabIndex={-1}>
          <div className={styles.head}>
            <p className={styles.label}>Availability</p>
            <h2 id="hl-dates-h" className={styles.h2}>
              Is your date <em>free?</em>
            </h2>
            <p className={styles.headLede}>The diary, live. Tap a day to check it, then send an enquiry straight from here.</p>
          </div>
          <Calendar
            today={today}
            selected={selected}
            onSelect={(s) => {
              setSelected(s)
              setEnquiryDate(isoOf(s))
            }}
            onEnquire={enquireAbout}
          />
        </section>

        <section id="hl-packages" className={styles.section} aria-labelledby="hl-packages-h" tabIndex={-1}>
          <div className={styles.head}>
            <p className={styles.label}>Packages</p>
            <h2 id="hl-packages-h" className={styles.h2}>
              Three ways to <em>keep the day</em>
            </h2>
            <p className={styles.headLede}>
              Every package includes a call beforehand, a shared planning form and a private online gallery. Add what
              you need and the total updates as you go.
            </p>
          </div>
          <Packages pkg={pkg} setPkg={setPkg} addons={addons} setAddons={setAddons} onUse={() => scrollToId('hl-enquire')} />
        </section>

        <How />

        <section id="hl-enquire" className={styles.enquire} aria-labelledby="hl-enquire-h" tabIndex={-1}>
          <div className={styles.enqIntro}>
            <p className={styles.label}>Enquire</p>
            <h2 id="hl-enquire-h" className={styles.h2}>
              Tell me a little about <em>your day</em>
            </h2>
            <p className={styles.headLede}>
              A few details are plenty. I reply within two working days, usually with times for a short video call.
            </p>
            <ul className={styles.promises}>
              <li>No obligation, and no chasing</li>
              <li>A clear quote before anything is booked</li>
              <li>Your date held for seven days while we talk</li>
            </ul>
          </div>
          <Enquiry
            today={today}
            date={enquiryDate}
            setDate={setEnquiryDate}
            pkg={pkg}
            addons={addons}
            onEditPackage={() => scrollToId('hl-packages')}
          />
        </section>

        <Faq />
        <Closing />
        <Footer />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function Nav({ open, onToggle, onClose }: { open: boolean; onToggle: () => void; onClose: () => void }): JSX.Element {
  return (
    <div
      className={styles.nav}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <div className={styles.navIn}>
        <a
          href="#hl-top"
          className={styles.brand}
          onClick={(e) => {
            onClose()
            jump(e, 'hl-top')
          }}
        >
          <Mark />
          <span>Harbour Light</span>
        </a>
        <nav aria-label="Harbour Light" className={styles.navLinks}>
          <ul id="hl-menu" className={cx(styles.links, open && styles.linksOpen)}>
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
          href="#hl-enquire"
          className={styles.navCta}
          onClick={(e) => {
            onClose()
            jump(e, 'hl-enquire')
          }}
        >
          Enquire
        </a>
        <button type="button" className={styles.menuBtn} aria-expanded={open} aria-controls="hl-menu" onClick={onToggle}>
          <span className={cx(styles.burger, open && styles.burgerOpen)} aria-hidden="true" />
          <span className={styles.sr}>{open ? 'Close menu' : 'Open menu'}</span>
        </button>
      </div>
    </div>
  )
}

function Hero(): JSX.Element {
  return (
    <section id="hl-top" className={styles.hero} aria-labelledby="hl-h1" tabIndex={-1}>
      <div className={styles.heroText}>
        <p className={styles.kicker}>Weddings and elopements · Cornwall</p>
        <h1 id="hl-h1" className={styles.h1}>
          Quiet, <em>honest</em> photographs of your day.
        </h1>
        <p className={styles.lede}>
          Check your date, see what’s included, and get your gallery delivered online within six weeks.
        </p>
        <div className={styles.ctas}>
          <a href="#hl-dates" className={styles.btnSolid} onClick={(e) => jump(e, 'hl-dates')}>
            Check my date
          </a>
          <a href="#hl-packages" className={styles.btnGhost} onClick={(e) => jump(e, 'hl-packages')}>
            Packages
          </a>
        </div>
      </div>
      <figure className={styles.heroFrame}>
        <div className={styles.heroPhoto}>
          <Scene
            kind="headland"
            label="Drawing: a couple standing on a clifftop at dusk, the sea below, a lighthouse on the far headland"
          />
        </div>
        <figcaption className={styles.caption}>
          <span>No. 01</span> The headland, last light
          <span className={styles.captionNote}>Drawn for this concept site</span>
        </figcaption>
      </figure>
    </section>
  )
}

function Approach(): JSX.Element {
  const principles = [
    { t: 'Mostly unseen', b: 'I spend most of the day at the edge of things, so people behave like themselves.' },
    { t: 'Twenty minutes, not two hours', b: 'Portraits are a short walk together, with something to do rather than a pose to hold.' },
    { t: 'Honest colour', b: 'Edited to look like the day felt. No heavy filters that date in five years.' },
  ]
  return (
    <section id="hl-approach" className={styles.approach} aria-labelledby="hl-approach-h" tabIndex={-1}>
      <figure className={styles.approachPhoto}>
        <div className={styles.portrait}>
          <Scene kind="doorway" label="Drawing: a bride silhouetted in a bright chapel doorway" />
        </div>
        <figcaption className={styles.caption}>
          <span>No. 02</span> The chapel door
        </figcaption>
      </figure>
      <div className={styles.approachText}>
        <p className={styles.label}>The approach</p>
        <h2 id="hl-approach-h" className={styles.h2}>
          I would rather you <em>forgot</em> I was there.
        </h2>
        <p className={styles.body}>
          Harbour Light is one photographer working the coast and the lanes behind it. I photograph a small number of
          weddings each year, so each one gets proper time before, during and after.
        </p>
        <ol className={styles.principles}>
          {principles.map((p, i) => (
            <li key={p.t}>
              <span className={styles.mono}>{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3>{p.t}</h3>
                <p>{p.b}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

const FRAMES: { kind: SceneKind; caption: string; shape: string; label: string }[] = [
  { kind: 'beach', caption: 'The walk back from the cove', shape: 'tall', label: 'Drawing: a couple walking along the tideline, footprints behind them' },
  { kind: 'lights', caption: 'Festoons, after dark', shape: 'wide', label: 'Drawing: a marquee at night under strings of warm lights' },
  { kind: 'rings', caption: 'Before the ceremony', shape: 'tall', label: 'Drawing: two gold rings resting on linen' },
  { kind: 'dance', caption: 'First dance', shape: 'wide', label: 'Drawing: a couple dancing in a warm room full of soft lights' },
  { kind: 'confetti', caption: 'Out of the church', shape: 'tall', label: 'Drawing: a couple under a shower of confetti against a stone wall' },
]

function Work(): JSX.Element {
  return (
    <section id="hl-work" className={styles.section} aria-labelledby="hl-work-h" tabIndex={-1}>
      <div className={styles.headRow}>
        <div className={styles.head}>
          <p className={styles.label}>Work</p>
          <h2 id="hl-work-h" className={styles.h2}>
            A few <em>frames</em>
          </h2>
        </div>
        <p className={styles.small}>
          On this concept site the photographs are drawn. A real build would show your own galleries here.
        </p>
      </div>
      <ul className={styles.gallery}>
        {FRAMES.map((f, i) => (
          <li key={f.kind} className={cx(styles.frameItem, f.shape === 'wide' ? styles.frameWide : styles.frameTall)}>
            <figure>
              <div className={styles.photo}>
                <Scene kind={f.kind} label={f.label} />
              </div>
              <figcaption className={styles.caption}>
                <span>No. {String(i + 3).padStart(2, '0')}</span> {f.caption}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}

function How(): JSX.Element {
  return (
    <section className={styles.section} aria-labelledby="hl-how-h">
      <div className={styles.head}>
        <p className={styles.label}>How it works</p>
        <h2 id="hl-how-h" className={styles.h2}>
          From first hello to <em>your gallery</em>
        </h2>
      </div>
      <ol className={styles.steps}>
        {STEPS.map((s, i) => (
          <li key={s.title}>
            <span className={styles.stepNo}>{String(i + 1).padStart(2, '0')}</span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Faq(): JSX.Element {
  return (
    <section className={styles.section} aria-labelledby="hl-faq-h">
      <div className={styles.head}>
        <p className={styles.label}>Questions</p>
        <h2 id="hl-faq-h" className={styles.h2}>
          The things <em>people ask</em>
        </h2>
      </div>
      <div className={styles.faqList}>
        {FAQS.map((f) => (
          <details key={f.q} className={styles.faqItem}>
            <summary>
              <span>{f.q}</span>
              <span className={styles.chev} aria-hidden="true" />
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
    <section className={styles.closing} aria-labelledby="hl-close-h">
      <div className={styles.closingBg} aria-hidden="true">
        <Scene kind="night" />
      </div>
      <div className={styles.closingText}>
        <p className={styles.kickerLight}>Next year’s Saturdays are going</p>
        <h2 id="hl-close-h" className={styles.closingTitle}>
          Your date might <em>still be free.</em>
        </h2>
        <a href="#hl-dates" className={styles.btnLight} onClick={(e) => jump(e, 'hl-dates')}>
          Check my date
        </a>
      </div>
    </section>
  )
}

function Footer(): JSX.Element {
  return (
    <footer className={styles.footer}>
      <div className={styles.footBrand}>
        <Mark />
        <span>Harbour Light</span>
      </div>
      <p>Wedding photographer · Cornwall</p>
      <p>Replies within two working days</p>
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
              <span>Harbour Light</span>
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
            <span className={styles.navCta}>Enquire</span>
          </div>
        </div>
        <div className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.kicker}>Weddings and elopements · Cornwall</p>
            <p className={styles.h1}>
              Quiet, <em>honest</em> photographs of your day.
            </p>
            <p className={styles.lede}>
              Check your date, see what’s included, and get your gallery delivered online within six weeks.
            </p>
            <div className={styles.ctas}>
              <span className={styles.btnSolid}>Check my date</span>
              <span className={styles.btnGhost}>Packages</span>
            </div>
          </div>
          <div className={styles.heroFrame}>
            <div className={styles.heroPhoto}>
              <Scene kind="headland" lean />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
