'use client'

import { useState } from 'react'
import type { JSX } from 'react'
import type { ProblemId } from './data'
import { Arrow } from './parts'
import styles from './styles.module.css'

type QId = 'gas' | 'co' | 'leak' | 'heat' | 'vulnerable'
type Answers = Partial<Record<QId, boolean>>
type Outcome = 'gas' | 'co' | 'leak' | 'priority' | 'sameday' | 'routine'

const questions: { id: QId; q: string; help: string }[] = [
  { id: 'gas', q: 'Can you smell gas?', help: 'A rotten-egg smell near the boiler, cooker or meter.' },
  { id: 'co', q: 'Is a carbon monoxide alarm sounding, or does anyone feel dizzy, sick or headachy?', help: 'These can be signs of a faulty appliance.' },
  { id: 'leak', q: 'Is water leaking from the boiler or pipes?', help: 'Anything more than the odd drip counts.' },
  { id: 'heat', q: 'Are you without heating or hot water right now?', help: 'Either one, completely off.' },
  { id: 'vulnerable', q: 'Is anyone at home elderly, very young, pregnant or unwell?', help: 'We put these visits first.' },
]

const order: QId[] = ['gas', 'co', 'leak', 'heat', 'vulnerable']

function decide(a: Answers): Outcome | null {
  if (a.gas === undefined) return null
  if (a.gas) return 'gas'
  if (a.co === undefined) return null
  if (a.co) return 'co'
  if (a.leak === undefined) return null
  if (a.leak) return 'leak'
  if (a.heat === undefined) return null
  if (!a.heat) return 'routine'
  if (a.vulnerable === undefined) return null
  return a.vulnerable ? 'priority' : 'sameday'
}

type Advice = {
  level: 'danger' | 'urgent' | 'soon' | 'calm'
  tag: string
  title: string
  steps: string[]
  cta: string | null
  problem: ProblemId | null
}

const advice: Record<Outcome, Advice> = {
  gas: {
    level: 'danger',
    tag: 'Emergency · do this now',
    title: 'Leave the property and call the gas emergency line.',
    steps: [
      'Do not use light switches, flames, doorbells or anything electrical.',
      'Open doors and windows if it is safe to do so.',
      'Turn the gas off at the meter if you can reach it safely.',
      'Go outside and call the National Gas Emergency Service on 0800 111 999. It is free, 24 hours a day.',
    ],
    cta: null,
    problem: null,
  },
  co: {
    level: 'danger',
    tag: 'Emergency · do this now',
    title: 'Get everyone into fresh air, then get help.',
    steps: [
      'Turn off the boiler and any gas appliances if it is safe to.',
      'Open windows and get everyone outside.',
      'Call the National Gas Emergency Service on 0800 111 999.',
      'If anyone feels unwell, call NHS 111, or 999 if it is serious.',
    ],
    cta: null,
    problem: null,
  },
  leak: {
    level: 'urgent',
    tag: 'Urgent · same day where we can',
    title: 'Stop the water, then book the first free window.',
    steps: [
      'Switch the boiler off at its switch or the fused spur next to it.',
      'Turn off the water at the stopcock, usually under the kitchen sink.',
      'Put a tray or towels down and keep water away from sockets.',
    ],
    cta: 'Book an urgent visit',
    problem: 'leak',
  },
  priority: {
    level: 'urgent',
    tag: 'Priority visit',
    title: 'We will offer you the first free window.',
    steps: [
      'Book now and tick “someone vulnerable at home” so we put you first.',
      'Check the pressure gauge: between 1 and 1.5 bar is normal.',
      'Try one reset: hold the reset button for three seconds, once only.',
      'A plug-in heater in one room helps while you wait.',
    ],
    cta: 'Book a priority visit',
    problem: 'no-heat',
  },
  sameday: {
    level: 'soon',
    tag: 'Not an emergency',
    title: 'Book before 11am and we can usually come today.',
    steps: [
      'Check the thermostat and timer have not been knocked or reset.',
      'Note any error code on the boiler display for the engineer.',
      'Check the pressure gauge is between 1 and 1.5 bar.',
    ],
    cta: 'Book a repair',
    problem: 'no-heat',
  },
  routine: {
    level: 'calm',
    tag: 'Not urgent',
    title: 'No rush. Book a time that suits you.',
    steps: [
      'Annual services are £70 and include your safety certificate.',
      'For odd noises, note when they happen: heating on, hot tap, or both.',
      'Thinking about a new boiler? The survey is free.',
    ],
    cta: 'Choose a time',
    problem: null,
  },
}

export function Triage({ onBook }: { onBook: (p: ProblemId | null) => void }): JSX.Element {
  const [answers, setAnswers] = useState<Answers>({})
  const outcome = decide(answers)
  const currentId = outcome ? null : order.find((id) => answers[id] === undefined) ?? null
  const current = questions.find((q) => q.id === currentId) ?? null
  const answered = order.filter((id) => answers[id] !== undefined)
  const index = currentId ? order.indexOf(currentId) : answered.length - 1

  function answer(id: QId, value: boolean) {
    setAnswers((a) => ({ ...a, [id]: value }))
  }

  function back() {
    const last = answered[answered.length - 1]
    if (!last) return
    setAnswers((a) => {
      const next: Answers = { ...a }
      delete next[last]
      return next
    })
  }

  const result = outcome ? advice[outcome] : null
  const levelClass =
    result?.level === 'danger'
      ? styles.adviceDanger
      : result?.level === 'urgent'
        ? styles.adviceUrgent
        : result?.level === 'soon'
          ? styles.adviceSoon
          : styles.adviceCalm

  return (
    <div className={styles.triage}>
      <div className={styles.triageQ}>
        {current ? (
          <div key={current.id} className={styles.qCard}>
            <p className={styles.qCount}>
              Question {index + 1} <span>of up to 5</span>
            </p>
            <p className={styles.qText} id="th-q-text">
              {current.q}
            </p>
            <p className={styles.qHelp}>{current.help}</p>
            <div className={styles.qBtns} role="group" aria-labelledby="th-q-text">
              <button type="button" className={`${styles.qBtn} ${styles.qYes}`} onClick={() => answer(current.id, true)}>
                Yes
              </button>
              <button type="button" className={styles.qBtn} onClick={() => answer(current.id, false)}>
                No
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.qCard}>
            <p className={styles.qCount}>Done</p>
            <p className={styles.qText}>Here is what to do next.</p>
            <p className={styles.qHelp}>Change an answer below, or start again.</p>
          </div>
        )}

        {answered.length > 0 && (
          <div className={styles.qTrail}>
            <ol className={styles.trail}>
              {answered.map((id) => {
                const q = questions.find((x) => x.id === id)
                return (
                  <li key={id}>
                    <span>{q ? q.q : id}</span>
                    <b>{answers[id] ? 'Yes' : 'No'}</b>
                  </li>
                )
              })}
            </ol>
            <div className={styles.trailBtns}>
              <button type="button" className={styles.linkBtn} onClick={back}>
                Change last answer
              </button>
              <button type="button" className={styles.linkBtn} onClick={() => setAnswers({})}>
                Start again
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.triageA} aria-live="polite">
        {result ? (
          <div key={outcome ?? 'none'} className={`${styles.advice} ${levelClass}`}>
            <p className={styles.adviceTag}>{result.tag}</p>
            <p className={styles.adviceTitle}>{result.title}</p>
            <ol className={styles.adviceSteps}>
              {result.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            {result.level === 'danger' ? (
              <p className={styles.adviceBig}>
                <span>National Gas Emergency Service</span>
                <b>0800 111 999</b>
              </p>
            ) : null}
            {result.cta ? (
              <button type="button" className={styles.btnRed} onClick={() => onBook(result.problem)}>
                {result.cta} <Arrow />
              </button>
            ) : (
              <p className={styles.adviceAfter}>Once it has been made safe, book us to repair the fault.</p>
            )}
          </div>
        ) : (
          <div className={styles.advicePlaceholder}>
            <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
              <circle cx="28" cy="28" r="26" fill="none" stroke="#c6cfdc" strokeWidth="3" strokeDasharray="5 6" />
              <path d="M28 16v14M28 37v3" stroke="#0c1f3f" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <p>Answer a few quick questions and the advice for your situation appears here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
