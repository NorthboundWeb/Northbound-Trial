import { fmtDate, type Project } from '@/lib/portal/data'
import { STAGES } from '@/lib/portal/stages'

/** One project's progress: percentage, stage track, dates, links and updates. Used by the client and admin pages. */
export function ProjectProgress({ p }: { p: Project }) {
  const current = STAGES[p.stage]
  return (
    <article className="pt-card" aria-labelledby={`pt-h-${p.id}`}>
      <header className="pt-card-head">
        <div>
          <p className="label">
            {p.ref}
            {p.business ? ` · ${p.business}` : ''}
          </p>
          <h2 id={`pt-h-${p.id}`}>{p.title}</h2>
        </div>
        <div className="pt-pct" aria-label={`${p.progress}% complete`}>
          {p.progress}
          <small>%</small>
        </div>
      </header>

      <div className="pt-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={p.progress} aria-label="Progress">
        <span style={{ width: `${p.progress}%` }} />
      </div>

      <ol className="pt-track" aria-label="Stages">
        {STAGES.map((s, i) => (
          <li key={s.name} className={i < p.stage ? 'done' : i === p.stage ? 'now' : ''} aria-current={i === p.stage ? 'step' : undefined}>
            <i aria-hidden="true">{i < p.stage ? '✓' : i + 1}</i>
            <span>{s.name}</span>
          </li>
        ))}
      </ol>

      <div className="pt-now">
        <b>{current.name}</b>
        <p>{current.blurb}</p>
        {p.due_date && p.stage < STAGES.length - 1 && (
          <p className="note">Aiming for {fmtDate(p.due_date)}. An estimate, not a guarantee: big changes can move it.</p>
        )}
      </div>

      {(p.preview_url || p.live_url) && (
        <div className="pt-links">
          {p.live_url && (
            <a className="btn solid" href={p.live_url} target="_blank" rel="noopener noreferrer">
              Open your live website
            </a>
          )}
          {p.preview_url && (
            <a className={`btn${p.live_url ? '' : ' solid'}`} href={p.preview_url} target="_blank" rel="noopener noreferrer">
              Open the preview
            </a>
          )}
        </div>
      )}

      {p.note && (
        <div className="pt-note">
          <p className="label">Note from Che</p>
          <p>{p.note}</p>
        </div>
      )}

      {p.updates.length > 0 && (
        <section className="pt-updates" aria-label="Updates">
          <p className="label">Updates</p>
          <ol>
            {p.updates.map((u) => (
              <li key={u.id}>
                <time dateTime={u.created_at}>{fmtDate(u.created_at, true)}</time>
                <p>{u.body}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  )
}
