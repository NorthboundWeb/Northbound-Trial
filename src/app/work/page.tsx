import type { Metadata } from 'next'
import Link from 'next/link'
import { PageShell } from '@/components/page-shell'
import { WorkShot } from '@/components/work-shot'
import { demos } from '@/lib/showcase'

export const metadata: Metadata = { title: 'Work' }

export default function WorkPage() {
  return (
    <PageShell>
      <section className="page-head wrap">
        <p className="eyebrow">Work</p>
        <h1 className="section-h big">
          Twelve working sites.
          <span>Open any of them.</span>
        </h1>
        <p className="section-sub">
          Each one is a full website for a made-up business, with the features a real one would need: bookings, baskets, quotes, timetables.
          Nothing you enter is sent anywhere.
        </p>
      </section>
      <section className="band wrap">
        <div className="demo-grid">
          {demos.map((d) => (
            <Link key={d.slug} href={`/demos/${d.slug}`} className="demo-tile">
              <span className="demo-tile-shot" aria-hidden="true">
                <span className="demo-tile-scale">
                  <WorkShot slug={d.slug} />
                </span>
              </span>
              <span className="work-meta">
                <b>{d.name}</b>
                <span>{d.trade}</span>
              </span>
              <span className="work-tags">
                {d.shows.slice(0, 2).map((s) => (
                  <i key={s}>{s}</i>
                ))}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
