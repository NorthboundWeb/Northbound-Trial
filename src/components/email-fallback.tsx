'use client'

import { useEffect, useRef, useState } from 'react'
import { emailRequest, type EmailState } from '@/app/email/actions'

/** "No WhatsApp?": sends the whole start-flow request to Che's inbox from the site. */
export function EmailFallback({ name, email, refCode, message }: { name: string; email: string; refCode: string; message: string }) {
  const [addr, setAddr] = useState(email)
  const [state, setState] = useState<EmailState>({ status: 'idle', message: '' })
  const [busy, setBusy] = useState(false)
  const startedAt = useRef(0)

  useEffect(() => {
    startedAt.current = Date.now()
  }, [])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      setState(await emailRequest({ name: name || addr.split('@')[0], email: addr, ref: refCode, message, startedAt: startedAt.current }))
    } catch {
      setState({ status: 'error', message: 'That did not send. Please try WhatsApp instead.' })
    } finally {
      setBusy(false)
    }
  }

  if (state.status === 'sent') {
    return (
      <p className="note" role="status" style={{ marginTop: 24 }}>
        <b>Sent by email.</b> {state.message} Send any photos when I reply.
      </p>
    )
  }

  return (
    <form className="sf-emailalt" onSubmit={send} noValidate>
      <p className="note">No WhatsApp? Send the same request to my inbox instead.</p>
      <div className="sf-emailalt-row">
        <label htmlFor="sf-alt-email" className="sr">
          Your email
        </label>
        <input id="sf-alt-email" type="email" autoComplete="email" inputMode="email" placeholder="Your email" value={addr} onChange={(e) => setAddr(e.target.value)} required />
        <button type="submit" className="btn" disabled={busy}>
          {busy ? 'Sending…' : 'Send by email'}
        </button>
      </div>
      {state.status === 'error' && (
        <p className="err" role="alert">
          {state.errors?.email ?? state.message}
        </p>
      )}
    </form>
  )
}
