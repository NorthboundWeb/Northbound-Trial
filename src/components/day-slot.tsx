'use client'

import { formatDay, slotKey } from '@/lib/booking/dates'
import { TIMES } from '@/lib/booking/options'

export function DayGrid({
  days,
  selected,
  taken,
  onPick,
}: {
  days: readonly string[]
  selected: string
  taken: ReadonlySet<string>
  onPick: (day: string) => void
}) {
  return (
    <div className="days" role="group" aria-label="Day">
      {days.map((d) => {
        const left = TIMES.filter((t) => !taken.has(slotKey(d, t))).length
        return (
          <button key={d} type="button" className="day" aria-pressed={selected === d} onClick={() => onPick(d)}>
            <span className="w">{formatDay(d, { weekday: 'short' })}</span>
            <span className="n">{formatDay(d, { day: 'numeric' })}</span>
            <span className="m">{formatDay(d, { month: 'short' })}</span>
            {left === 0 && <span className="full">Full</span>}
          </button>
        )
      })}
    </div>
  )
}

export function SlotGrid({
  day,
  selected,
  taken,
  onPick,
}: {
  day: string
  selected: string
  taken: ReadonlySet<string>
  onPick: (time: string) => void
}) {
  return (
    <div className="slots" role="group" aria-label="Times">
      {TIMES.map((t) => {
        if (!day)
          return (
            <button key={t} type="button" className="slot" disabled>
              {t}
            </button>
          )
        if (taken.has(slotKey(day, t)))
          return (
            <button key={t} type="button" className="slot" disabled>
              {t}
              <small>Taken</small>
            </button>
          )
        return (
          <button key={t} type="button" className="slot" aria-pressed={selected === t} onClick={() => onPick(t)}>
            {t}
          </button>
        )
      })}
    </div>
  )
}

export function StatusPill({ status }: { status: string }) {
  return <span className={`status ${status}`}>{status === 'requested' ? 'Waiting for confirmation' : status}</span>
}
