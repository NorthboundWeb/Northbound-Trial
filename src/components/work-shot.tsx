'use client'

import { demoBySlug } from '@/lib/showcase'
import { DemoSite } from './demo-site'
import { demoComponents } from './demos/registry'

/** The first screen of a demo site, for thumbnails. Falls back to the simple drawn version. */
export function WorkShot({ slug }: { slug: string }) {
  const Shot = demoComponents[slug]?.Shot
  if (Shot) return <Shot />
  const d = demoBySlug(slug)
  return d ? <DemoSite d={d} /> : null
}
