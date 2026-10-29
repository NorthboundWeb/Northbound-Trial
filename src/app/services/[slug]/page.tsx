import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageShell } from '@/components/page-shell'
import {
  ANNUAL_TERMS,
  COMPLIMENTARY_MONTH_TERMS,
  TIMELINE_TERMS,
  buildPackages,
  managementPlans,
  managementTerms,
} from '@/lib/services'

const SLUGS = [...buildPackages.map((p) => p.slug), 'management']

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const p = buildPackages.find((x) => x.slug === slug)
  return { title: p ? `${p.name} website` : 'Website management' }
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params

  if (slug === 'management') {
    return (
      <PageShell>
        <section className="page-head wrap">
          <p className="eyebrow">
            <Link href="/services">Services</Link> / Management
          </p>
          <h1 className="section-h big">
            Looked after.
            <span>Once it is live.</span>
          </h1>
          <p className="section-sub">{COMPLIMENTARY_MONTH_TERMS}</p>
        </section>
        <section className="band wrap">
          <div className="pkg-grid">
            {managementPlans.map((m) => (
              <article key={m.slug} className="pkg">
                <h2 className="pkg-h">{m.name}</h2>
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
          <div className="detail-cta">
            <Link className="btn solid" href="/booking">
              Book a call
            </Link>
            <Link className="text-link" href="/services">
              All services
            </Link>
          </div>
        </section>
      </PageShell>
    )
  }

  const p = buildPackages.find((x) => x.slug === slug)
  if (!p) notFound()
  const others = buildPackages.filter((x) => x.slug !== p.slug)

  return (
    <PageShell>
      <section className="page-head wrap">
        <p className="eyebrow">
          <Link href="/services">Services</Link> / {p.name}
        </p>
        <h1 className="section-h big">
          {p.name}.
          <span>
            {p.variable ? 'From ' : ''}£{p.price}
            {p.variable ? ', quoted in writing.' : ', fixed.'}
          </span>
        </h1>
        <p className="section-sub">{p.summary}</p>
      </section>

      <section className="band wrap detail">
        <div>
          <h2 className="detail-h">What you get</h2>
          <ul className="ticks big">
            {p.includes.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          {p.note && <p className="note" style={{ marginTop: 20 }}>{p.note}</p>}
        </div>
        <aside className="detail-side">
          <p className="label">Best for</p>
          <p>{p.bestFor}</p>
          <p className="label" style={{ marginTop: 20 }}>
            Timeline
          </p>
          <p>
            <b>{p.timeline}.</b> {TIMELINE_TERMS}
          </p>
          {p.freeAdvancedMonth && (
            <>
              <p className="label" style={{ marginTop: 20 }}>
                Management
              </p>
              <p>{COMPLIMENTARY_MONTH_TERMS}</p>
            </>
          )}
          <p className="label" style={{ marginTop: 20 }}>
            Payment
          </p>
          <p>Half to start, half once the site is complete and approved, before it goes live.</p>
          <Link className="btn solid wide-btn" href="/booking">
            {p.cta}
          </Link>
        </aside>
      </section>

      <section className="band wrap">
        <p className="eyebrow">Compare</p>
        <div className="other-row">
          {others.map((o) => (
            <Link key={o.slug} href={`/services/${o.slug}`} className="other">
              <b>{o.name}</b>
              <span>
                {o.variable ? 'from ' : ''}£{o.price}
              </span>
              <span className="arr" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
          <Link href="/services/management" className="other">
            <b>Management</b>
            <span>from £39/month</span>
            <span className="arr" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </section>
    </PageShell>
  )
}
