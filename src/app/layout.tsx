import type { Metadata, Viewport } from 'next'
import { Inter, Inter_Tight, JetBrains_Mono } from 'next/font/google'
import { Curtain } from '@/components/curtain'
import { DotCursor } from '@/components/dot-cursor'
import { Intro } from '@/components/intro'
import { SwipeBack } from '@/components/swipe-back'
import { bootScript } from '@/lib/boot-scripts'
import { site } from '@/lib/site'
import './globals.css'

const sans = Inter({ subsets: ['latin'], variable: '--nb-sans', display: 'swap' })
const display = Inter_Tight({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--nb-display', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--nb-mono', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s — ${site.name}` },
  description: site.description,
  openGraph: { type: 'website', locale: 'en_GB', url: site.url, siteName: site.name, title: `${site.name} — ${site.tagline}`, description: site.description },
  twitter: { card: 'summary_large_image', title: `${site.name} — ${site.tagline}`, description: site.description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'dark light',
  themeColor: '#06080d',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" data-theme="dark" className={`${sans.variable} ${display.variable} ${mono.variable}`} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <Intro />
        <Curtain />
        <SwipeBack />
        <DotCursor />
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  )
}
