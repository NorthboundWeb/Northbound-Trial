import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PageShell } from '@/components/page-shell'
import { fmtDate, listProjects, type Project } from '@/lib/portal/data'
import { getSession } from '@/lib/portal/session'
import { STAGES } from '@/lib/portal/stages'
import { addUpdate, deleteProject, deleteUpdate, saveProject, signOut } from '../actions'
import { ProjectProgress } from '../progress'
import { LinkButton } from './link-button'

export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } }

function ProjectFields({ p }: { p?: Project }) {
  return (
    <>
      {p && <input type="hidden" name="id" value={p.id} />}
      <div className="grid2">
        <div className="field">
          <label htmlFor={`n-${p?.id ?? 'new'}`}>Client name</label>
          <input id={`n-${p?.id ?? 'new'}`} name="client_name" type="text" defaultValue={p?.client_name} required />
        </div>
        <div className="field">
          <label htmlFor={`e-${p?.id ?? 'new'}`}>Client email (their login)</label>
          <input id={`e-${p?.id ?? 'new'}`} name="client_email" type="email" defaultValue={p?.client_email} required />
        </div>
        <div className="field">
          <label htmlFor={`b-${p?.id ?? 'new'}`}>Business</label>
          <input id={`b-${p?.id ?? 'new'}`} name="business" type="text" defaultValue={p?.business} />
        </div>
        <div className="field">
          <label htmlFor={`t-${p?.id ?? 'new'}`}>Project</label>
          <input id={`t-${p?.id ?? 'new'}`} name="title" type="text" defaultValue={p?.title} placeholder="e.g. New website" required />
        </div>
        <div className="field">
          <label htmlFor={`s-${p?.id ?? 'new'}`}>Stage</label>
          <select id={`s-${p?.id ?? 'new'}`} name="stage" defaultValue={STAGES[p?.stage ?? 0].name} className="pa-select">
            {STAGES.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name} ({s.progress}%)
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`p-${p?.id ?? 'new'}`}>
            Progress % <i>Blank uses the stage</i>
          </label>
          <input id={`p-${p?.id ?? 'new'}`} name="progress" type="text" inputMode="numeric" pattern="\d{1,3}" defaultValue={p ? String(p.progress) : ''} />
        </div>
        <div className="field">
          <label htmlFor={`d-${p?.id ?? 'new'}`}>Aiming for</label>
          <input id={`d-${p?.id ?? 'new'}`} name="due_date" type="date" defaultValue={p?.due_date} className="pa-date" />
        </div>
        <div className="field">
          <label htmlFor={`v-${p?.id ?? 'new'}`}>Preview link</label>
          <input id={`v-${p?.id ?? 'new'}`} name="preview_url" type="url" defaultValue={p?.preview_url} />
        </div>
        <div className="field">
          <label htmlFor={`l-${p?.id ?? 'new'}`}>Live link</label>
          <input id={`l-${p?.id ?? 'new'}`} name="live_url" type="url" defaultValue={p?.live_url} />
        </div>
      </div>
      <div className="field" style={{ marginTop: 18 }}>
        <label htmlFor={`o-${p?.id ?? 'new'}`}>
          Note for the client <i>Shown on their page</i>
        </label>
        <textarea id={`o-${p?.id ?? 'new'}`} name="note" rows={3} defaultValue={p?.note} />
      </div>
    </>
  )
}

export default async function AdminPage() {
  const session = await getSession()
  if (!session?.admin) redirect('/portal')

  let projects: Project[] = []
  let failed = ''
  try {
    projects = await listProjects()
  } catch (error) {
    failed = error instanceof Error ? error.message : 'Unknown error'
  }

  return (
    <PageShell>
      <section className="wrap pt-wrap">
        <div className="pt-top">
          <p className="eyebrow">Admin · {session.email}</p>
          <div className="pt-top-btns">
            <Link className="btn small" href="/portal">
              My client view
            </Link>
            <form action={signOut}>
              <button className="btn small" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </div>
        <h1 className="section-h big">
          Client projects.
          <span>
            {projects.length} on the board.
          </span>
        </h1>
        <p className="section-sub">Changes here show on the client&apos;s page straight away. You can also edit the Projects tab in the Google Sheet directly.</p>
        {failed && (
          <div className="banner" role="alert" style={{ marginTop: 24 }}>
            Could not read the Sheet: {failed}
          </div>
        )}

        <details className="pa-new">
          <summary className="btn solid">+ New project</summary>
          <form action={saveProject} className="pa-form">
            <ProjectFields />
            <button className="btn solid" type="submit">
              Add project
            </button>
          </form>
        </details>

        <div className="pa-list">
          {projects.map((p) => (
            <section key={p.id} className="pa-item" aria-label={`${p.client_name}: ${p.title}`}>
              <div className="pa-item-head">
                <div>
                  <p className="label">
                    {p.ref} · {STAGES[p.stage].name} · {p.progress}%
                  </p>
                  <h2>
                    {p.client_name}
                    {p.business ? <small> · {p.business}</small> : null}
                  </h2>
                  <p className="note">
                    {p.title} · {p.client_email}
                    {p.updated_at ? ` · updated ${fmtDate(p.updated_at, true)}` : ''}
                  </p>
                </div>
                <LinkButton email={p.client_email} name={p.client_name} />
              </div>

              <form action={addUpdate} className="pa-update">
                <input type="hidden" name="project_id" value={p.id} />
                <label htmlFor={`u-${p.id}`} className="sr">
                  Post an update
                </label>
                <input id={`u-${p.id}`} name="body" type="text" placeholder="Post an update the client will see…" required />
                <button className="btn small solid" type="submit">
                  Post
                </button>
              </form>

              <details className="pa-edit">
                <summary>Edit details, stage and links</summary>
                <form action={saveProject} className="pa-form">
                  <ProjectFields p={p} />
                  <button className="btn solid" type="submit">
                    Save changes
                  </button>
                </form>
                {p.updates.length > 0 && (
                  <ul className="pa-updates">
                    {p.updates.map((u) => (
                      <li key={u.id}>
                        <span>
                          <time dateTime={u.created_at}>{fmtDate(u.created_at, true)}</time> {u.body}
                        </span>
                        <form action={deleteUpdate}>
                          <input type="hidden" name="id" value={u.id} />
                          <button type="submit" className="link">
                            Remove
                          </button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}
                <form action={deleteProject} className="pa-delete">
                  <input type="hidden" name="id" value={p.id} />
                  <label>
                    <input type="checkbox" name="confirm" value="yes" required /> Yes, delete this project and its updates
                  </label>
                  <button type="submit" className="btn small">
                    Delete project
                  </button>
                </form>
              </details>

              <details className="pa-preview">
                <summary>What the client sees</summary>
                <ProjectProgress p={p} />
              </details>
            </section>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
