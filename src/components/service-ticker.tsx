import Link from 'next/link'

/**
 * The column of service tags beside the wall. It scrolls slowly upwards,
 * fades at the top and bottom, pauses when the mouse is over it or a tag has
 * keyboard focus, and every tag opens the page that covers it.
 *
 * The list is drawn twice so the loop is seamless; the second copy is hidden
 * from screen readers and skipped by the keyboard.
 */
export function ServiceTicker({ items }: { items: { label: string; href: string }[] }) {
  const copy = (hidden: boolean) =>
    items.map((t, i) => (
      <li key={(hidden ? 'b' : 'a') + t.label} style={{ marginRight: `${[0, 18, 6, 26, 10, 0, 22, 4, 14][i % 9]}px` }}>
        <Link href={t.href} tabIndex={hidden ? -1 : undefined}>
          {t.label}
        </Link>
      </li>
    ))
  return (
    <nav className="ticker" aria-label="What I build">
      <div className="ticker-track">
        <ul>{copy(false)}</ul>
        <ul aria-hidden="true">{copy(true)}</ul>
      </div>
    </nav>
  )
}
