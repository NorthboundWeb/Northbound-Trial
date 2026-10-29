'use client'

import { useEffect, useState } from 'react'
import type { JSX, MouseEvent } from 'react'
import { BIZ, faqs, navLinks, priceBoard } from './data'
import type { Vehicle } from './data'
import { Arrow, Car, MapSketch, Mark, Tick } from './parts'
import { CarCard, RegForm } from './reg'
import { MotCalc } from './mot'
import { Booking } from './booking'
import { Approvals } from './repairs'
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
  const [found, setFound] = useState<{ v: Vehicle; y: number; m: number } | null>(null)

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

  function onVehicle(v: Vehicle) {
    const now = new Date()
    setFound({ v, y: now.getFullYear(), m: now.getMonth() + 1 })
  }

  const vehicle = found ? found.v : null

  return (
    <div className={styles.site}>
      <header className={styles.nav}>
        <div className={styles.navIn}>
          <a href="#ng-top" className={styles.brand} onClick={(e) => jump(e, 'ng-top')}>
            <Mark />
            <span className={styles.brandText}>
              <b>Northgate Motors</b>
              <span>MOT · Service · Repair</span>
            </span>
          </a>
          <nav aria-label="Northgate Motors" className={styles.navLinks}>
            {navLinks.map((l) => (
              <a key={l.id} href={`#${l.id}`} onClick={(e) => jump(e, l.id)}>
                {l.label}
              </a>
            ))}
          </nav>
          <a href="#ng-book" className={`${styles.btnGreen} ${styles.navCta}`} onClick={(e) => jump(e, 'ng-book')}>
            Book an MOT
          </a>
          <button
            type="button"
            className={styles.burger}
            aria-expanded={menuOpen}
            aria-controls="ng-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className={styles.sr}>{menuOpen ? 'Close menu' : 'Open menu'}</span>
            <span aria-hidden="true" className={styles.burgerTxt}>
              {menuOpen ? 'Close' : 'Menu'}
            </span>
          </button>
        </div>
        <div id="ng-menu" className={styles.menu} hidden={!menuOpen}>
          {navLinks.map((l) => (
            <a key={l.id} href={`#${l.id}`} onClick={(e) => jump(e, l.id)}>
              {l.label}
              <Arrow />
            </a>
          ))}
          <a href="#ng-book" className={styles.btnGreen} onClick={(e) => jump(e, 'ng-book')}>
            Book an MOT
          </a>
        </div>
      </header>

      <section id="ng-top" tabIndex={-1} className={styles.hero}>
        <div className={styles.heroIn}>
          <div className={styles.heroText}>
            <p className={styles.kicker}>
              <span>MOT</span>
              <span>Servicing</span>
              <span>Repairs</span>
            </p>
            <h1 className={styles.h1}>
              Book your MOT in <span className={styles.underline}>under a minute.</span>
            </h1>
            <p className={styles.lede}>
              Enter your reg, pick a time, and we&rsquo;ll text you when it&rsquo;s done. Reminders every year, free.
            </p>
            <RegForm id="ng-hero-reg" variant="hero" onFound={onVehicle} />
            {found ? (
              <CarCard
                key={found.v.reg}
                v={found.v}
                nowY={found.y}
                nowM={found.m}
                onBook={() => scrollToId('ng-book')}
                onMot={() => scrollToId('ng-mot')}
              />
            ) : (
              <p className={styles.hint}>Any UK plate works, current or older, like MA71 XYZ or R123 ABC.</p>
            )}
          </div>
          <div className={styles.heroArt}>
            <div className={styles.bay} aria-hidden="true">
              <span className={styles.bayNo}>BAY 2</span>
              <span className={styles.bayTag}>
                {vehicle ? `${vehicle.colour} ${vehicle.make} ${vehicle.model}` : 'MOT · Class 4'}
              </span>
            </div>
            <Car colour={vehicle ? vehicle.colourHex : '#15803d'} />
          </div>
        </div>
        <ul className={styles.heroStrip}>
          <li>
            <Tick /> £45 MOT, free retest within 10 working days
          </li>
          <li>
            <Tick /> Text when it&rsquo;s done
          </li>
          <li>
            <Tick /> Approve any repairs online first
          </li>
        </ul>
      </section>

      <section id="ng-prices" tabIndex={-1} className={styles.section} aria-labelledby="ng-prices-h">
        <div className={`${styles.wrap} ${styles.pricesWrap}`}>
          <div>
            <p className={styles.eyebrow}>Prices</p>
            <h2 id="ng-prices-h" className={styles.h2}>
              On the board, not on request.
            </h2>
            <p className={styles.secLede}>
              Prices include VAT. Any extra work is priced and shown to you with photos before we do it, and you can
              say no.
            </p>
            <a href="#ng-book" className={styles.btnGreen} onClick={(e) => jump(e, 'ng-book')}>
              Book a slot <Arrow />
            </a>
          </div>
          <div className={styles.board}>
            <p className={styles.boardHead}>
              <span>Workshop prices</span>
              <span>£ inc. VAT</span>
            </p>
            <ul className={styles.boardList}>
              {priceBoard.map((p) => (
                <li key={p.name}>
                  <span className={styles.boardName}>
                    {p.name}
                    <small>{p.note}</small>
                  </span>
                  <span className={styles.boardDots} aria-hidden="true" />
                  <b>{p.price}</b>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="ng-mot" tabIndex={-1} className={`${styles.section} ${styles.motSec}`} aria-labelledby="ng-mot-h">
        <div className={styles.wrap}>
          <div className={styles.secHead}>
            <p className={styles.eyebrow}>MOT due date</p>
            <h2 id="ng-mot-h" className={styles.h2}>
              When does yours run out?
            </h2>
            <p className={styles.secLede}>
              Put in your last test date and see the exact expiry, the earliest day you can test and keep that date, and
              set a free reminder.
            </p>
          </div>
          <MotCalc vehicle={vehicle} onBook={() => scrollToId('ng-book')} />
        </div>
      </section>

      <section id="ng-book" tabIndex={-1} className={styles.section} aria-labelledby="ng-book-h">
        <div className={styles.wrap}>
          <div className={styles.secHead}>
            <p className={styles.eyebrow}>Book</p>
            <h2 id="ng-book-h" className={styles.h2}>
              Pick a bay and a time.
            </h2>
            <p className={styles.secLede}>Only free times are shown. Pay when you collect.</p>
          </div>
          <Booking vehicle={vehicle} onVehicle={onVehicle} />
        </div>
      </section>

      <section id="ng-repairs" tabIndex={-1} className={`${styles.section} ${styles.repSec}`} aria-labelledby="ng-repairs-h">
        <div className={`${styles.wrap} ${styles.repWrap}`}>
          <div>
            <p className={styles.eyebrowLight}>Approve repairs online</p>
            <h2 id="ng-repairs-h" className={`${styles.h2} ${styles.h2Light}`}>
              Nothing gets fixed until you say yes.
            </h2>
            <p className={styles.repLede}>
              If we find something, you get a text with a photo, the reason, and a fixed price for each item. Approve
              what you want done, decline the rest. Try it on the phone.
            </p>
            <ol className={styles.repSteps}>
              <li>
                <b>We test</b> and photograph anything we find.
              </li>
              <li>
                <b>You choose</b> item by item, from your phone.
              </li>
              <li>
                <b>We fix</b> only what you approved, and text when it is ready.
              </li>
            </ol>
          </div>
          <Approvals />
        </div>
      </section>

      <section id="ng-faq" tabIndex={-1} className={styles.section} aria-labelledby="ng-faq-h">
        <div className={`${styles.wrap} ${styles.faqWrap}`}>
          <div>
            <p className={styles.eyebrow}>FAQ</p>
            <h2 id="ng-faq-h" className={styles.h2}>
              Before you book.
            </h2>
          </div>
          <div className={styles.faqList}>
            {faqs.map((f) => (
              <details key={f.q} className={styles.faq}>
                <summary>
                  {f.q}
                  <span className={styles.chev} aria-hidden="true" />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="ng-visit" tabIndex={-1} className={`${styles.section} ${styles.visitSec}`} aria-labelledby="ng-visit-h">
        <div className={`${styles.wrap} ${styles.visitWrap}`}>
          <MapSketch />
          <div>
            <p className={styles.eyebrow}>Find us</p>
            <h2 id="ng-visit-h" className={styles.h2}>
              Two minutes off the ring road.
            </h2>
            <p className={styles.secLede}>
              {BIZ.address}. Free parking on site and a waiting area with wifi.
            </p>
            <table className={styles.hours}>
              <caption className={styles.sr}>Opening hours</caption>
              <tbody>
                <tr>
                  <th scope="row">Monday – Friday</th>
                  <td>8am – 5.30pm</td>
                </tr>
                <tr>
                  <th scope="row">Saturday</th>
                  <td>8am – 12pm</td>
                </tr>
                <tr>
                  <th scope="row">Sunday</th>
                  <td>Closed</td>
                </tr>
              </tbody>
            </table>
            <p className={styles.mutedText}>
              Workshop: <span className={styles.mono}>{BIZ.phone}</span>
            </p>
          </div>
        </div>
      </section>

      <section className={styles.cta} aria-labelledby="ng-cta-h">
        <div className={styles.ctaIn}>
          <div>
            <h2 id="ng-cta-h" className={styles.ctaH}>
              MOT due? Sorted in a minute.
            </h2>
            <p>£45, free retest, a text when it is done.</p>
          </div>
          <a href="#ng-top" className={styles.btnWhite} onClick={(e) => jump(e, 'ng-top')}>
            Enter your reg <Arrow />
          </a>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footIn}>
          <span className={styles.footBrand}>
            <Mark size={28} /> <b>{BIZ.name}</b> · {BIZ.place}
          </span>
          <span>{BIZ.hours}</span>
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
            <b>Northgate Motors</b>
            <span>MOT · Service · Repair</span>
          </span>
        </span>
        <span className={styles.shotLinks}>Prices · MOT date · Book · Repairs · FAQ</span>
        <span className={`${styles.btnGreen} ${styles.navCta}`}>Book an MOT</span>
      </div>
      <div className={styles.hero}>
        <div className={styles.heroIn}>
          <div className={styles.heroText}>
            <p className={styles.kicker}>
              <span>MOT</span>
              <span>Servicing</span>
              <span>Repairs</span>
            </p>
            <p className={styles.h1}>
              Book your MOT in <span className={styles.underline}>under a minute.</span>
            </p>
            <p className={styles.lede}>
              Enter your reg, pick a time, and we&rsquo;ll text you when it&rsquo;s done. Reminders every year, free.
            </p>
            <div className={styles.regHero}>
              <span className={styles.regLabel}>Enter your registration</span>
              <div className={styles.regRow}>
                <span className={styles.plateInputWrap}>
                  <span className={styles.plateBand}>UK</span>
                  <span className={`${styles.plateInput} ${styles.platePh}`}>AB21 CDE</span>
                </span>
                <span className={styles.btnGreen}>Find my car</span>
              </div>
            </div>
          </div>
          <div className={styles.heroArt}>
            <div className={styles.bay}>
              <span className={styles.bayNo}>BAY 2</span>
              <span className={styles.bayTag}>MOT · Class 4</span>
            </div>
            <Car colour="#15803d" lifted={false} />
          </div>
        </div>
      </div>
    </div>
  )
}
