import type { Metadata } from 'next'
import Link from 'next/link'
import { PageShell } from '@/components/page-shell'
import {
  ADVANCED_MANAGEMENT_PRICE,
  ANNUAL_TERMS,
  COMPLIMENTARY_MONTH_TERMS,
  TIMELINE_TERMS,
  buildPackages,
  commercialTerms,
  managementPlans,
  managementTerms,
  standards,
} from '@/lib/services'

export const metadata: Metadata = { title: 'Services' }

export default function ServicesPage() {
  return (
    <PageShell>
      <section className="page-head wrap">
        <p className="eyebrow">Services</p>
        <h1 className="section-h big">
          Three builds.
          <span>One price on each.</span>
        </h1>
        <p className="section-sub">
          Pro and Ultimate are fixed prices. Custom starts from £349 and is quoted in writing. Monthly management is optional, from £
          {ADVANCED_MANAGEMENT_PRICE}.
        </p>
      </section>

      <section className="band wrap" aria-labelledby="builds">
        <h2 id="builds" className="sr">
          Website builds
        </h2>
        <div className="pkg-grid">
          {buildPackages.map((p) => (
            <article key={p.slug} className={`pkg${p.badge ? ' feat' : ''}`}>
              <div className="pkg-top">
                <h3>{p.name}</h3>
                {p.badge && <span className="badge">{p.badge}</span>}
              </div>
              <p className="pkg-price">
                {p.variable && <small>from </small>}£{p.price}
              </p>
              <p className="pkg-sum">{p.summary}</p>
              <ul className="ticks">
                {p.includes.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <p className="pkg-time">
                <b>{p.timeline}.</b> {TIMELINE_TERMS}
              </p>
              <div className="pkg-actions">
                <Link className="btn solid" href="/start">
                  {p.cta}
                </Link>
                <Link className="text-link" href={`/services/${p.slug}`}>
                  Full details
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="band wrap" aria-labelledby="mgmt">
        <h2 id="mgmt" className="section-h">
          Management.
          <span>Optional. First month free.</span>
        </h2>
        <p className="section-sub">{COMPLIMENTARY_MONTH_TERMS}</p>
        <div className="pkg-grid">
          {managementPlans.map((m) => (
            <article key={m.slug} className="pkg">
              <h3>{m.name}</h3>
              <p className="pkg-price">
                {m.slug === 'custom-management' && <small>from </small>}£{m.price}
                <small>/month</small>
              </p>
              <p className="pkg-sum">{m.summary}</p>
              <ul className="ticks">
                {m.includes.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <p className="pkg-time">{m.changeTime}</p>
            </article>
          ))}
        </div>
        <p className="note" style={{ marginTop: 20 }}>
          {ANNUAL_TERMS}
        </p>
        <ul className="terms">
          {managementTerms.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p style={{ marginTop: 20 }}>
          <Link className="text-link" href="/services/management">
            More on management
          </Link>
        </p>
      </section>

      <section className="band wrap" aria-labelledby="standards">
        <h2 id="standards" className="section-h">
          Every build.
          <span>The same standards.</span>
        </h2>
        <div className="std-grid">
          {standards.map((s, i) => (
            <div key={s.title} className="std">
              <span className="svc-n">{String(i + 1).padStart(2, '0')}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="band wrap" aria-labelledby="terms">
        <h2 id="terms" className="section-h">
          The terms.
          <span>Written down.</span>
        </h2>
        <div className="terms-grid">
          {commercialTerms.map((t) => (
            <div key={t.title}>
              <h3>{t.title}</h3>
              <ul>
                {t.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
