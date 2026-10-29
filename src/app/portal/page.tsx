import type { Metadata } from 'next'
import Link from 'next/link'
import { PageShell } from '@/components/page-shell'
import { listProjects, type Project } from '@/lib/portal/data'
import { getSession } from '@/lib/portal/session'
import { signOut } from './actions'
import { ProjectProgress } from './progress'
import { SignInForm } from './sign-in-form'

export const metadata: Metadata = {
  title: 'Client login',
  description: 'See how your website is coming along.',
  robots: { index: false, follow: false },
}

export default async function PortalPage({ searchParams }: { searchParams: Promise<{ link?: string }> }) {
  const { link } = await searchParams
  const session = await getSession()

  if (!session) {
    return (
      <PageShell>
        <section className="wrap pt-wrap">
          <p className="eyebrow">Client login</p>
          <h1 className="section-h big">
            Your website,
            <span>as it happens.</span>
          </h1>
          <p className="section-sub">Enter the email you used with me and I will send you a one-tap sign-in link. No password to remember.</p>
          {link === 'bad' && (
            <div className="banner" role="alert" style={{ marginTop: 24 }}>
              That sign-in link has expired or was already used. Ask for a fresh one below.
            </div>
          )}
          <SignInForm />
          <p className="note" style={{ marginTop: 28 }}>
            Not a client yet? <Link href="/start">Get your first website built free</Link>.
          </p>
        </section>
      </PageShell>
    )
  }

  let projects: Project[] = []
  let failed = false
  try {
    projects = await listProjects(session.email)
  } catch (error) {
    console.error('Could not load projects:', error)
    failed = true
  }
  const first = projects[0]?.client_name.split(/\s+/)[0]

  return (
    <PageShell>
      <section className="wrap pt-wrap">
        <div className="pt-top">
          <p className="eyebrow">Signed in as {session.email}</p>
          <div className="pt-top-btns">
            {session.admin && (
              <Link className="btn small" href="/portal/admin">
                Admin
              </Link>
            )}
            <form action={signOut}>
              <button className="btn small" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </div>
        <h1 className="section-h big">
          {first ? `Hi ${first}.` : 'Hello.'}
          <span>{projects.length ? 'Here is where things are.' : 'Nothing here yet.'}</span>
        </h1>
        {failed && (
          <div className="banner" role="alert" style={{ marginTop: 24 }}>
            I could not load your project just now. Please refresh in a minute, or message me on WhatsApp.
          </div>
        )}
        {!failed && projects.length === 0 && (
          <p className="section-sub">
            There is no project under this email yet. If you have sent me a request, I will add it here once I have read it.{' '}
            <Link href="/start">Start a project</Link>.
          </p>
        )}
        <div className="pt-list">
          {projects.map((p) => (
            <ProjectProgress key={p.id} p={p} />
          ))}
        </div>
      </section>
    </PageShell>
  )
}
