import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DemoSite } from '@/components/demo-site'
import { demoBySlug, demos } from '@/lib/showcase'

export function generateStaticParams() {
  return demos.map((d) => ({ slug: d.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const d = demoBySlug(slug)
  return { title: d ? `${d.name} — concept site` : 'Concept site' }
}

export default async function DemoPage({ params }: Props) {
  const { slug } = await params
  const d = demoBySlug(slug)
  if (!d) notFound()
  const i = demos.indexOf(d)
  const next = demos[(i + 1) % demos.length]

  return (
    <>
      <div className="demo-bar" role="note">
        <Link href="/work" className="demo-bar-back">
          <span aria-hidden="true">←</span> All work
        </Link>
        <p>
          <b>Concept site by Northbound Web.</b> {d.name} is a made-up business.
        </p>
        <Link href={`/demos/${next.slug}`} className="demo-bar-next">
          Next: {next.name} <span aria-hidden="true">→</span>
        </Link>
      </div>
      <main id="main">
        <DemoSite d={d} full />
      </main>
      <aside className="demo-pitch" aria-label="About this demo">
        <div>
          <p className="label">What this one shows</p>
          <ul>
            {d.shows.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <Link className="btn solid" href="/start">
          Want one like this?
        </Link>
      </aside>
    </>
  )
}
