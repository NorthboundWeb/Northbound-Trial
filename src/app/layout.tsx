import type { Metadata } from 'next'
import { Inter, Inter_Tight, JetBrains_Mono } from 'next/font/google'
import { Curtain } from '@/components/curtain'
import { Intro, introSeenScript } from '@/components/intro'
import './globals.css'

const sans = Inter({ subsets: ['latin'], variable: '--nb-sans', display: 'swap' })
const display = Inter_Tight({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--nb-display', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--nb-mono', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'Northbound Web — websites for UK small businesses', template: '%s — Northbound Web' },
  description: 'Fast, honest websites for UK small businesses, priced up front. Preview build.',
  // A preview, not the live site: keep it out of search results.
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${sans.variable} ${display.variable} ${mono.variable}`} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: introSeenScript }} />
        <Intro />
        <Curtain />
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  )
}
