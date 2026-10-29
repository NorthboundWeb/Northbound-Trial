'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { CONTACT_EMAIL } from '@/lib/booking/options'
import { PAGES } from '@/lib/nav'
import { LogoLink } from './logo-link'

/**
 * The marketing pages' header: the mark on the left, a dark pill in the middle
 * holding the menu, and "Get started" on the right. The menu drops a panel of
 * every page beneath the pill.
 */
export function SiteNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const panel = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const [lastPath, setLastPath] = useState(pathname)

  // Close the menu when the page changes (adjusting state during render, not in an effect).
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        button.current?.focus()
      }
    }
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node
      if (!panel.current?.contains(t) && !button.current?.contains(t)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open])

  return (
    <header className="nav">
      <LogoLink className="logo nav-logo" />
      <div className="pillbar">
        <button
          ref={button}
          type="button"
          className="pillbar-btn"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className={`burger${open ? ' x' : ''}`} aria-hidden="true">
            <i />
            <i />
          </span>
          {open ? 'Close' : 'Menu'}
        </button>
        <span className="pillbar-chip" title="Working across the UK">
          UK
        </span>
        <div ref={panel} id="site-menu" className={`menu${open ? ' open' : ''}`} hidden={!open}>
          <nav aria-label="Pages">
            <ul>
              {PAGES.map((p, i) => (
                <li key={p.href} style={{ animationDelay: `${i * 40}ms` }}>
                  <Link href={p.href} aria-current={pathname === p.href ? 'page' : undefined}>
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <a className="menu-mail" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>
      <Link className="btn dark nav-cta" href="/booking">
        Get started
      </Link>
    </header>
  )
}
