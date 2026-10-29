import type { Metadata } from 'next'
import Link from 'next/link'
import { PageShell } from '@/components/page-shell'

export const metadata: Metadata = { title: 'About' }

/*
  Deliberately makes no claims that need verifying: no years of experience,
  client counts or past projects. Add specifics only when they are real.
*/
const beliefs = [
  {
    title: 'The price is on the page',
    body: 'Package prices are published, and they are what you pay. If the work grows because you have asked for something new, we agree that separately, in writing, before I build it. No invoice should ever be a surprise.',
  },
  {
    title: 'You own everything',
    body: 'The domain stays in your name. The code lives in a repository you own. If you ever want to take the project elsewhere, you hand another developer a link and they can get to work. Nothing here depends on me staying reachable.',
  },
  {
    title: 'Plain English, always',
    body: 'You should never have to nod along to something you do not follow. I will explain what I am recommending and why, and I will tell you when a decision genuinely does not matter.',
  },
  {
    title: 'The honest answer',
    body: 'If the Pro package would do what you need, I will not sell you the Ultimate one. If the thing you are describing does not need a developer at all, I will say so.',
  },
]

export default function AboutPage() {
  return (
    <PageShell>
      <section className="page-head wrap">
        <p className="eyebrow">About</p>
        <h1 className="section-h big">
          Small on purpose.
          <span>One person, start to finish.</span>
        </h1>
      </section>
      <section className="band wrap about-cols">
        <p className="lead">
          Northbound Web is an independent web studio working with small businesses across the United Kingdom. When you get in touch, you are
          talking to the person who will design and build the thing, not an account manager relaying messages to a team you never meet.
        </p>
        <div className="prose">
          <p>
            Most small businesses have been failed by their website at least once. A cheap template that never brought in an enquiry. An agency
            that vanished after launch. A platform that seemed reasonable until the subscription doubled and the content turned out to be
            impossible to export. The work here is a reaction to all three.
          </p>
          <p>
            So: proper design rather than a stock theme, built on tools that will still be maintained in five years, handed over in a form you
            genuinely own, and, if you want it, looked after for a predictable monthly fee.
          </p>
        </div>
      </section>
      <section className="band wrap">
        <h2 className="section-h">
          Four things.
          <span>I will not budge on.</span>
        </h2>
        <div className="std-grid two">
          {beliefs.map((b, i) => (
            <div key={b.title} className="std">
              <span className="svc-n">{String(i + 1).padStart(2, '0')}</span>
              <h3>{b.title}</h3>
              <p>{b.body}</p>
            </div>
          ))}
        </div>
        <div className="detail-cta">
          <Link className="btn solid" href="/start">
            Start a project
          </Link>
          <Link className="text-link" href="/services">
            See packages and prices
          </Link>
        </div>
      </section>
    </PageShell>
  )
}
