'use client'

import { useActionState } from 'react'
import { requestLink, type LinkState } from './actions'

const START: LinkState = { status: 'idle', message: '' }

export function SignInForm() {
  const [state, action, pending] = useActionState(requestLink, START)
  if (state.status === 'sent') {
    return (
      <div className="pt-sent" role="status">
        <b>Check your inbox.</b>
        <p>{state.message}</p>
      </div>
    )
  }
  return (
    <form action={action} className="pt-form" noValidate>
      <div className="hp" aria-hidden="true">
        <label htmlFor="pt-website">Leave this empty</label>
        <input id="pt-website" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <div className="field">
        <label htmlFor="pt-email">Email</label>
        <input
          id="pt-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          placeholder="the email you used with me"
          aria-invalid={state.status === 'error' ? true : undefined}
          aria-describedby={state.status === 'error' ? 'pt-err' : undefined}
        />
      </div>
      {state.status === 'error' && (
        <p className="err" id="pt-err" role="alert">
          {state.message}
        </p>
      )}
      <button className="btn solid" type="submit" disabled={pending}>
        {pending ? 'Sending…' : 'Email me a sign-in link'}
      </button>
    </form>
  )
}
