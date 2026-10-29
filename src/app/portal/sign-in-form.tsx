'use client'

import { useActionState, useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { googleSignIn, requestLink, type LinkState } from './actions'

const START: LinkState = { status: 'idle', message: '' }

type GoogleId = {
  initialize: (o: { client_id: string; callback: (r: { credential: string }) => void; ux_mode?: string }) => void
  renderButton: (el: HTMLElement, o: Record<string, unknown>) => void
}

function GoogleButton({ clientId }: { clientId: string }) {
  const box = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [msg, setMsg] = useState('')
  const [pending, start] = useTransition()

  useEffect(() => {
    let cancelled = false
    const init = () => {
      const g = (window as unknown as { google?: { accounts?: { id?: GoogleId } } }).google?.accounts?.id
      if (cancelled || !g || !box.current) return false
      g.initialize({
        client_id: clientId,
        callback: ({ credential }) =>
          start(async () => {
            setMsg('')
            const out = await googleSignIn(credential)
            if (out.ok) {
              router.replace(out.to ?? '/portal')
              router.refresh()
            } else setMsg(out.message ?? 'That did not work.')
          }),
      })
      g.renderButton(box.current, { type: 'standard', theme: 'outline', size: 'large', text: 'continue_with', shape: 'pill', width: Math.min(320, box.current.offsetWidth || 320) })
      return true
    }
    if (init()) return
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.onload = () => init()
    document.head.appendChild(s)
    return () => {
      cancelled = true
    }
  }, [clientId, router])

  return (
    <div className="pt-google">
      <div ref={box} className="pt-google-btn" aria-busy={pending} />
      {pending && <p className="note">Signing you in…</p>}
      {msg && (
        <p className="err" role="alert">
          {msg}
        </p>
      )}
      <p className="pt-or">
        <span>or use an email link</span>
      </p>
    </div>
  )
}

export function SignInForm({ googleClientId }: { googleClientId?: string }) {
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
    <div className="pt-form-wrap">
    {googleClientId && <GoogleButton clientId={googleClientId} />}
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
    </div>
  )
}
