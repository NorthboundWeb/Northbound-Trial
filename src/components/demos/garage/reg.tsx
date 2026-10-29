'use client'

import { useState } from 'react'
import type { FormEvent, JSX } from 'react'
import { MONTHS, lookupReg, motNote } from './data'
import type { Vehicle } from './data'
import { Arrow, Plate } from './parts'
import styles from './styles.module.css'

/** The yellow-plate reg box. `hero` is the big one; `compact` sits in the booking form. */
export function RegForm({
  id,
  variant,
  onFound,
}: {
  id: string
  variant: 'hero' | 'compact'
  onFound: (v: Vehicle) => void
}): JSX.Element {
  const [raw, setRaw] = useState('')
  const [error, setError] = useState('')

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const now = new Date()
    const r = lookupReg(raw, now.getFullYear(), now.getMonth() + 1)
    if (!r.ok) {
      setError(r.error)
      return
    }
    setError('')
    setRaw(r.v.plate)
    onFound(r.v)
  }

  return (
    <form className={variant === 'hero' ? styles.regHero : styles.regCompact} onSubmit={submit} noValidate>
      <label htmlFor={id} className={variant === 'hero' ? styles.regLabel : styles.fieldLabel}>
        {variant === 'hero' ? 'Enter your registration' : 'Registration'}
      </label>
      <div className={styles.regRow}>
        <span className={styles.plateInputWrap}>
          <span className={styles.plateBand} aria-hidden="true">
            UK
          </span>
          <input
            id={id}
            className={styles.plateInput}
            value={raw}
            onChange={(e) => setRaw(e.target.value.toUpperCase())}
            placeholder="AB21 CDE"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={9}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-err` : undefined}
          />
        </span>
        <button type="submit" className={styles.btnGreen}>
          {variant === 'hero' ? 'Find my car' : 'Find'} <Arrow />
        </button>
      </div>
      <p id={`${id}-err`} className={styles.regErr} role={error ? 'alert' : undefined}>
        {error}
      </p>
    </form>
  )
}

export function CarCard({
  v,
  nowY,
  nowM,
  onBook,
  onMot,
}: {
  v: Vehicle
  nowY: number
  nowM: number
  onBook: () => void
  onMot: () => void
}): JSX.Element {
  return (
    <div className={styles.carCard}>
      <div className={styles.carCardTop}>
        <Plate text={v.plate} small />
        <span className={styles.swatch} style={{ background: v.colourHex }} aria-hidden="true" />
      </div>
      <p className={styles.carName}>
        {v.make} {v.model} <span>{v.body}</span>
      </p>
      <dl className={styles.carSpecs}>
        <div>
          <dt>Colour</dt>
          <dd>{v.colour}</dd>
        </div>
        <div>
          <dt>Fuel</dt>
          <dd>{v.fuel}</dd>
        </div>
        <div>
          <dt>Engine</dt>
          <dd>{v.engine}</dd>
        </div>
        <div>
          <dt>First registered</dt>
          <dd>
            {v.approx ? 'About ' : ''}
            {MONTHS[v.regMonth - 1]} {v.regYear}
          </dd>
        </div>
      </dl>
      <p className={styles.carMot}>{motNote(v, nowY, nowM)}</p>
      <div className={styles.carActions}>
        <button type="button" className={styles.btnGreen} onClick={onBook}>
          Book an MOT for this car <Arrow />
        </button>
        <button type="button" className={styles.btnLine} onClick={onMot}>
          Work out my MOT date
        </button>
      </div>
      <p className={styles.fakeNote}>Made-up vehicle details for this demo, generated from the plate.</p>
    </div>
  )
}
