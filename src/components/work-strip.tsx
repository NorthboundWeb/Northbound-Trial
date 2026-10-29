const TILES = [
  { title: 'SL Lash Lab', kind: 'Beauty · Landing page', wash: 'radial-gradient(120% 90% at 20% 90%, #3b2a6b 0%, transparent 60%)' },
  { title: 'Sol Aurellé', kind: 'Brand · Website', wash: 'radial-gradient(120% 90% at 80% 10%, #8a5a2b 0%, transparent 60%)' },
  { title: 'Your project', kind: 'Trades · Website', wash: 'radial-gradient(120% 90% at 50% 100%, #1f5fd1 0%, transparent 60%)' },
  { title: 'Your project', kind: 'Food · Bookings', wash: 'radial-gradient(120% 90% at 10% 10%, #1e6b5a 0%, transparent 60%)' },
]

/** The scrolling strip of work across the top. Decorative, so hidden from screen readers. */
export function WorkStrip() {
  const loop = [...TILES, ...TILES]
  return (
    <div className="strip" aria-hidden="true">
      <div className="mq">
        {loop.map((t, i) => (
          <div className="tile" key={i}>
            <i style={{ background: `${t.wash}, linear-gradient(160deg, #141a26, #0d1118)` }} />
            <b>{t.title}</b>
            <span>{t.kind}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
