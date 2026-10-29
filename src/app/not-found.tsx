import Link from 'next/link'

export default function NotFound() {
  return (
    <main id="main" className="stage" style={{ textAlign: 'center', paddingTop: 120 }}>
      <p className="label">404</p>
      <h1 className="display" style={{ marginTop: 14 }}>
        That page is not here<span className="kick">.</span>
      </h1>
      <p className="sub" style={{ marginInline: 'auto' }}>
        It may have moved. Head home, or start your free website.
      </p>
      <p style={{ marginTop: 28, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link className="btn solid" href="/">
          Home
        </Link>
        <Link className="btn" href="/start">
          Start a project
        </Link>
      </p>
    </main>
  )
}
