'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { messageHref, messageLabel } from '@/lib/contact'
import { PAGES } from '@/lib/nav'
import { search } from '@/lib/search'
import { LogoLink } from './logo-link'
import { ThemeToggle } from './theme-toggle'

/**
 * The marketing pages' header: the mark on the left, a dark pill in the middle
 * holding the menu and the light/dark switch, and "Start a project" on the right.
 *
 * Menu opens a full-screen panel: the header turns white on dark, a search box
 * sits above the pages in large type, with the message pill and the email
 * address underneath. Typing in the search swaps the page list for results.
 */
export function SiteNav() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const pathname = usePathname()
  const button = useRef<HTMLButtonElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const [lastPath, setLastPath] = useState(pathname)

  // Close the menu when the page changes (adjusting state during render, not in an effect).
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setOpen(false)
    setQ('')
  }

  const results = useMemo(() => search(q), [q])

  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    const prev = root.style.overflow
    root.style.overflow = 'hidden'
    const t = setTimeout(() => input.current?.focus({ preventScroll: true }), 250)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        button.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      root.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const close = () => {
    setOpen(false)
    setQ('')
  }

  return (
    <>
      <header className={`nav${open ? ' is-open' : ''}`}>
        <LogoLink className="logo nav-logo" />
        <div className="pillbar">
          <button
            ref={button}
            type="button"
            className="pillbar-btn"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => (open ? close() : setOpen(true))}
          >
            <span className={`burger${open ? ' x' : ''}`} aria-hidden="true">
              <i />
              <i />
            </span>
            {open ? 'Close' : 'Menu'}
          </button>
          <ThemeToggle />
          <span className="pillbar-chip" title="Working across the UK">
            UK
          </span>
        </div>
        <Link className="btn dark nav-cta" href="/start">
          Start a project
        </Link>
      </header>

      {open && (
        <div id="site-menu" className="menu-full" role="dialog" aria-modal="true" aria-label="Site menu">
          <div className="menu-glow" aria-hidden="true" />
          <div className="menu-inner">
            <form className="menu-search" role="search" onSubmit={(e) => e.preventDefault()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              <label htmlFor="menu-q" className="sr">
                Search the site
              </label>
              <input
                ref={input}
                id="menu-q"
                type="search"
                placeholder="Search"
                autoComplete="off"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </form>

            {q.trim() ? (
              <div className="menu-results" aria-live="polite">
                {results.length ? (
                  <ul>
                    {results.map((r) => (
                      <li key={r.href + r.title}>
                        <Link href={r.href} onClick={close}>
                          <b>{r.title}</b>
                          <span>{r.kind}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="menu-none">
                    Nothing found for &ldquo;{q.trim()}&rdquo;. Try &ldquo;bookings&rdquo;, &ldquo;price&rdquo; or &ldquo;SEO&rdquo;.
                  </p>
                )}
              </div>
            ) : (
              <nav aria-label="Pages">
                <ul className="menu-big">
                  {PAGES.map((p, i) => (
                    <li key={p.href} style={{ animationDelay: `${80 + i * 55}ms` }}>
                      <Link href={p.href} aria-current={pathname === p.href ? 'page' : undefined} onClick={close}>
                        {p.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            <a className="menu-message" href={messageHref()} target="_blank" rel="noopener noreferrer" aria-label={messageLabel}>
              Message me
              <span aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4A8 8 0 1 1 20 12z" />
                </svg>
              </span>
            </a>

            <div className="menu-contact">
              <p>Get in touch</p>
              <div className="menu-contact-links">
                <a href="/email">Email me</a>
                <a href="/portal">Client login</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
