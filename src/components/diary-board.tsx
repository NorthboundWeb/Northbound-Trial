'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { getDiary, setBlock, setBookingStatus, type DiaryData } from '@/lib/booking/actions'
import { longDay, slotKey } from '@/lib/booking/dates'
import { TIMES } from '@/lib/booking/options'
import { DayGrid, StatusPill } from './day-slot'

const POLL_MS = 15_000

export function DiaryBoard({ days, initial }: { days: string[]; initial: DiaryData }) {
  const [data, setData] = useState(initial)
  const [blockDay, setBlockDay] = useState(days[0])
  const [msg, setMsg] = useState('')
  const [busy, start] = useTransition()

  useEffect(() => {
    const id = setInterval(async () => {
      if (document.visibilityState !== 'visible') return
      const next = await getDiary()
      if (next) setData(next)
    }, POLL_MS)
    return () => clearInterval(id)
  }, [])

  const rows = useMemo(
    () => [...data.bookings].sort((a, b) => (a.day + a.slot).localeCompare(b.day + b.slot)),
    [data.bookings]
  )
  const open = useMemo(() => rows.filter((r) => r.status !== 'cancelled'), [rows])

  const booked = useMemo(() => new Set(open.map((r) => slotKey(r.day, r.slot))), [open])
  const blocked = useMemo(() => new Set(data.blocks), [data.blocks])
  const unavailable = useMemo(() => new Set([...booked, ...blocked]), [booked, blocked])

  function status(ref: string, s: 'confirmed' | 'cancelled') {
    start(async () => {
      const res = await setBookingStatus(ref, s)
      if (res.data) setData(res.data)
      setMsg(res.ok ? '' : 'Your diary session has ended. Reload and sign in again.')
    })
  }

  function toggle(time: string) {
    const key = slotKey(blockDay, time)
    start(async () => {
      const res = await setBlock(blockDay, time, !blocked.has(key))
      if (res.data) setData(res.data)
      setMsg(res.error || (res.ok ? '' : 'That did not save. Reload and try again.'))
    })
  }

  return (
    <>
      <p className="label kick">Diary</p>
      <h1 className="display" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', marginTop: 18 }}>
        Call requests<span className="kick">.</span>
      </h1>
      <p className="sub">
        {open.length} active, {rows.length - open.length} cancelled. Confirming here updates the visitor&apos;s page. Email them to confirm the
        time too: this preview does not send email.
      </p>
      {msg && (
        <div className="banner" role="alert" style={{ marginTop: 24 }}>
          {msg}
        </div>
      )}
      <div className="body">
        {rows.length ? (
          <ul className="rows">
            {rows.map((r) => (
              <li className="item" key={r.ref}>
                <div className="main">
                  <p className="when">
                    {longDay(r.day)} at {r.slot} <StatusPill status={r.status} />
                  </p>
                  <p className="meta">
                    {r.name}
                    {r.business ? ` · ${r.business}` : ''} · Ref {r.ref}
                    {r.cancelledBy ? ` · cancelled by ${r.cancelledBy === 'owner' ? 'you' : 'them'}` : ''}
                  </p>
                  <dl>
                    <dt>Email</dt>
                    <dd>
                      <a href={`mailto:${r.email}`}>{r.email}</a>
                    </dd>
                    {r.phone && (
                      <>
                        <dt>Phone</dt>
                        <dd>{r.phone}</dd>
                      </>
                    )}
                    <dt>Needs</dt>
                    <dd>{r.help.join(', ')}</dd>
                    <dt>Budget</dt>
                    <dd>{r.budget}</dd>
                    {r.plan && (
                      <>
                        <dt>Monthly plan</dt>
                        <dd>{r.plan}</dd>
                      </>
                    )}
                    <dt>Timeline</dt>
                    <dd>{r.timeline}</dd>
                    {r.site && (
                      <>
                        <dt>Site</dt>
                        <dd>{r.site}</dd>
                      </>
                    )}
                    {r.other && (
                      <>
                        <dt>Notes</dt>
                        <dd>{r.other}</dd>
                      </>
                    )}
                  </dl>
                </div>
                <div className="acts">
                  {r.status === 'requested' && (
                    <button className="btn small" type="button" disabled={busy} onClick={() => status(r.ref, 'confirmed')}>
                      Confirm
                    </button>
                  )}
                  {r.status !== 'cancelled' && (
                    <button className="btn small" type="button" disabled={busy} onClick={() => status(r.ref, 'cancelled')}>
                      Cancel
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty">No requests yet. When someone books a call it appears here within a few seconds.</div>
        )}

        <section className="group" style={{ maxWidth: 'none' }}>
          <h2>Block out time</h2>
          <p className="hint">Pick a day, then tap a free time to block it, or a blocked time to free it.</p>
          <div style={{ marginTop: 16 }}>
            <DayGrid days={days} selected={blockDay} taken={unavailable} onPick={setBlockDay} />
          </div>
          <div className="slots" role="group" aria-label={`Times on ${longDay(blockDay)}`} style={{ marginTop: 20 }}>
            {TIMES.map((t) => {
              const key = slotKey(blockDay, t)
              if (booked.has(key))
                return (
                  <button key={t} type="button" className="slot" disabled>
                    {t}
                    <small>Booked</small>
                  </button>
                )
              const isBlocked = blocked.has(key)
              return (
                <button key={t} type="button" className="slot" aria-pressed={isBlocked} disabled={busy} onClick={() => toggle(t)}>
                  {t}
                  <small>{isBlocked ? 'Blocked' : 'Free'}</small>
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </>
  )
}
