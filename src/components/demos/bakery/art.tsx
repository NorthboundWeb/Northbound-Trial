import type { JSX } from 'react'
import type { ArtKind } from './data'
import styles from './styles.module.css'

const CRUST = '#b36c33'
const CRUST_DEEP = '#7d4520'
const CRUMB = '#f2ddb0'
const FLOUR = '#fffaf0'
const INK = '#20301f'

/** Wheat-ear mark used in the nav and footer. */
export function Mark(): JSX.Element {
  return (
    <svg className={styles.mark} viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="19" fill="#2f4a2c" />
      <path d="M20 31V11" stroke="#f6f1e7" strokeWidth="1.6" strokeLinecap="round" />
      <g fill="#f6f1e7">
        <ellipse cx="16.6" cy="15" rx="2" ry="3.6" transform="rotate(-32 16.6 15)" />
        <ellipse cx="23.4" cy="15" rx="2" ry="3.6" transform="rotate(32 23.4 15)" />
        <ellipse cx="16.6" cy="20.5" rx="2" ry="3.6" transform="rotate(-32 16.6 20.5)" />
        <ellipse cx="23.4" cy="20.5" rx="2" ry="3.6" transform="rotate(32 23.4 20.5)" />
        <ellipse cx="20" cy="10" rx="1.8" ry="3.2" />
      </g>
    </svg>
  )
}

function Stalk({ x, y, r }: { x: number; y: number; r: number }): JSX.Element {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`} fill="#c9a061" stroke="#a37c42" strokeWidth="1">
      <path d="M0 0V-150" fill="none" strokeWidth="2" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <ellipse cx="-7" cy={-100 - i * 12} rx="5" ry="10" transform={`rotate(-28 -7 ${-100 - i * 12})`} />
          <ellipse cx="7" cy={-100 - i * 12} rx="5" ry="10" transform={`rotate(28 7 ${-100 - i * 12})`} />
        </g>
      ))}
      <ellipse cx="0" cy="-160" rx="4.5" ry="9" />
    </g>
  )
}

/**
 * The hero plate: a scored sourdough boule on a board, wheat behind it.
 * `lean` drops the detail for the home-page wall (no gradients, no ids).
 */
export function HeroLoaf({ lean = false }: { lean?: boolean }): JSX.Element {
  return (
    <svg
      className={styles.heroSvg}
      viewBox="0 0 480 480"
      role="img"
      aria-label="Drawing of a scored sourdough loaf cooling on a wooden board"
    >
      {!lean && (
        <defs>
          <radialGradient id="sb-crust" cx="42%" cy="30%" r="75%">
            <stop offset="0" stopColor="#dca45c" />
            <stop offset="0.55" stopColor={CRUST} />
            <stop offset="1" stopColor={CRUST_DEEP} />
          </radialGradient>
        </defs>
      )}
      <circle cx="240" cy="232" r="206" fill="#e8d4a6" />
      <circle cx="240" cy="232" r="222" fill="none" stroke={INK} strokeOpacity="0.35" strokeDasharray="1 7" strokeLinecap="round" strokeWidth="2" />
      {!lean && (
        <g className={styles.stalks}>
          <Stalk x={150} y={300} r={-18} />
          <Stalk x={330} y={300} r={20} />
          <Stalk x={240} y={290} r={2} />
        </g>
      )}
      <path d="M58 352h318a15 15 0 0 1 0 30H58a15 15 0 0 1 0-30z" fill="#9a6535" />
      <rect x="376" y="359" width="74" height="16" rx="8" fill="#9a6535" />
      <circle cx="436" cy="367" r="4" fill="#e8d4a6" />
      <path d="M70 360h290" stroke="#7a4c25" strokeOpacity="0.5" strokeWidth="1.5" />
      <path
        d="M92 330C84 236 152 166 240 166s156 70 148 164c-8 22-68 28-148 28s-140-6-148-28z"
        fill={lean ? CRUST : 'url(#sb-crust)'}
      />
      <path d="M126 270c44-56 136-74 220-46-70 4-150 22-220 46z" fill={CRUMB} />
      <path d="M126 270c70-24 150-42 220-46" fill="none" stroke="#5e3214" strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" />
      {!lean && (
        <>
          <path d="M156 314c42-12 104-16 168-8" stroke={CRUMB} strokeOpacity="0.6" strokeWidth="5" strokeLinecap="round" fill="none" />
          <g fill={FLOUR}>
            <circle cx="186" cy="208" r="3" opacity="0.8" />
            <circle cx="214" cy="196" r="2" opacity="0.7" />
            <circle cx="262" cy="192" r="2.6" opacity="0.8" />
            <circle cx="300" cy="204" r="2" opacity="0.6" />
            <circle cx="236" cy="212" r="1.6" opacity="0.7" />
            <circle cx="160" cy="236" r="2.2" opacity="0.6" />
            <circle cx="330" cy="246" r="1.8" opacity="0.6" />
          </g>
          <g className={styles.steam} fill="none" stroke={INK} strokeOpacity="0.4" strokeWidth="2.5" strokeLinecap="round">
            <path d="M200 140c-16-20 16-34 0-58" />
            <path d="M242 130c-16-22 16-36 0-62" />
            <path d="M284 140c-16-20 16-34 0-58" />
          </g>
        </>
      )}
    </svg>
  )
}

/** Small drawings for each menu item, on a 160 × 110 board. */
export function ItemArt({ kind }: { kind: ArtKind }): JSX.Element {
  return (
    <svg className={styles.itemSvg} viewBox="0 0 160 110" aria-hidden="true">
      <ellipse cx="80" cy="94" rx="58" ry="7" fill={INK} opacity="0.08" />
      {renderItem(kind)}
    </svg>
  )
}

function renderItem(kind: ArtKind): JSX.Element {
  switch (kind) {
    case 'boule':
      return (
        <g>
          <path d="M28 86c-4-36 22-60 52-60s56 24 52 60c-4 6-26 8-52 8s-48-2-52-8z" fill={CRUST} />
          <path d="M44 62c18-20 50-24 76-14-24 0-52 6-76 14z" fill={CRUMB} />
          <circle cx="62" cy="44" r="1.6" fill={FLOUR} />
          <circle cx="92" cy="40" r="1.4" fill={FLOUR} />
        </g>
      )
    case 'rye':
      return (
        <g>
          <rect x="26" y="44" width="108" height="46" rx="18" fill="#6e4426" />
          {[40, 56, 72, 88, 104, 120].map((x, i) => (
            <ellipse key={x} cx={x} cy={i % 2 ? 56 : 62} rx="3" ry="1.6" fill="#e7cf98" transform={`rotate(${i * 25} ${x} 60)`} />
          ))}
          {[48, 66, 84, 102, 118].map((x) => (
            <circle key={x} cx={x} cy="74" r="1.6" fill="#d9bb7a" />
          ))}
        </g>
      )
    case 'tin':
      return (
        <g>
          <path d="M34 90V56c0-22 20-30 46-30s46 8 46 30v34z" fill="#dcae6c" />
          <path d="M34 56c0-22 20-30 46-30s46 8 46 30" fill="none" stroke="#a96f37" strokeWidth="3" />
          <rect x="30" y="62" width="100" height="28" rx="3" fill="#8b8f8a" />
          <path d="M30 70h100" stroke="#a9ada6" strokeWidth="2" />
        </g>
      )
    case 'fougasse':
      return (
        <g>
          <path d="M80 18c34 18 50 44 44 70-14 6-30 6-44 6s-30 0-44-6c-6-26 10-52 44-70z" fill="#c98a45" />
          <path d="M80 30v56" stroke="#f6f1e7" strokeWidth="4" strokeLinecap="round" />
          {[44, 60, 76].map((y) => (
            <g key={y} stroke="#f6f1e7" strokeWidth="4" strokeLinecap="round">
              <path d={`M74 ${y}l-18 10`} />
              <path d={`M86 ${y}l18 10`} />
            </g>
          ))}
          <circle cx="66" cy="38" r="2" fill="#4f5a2c" />
          <circle cx="98" cy="62" r="2" fill="#4f5a2c" />
        </g>
      )
    case 'bun':
    case 'knot': {
      const base = kind === 'bun' ? '#d39a56' : '#a8662f'
      return (
        <g>
          <circle cx="80" cy="60" r="32" fill={base} />
          <path
            d="M80 60m-4 0a4 4 0 1 1 8 0a10 10 0 1 1-20 0a16 16 0 1 1 32 0a22 22 0 1 1-44 0"
            fill="none"
            stroke={kind === 'bun' ? '#f3d9a4' : '#6b3a17'}
            strokeWidth="4"
            strokeLinecap="round"
          />
          {kind === 'bun' &&
            [
              [66, 44],
              [96, 48],
              [92, 76],
              [62, 74],
              [80, 36],
            ].map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="3" height="3" fill={FLOUR} transform={`rotate(30 ${x} ${y})`} />)}
        </g>
      )
    }
    case 'croissant':
      return (
        <g stroke="#9c5a24" strokeWidth="1.5">
          <path d="M22 78c4-22 22-36 30-34l6 40c-14 4-28 2-36-6z" fill="#cf8a43" />
          <path d="M138 78c-4-22-22-36-30-34l-6 40c14 4 28 2 36-6z" fill="#cf8a43" />
          <path d="M52 44c8-10 20-14 28-14s20 4 28 14l-6 40c-8 4-14 4-22 4s-14 0-22-4z" fill="#e2a65a" />
          <path d="M68 34l-4 52M92 34l4 52" fill="none" />
        </g>
      )
    case 'pain':
      return (
        <g>
          <rect x="30" y="40" width="100" height="48" rx="10" fill="#d89a52" />
          <path d="M30 56h100M30 72h100" stroke="#b07035" strokeWidth="2" />
          <rect x="24" y="52" width="10" height="8" rx="3" fill="#3b2418" />
          <rect x="126" y="68" width="10" height="8" rx="3" fill="#3b2418" />
        </g>
      )
    case 'roll':
      return (
        <g>
          <rect x="24" y="46" width="112" height="40" rx="14" fill="#d9a35e" />
          {[46, 66, 86, 106].map((x) => (
            <path key={x} d={`M${x} 52l10 12`} stroke="#9c5a24" strokeWidth="3" strokeLinecap="round" />
          ))}
          <ellipse cx="136" cy="66" rx="6" ry="16" fill="#e9c189" />
          <ellipse cx="136" cy="66" rx="3" ry="9" fill="#b9644a" />
        </g>
      )
    case 'cakeLemon':
    case 'cakeChoc': {
      const sponge = kind === 'cakeLemon' ? '#f3d77a' : '#5c3a2a'
      const top = kind === 'cakeLemon' ? '#fffaf0' : '#2f1d15'
      const deco = kind === 'cakeLemon' ? '#9db36a' : '#f3e2c4'
      return (
        <g>
          <rect x="34" y="44" width="92" height="46" rx="4" fill={sponge} />
          <path d="M34 54h92" stroke={top} strokeWidth="3" />
          <path d="M34 72h92" stroke={top} strokeOpacity="0.7" strokeWidth="3" />
          <path d="M30 44h100v6c-6 0-6 8-12 8s-6-8-12-8-6 10-12 10-6-10-12-10-6 8-12 8-6-8-12-8-6 10-12 10-6-10-12-10-6 8-12 8z" fill={top} />
          <rect x="22" y="88" width="116" height="5" rx="2.5" fill="#c9cfc6" />
          <circle cx="62" cy="38" r="4" fill={deco} />
          <circle cx="80" cy="35" r="4" fill={deco} />
          <circle cx="98" cy="38" r="4" fill={deco} />
        </g>
      )
    }
    case 'galette':
      return (
        <g>
          <ellipse cx="80" cy="64" rx="56" ry="26" fill="#d7a058" />
          <ellipse cx="80" cy="62" rx="40" ry="17" fill="#a83d4d" />
          {[58, 72, 88, 102].map((x, i) => (
            <circle key={x} cx={x} cy={i % 2 ? 58 : 66} r="5" fill="#cf5866" />
          ))}
          <path d="M26 64c8 14 30 24 54 24s46-10 54-24" fill="none" stroke="#b07035" strokeWidth="3" strokeDasharray="6 5" />
        </g>
      )
    case 'cup':
      return (
        <g>
          <ellipse cx="80" cy="86" rx="40" ry="7" fill="#e9e4d8" />
          <path d="M52 44h56l-6 40c-2 4-10 6-22 6s-20-2-22-6z" fill="#f6f1e7" stroke={INK} strokeWidth="2" />
          <path d="M108 52c14 0 14 18 0 18" fill="none" stroke={INK} strokeWidth="3" />
          <ellipse cx="80" cy="46" rx="26" ry="5" fill="#9a6535" />
          <path d="M76 45c2-3 6-3 8 0-2 3-6 3-8 0z" fill="#f2ddb0" />
        </g>
      )
    case 'filter':
      return (
        <g>
          <path d="M60 26h40l-8 22H68z" fill="#f6f1e7" stroke={INK} strokeWidth="2" />
          <path d="M58 52h44c4 10 6 20 4 30-2 6-12 8-26 8s-24-2-26-8c-2-10 0-20 4-30z" fill="#e6efe8" stroke={INK} strokeWidth="2" />
          <path d="M56 70h48c-1 8-2 12-6 14-4 3-10 4-18 4s-14-1-18-4c-4-2-5-6-6-14z" fill="#6e4426" />
        </g>
      )
    case 'beans':
      return (
        <g>
          <path d="M48 28h64l6 62H42z" fill="#2f4a2c" />
          <path d="M48 28l6-8h52l6 8" fill="#3d5c39" />
          <rect x="58" y="46" width="44" height="28" rx="2" fill="#f6f1e7" />
          <ellipse cx="72" cy="60" rx="5" ry="7" fill="#6e4426" transform="rotate(-20 72 60)" />
          <ellipse cx="88" cy="60" rx="5" ry="7" fill="#6e4426" transform="rotate(20 88 60)" />
        </g>
      )
  }
}

/** A drawn map of the harbour end of town with the shop pinned. */
export function HarbourMap(): JSX.Element {
  return (
    <svg className={styles.mapSvg} viewBox="0 0 520 360" role="img" aria-label="Map sketch: the bakehouse sits on Net Loft Yard, a short walk from the harbour car park">
      <rect width="520" height="360" fill="#e7dec9" />
      <path d="M0 250c60-20 110 10 170-6s90-50 160-40 120 30 190 10v146H0z" fill="#b9cbc0" />
      <g fill="none" stroke="#f6f1e7" strokeWidth="2" strokeLinecap="round" opacity="0.8">
        <path d="M30 300c14-6 28-6 42 0s28 6 42 0" />
        <path d="M250 320c14-6 28-6 42 0s28 6 42 0" />
        <path d="M400 290c14-6 28-6 42 0s28 6 42 0" />
      </g>
      <path d="M300 214l60 70" stroke="#8c8577" strokeWidth="10" strokeLinecap="round" />
      <path d="M60 60c80 30 150 40 250 40s150-10 210-30" fill="none" stroke="#f6f1e7" strokeWidth="18" strokeLinecap="round" />
      <path d="M220 100c-10 50-10 90 10 130" fill="none" stroke="#f6f1e7" strokeWidth="12" strokeLinecap="round" />
      <g fill="#d3c7ac">
        <rect x="90" y="120" width="70" height="44" rx="4" />
        <rect x="250" y="130" width="90" height="50" rx="4" />
        <rect x="370" y="110" width="80" height="40" rx="4" />
        <rect x="100" y="182" width="56" height="36" rx="4" />
      </g>
      <rect x="380" y="180" width="96" height="46" rx="6" fill="#f6f1e7" stroke="#20301f" strokeOpacity="0.4" strokeDasharray="4 4" />
      <text x="428" y="208" textAnchor="middle" fontSize="15" fill="#20301f" fontFamily="var(--nb-mono), monospace">P</text>
      <g transform="translate(236 142)">
        <path d="M0 -44c-16 0-26 12-26 26 0 20 26 42 26 42s26-22 26-42c0-14-10-26-26-26z" fill="#2f4a2c" />
        <circle cx="0" cy="-18" r="9" fill="#f6f1e7" />
      </g>
      <text x="262" y="96" fontSize="15" fill="#20301f" fontStyle="italic" fontFamily="'Iowan Old Style', Palatino, Georgia, serif">Net Loft Yard</text>
      <text x="30" y="340" fontSize="15" fill="#20301f" fontStyle="italic" fontFamily="'Iowan Old Style', Palatino, Georgia, serif">the harbour</text>
      <g transform="translate(470 40)" stroke="#20301f" strokeWidth="1.5" fill="none">
        <circle r="16" />
        <path d="M0 -12l5 12h-10z" fill="#20301f" />
      </g>
    </svg>
  )
}
