'use client'

import { useActionState, useEffect, useRef } from 'react'
import { messageHref } from '@/lib/contact'
import { sendEmailForm, type EmailState } from './actions'

const START: EmailState = { status: 'idle', message: '' }

export function EmailForm({ subject, message }: { subject: string; message: string }) {
  const [state, action, pending] = useActionState(sendEmailForm, START)
  const startedAt = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (startedAt.current) startedAt.current.value = String(Date.now())
  }, [])

  if (state.status === 'sent') {
    return (
      <div className="pt-sent" role="status">
        <b>Sent.</b>
        <p>{state.message}</p>
      </div>
    )
  }

  const e = state.errors ?? {}
  return (
    <form action={action} className="pt-form em-form" noValidate>
      <input ref={startedAt} type="hidden" name="startedAt" defaultValue="0" />
      <input type="hidden" name="subject" value={subject} />
      <div className="hp" aria-hidden="true">
        <label htmlFor="em-company">Leave this empty</label>
        <input id="em-company" name="company" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <div className="grid2">
        <div className="field">
          <label htmlFor="em-name">Your name</label>
          <input id="em-name" name="name" type="text" autoComplete="name" required aria-invalid={e.name ? true : undefined} />
          {e.name && <p className="err">{e.name}</p>}
        </div>
        <div className="field">
          <label htmlFor="em-email">Your email</label>
          <input id="em-email" name="email" type="email" autoComplete="email" inputMode="email" required aria-invalid={e.email ? true : undefined} />
          {e.email && <p className="err">{e.email}</p>}
        </div>
      </div>
      <div className="field">
        <label htmlFor="em-message">Message</label>
        <textarea id="em-message" name="message" rows={7} defaultValue={message} required aria-invalid={e.message ? true : undefined} placeholder="What do you need? A website, a booking system, a shop, a change to an existing site…" />
        {e.message && <p className="err">{e.message}</p>}
      </div>
      {state.status === 'error' && (
        <p className="err" role="alert">
          {state.message}{' '}
          <a href={messageHref()} target="_blank" rel="noopener noreferrer">
            Open WhatsApp
          </a>
        </p>
      )}
      <button className="btn solid" type="submit" disabled={pending}>
        {pending ? 'Sending…' : 'Send email'}
      </button>
      <p className="note">Goes straight to my inbox. I reply by email, no calls.</p>
    </form>
  )
}
