'use client'

import { useEffect, useState } from 'react'

/**
 * Light / dark switch in the header pill. The new theme spreads out from the
 * button in a growing circle (View Transitions where the browser has them,
 * an instant swap where it does not). The choice lasts for this visit only;
 * every new visit opens in dark.
 */

import { THEME_KEY as KEY } from '@/lib/boot-scripts'

export const THEME_EVENT = 'nb:theme'

type Theme = 'light' | 'dark'

const current = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

function apply(t: Theme) {
  document.documentElement.dataset.theme = t
  try {
    sessionStorage.setItem(KEY, t)
  } catch {
    // Storage blocked: the theme just resets on the next page load.
  }
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: t }))
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const t = setTimeout(() => setTheme(current()), 0)
    return () => clearTimeout(t)
  }, [])

  function toggle(e: React.MouseEvent<HTMLButtonElement>) {
    const next: Theme = current() === 'dark' ? 'light' : 'dark'
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!doc.startViewTransition || reduced) {
      apply(next)
      setTheme(next)
      return
    }
    const r = e.currentTarget.getBoundingClientRect()
    const x = r.left + r.width / 2
    const y = r.top + r.height / 2
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    const vt = doc.startViewTransition(() => {
      apply(next)
      setTheme(next)
    })
    vt.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
          { duration: 700, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-new(root)' }
        )
      })
      .catch(() => {})
  }

  const dark = theme === 'dark'
  return (
    <button
      type="button"
      className="theme-btn"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={dark}
    >
      {dark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
        </svg>
      )}
    </button>
  )
}

