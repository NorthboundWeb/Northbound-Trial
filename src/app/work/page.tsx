import type { Metadata } from 'next'
import Link from 'next/link'
import { MockSite } from '@/components/mock-site'
import { PageShell } from '@/components/page-shell'
import { comparisons } from '@/lib/discover'

export const metadata: Metadata = { title: 'Work' }

export default function WorkPage() {
  return (
    <PageShell>
      <section className="page-head wrap">
        <p className="eyebrow">Work</p>
        <h1 className="section-h big">
          Concepts you can check.
          <span>Before and after.</span>
        </h1>
        <p className="section-sub">
          Each one takes a typical small-business website and rebuilds it. Every business here is made up, and each page says so. The
          measurements are properties of the mock-ups themselves, not claims about anyone&apos;s takings.
        </p>
      </section>
      <section className="band wrap">
        <div className="work-grid">
          {comparisons.map((c) => (
            <Link key={c.slug} href={`/work/${c.slug}`} className="work-card">
              <MockSite m={c.after} compact />
              <span className="work-meta">
                <b>{c.business}</b>
                <span>{c.trade}</span>
              </span>
              <span className="work-tags">
                <i>Concept</i>
                <i>{c.changes.length} changes</i>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
