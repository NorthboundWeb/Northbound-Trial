import type { Demo } from '@/lib/showcase'

/**
 * One made-up business's website, drawn entirely in HTML and CSS.
 *
 * `full` renders the whole one-page site (used on /demos/[slug]). Without it,
 * only the first screen is drawn at a fixed 1280×800 size, which the home
 * page wall scales down to make its "screenshots" — so the wall shows the real
 * pages, not pictures of them.
 */
export function DemoSite({ d, full = false }: { d: Demo; full?: boolean }) {
  const style = {
    ['--d-bg' as string]: d.c.bg,
    ['--d-ink' as string]: d.c.ink,
    ['--d-accent' as string]: d.c.accent,
    ['--d-on' as string]: d.c.on,
    ['--d-soft' as string]: d.c.soft,
    ['--d-muted' as string]: d.c.muted,
  }
  return (
    <div className={`demo v-${d.variant} f-${d.font}${full ? ' full' : ' shot'}`} style={style}>
      <header className="d-nav">
        <b className="d-logo">{d.name}</b>
        <nav aria-label={full ? `${d.name} sections` : undefined}>
          <span>Services</span>
          <span>Prices</span>
          <span>About</span>
        </nav>
        <span className="d-btn">{d.ctaA}</span>
      </header>

      <section className="d-hero">
        <div className="d-hero-text">
          <p className="d-kicker">{d.kicker}</p>
          {full ? <h1 className="d-h">{d.headline}</h1> : <p className="d-h">{d.headline}</p>}
          <p className="d-sub">{d.sub}</p>
          <div className="d-ctas">
            <span className="d-btn">{d.ctaA}</span>
            <span className="d-btn ghost">{d.ctaB}</span>
          </div>
        </div>
        <div className="d-hero-art" aria-hidden="true">
          <div className="d-card">
            <p className="d-card-k">{d.trade}</p>
            {d.menu.map((m) => (
              <div key={m.name} className="d-row">
                <span>{m.name}</span>
                <b>{m.price}</b>
              </div>
            ))}
            <span className="d-btn wide">{d.ctaA}</span>
          </div>
          <div className="d-blob" />
        </div>
      </section>

      <div className="d-strip">
        <span>{d.hours}</span>
        <span>{d.place}</span>
        {d.shows.map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>

      {full && (
        <>
          <section className="d-sec" aria-labelledby={`${d.slug}-prices`}>
            <h2 id={`${d.slug}-prices`} className="d-h2">
              Prices
            </h2>
            <div className="d-menu">
              {d.menu.map((m) => (
                <div key={m.name} className="d-item">
                  <h3>{m.name}</h3>
                  <p className="d-price">{m.price}</p>
                  <p>{m.note}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="d-sec alt" aria-labelledby={`${d.slug}-why`}>
            <h2 id={`${d.slug}-why`} className="d-h2">
              Why people book with {d.name.split(' ')[0]}
            </h2>
            <div className="d-points">
              {d.points.map((p, i) => (
                <div key={p.title}>
                  <span className="d-num">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="d-sec d-cta">
            <h2 className="d-h2">{d.ctaA}</h2>
            <p>{d.hours}</p>
            <span className="d-btn big">{d.ctaA}</span>
          </section>
          <footer className="d-foot">
            <b>{d.name}</b>
            <span>
              {d.trade} · {d.place}
            </span>
          </footer>
        </>
      )}
    </div>
  )
}
