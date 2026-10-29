import Link from 'next/link'

/** Mark top left, step counter top right, hairline progress under it. */
export function TopBar({ count, progress }: { count?: string; progress?: number }) {
  return (
    <header className="top">
      <div className="top-in">
        <Link className="logo" href="/" aria-label="Northbound Web, book a call">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/mark.png" alt="" width={69} height={30} />
        </Link>
        {count && (
          <span className="count" aria-hidden="true">
            {count}
          </span>
        )}
      </div>
      {typeof progress === 'number' && <span className="bar" style={{ width: `${Math.round(progress * 100)}%` }} />}
    </header>
  )
}
