'use client'

import Link from 'next/link'
import { goWithCurtain } from './curtain'

/**
 * The mountain mark. Clicking it plays the curtain and goes home, the way
 * Averlo's logo does. A ctrl/cmd/middle click still opens a new tab normally.
 */
export function LogoLink({ className = 'logo', dark = true }: { className?: string; dark?: boolean }) {
  return (
    <Link
      className={className}
      href="/"
      aria-label="Northbound Web home"
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
        e.preventDefault()
        goWithCurtain('/')
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/mark.png" alt="" width={69} height={30} style={dark ? undefined : { filter: 'none' }} />
    </Link>
  )
}
