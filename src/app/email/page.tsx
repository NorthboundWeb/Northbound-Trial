import type { Metadata } from 'next'
import { PageShell } from '@/components/page-shell'
import { EmailForm } from './email-form'

export const metadata: Metadata = {
  title: 'Email me',
  description: 'Send Che at Northbound Web a message. It goes straight to his inbox and he replies by email.',
}

export default async function EmailPage({ searchParams }: { searchParams: Promise<{ about?: string; message?: string }> }) {
  const q = await searchParams
  const subject = (q.about ?? '').slice(0, 140) || 'Website message'
  const message = (q.message ?? '').slice(0, 6000)
  return (
    <PageShell>
      <section className="wrap pt-wrap">
        <p className="eyebrow">Email me</p>
        <h1 className="section-h big">
          Write it down.
          <span>I will write back.</span>
        </h1>
        <p className="section-sub">Prefer email to WhatsApp? Send it here and it lands in my inbox. I reply by email, usually within a working day.</p>
        <EmailForm subject={subject} message={message} />
      </section>
    </PageShell>
  )
}
