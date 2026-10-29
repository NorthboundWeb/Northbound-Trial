import Link from 'next/link'
import { Faq, Process } from '@/components/faq'
import { DemoSite } from '@/components/demo-site'
import { MockSite } from '@/components/mock-site'
import { PageShell } from '@/components/page-shell'
import { ServiceTicker } from '@/components/service-ticker'
import { SiteWall } from '@/components/site-wall'
import { comparisons } from '@/lib/discover'
import { demos } from '@/lib/showcase'
import { ADVANCED_MANAGEMENT_PRICE, buildPackages, process } from '@/lib/services'

/** The clickable list beside the wall: each one opens the page that covers it. */
const TAGS = [
  { label: 'Small-business websites', href: '/services/pro' },
  { label: 'Website redesigns', href: '/work' },
  { label: 'Landing pages', href: '/services/pro' },
  { label: 'Online booking', href: '/services/ultimate' },
  { label: 'Local SEO', href: '/services/ultimate' },
  { label: 'Online shops', href: '/demos/florist' },
  { label: 'Monthly website care', href: '/services/management' },
  { label: 'Custom web apps', href: '/services/custom' },
  { label: 'Website check', href: '/tools' },
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
  return (
    <PageShell>
      <section className="hero wrap">
        <SiteWall />
        <ServiceTicker items={TAGS} />
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

      <section className="band wrap" aria-labelledby="demos-h">
        <p className="eyebrow">The sites on the wall are real pages. Open any of them.</p>
        <h2 id="demos-h" className="section-h">
          Twelve sites.
          <span>Built to show what is possible.</span>
        </h2>
        <p className="section-sub">Every business here is made up. The bookings, price lists, shops and calculators are the kind of thing your site can have.</p>
        <div className="demo-grid">
          {demos.map((d) => (
            <Link key={d.slug} href={`/demos/${d.slug}`} className="demo-tile">
              <span className="demo-tile-shot" aria-hidden="true">
                <span className="demo-tile-scale">
                  <DemoSite d={d} />
                </span>
              </span>
              <span className="work-meta">
                <b>{d.name}</b>
                <span>{d.trade}</span>
              </span>
            </Link>
          ))}
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
          From first message
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
            Free · No calls · Written quote
          </p>
          <h2>Tell me what the site needs to do.</h2>
          <p>
            Five quick questions, then I reply by WhatsApp or email. If a smaller package would do the job, that is the one I will point you at. Pro is {`£${buildPackages[0].price}`}.
          </p>
          <Link className="btn light grow-sm" href="/start">
            Start a project
          </Link>
        </div>
      </section>
    </PageShell>
  )
}
