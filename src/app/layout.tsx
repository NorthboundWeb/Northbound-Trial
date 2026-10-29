import type { Metadata } from 'next'
import Link from 'next/link'
import { Inter, Inter_Tight, JetBrains_Mono } from 'next/font/google'
import { WorkStrip } from '@/components/work-strip'
import './globals.css'

const sans = Inter({ subsets: ['latin'], variable: '--nb-sans', display: 'swap' })
const display = Inter_Tight({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--nb-display', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['500'], variable: '--nb-mono', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'Book a call — Northbound Web', template: '%s — Northbound Web' },
  description: 'Book a free 20-minute call with Northbound Web. Preview build.',
  // A preview, not the live site: keep it out of search results.
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <WorkStrip />
        <div className="wrap">
          <header className="bar">
            <Link className="brand" href="/">
              <span className="mark" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20V5" />
                  <path d="M6 11l6-6 6 6" />
                </svg>
              </span>
              <b>Northbound</b>
              <span>Web.co</span>
            </Link>
            <nav className="nav" aria-label="Main">
              <Link href="/" aria-current="page">
                Book a call
              </Link>
            </nav>
          </header>
          <main id="main">{children}</main>
          <footer>
            <span>© Northbound Web · UK · Preview, not the live site</span>
            <span>
              <Link href="/diary" style={{ color: 'inherit' }}>
                NB / DIARY
              </Link>
            </span>
          </footer>
        </div>
      </body>
    </html>
  )
}
