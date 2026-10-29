'use client'

import { useActionState } from 'react'
import { diaryLogin, type DiaryLoginState } from '@/lib/booking/actions'

export function DiaryLogin() {
  const [state, action, pending] = useActionState<DiaryLoginState, FormData>(diaryLogin, {})
  return (
    <form className="login" action={action}>
      <div className="field">
        <label htmlFor="password">Diary password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? 'e-password' : undefined}
        />
        {state.error && (
          <p className="err" role="alert" id="e-password">
            {state.error}
          </p>
        )}
      </div>
      <div>
        <button className="btn solid" type="submit" disabled={pending}>
          {pending ? 'Checking…' : 'Open the diary'}
        </button>
      </div>
    </form>
  )
}
