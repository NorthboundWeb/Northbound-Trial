'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, useTransition } from 'react'
import { requestText } from '@/lib/booking/actions'
import { messageHref } from '@/lib/contact'

/**
 * The panel after the home page's first screen: on the left, leave a
 * WhatsApp number and get a message back; on the right, start a project.
 */
export function ContactSplit() {
  const [num, setNum] = useState('')
  const [state, setState] = useState<{ ok: boolean; message: string } | null>(null)
  const [busy, start] = useTransition()
  const startedAt = useRef(0)
  const trap = useRef<HTMLInputElement>(null)

  useEffect(() => {
    startedAt.current = Date.now()
  }, [])

  function send(e: React.FormEvent) {
    e.preventDefault()
    start(async () => {
      setState(await requestText(num, { startedAt: startedAt.current, trap: trap.current?.value ?? '' }))
    })
  }

  return (
    <section id="contact" className="split" aria-label="Get in touch">
      <div className="split-text">
        <div className="split-glow" aria-hidden="true" />
        <div className="split-in">
          <p className="split-k">Message me directly</p>
          {state?.ok ? (
            <p className="split-done" role="status">
              {state.message}
            </p>
          ) : (
            <form className="split-form" onSubmit={send} noValidate>
              <div className="hp" aria-hidden="true">
                <label htmlFor="split-website">Leave this empty</label>
                <input id="split-website" ref={trap} tabIndex={-1} autoComplete="off" defaultValue="" />
              </div>
              <label htmlFor="split-num" className="sr">
                Your WhatsApp number
              </label>
              <input
                id="split-num"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="Your WhatsApp number"
                value={num}
                onChange={(e) => setNum(e.target.value)}
                aria-invalid={state && !state.ok ? true : undefined}
                aria-describedby={state && !state.ok ? 'split-err' : undefined}
              />
              <button type="submit" className="split-go" disabled={busy}>
                {busy ? 'Sending…' : 'Text me'}
              </button>
            </form>
          )}
          {state && !state.ok && (
            <p className="split-err" id="split-err" role="alert">
              {state.message}{' '}
              <a href={messageHref()} target="_blank" rel="noopener noreferrer">
                Open WhatsApp
              </a>
            </p>
          )}
          <p className="split-note">Only used to message you. No calls.</p>
        </div>
      </div>
      <Link href="/start" className="split-start">
        <span className="split-k">or tell me about it</span>
        <span className="split-big">
          Start a project <span aria-hidden="true">→</span>
        </span>
      </Link>
    </section>
  )
}
