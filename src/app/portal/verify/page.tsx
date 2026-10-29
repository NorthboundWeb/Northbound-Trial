import type { Metadata } from 'next'
import { TopBar } from '@/components/top-bar'
import { confirmLink } from '../actions'

export const metadata: Metadata = { title: 'Sign in', robots: { index: false, follow: false } }

/** The link in the email lands here; the button does the sign-in, so mail scanners that open links cannot use it up. */
export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = '' } = await searchParams
  return (
    <>
      <TopBar count="Sign in" progress={1} />
      <main id="main" className="stage step-in">
        <p className="label">Northbound Web · Client login</p>
        <h1 className="display" style={{ marginTop: 14 }}>
          One tap and you are in<span className="kick">.</span>
        </h1>
        <p className="sub">This signs you in on this device for 30 days.</p>
        <form action={confirmLink} style={{ marginTop: 32 }}>
          <input type="hidden" name="token" value={token} />
          <button className="btn solid" type="submit" style={{ minWidth: 220 }}>
            See my project
          </button>
        </form>
      </main>
    </>
  )
}
