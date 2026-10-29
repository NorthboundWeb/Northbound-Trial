import { comparisons } from './discover'
import { PAGES } from './nav'
import { buildPackages } from './services'

/** Everything the menu's search box can find. Built from the same data the pages use. */
export type SearchItem = { href: string; title: string; kind: string; words: string }

export const SEARCH_INDEX: SearchItem[] = [
  ...PAGES.map((p) => ({ href: p.href, title: p.label, kind: 'Page', words: p.label })),
  ...buildPackages.map((p) => ({
    href: `/services/${p.slug}`,
    title: `${p.name} website`,
    kind: `${p.variable ? 'From ' : ''}£${p.price}`,
    words: [p.name, p.summary, p.bestFor, ...p.includes].join(' '),
  })),
  {
    href: '/services/management',
    title: 'Website management',
    kind: 'From £39/month',
    words: 'management hosting monthly care updates security monitoring plan first month free',
  },
  ...comparisons.map((c) => ({
    href: `/work/${c.slug}`,
    title: c.business,
    kind: `Concept · ${c.trade}`,
    words: [c.business, c.trade, c.who, c.problem, ...c.changes.map((x) => x.title)].join(' '),
  })),
  { href: '/tools', title: 'Check your website', kind: 'Tool', words: 'site check score speed google padlock phone quiz tool' },
  { href: '/portal', title: 'Client login', kind: 'Clients', words: 'client login sign in account progress my website status portal' },
  { href: '/email', title: 'Email me', kind: 'Contact', words: 'email contact message write enquiry' },
  { href: '/start', title: 'Start a project', kind: 'Free build', words: 'start project free build no deposit quote enquiry contact book booking get started photos date message whatsapp email' },
]

export function search(q: string): SearchItem[] {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return []
  return SEARCH_INDEX.map((item) => {
    const title = item.title.toLowerCase()
    const all = `${title} ${item.words.toLowerCase()}`
    if (!terms.every((t) => all.includes(t))) return null
    const score = terms.reduce((s, t) => s + (title.includes(t) ? 3 : 1), 0)
    return { item, score }
  })
    .filter((x): x is { item: SearchItem; score: number } => x !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((x) => x.item)
}
