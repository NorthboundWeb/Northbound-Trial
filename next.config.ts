import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      // Routes from the previous version of the site, kept so old links and search results still land somewhere useful.
      { source: '/contact', destination: '/start', permanent: true },
      { source: '/discover', destination: '/services', permanent: true },
      { source: '/projects', destination: '/work', permanent: true },
      { source: '/projects/:path*', destination: '/work', permanent: true },
      { source: '/approach', destination: '/services', permanent: true },
      { source: '/booking', destination: '/start', permanent: false },
      { source: '/diary', destination: '/', permanent: false },
      { source: '/login', destination: '/start', permanent: false },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
        ],
      },
    ]
  },
}

export default nextConfig
