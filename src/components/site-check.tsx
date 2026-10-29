'use client'

import Link from 'next/link'
import { useState } from 'react'

/**
 * The site self-check: eight yes/no questions an owner can answer from memory.
 * Runs entirely in the browser; nothing is sent anywhere, and the page says so.
 */
const QUESTIONS = [
  { q: 'Does it load in under three seconds on mobile data?', hint: 'Not on your office wifi — on 4G, outside.', fix: 'Speed: slow pages lose people before they see anything.' },
  { q: 'Can someone tap your phone number and have it ring?', hint: 'A number you have to copy out is a number nobody rings.', fix: 'Tap-to-call on every page.' },
  { q: 'Is a price, or a "from" price, visible without enquiring?', hint: 'People want a rough idea before they pick up the phone.', fix: 'Put a price, or a starting price, where it can be seen.' },
  { q: 'Does the address bar show a padlock?', hint: 'If it says "Not secure", visitors are being warned off.', fix: 'An SSL certificate, so browsers stop warning people away.' },
  { q: 'Does it read on a phone without pinching to zoom?', hint: 'Most of your visitors are on a phone.', fix: 'A layout that rearranges itself for small screens.' },
  { q: 'Is there one obvious next step on the home page?', hint: 'Call, book, or get a quote — one of them, clearly.', fix: 'A single clear action, rather than six competing ones.' },
  { q: 'Do you come up on Google for your trade and your town?', hint: 'Search it the way a customer would.', fix: 'The basics of local search, and a Google Business Profile.' },
  { q: 'Has anything on it changed in the last year?', hint: 'Old prices and dead links cost more trust than you think.', fix: 'Somewhere to keep it current without starting over.' },
] as const

type Answer = boolean | null

export function SiteCheck() {
  const [answers, setAnswers] = useState<Answer[]>(() => Array(QUESTIONS.length).fill(null) as Answer[])
  const answered = answers.filter((a) => a !== null).length
  const score = answers.filter((a) => a === true).length
  const misses = QUESTIONS.filter((_, i) => answers[i] === false)
  const done = answered === QUESTIONS.length

  const set = (i: number, v: boolean) =>
    setAnswers((prev) => {
      const next = [...prev]
      next[i] = next[i] === v ? null : v
      return next
    })

  const verdict = !done
    ? { title: 'Answer the questions', body: 'Your score fills in as you go.' }
    : score >= 7
      ? { title: 'In good shape', body: 'Little to fix. A management plan would keep it that way.' }
      : score >= 4
        ? { title: 'Worth a look', body: 'The bones are there. A few fixes would do a lot.' }
        : { title: 'Costing you work', body: 'Enough is missing that people are leaving before they call.' }

  const r = 56
  const circ = 2 * Math.PI * r

  return (
    <div className="check">
      <ol className="check-qs">
        {QUESTIONS.map((item, i) => (
          <li key={item.q} className="check-q">
            <div>
              <p className="check-text">{item.q}</p>
              <p className="check-hint">{item.hint}</p>
            </div>
            <div className="check-btns" role="group" aria-label={item.q}>
              <button type="button" className="pill sm" aria-pressed={answers[i] === true} onClick={() => set(i, true)}>
                Yes
              </button>
              <button type="button" className="pill sm" aria-pressed={answers[i] === false} onClick={() => set(i, false)}>
                No
              </button>
            </div>
          </li>
        ))}
      </ol>
      <aside className="check-score" aria-live="polite">
        <svg viewBox="0 0 140 140" width="140" height="140" aria-hidden="true">
          <circle cx="70" cy="70" r={r} fill="none" stroke="var(--line)" strokeWidth="10" />
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - score / QUESTIONS.length)}
            transform="rotate(-90 70 70)"
            style={{ transition: 'stroke-dashoffset .5s cubic-bezier(.2,.8,.2,1)' }}
          />
        </svg>
        <p className="check-num">
          {score}
          <small>/{QUESTIONS.length}</small>
        </p>
        <p className="check-verdict">{verdict.title}</p>
        <p className="note">{verdict.body}</p>
        {done && misses.length > 0 && (
          <>
            <p className="label" style={{ marginTop: 20 }}>
              Worth fixing
            </p>
            <ul className="check-fixes">
              {misses.map((m) => (
                <li key={m.q}>{m.fix}</li>
              ))}
            </ul>
          </>
        )}
        {done && (
          <Link className="btn solid wide-btn" href="/start">
            Talk it through
          </Link>
        )}
        <p className="fine" style={{ textAlign: 'left' }}>
          Runs in your browser. Nothing you tick is sent anywhere.
        </p>
      </aside>
    </div>
  )
}
