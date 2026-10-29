'use client'

import { useEffect, useState } from 'react'
import type { JSX, MouseEvent } from 'react'
import { BIZ, areas, faqs, howSteps, navLinks, services } from './data'
import type { ProblemId } from './data'
import { AreaMap, Arrow, Boiler, Check, Mark } from './parts'
import { Booking } from './booking'
import { Triage } from './triage'
import styles from './styles.module.css'

function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  el.focus({ preventScroll: true })
}

export function Site(): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false)
  const [problem, setProblem] = useState<ProblemId | null>(null)

  useEffect(() => {
    if (!menuOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  function jump(e: MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault()
    setMenuOpen(false)
    scrollToId(id)
  }

  function bookFromTriage(p: ProblemId | null) {
    if (p) setProblem(p)
    scrollToId('th-book')
  }

  return (
    <div className={styles.site}>
      <header className={styles.nav}>
        <div className={styles.navIn}>
          <a href="#th-top" className={styles.brand} onClick={(e) => jump(e, 'th-top')}>
            <Mark />
            <span className={styles.brandText}>
              <b>Thornley</b> Heating
            </span>
          </a>
          <nav aria-label="Thornley Heating" className={styles.navLinks}>
            {navLinks.map((l) => (
              <a key={l.id} href={`#${l.id}`} onClick={(e) => jump(e, l.id)}>
                {l.label}
              </a>
            ))}
          </nav>
          <a href="#th-book" className={`${styles.btnRed} ${styles.navCta}`} onClick={(e) => jump(e, 'th-book')}>
            Book a visit
          </a>
          <button
            type="button"
            className={styles.burger}
            aria-expanded={menuOpen}
            aria-controls="th-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className={styles.sr}>{menuOpen ? 'Close menu' : 'Open menu'}</span>
            <span className={`${styles.burgerBars} ${menuOpen ? styles.burgerX : ''}`} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </button>
        </div>
        <div id="th-menu" className={`${styles.menu} ${menuOpen ? styles.menuOpen : ''}`} hidden={!menuOpen}>
          {navLinks.map((l) => (
            <a key={l.id} href={`#${l.id}`} onClick={(e) => jump(e, l.id)}>
              {l.label}
              <Arrow />
            </a>
          ))}
          <a href="#th-book" className={styles.btnRed} onClick={(e) => jump(e, 'th-book')}>
            Book a visit
          </a>
        </div>
      </header>

      {/* Hero */}
      <section id="th-top" tabIndex={-1} className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.kicker}>
            <span className={styles.pulse} aria-hidden="true" />
            Boiler down?
          </p>
          <h1 className={styles.h1}>
            We&rsquo;ll have you <em className={styles.warm}>warm</em> again today.
          </h1>
          <p className={styles.lede}>
            Gas Safe registered heating engineers covering Wakefield and the district. A fixed price before any work
            starts.
          </p>
          <div className={styles.ctas}>
            <a href="#th-book" className={styles.btnRed} onClick={(e) => jump(e, 'th-book')}>
              Book a visit <Arrow />
            </a>
            <a href="#th-prices" className={styles.btnGhost} onClick={(e) => jump(e, 'th-prices')}>
              Get a price
            </a>
          </div>
          <ul className={styles.facts}>
            <li>
              <b>Before 11am</b>
              <span>same-day visit</span>
            </li>
            <li>
              <b>Price first</b>
              <span>before a spanner</span>
            </li>
            <li>
              <b>Text alerts</b>
              <span>when we set off</span>
            </li>
          </ul>
        </div>
        <div className={styles.heroArt}>
          <div className={styles.heroDisc} aria-hidden="true" />
          <Boiler />
          <div className={`${styles.float} ${styles.floatA}`} aria-hidden="true">
            <span className={styles.floatK}>Next free window</span>
            <b>Today · 2pm – 4pm</b>
          </div>
          <div className={`${styles.float} ${styles.floatB}`} aria-hidden="true">
            <span className={styles.floatK}>Boiler repair</span>
            <b>From £85, fixed</b>
          </div>
        </div>
      </section>

      {/* Emergency triage */}
      <section id="th-emergency" tabIndex={-1} className={`${styles.section} ${styles.emergency}`} aria-labelledby="th-emergency-h">
        <div className={styles.wrap}>
          <div className={styles.secHead}>
            <p className={styles.eyebrow}>Thirty-second check</p>
            <h2 id="th-emergency-h" className={styles.h2}>
              Is it an emergency?
            </h2>
            <p className={styles.secLede}>
              Answer honestly and we will tell you what to do right now, including when to put the phone down on us
              and call someone else.
            </p>
          </div>
          <Triage onBook={bookFromTriage} />
        </div>
      </section>

      {/* Prices */}
      <section id="th-prices" tabIndex={-1} className={styles.section} aria-labelledby="th-prices-h">
        <div className={styles.wrap}>
          <div className={styles.secHeadRow}>
            <div>
              <p className={styles.eyebrow}>Prices</p>
              <h2 id="th-prices-h" className={styles.h2}>
                The figure before the spanner.
              </h2>
            </div>
            <p className={styles.secLede}>
              Repairs are a fixed price, agreed on the day after diagnosis. If you decide not to go ahead you pay the
              £45 call-out only.
            </p>
          </div>
          <ul className={styles.priceGrid}>
            {services.map((s, i) => (
              <li key={s.name} className={styles.priceCard} style={{ animationDelay: `${i * 60}ms` }}>
                <div className={styles.priceTop}>
                  <h3 className={styles.h3}>{s.name}</h3>
                  {s.tag ? <span className={styles.tag}>{s.tag}</span> : null}
                </div>
                <p className={styles.price}>{s.price}</p>
                <p className={styles.muted}>{s.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Booking */}
      <section id="th-book" tabIndex={-1} className={`${styles.section} ${styles.bookSec}`} aria-labelledby="th-book-h">
        <div className={`${styles.wrap} ${styles.bookWrap}`}>
          <div className={styles.bookAside}>
            <p className={styles.eyebrowLight}>Book a visit</p>
            <h2 id="th-book-h" className={`${styles.h2} ${styles.h2Light}`}>
              Five taps to a warm house.
            </h2>
            <p className={styles.bookLede}>
              Tell us what is wrong, pick a day and a two-hour window. We confirm by text, then text again when the
              engineer is on the way.
            </p>
            <ul className={styles.bookPoints}>
              <li>
                <Check /> Only genuinely free windows are shown
              </li>
              <li>
                <Check /> No payment taken to book
              </li>
              <li>
                <Check /> Fixed price agreed on the day
              </li>
            </ul>
          </div>
          <Booking problem={problem} onProblem={setProblem} />
        </div>
      </section>

      {/* How it works */}
      <section id="th-how" tabIndex={-1} className={styles.section} aria-labelledby="th-how-h">
        <div className={styles.wrap}>
          <div className={styles.secHead}>
            <p className={styles.eyebrow}>How it works</p>
            <h2 id="th-how-h" className={styles.h2}>
              From cold radiators to warm hands.
            </h2>
          </div>
          <ol className={styles.how}>
            {howSteps.map((s, i) => (
              <li key={s.title} className={styles.howStep}>
                <span className={styles.howNum}>{String(i + 1).padStart(2, '0')}</span>
                <h3 className={styles.h3}>{s.title}</h3>
                <p className={styles.muted}>{s.body}</p>
              </li>
            ))}
          </ol>
          <div className={styles.thermo} aria-hidden="true">
            <span>12°</span>
            <div className={styles.thermoBar}>
              <i />
            </div>
            <span>21°</span>
          </div>
        </div>
      </section>

      {/* Area + hours */}
      <section id="th-area" tabIndex={-1} className={`${styles.section} ${styles.areaSec}`} aria-labelledby="th-area-h">
        <div className={`${styles.wrap} ${styles.areaWrap}`}>
          <div>
            <p className={styles.eyebrow}>Where and when</p>
            <h2 id="th-area-h" className={styles.h2}>
              Wakefield and about eight miles round.
            </h2>
            <ul className={styles.areaList}>
              {areas.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <table className={styles.hours}>
              <caption className={styles.sr}>Opening hours</caption>
              <tbody>
                <tr>
                  <th scope="row">Monday – Friday</th>
                  <td>8am – 6pm</td>
                </tr>
                <tr>
                  <th scope="row">Saturday</th>
                  <td>8am – 6pm</td>
                </tr>
                <tr>
                  <th scope="row">Sunday</th>
                  <td>Closed · gas emergencies 0800 111 999</td>
                </tr>
              </tbody>
            </table>
            <p className={styles.muted}>
              Office: <span className={styles.mono}>{BIZ.phone}</span>
            </p>
          </div>
          <AreaMap />
        </div>
      </section>

      {/* FAQ */}
      <section id="th-faq" tabIndex={-1} className={styles.section} aria-labelledby="th-faq-h">
        <div className={`${styles.wrap} ${styles.faqWrap}`}>
          <div>
            <p className={styles.eyebrow}>Questions</p>
            <h2 id="th-faq-h" className={styles.h2}>
              Straight answers.
            </h2>
          </div>
          <div className={styles.faqList}>
            {faqs.map((f) => (
              <details key={f.q} className={styles.faq}>
                <summary>
                  <span>{f.q}</span>
                  <span className={styles.faqPlus} aria-hidden="true" />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta} aria-labelledby="th-cta-h">
        <div className={styles.ctaIn}>
          <h2 id="th-cta-h" className={styles.ctaH}>
            Cold house? Let&rsquo;s sort it.
          </h2>
          <p>Book before 11am for a visit today, Monday to Saturday.</p>
          <div className={styles.ctas}>
            <a href="#th-book" className={styles.btnRed} onClick={(e) => jump(e, 'th-book')}>
              Book a visit <Arrow />
            </a>
            <a href="#th-emergency" className={styles.btnOnDark} onClick={(e) => jump(e, 'th-emergency')}>
              Is it an emergency?
            </a>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footIn}>
          <div className={styles.footBrand}>
            <Mark size={28} />
            <span>
              <b>{BIZ.name}</b> · {BIZ.place}
            </span>
          </div>
          <p>{BIZ.hours}</p>
          <p className={styles.footNote}>Concept site by Northbound Web. This business is made up.</p>
        </div>
      </footer>
    </div>
  )
}

/** First screen for the home page wall: static, 1280×800. */
export function Shot(): JSX.Element {
  return (
    <div className={styles.shot} aria-hidden="true">
      <div className={styles.shotNav}>
        <span className={styles.brand}>
          <Mark />
          <span className={styles.brandText}>
            <b>Thornley</b> Heating
          </span>
        </span>
        <span className={styles.shotLinks}>{'Emergency?      Prices      Book      How it works      FAQ'}</span>
        <span className={`${styles.btnRed} ${styles.navCta}`}>Book a visit</span>
      </div>
      <div className={`${styles.hero} ${styles.shotHero}`}>
        <div className={styles.heroText}>
          <p className={styles.kicker}>
            <span className={styles.pulse} />
            Boiler down?
          </p>
          <p className={styles.h1}>
            We&rsquo;ll have you <em className={styles.warm}>warm</em> again today.
          </p>
          <p className={styles.lede}>
            Gas Safe registered heating engineers covering Wakefield and the district. A fixed price before any work
            starts.
          </p>
          <div className={styles.ctas}>
            <span className={styles.btnRed}>Book a visit</span>
            <span className={styles.btnGhost}>Get a price</span>
          </div>
          <div className={styles.facts}>
            <p>
              <b>Before 11am</b> same-day visit
            </p>
            <p>
              <b>Price first</b> before a spanner
            </p>
            <p>
              <b>Text alerts</b> when we set off
            </p>
          </div>
        </div>
        <div className={styles.heroArt}>
          <div className={styles.heroDisc} />
          <Boiler />
          <div className={`${styles.float} ${styles.floatA}`}>
            <span className={styles.floatK}>Next free window</span>
            <b>Today · 2pm – 4pm</b>
          </div>
        </div>
      </div>
    </div>
  )
}
