import Link from 'next/link'
import { CONTACT_EMAIL } from '@/lib/booking/options'
import { messageHref, messageLabel } from '@/lib/contact'
import { PAGES, SOCIALS } from '@/lib/nav'

export function SiteFooter() {
  return (
    <footer className="site-foot">
      <div className="wrap foot-grid">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/mark.png" alt="Northbound Web" width={92} height={40} className="foot-mark" />
          <p className="foot-line">Websites for UK small businesses. Priced up front, built properly, yours to keep.</p>
        </div>
        <nav aria-label="Footer">
          <p className="label">Pages</p>
          <ul>
            {PAGES.map((p) => (
              <li key={p.href}>
                <Link href={p.href}>{p.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="label">Get in touch</p>
          <ul>
            <li>
              <a href={messageHref()} target="_blank" rel="noopener noreferrer">
                {messageLabel}
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </li>
            {SOCIALS.map((s) => (
              <li key={s.href}>
                <a href={s.href} rel="noopener noreferrer" target="_blank">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="wrap foot-base">
        <span>© Northbound Web · United Kingdom</span>
        <span>Preview build · <Link href="/diary">Diary</Link></span>
      </div>
    </footer>
  )
}

/** The floating "Message me" pill at the bottom of the marketing pages. */
export function MessagePill() {
  return (
    <a className="message-pill" href={messageHref()} target="_blank" rel="noopener noreferrer" aria-label={messageLabel}>
      Message me
      <span aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4A8 8 0 1 1 20 12z" />
        </svg>
      </span>
    </a>
  )
}
