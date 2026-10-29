import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MockSite } from '@/components/mock-site'
import { PageShell } from '@/components/page-shell'
import { comparisons } from '@/lib/discover'

export function generateStaticParams() {
  return comparisons.map((c) => ({ slug: c.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const c = comparisons.find((x) => x.slug === slug)
  return { title: c ? `${c.business} (concept)` : 'Work' }
}

export default async function WorkDetail({ params }: Props) {
  const { slug } = await params
  const i = comparisons.findIndex((x) => x.slug === slug)
  if (i < 0) notFound()
  const c = comparisons[i]
  const next = comparisons[(i + 1) % comparisons.length]

  return (
    <PageShell>
      <section className="page-head wrap">
        <p className="eyebrow">
          <Link href="/work">Work</Link> / Concept · made-up business
        </p>
        <h1 className="section-h big">
          {c.business}.
          <span>{c.trade}.</span>
        </h1>
        <p className="section-sub">{c.who}</p>
      </section>

      <section className="band wrap">
        <div className="detail-mock">
          <MockSite m={c.after} />
        </div>
      </section>

      <section className="band wrap detail">
        <div>
          <p className="label">What was wrong</p>
          <p className="problem">{c.problem}</p>
          <h2 className="detail-h" style={{ marginTop: 40 }}>
            What changed
          </h2>
          <ol className="changes">
            {c.changes.map((ch, n) => (
              <li key={ch.title}>
                <span className="svc-n">{String(n + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{ch.title}</h3>
                  <p>{ch.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <aside className="detail-side">
          <p className="label">Measured on the mock-ups</p>
          <table className="facts-table">
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr">Measure</span>
                </th>
                <th scope="col">Before</th>
                <th scope="col">After</th>
              </tr>
            </thead>
            <tbody>
              {c.facts.map((f) => (
                <tr key={f.label}>
                  <th scope="row">{f.label}</th>
                  <td>{f.before}</td>
                  <td>{f.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link className="btn solid wide-btn" href="/booking">
            Talk about your site
          </Link>
        </aside>
      </section>

      <section className="band wrap">
        <Link href={`/work/${next.slug}`} className="next-work">
          <span className="label">Next concept</span>
          <b>{next.business}</b>
          <span aria-hidden="true">→</span>
        </Link>
      </section>
    </PageShell>
  )
}
