'use client'

import { useState } from 'react'
import type { JSX } from 'react'
import { repairs } from './data'
import styles from './styles.module.css'

type Choice = 'yes' | 'no' | null

/** A phone showing the repair approval screen. Works: approve or decline each item. */
export function Approvals(): JSX.Element {
  const [choice, setChoice] = useState<Record<string, Choice>>({})
  const approved = repairs.filter((r) => choice[r.id] === 'yes')
  const total = approved.reduce((n, r) => n + r.price, 0)
  const decided = repairs.filter((r) => choice[r.id]).length

  function set(id: string, c: Choice) {
    setChoice((prev) => ({ ...prev, [id]: prev[id] === c ? null : c }))
  }

  return (
    <div className={styles.phone}>
      <div className={styles.phoneNotch} aria-hidden="true" />
      <div className={styles.phoneScreen}>
        <p className={styles.phoneK}>Northgate Motors · your car</p>
        <p className={styles.phoneTitle}>3 items need your OK</p>
        <ul className={styles.repList}>
          {repairs.map((r) => {
            const c = choice[r.id] ?? null
            return (
              <li key={r.id} className={`${styles.rep} ${c === 'yes' ? styles.repYes : c === 'no' ? styles.repNo : ''}`}>
                <div className={styles.repPhoto} aria-hidden="true">
                  <span />
                </div>
                <div className={styles.repInfo}>
                  <span
                    className={`${styles.repLevel} ${
                      r.level === 'Needed to pass' ? styles.lvlBad : r.level === 'Recommended' ? styles.lvlWarn : styles.lvlInfo
                    }`}
                  >
                    {r.level}
                  </span>
                  <b>{r.name}</b>
                  <span className={styles.repWhy}>{r.why}</span>
                  <span className={styles.repPrice}>£{r.price}</span>
                </div>
                <div className={styles.repBtns} role="group" aria-label={`${r.name}, £${r.price}`}>
                  <button type="button" aria-pressed={c === 'yes'} onClick={() => set(r.id, 'yes')} className={styles.repOk}>
                    Approve
                  </button>
                  <button type="button" aria-pressed={c === 'no'} onClick={() => set(r.id, 'no')} className={styles.repDecline}>
                    Decline
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
        <div className={styles.phoneTotal} aria-live="polite">
          <span>
            {decided}/{repairs.length} decided · {approved.length} approved
          </span>
          <b>£{total}</b>
        </div>
        <p className={styles.phoneNote}>Demo only: nothing is sent.</p>
      </div>
    </div>
  )
}
