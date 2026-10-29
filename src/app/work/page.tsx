import type { Metadata } from 'next'
import Link from 'next/link'
import { PageShell } from '@/components/page-shell'
import { WorkWheel } from '@/components/work-wheel'
import { demos } from '@/lib/showcase'

export const metadata: Metadata = { title: 'Work' }

export default function WorkPage() {
  return (
    <PageShell>
      <section className="page-head wrap">
        <p className="eyebrow">Work</p>
        <h1 className="section-h big">
          Twelve working sites.
          <span>Spin the wheel, open any of them.</span>
        </h1>
        <p className="section-sub">
          Each one is a full website for a made-up business, with the features a real one would need: bookings, baskets, quotes, timetables.
          Nothing you enter is sent anywhere.
        </p>
      </section>
      <section className="band wrap">
        <WorkWheel demos={demos} />
        <details className="ww-list">
          <summary>See all twelve as a list</summary>
          <ul className="ww-names">
            {demos.map((d) => (
              <li key={d.slug}>
                <Link href={`/demos/${d.slug}`}>{d.name}</Link> <span>{d.trade}</span>
              </li>
            ))}
          </ul>
        </details>
      </section>
    </PageShell>
  )
}
