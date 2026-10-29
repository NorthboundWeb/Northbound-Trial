import { ImageResponse } from 'next/og'
import { site } from '@/lib/site'

export const alt = `${site.name} — ${site.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#06080d', padding: 80, color: '#fff' }}>
        <div style={{ display: 'flex', fontSize: 34, color: '#8fb6ff', letterSpacing: -1 }}>Northbound Web</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', fontSize: 84, fontWeight: 700, letterSpacing: -3, lineHeight: 1.02 }}>I will build your first website for free.</div>
          <div style={{ display: 'flex', fontSize: 32, color: '#a3adbd' }}>No deposit. Like it? Buy it. UK small businesses.</div>
        </div>
        <div style={{ display: 'flex', width: 120, height: 8, borderRadius: 4, background: '#2f7bff' }} />
      </div>
    ),
    size
  )
}
