'use client'

import { useState } from 'react'
import type { FormEvent, JSX } from 'react'
import { certText, findCert, normaliseRef } from './data'
import type { Cert } from './data'
import { Arrow } from './parts'
import styles from './styles.module.css'

type Result =
  | { kind: 'idle' }
  | { kind: 'bad'; ref: string }
  | { kind: 'missing'; ref: string }
  | { kind: 'found'; cert: Cert; status: 'Valid' | 'Due soon' | 'Overdue'; months: number }

const samples = ['BLE-240317', 'BLE-190211', 'BLE-240213']

export function Certs(): JSX.Element {
  const [raw, setRaw] = useState('')
  const [result, setResult] = useState<Result>({ kind: 'idle' })
  const [saved, setSaved] = useState('')

  function look(value: string) {
    const ref = normaliseRef(value)
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth() + 1
    const found = findCert(ref, y, m)
    setSaved('')
    if (found === 'bad') {
      setResult({ kind: 'bad', ref: value.trim() })
      return
    }
    if (found === null) {
      setResult({ kind: 'missing', ref })
      return
    }
    const months = found.dueY * 12 + found.dueM - (y * 12 + m)
    const status = months < 0 ? 'Overdue' : months <= 3 ? 'Due soon' : 'Valid'
    setRaw(ref)
    setResult({ kind: 'found', cert: found, status, months })
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    look(raw)
  }

  function download(c: Cert, status: string) {
    const blob = new Blob([certText(c, status)], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${c.ref}-EICR-summary.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setSaved(`Saved ${c.ref}-EICR-summary.txt to your downloads.`)
  }

  return (
    <div className={styles.certs}>
      <form className={styles.certForm} onSubmit={submit} noValidate>
        <label htmlFor="bl-ref" className={styles.certLabel}>
          Certificate reference
        </label>
        <div className={styles.certRow}>
          <input
            id="bl-ref"
            className={`${styles.input} ${styles.certInput}`}
            placeholder="BLE-240317"
            autoComplete="off"
            spellCheck={false}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            aria-describedby="bl-ref-help"
            aria-invalid={result.kind === 'bad' ? true : undefined}
          />
          <button type="submit" className={styles.btnYellow}>
            Find <Arrow />
          </button>
        </div>
        <p id="bl-ref-help" className={styles.mutedText}>
          It is printed top right on your report, BLE followed by six numbers.
        </p>
        <div className={styles.samples}>
          <span>Try a sample:</span>
          {samples.map((s) => (
            <button
              key={s}
              type="button"
              className={styles.sample}
              onClick={() => {
                setRaw(s)
                look(s)
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </form>

      <div className={styles.certOut} aria-live="polite">
        {result.kind === 'idle' && (
          <div className={styles.certEmpty}>
            <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="#a9b8d4" strokeWidth="2.5">
              <path d="M18 8h20l10 10v38H18z" strokeLinejoin="round" />
              <path d="M38 8v10h10M25 32h16M25 40h16M25 48h9" strokeLinecap="round" />
            </svg>
            <p>Your certificate appears here, ready to download.</p>
          </div>
        )}
        {result.kind === 'bad' && (
          <div className={styles.certMsg} role="alert">
            <b>That does not look like one of ours.</b>
            <p>References look like BLE-240317. Check for a missing number.</p>
          </div>
        )}
        {result.kind === 'missing' && (
          <div className={styles.certMsg}>
            <b>No certificate found for {result.ref}.</b>
            <p>If the inspection was recent it can take a working day to appear. Otherwise, send us a message.</p>
          </div>
        )}
        {result.kind === 'found' && (
          <article key={result.cert.ref} className={styles.cert}>
            <div className={styles.certHead}>
              <div>
                <p className={styles.certK}>Electrical installation condition report</p>
                <p className={styles.certRef}>{result.cert.ref}</p>
              </div>
              <span
                className={`${styles.badge} ${
                  result.status === 'Valid' ? styles.badgeOk : result.status === 'Due soon' ? styles.badgeWarn : styles.badgeBad
                }`}
              >
                {result.status}
              </span>
            </div>
            <dl className={styles.certGrid}>
              <div className={styles.certWide}>
                <dt>Property</dt>
                <dd>{result.cert.address}</dd>
              </div>
              <div>
                <dt>Type</dt>
                <dd>{result.cert.kind}</dd>
              </div>
              <div>
                <dt>Inspected</dt>
                <dd>{result.cert.issued}</dd>
              </div>
              <div>
                <dt>Result</dt>
                <dd className={result.cert.result === 'Satisfactory' ? styles.okText : styles.badText}>{result.cert.result}</dd>
              </div>
              <div>
                <dt>Next due</dt>
                <dd>{result.cert.due}</dd>
              </div>
              <div>
                <dt>Circuits tested</dt>
                <dd>{result.cert.circuits}</dd>
              </div>
              <div>
                <dt>Observations</dt>
                <dd>
                  C2 {result.cert.c2} · C3 {result.cert.c3}
                </dd>
              </div>
            </dl>
            <p className={styles.certStatus}>
              {result.status === 'Overdue'
                ? `The next inspection was due ${Math.abs(result.months)} month${Math.abs(result.months) === 1 ? '' : 's'} ago. Book a new EICR to stay compliant.`
                : result.status === 'Due soon'
                  ? 'The next inspection is due within three months. Book now to avoid a gap.'
                  : result.cert.result === 'Unsatisfactory'
                    ? 'Remedial work is needed on the C2 items before this installation is satisfactory.'
                    : `Valid for another ${Math.floor(result.months / 12)} year${Math.floor(result.months / 12) === 1 ? '' : 's'} and ${result.months % 12} month${result.months % 12 === 1 ? '' : 's'}.`}
            </p>
            <div className={styles.certActions}>
              <button type="button" className={styles.btnYellow} onClick={() => download(result.cert, result.status)}>
                Download summary
              </button>
              <span className={styles.mutedText}>Signed by {result.cert.engineer}</span>
            </div>
            {saved && <p className={styles.savedNote}>{saved}</p>}
            <p className={styles.demoNote}>Demo only: a made-up record. The file is a plain-text sample.</p>
          </article>
        )}
      </div>
    </div>
  )
}
