import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'

const routes = [
  { path: '/', priority: 1 },
  { path: '/services', priority: 0.9 },
  { path: '/services/pro', priority: 0.8 },
  { path: '/services/ultimate', priority: 0.8 },
  { path: '/services/custom', priority: 0.7 },
  { path: '/services/management', priority: 0.7 },
  { path: '/work', priority: 0.8 },
  { path: '/about', priority: 0.6 },
  { path: '/start', priority: 0.9 },
  { path: '/email', priority: 0.5 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return routes.map(({ path, priority }) => ({
    url: new URL(path, site.url).toString(),
    lastModified,
    changeFrequency: 'monthly',
    priority,
  }))
}
