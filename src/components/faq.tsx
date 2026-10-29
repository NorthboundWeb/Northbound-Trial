'use client'

import { useState } from 'react'

/** One-open-at-a-time answers. Each question is a real button with aria-expanded. */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <ul className="faq">
      {items.map((it, i) => {
        const on = open === i
        return (
          <li key={it.q} className={on ? 'on' : ''}>
            <h3>
              <button type="button" aria-expanded={on} aria-controls={`faq-${i}`} onClick={() => setOpen(on ? null : i)}>
                {it.q}
                <span className="plus" aria-hidden="true" />
              </button>
            </h3>
            <div id={`faq-${i}`} className="faq-a" hidden={!on}>
              <p>{it.a}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/** "How it works": a row of step tabs with the chosen step's detail beneath. */
export function Process({ steps }: { steps: { step: string; title: string; body: string }[] }) {
  const [at, setAt] = useState(0)
  const s = steps[at]
  return (
    <div className="process">
      <div className="process-tabs" role="tablist" aria-label="Project stages">
        {steps.map((x, i) => (
          <button
            key={x.step}
            type="button"
            role="tab"
            id={`ptab-${i}`}
            aria-selected={at === i}
            aria-controls="ppanel"
            tabIndex={at === i ? 0 : -1}
            onClick={() => setAt(i)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                const n = (i + (e.key === 'ArrowRight' ? 1 : steps.length - 1)) % steps.length
                setAt(n)
                document.getElementById(`ptab-${n}`)?.focus()
              }
            }}
          >
            {x.title}
          </button>
        ))}
      </div>
      <div className="process-bar" aria-hidden="true">
        <span style={{ width: `${((at + 1) / steps.length) * 100}%` }} />
      </div>
      <div id="ppanel" role="tabpanel" aria-labelledby={`ptab-${at}`} className="process-panel" key={at}>
        <span className="process-num" aria-hidden="true">
          {s.step}
        </span>
        <div>
          <h3>{s.title}</h3>
          <p>{s.body}</p>
        </div>
      </div>
    </div>
  )
}
