'use client'

import { useEffect, useState } from 'react'
import type { JSX, MouseEvent } from 'react'
import { BIZ, evPoints, faqs, howSteps, navLinks, services } from './data'
import type { JobId } from './data'
import { Arrow, Bolt, Charger, ConsumerUnit, JobIcon, Mark } from './parts'
import { Quote } from './quote'
import { Certs } from './certs'
import styles from './styles.module.css'

function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  el.focus({ preventScroll: true })
}

const ticker = ['EICR certificates', 'EV chargers', 'Fault finding', 'Consumer units', 'Rewires', 'Lighting', 'Landlord packs']

export function Site(): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false)
  const [job, setJob] = useState<JobId>('eicr')

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

  function quoteFor(id: JobId) {
    setJob(id)
    scrollToId('bl-quote')
  }

  return (
    <div className={styles.site}>
      <header className={styles.nav}>
        <div className={styles.navIn}>
          <a href="#bl-top" className={styles.brand} onClick={(e) => jump(e, 'bl-top')}>
            <Mark />
            <span className={styles.brandText}>
              <b>Brightline</b>
              <span>Electrical · Leicester</span>
            </span>
          </a>
          <nav aria-label="Brightline Electrical" className={styles.navLinks}>
            {navLinks.map((l) => (
              <a key={l.id} href={`#${l.id}`} onClick={(e) => jump(e, l.id)}>
                {l.label}
              </a>
            ))}
          </nav>
          <a href="#bl-quote" className={`${styles.btnYellow} ${styles.navCta}`} onClick={(e) => jump(e, 'bl-quote')}>
            Get a quote
          </a>
          <button
            type="button"
            className={styles.burger}
            aria-expanded={menuOpen}
            aria-controls="bl-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className={styles.sr}>{menuOpen ? 'Close menu' : 'Open menu'}</span>
            <span className={`${styles.burgerBars} ${menuOpen ? styles.burgerX : ''}`} aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
        <div id="bl-menu" className={styles.menu} hidden={!menuOpen}>
          {navLinks.map((l, i) => (
            <a key={l.id} href={`#${l.id}`} onClick={(e) => jump(e, l.id)}>
              <span className={styles.menuNum}>{String(i + 1).padStart(2, '0')}</span>
              {l.label}
            </a>
          ))}
          <a href="#bl-quote" className={styles.btnYellow} onClick={(e) => jump(e, 'bl-quote')}>
            Get a quote <Arrow />
          </a>
        </div>
      </header>

      <section id="bl-top" tabIndex={-1} className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroText}>
            <p className={styles.kicker}>
              <Bolt /> Domestic and landlord electricians
            </p>
            <h1 className={styles.h1}>
              <span>Power on.</span>{' '}
              <span className={styles.h1Hi}>
                <span>Problem</span> <span>sorted.</span>
              </span>
            </h1>
            <p className={styles.lede}>
              Fault finding, rewires, EV chargers and certificates for landlords. Upload a photo for a quick price.
            </p>
            <div className={styles.ctas}>
              <a href="#bl-quote" className={styles.btnYellow} onClick={(e) => jump(e, 'bl-quote')}>
                Get a quote <Arrow />
              </a>
              <a href="#bl-ev" className={styles.btnOutline} onClick={(e) => jump(e, 'bl-ev')}>
                EV chargers
              </a>
            </div>
          </div>
          <div className={styles.heroArt}>
            <ConsumerUnit />
            <p className={styles.heroTag} aria-hidden="true">
              <span>Fault found</span> RCD tripping · circuit 5
            </p>
          </div>
        </div>
        <div className={styles.ticker} aria-hidden="true">
          {ticker.map((t, i) => (
            <span key={t}>
              {i > 0 ? <i>/</i> : null}
              {t}
            </span>
          ))}
        </div>
      </section>

      <section id="bl-services" tabIndex={-1} className={styles.section} aria-labelledby="bl-services-h">
        <div className={styles.wrap}>
          <div className={styles.secHead}>
            <p className={styles.label}>01 / Services</p>
            <h2 id="bl-services-h" className={styles.h2}>
              Prices on the page.
            </h2>
            <p className={styles.secLede}>Every job starts from a figure you can see. Tap one to price it with photos.</p>
          </div>
          <ul className={styles.svcGrid}>
            {services.map((s) => (
              <li key={s.id}>
                <button type="button" className={styles.svc} onClick={() => quoteFor(s.id)}>
                  <span className={styles.svcIcon}>
                    <JobIcon id={s.id} />
                  </span>
                  <span className={styles.svcName}>{s.label}</span>
                  <span className={styles.svcPrice}>{s.price}</span>
                  <span className={styles.svcNote}>{s.note}</span>
                  <span className={styles.svcGo}>
                    Price this job <Arrow />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="bl-quote" tabIndex={-1} className={`${styles.section} ${styles.quoteSec}`} aria-labelledby="bl-quote-h">
        <div className={styles.wrap}>
          <div className={styles.secHead}>
            <p className={styles.label}>02 / Photo quote</p>
            <h2 id="bl-quote-h" className={styles.h2}>
              Snap it. <span className={styles.hi}>See a price.</span>
            </h2>
            <p className={styles.secLede}>
              Pick the job, add a few photos, and get a ballpark range now. Send it and an electrician replies with a
              fixed price the same working day.
            </p>
          </div>
          <Quote job={job} onJob={setJob} />
        </div>
      </section>

      <section id="bl-ev" tabIndex={-1} className={styles.section} aria-labelledby="bl-ev-h">
        <div className={`${styles.wrap} ${styles.evWrap}`}>
          <Charger />
          <div>
            <p className={styles.label}>03 / EV chargers</p>
            <h2 id="bl-ev-h" className={styles.h2}>
              Charge at home, from £795.
            </h2>
            <p className={styles.secLede}>
              A seven-kilowatt charger on your wall, fitted in about half a day. We check your supply, notify the
              network operator and check whether you qualify for any grant.
            </p>
            <ul className={styles.evStats}>
              {evPoints.map((p) => (
                <li key={p.k}>
                  <b>{p.k}</b>
                  <span>{p.v}</span>
                </li>
              ))}
            </ul>
            <button type="button" className={styles.btnYellow} onClick={() => quoteFor('ev')}>
              Price a charger <Arrow />
            </button>
          </div>
        </div>
      </section>

      <section id="bl-certs" tabIndex={-1} className={`${styles.section} ${styles.certSec}`} aria-labelledby="bl-certs-h">
        <div className={styles.wrap}>
          <div className={styles.secHead}>
            <p className={styles.labelDark}>04 / Certificates</p>
            <h2 id="bl-certs-h" className={`${styles.h2} ${styles.h2Dark}`}>
              Lost your EICR? Find it here.
            </h2>
            <p className={`${styles.secLede} ${styles.secLedeDark}`}>
              Landlords and homeowners can look up any report we have issued and download a copy, any time.
            </p>
          </div>
          <Certs />
        </div>
      </section>

      <section id="bl-how" tabIndex={-1} className={styles.section} aria-labelledby="bl-how-h">
        <div className={styles.wrap}>
          <div className={styles.secHead}>
            <p className={styles.label}>05 / How it works</p>
            <h2 id="bl-how-h" className={styles.h2}>
              Four steps. No mess.
            </h2>
          </div>
          <ol className={styles.circuit}>
            {howSteps.map((s, i) => (
              <li key={s.title} style={{ animationDelay: `${i * 90}ms` }}>
                <span className={styles.node} aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className={styles.h3}>{s.title}</h3>
                <p className={styles.mutedText}>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="bl-faq" tabIndex={-1} className={styles.section} aria-labelledby="bl-faq-h">
        <div className={`${styles.wrap} ${styles.faqWrap}`}>
          <div>
            <p className={styles.label}>06 / FAQ</p>
            <h2 id="bl-faq-h" className={styles.h2}>
              Good questions.
            </h2>
            <table className={styles.hours}>
              <caption className={styles.sr}>Opening hours</caption>
              <tbody>
                <tr>
                  <th scope="row">Mon – Fri</th>
                  <td>7.30am – 5.30pm</td>
                </tr>
                <tr>
                  <th scope="row">Sat – Sun</th>
                  <td>Closed</td>
                </tr>
                <tr>
                  <th scope="row">Office</th>
                  <td className={styles.mono}>{BIZ.phone}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className={styles.faqList}>
            {faqs.map((f, i) => (
              <details key={f.q} className={styles.faq}>
                <summary>
                  <span className={styles.faqNum}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={styles.faqQ}>{f.q}</span>
                  <span className={styles.faqIcon} aria-hidden="true" />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.cta} aria-labelledby="bl-cta-h">
        <div className={styles.ctaIn}>
          <h2 id="bl-cta-h" className={styles.ctaH}>
            Something tripping? <span>Send a photo.</span>
          </h2>
          <a href="#bl-quote" className={styles.btnNavy} onClick={(e) => jump(e, 'bl-quote')}>
            Get a quote <Arrow />
          </a>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footIn}>
          <span className={styles.footBrand}>
            <Mark size={28} /> <b>{BIZ.name}</b>
          </span>
          <span>{BIZ.place}</span>
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
            <b>Brightline</b>
            <span>Electrical · Leicester</span>
          </span>
        </span>
        <span className={styles.shotLinks}>{'Services      Photo quote      EV chargers      Certificates      FAQ'}</span>
        <span className={`${styles.btnYellow} ${styles.navCta}`}>Get a quote</span>
      </div>
      <div className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroText}>
            <p className={styles.kicker}>Domestic and landlord electricians</p>
            <p className={styles.h1}>
              <span>Power on.</span>
              <span className={styles.h1Hi}>
                <span>Problem</span> <span>sorted.</span>
              </span>
            </p>
            <p className={styles.lede}>
              Fault finding, rewires, EV chargers and certificates for landlords. Upload a photo for a quick price.
            </p>
            <div className={styles.ctas}>
              <span className={styles.btnYellow}>Get a quote</span>
              <span className={styles.btnOutline}>EV chargers</span>
            </div>
          </div>
          <div className={styles.heroArt}>
            <ConsumerUnit />
          </div>
        </div>
        <div className={styles.ticker}>EICR certificates / EV chargers / Fault finding / Consumer units / Rewires / Lighting</div>
      </div>
    </div>
  )
}
