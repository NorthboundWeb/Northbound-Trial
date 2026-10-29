import { MessagePill, SiteFooter } from './site-footer'
import { SiteNav } from './site-nav'

/** Header, footer and the floating message pill around every marketing page. */
export function PageShell({ children, after }: { children: React.ReactNode; after?: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      <main id="main">{children}</main>
      <SiteFooter />
      {after}
      <MessagePill />
    </>
  )
}
