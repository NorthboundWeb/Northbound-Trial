import Link from 'next/link'
import { Faq, Process } from '@/components/faq'
import { MockSite } from '@/components/mock-site'
import { PageShell } from '@/components/page-shell'
import { comparisons } from '@/lib/discover'
import { ADVANCED_MANAGEMENT_PRICE, buildPackages, process } from '@/lib/services'

const TAGS = [
  'Small-business websites',
  'Website redesigns',
  'Landing pages',
  'Online booking',
  'Local SEO',
  'Monthly website care',
  'Custom web apps',
]

const SERVICES = [
  {
    n: '01',
    href: '/services/pro',
    kicker: 'Pro · £249',
    title: 'A proper small-business site',
    body: 'Up to five pages designed for mobile and desktop, a contact form, basic SEO and bookings for one calendar.',
  },
  {
    n: '02',
    href: '/services/ultimate',
    kicker: 'Ultimate · £349',
    title: 'More pages, local search, a whole team booked in',
    body: 'Up to eight pages, local SEO set up properly, and bookings across several staff calendars with reminders and payments.',
  },
  {
    n: '03',
    href: '/services/custom',
    kicker: 'Custom · from £349',
    title: 'Work that does not fit a package',
    body: 'Web applications, integrations and specific requirements, scoped and priced in writing before anything starts.',
  },
  {
    n: '04',
    href: '/services/management',
    kicker: `Management · from £${ADVANCED_MANAGEMENT_PRICE}/month`,
    title: 'Looked after once it is live',
    body: 'Hosting, security, monitoring and a set amount of update time each month. Optional, and the first month is free.',
  },
]

const FAQS = [
  {
    q: 'What does a website cost?',
    a: `Pro is £249 and Ultimate is £349. Those are the prices, not starting points. Custom work starts from £349 and is quoted in writing before anything begins. A 50% deposit starts the project and the rest is due once you have approved the site, before it goes live.`,
  },
  {
    q: 'How long does it take?',
    a: 'Pro is approximately 7–10 working days and Ultimate approximately 10–15, counted from the deposit and the arrival of your content. They are estimates, not guarantees: slow content or feedback moves the date.',
  },
  {
    q: 'Do I own the website?',
    a: 'Yes. The domain stays in your name and the code lives in a repository you own. If you ever want another developer to take over, you hand them the repository and they can start.',
  },
  {
    q: 'Do I have to take a monthly plan?',
    a: `No. Management is optional and is never a condition of having a site built. If you want it, plans start from £${ADVANCED_MANAGEMENT_PRICE} a month and the first month is free. It does not turn into a paid plan unless you decide to carry on.`,
  },
  {
    q: 'What do I need to provide?',
    a: 'Your business details, any logo or branding you already have, photos you want used, accurate service and price information, and how customers should contact you. Copywriting, photography and logo design are not part of the fixed packages.',
  },
  {
    q: 'Who will I be dealing with?',
    a: 'Me, the person who designs and builds the site. There is no account manager passing messages along.',
  },
]

export default function Home() {
  const minis = comparisons.slice(0, 4)
  return (
    <PageShell>
      <section className="hero wrap">
        <div className="collage" aria-hidden="true">
          {minis.map((c, i) => (
            <div key={c.slug} className={`collage-card c${i}`}>
              <MockSite m={c.after} compact />
            </div>
          ))}
        </div>
        <ul className="tags" aria-label="What I build">
          {TAGS.map((t, i) => (
            <li key={t} style={{ animationDelay: `${i * 70}ms` }}>
              {t}
            </li>
          ))}
        </ul>
        <div className="hero-text">
          <p className="hero-line">An independent web studio building fast, honest websites for UK small businesses.</p>
          <h1 className="hero-h">
            Websites that get you found.
            <span>Priced before we start.</span>
          </h1>
          <a className="scroll-cue" href="#services">
            Scroll down
          </a>
        </div>
      </section>

      <section id="services" className="band wrap">
        <p className="eyebrow">Design, build, bookings and care. One person, start to finish.</p>
        <h2 className="section-h">
          What I build.
          <span>And look after.</span>
        </h2>
        <div className="svc-list">
          {SERVICES.map((s) => (
            <article key={s.n} className="svc">
              <span className="svc-n">{s.n}</span>
              <div>
                <p className="label">{s.kicker}</p>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
              <Link className="svc-go" href={s.href}>
                Explore in detail <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="band work-band">
        <div className="wrap">
          <h2 className="section-h">
            Concepts you can check.
            <span>Before you spend a penny.</span>
          </h2>
          <p className="section-sub">Four before-and-after rebuilds. Every business shown is made up; the changes and the measurements are real properties of the mock-ups.</p>
        </div>
        <div className="work-row" role="list">
          {comparisons.map((c) => (
            <Link key={c.slug} href={`/work/${c.slug}`} className="work-card" role="listitem">
              <MockSite m={c.after} compact />
              <span className="work-meta">
                <b>{c.business}</b>
                <span>{c.trade}</span>
              </span>
              <span className="work-tags">
                <i>Concept</i>
                <i>Redesign</i>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="band wrap">
        <h2 className="section-h">
          From first call
          <span>to a live site.</span>
        </h2>
        <p className="section-sub">How it works</p>
        <Process steps={process} />
      </section>

      <section className="band wrap faq-band">
        <div>
          <p className="eyebrow">FAQs</p>
          <h2 className="section-h">
            Straight answers.
            <span>No small print surprises.</span>
          </h2>
        </div>
        <Faq items={FAQS} />
      </section>

      <section className="band wrap">
        <div className="cta-panel">
          <p className="label" style={{ color: 'rgba(255,255,255,.7)' }}>
            Free · 20 minutes · No obligation
          </p>
          <h2>Tell me what the site needs to do.</h2>
          <p>
            Pick a time that suits you. If a smaller package would do the job, that is the one I will point you at. Pro is {`£${buildPackages[0].price}`}.
          </p>
          <Link className="btn light grow-sm" href="/booking">
            Book a call
          </Link>
        </div>
      </section>
    </PageShell>
  )
}
