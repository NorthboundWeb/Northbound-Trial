import { LogoLink } from './logo-link'

/** Booking and diary header: mark top left, step counter top right, hairline progress under it. */
export function TopBar({ count, progress }: { count?: string; progress?: number }) {
  return (
    <header className="top">
      <div className="top-in">
        <LogoLink />
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
