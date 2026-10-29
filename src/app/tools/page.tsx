import type { Metadata } from 'next'
import { PageShell } from '@/components/page-shell'
import { SiteCheck } from '@/components/site-check'

export const metadata: Metadata = { title: 'Tools' }

export default function ToolsPage() {
  return (
    <PageShell>
      <section className="page-head wrap">
        <p className="eyebrow">Tools</p>
        <h1 className="section-h big">
          Check your website.
          <span>In about a minute.</span>
        </h1>
        <p className="section-sub">
          Eight yes-or-no questions you can answer from memory. Your score fills in as you go, and anything you answer no to comes back as a
          list of things worth fixing.
        </p>
      </section>
      <section className="band wrap">
        <SiteCheck />
      </section>
    </PageShell>
  )
}
