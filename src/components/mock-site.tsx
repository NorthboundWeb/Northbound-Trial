import type { MockAfter } from '@/lib/discover'

/**
 * A small drawn-in-CSS home page for one of the concept businesses. No images:
 * the colours, headline and tiles come from src/lib/discover.ts.
 */
export function MockSite({ m, compact = false }: { m: MockAfter; compact?: boolean }) {
  return (
    <div
      className={`mock${compact ? ' compact' : ''}`}
      style={{ background: m.bg, color: m.ink, ['--m-accent' as string]: m.accent, ['--m-on' as string]: m.onAccent, ['--m-soft' as string]: m.soft }}
      aria-hidden="true"
    >
      <div className="mock-top">
        <b>{m.name}</b>
        <span className="mock-call">{m.phone}</span>
      </div>
      <p className="mock-kick">{m.kicker}</p>
      <p className="mock-h">{m.headline}</p>
      {!compact && <p className="mock-sub">{m.sub}</p>}
      <div className="mock-ctas">
        <span className="a">{m.ctaA}</span>
        <span className="b">{m.ctaB}</span>
      </div>
      <div className="mock-tiles">
        {m.tiles.map(([t, v]) => (
          <span key={t}>
            <i>{t}</i>
            {v}
          </span>
        ))}
      </div>
      {!compact && <p className="mock-strip">{m.strip}</p>}
    </div>
  )
}
