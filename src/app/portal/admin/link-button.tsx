'use client'

import { useState } from 'react'
import { makeClientLink } from '../actions'

/** Makes a one-time sign-in link for a client and copies it, ready to paste into WhatsApp. */
export function LinkButton({ email, name }: { email: string; name: string }) {
  const [state, setState] = useState<{ link?: string; msg: string }>({ msg: '' })
  const [busy, setBusy] = useState(false)

  async function make() {
    setBusy(true)
    try {
      const out = await makeClientLink(email, name)
      if (!out.ok || !out.link) return setState({ msg: out.message ?? 'Could not make a link.' })
      let copied = false
      try {
        await navigator.clipboard.writeText(out.link)
        copied = true
      } catch {
        // Clipboard blocked: the link is shown so it can be copied by hand.
      }
      setState({ link: out.link, msg: copied ? 'Copied. Works once, for 7 days.' : 'Works once, for 7 days.' })
    } finally {
      setBusy(false)
    }
  }

  const first = name.split(/\s+/)[0] || 'there'
  const text = state.link ? `Hi ${first}, you can see how your website is coming along here: ${state.link}` : ''

  return (
    <div className="pa-link">
      <button type="button" className="btn small" onClick={make} disabled={busy}>
        {busy ? 'Making…' : 'Sign-in link for client'}
      </button>
      {state.link && (
        <a className="btn small solid" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer">
          Send on WhatsApp
        </a>
      )}
      {state.msg && (
        <p className="note" aria-live="polite">
          {state.msg}
        </p>
      )}
      {state.link && <input className="pa-link-out" readOnly value={state.link} aria-label="Sign-in link" onFocus={(e) => e.currentTarget.select()} />}
    </div>
  )
}
