// Custom SVG icon set for Remix Relay. One unified minimal line style: 24×24
// grid, currentColor stroke, no fill — every glyph tints with surrounding text
// color and stays crisp at tile size. No emoji anywhere.
import type { ReactNode } from 'react';

const ICONS: Record<string, ReactNode> = {
  // ── transform moves ───────────────────────────────────────
  flame: (<>
    <path d="M12 3c1 3-2 4-2 7a2 2 0 0 0 4 .3C16 13 13 6 12 3z" />
    <path d="M7.5 12c-1 1.6-1.5 3.2-1.5 4.8A6 6 0 0 0 18 17c0-2.2-1-4-2.5-5.5" />
  </>),
  drop: (<>
    <path d="M12 3.5c3 4 5 6.5 5 9.5a5 5 0 0 1-10 0c0-3 2-5.5 5-9.5z" />
    <path d="M9.5 13.5a2.5 2.5 0 0 0 2.5 2.5" />
  </>),
  ruins: (<>
    <path d="M5 21V8M9 21V8M15 21V9M19 21V9" />
    <path d="M4 8h6M14 9h6" />
    <path d="M3.5 21h17" />
    <path d="M9 14h6" />
  </>),
  chip: (<>
    <rect x="7" y="7" width="10" height="10" rx="1.5" />
    <path d="M10 10h4v4h-4z" />
    <path d="M10 4v3M14 4v3M10 17v3M14 17v3M4 10h3M4 14h3M17 10h3M17 14h3" />
  </>),
  tiny: (<>
    <rect x="9" y="9" width="6" height="6" rx="1" />
    <path d="M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4" />
  </>),
  giant: (<>
    <path d="M12 3v18M12 3l-4 4M12 3l4 4" />
    <path d="M5 21h14" />
    <path d="M7 14l-2 2M17 14l2 2" />
  </>),
  gem: (<>
    <path d="M6 4h12l3 5-9 11L3 9z" />
    <path d="M3 9h18M9 4 7.5 9 12 20M15 4l1.5 5L12 20" />
  </>),
  moon: (<>
    <path d="M19 14.5A8 8 0 0 1 9.5 5a7 7 0 1 0 9.5 9.5z" />
    <path d="M16 4l.7 1.8L18.5 6.5l-1.8.7L16 9l-.7-1.8L13.5 6.5l1.8-.7z" />
  </>),
  snow: (<>
    <path d="M12 3v18M3 12h18" />
    <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />
    <path d="M12 6l-2 2M12 6l2 2M12 18l-2-2M12 18l2-2M6 12l2-2M6 12l2 2M18 12l-2-2M18 12l-2 2" />
  </>),
  bolt: (<>
    <path d="M13 3 5 13h5l-1 8 8-11h-5z" />
  </>),
  candy: (<>
    <circle cx="12" cy="12" r="4.5" />
    <path d="M8.8 8.8 4.5 6 6 10.3M15.2 15.2l4.3 2.8L18 13.7" />
    <path d="M10.5 10.5l3 3M13.5 10.5l-3 3" />
  </>),
  planet: (<>
    <circle cx="12" cy="12" r="5" />
    <path d="M4.5 16c-1.6 1.6-2.2 3-1.4 3.7.9.9 3.6-.4 6.2-2.8M19.5 8c1.6-1.6 2.2-3 1.4-3.7-.9-.9-3.6.4-6.2 2.8" />
  </>),
  leaf: (<>
    <path d="M20 4C9 4 4 9 4 18c0 0 0 2 0 2 9 0 16-5 16-16z" />
    <path d="M4 20C8 14 12 11 17 8" />
  </>),
  ghost: (<>
    <path d="M6 20v-8a6 6 0 0 1 12 0v8l-2-1.5L14 20l-2-1.5L10 20l-2-1.5z" />
    <circle cx="9.5" cy="11" r="1" /><circle cx="14.5" cy="11" r="1" />
  </>),
  robot: (<>
    <rect x="6" y="8" width="12" height="10" rx="2" />
    <path d="M12 4v4M9 4h6" />
    <circle cx="9.5" cy="12.5" r="1" /><circle cx="14.5" cy="12.5" r="1" />
    <path d="M9.5 15.5h5M3.5 11v4M20.5 11v4" />
  </>),
  diamond: (<>
    <path d="M12 3 4 11l8 10 8-10z" />
    <path d="M12 3v18M4 11h16" />
  </>),

  // ── UI ────────────────────────────────────────────────────
  shuffle: (<>
    <path d="M3 7h3.5c1.5 0 2.5 1 3.5 2.5M3 17h3.5c1.5 0 2.5-1 3.5-2.5" />
    <path d="M14 7h4M14 17h4" />
    <path d="M16 5l3 2-3 2M16 15l3 2-3 2" />
  </>),
  grid: (<>
    <rect x="4" y="4" width="7" height="7" rx="1" />
    <rect x="13" y="4" width="7" height="7" rx="1" />
    <rect x="4" y="13" width="7" height="7" rx="1" />
    <rect x="13" y="13" width="7" height="7" rx="1" />
  </>),
  arrow: (<>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </>),
  chain: (<>
    <path d="M9 12h6" />
    <path d="M9 8H7a4 4 0 0 0 0 8h2M15 8h2a4 4 0 0 1 0 8h-2" />
  </>),
  tap: (<>
    <path d="M9 11V6a1.8 1.8 0 0 1 3.6 0v5" />
    <path d="M12.6 11V9.2a1.6 1.6 0 0 1 3.2 0V11M15.8 11v-.6a1.6 1.6 0 0 1 3.2 0V15a5 5 0 0 1-5 5h-2.2a4 4 0 0 1-3-1.4L6 15.5a1.7 1.7 0 0 1 2.5-2.2L9.6 14" />
  </>),
  back: (<>
    <path d="M15 6l-6 6 6 6" />
  </>),
  wand: (<>
    <path d="M5 19 16 8M14 6l1-2 1 2 2 1-2 1-1 2-1-2-2-1z" />
    <path d="M6.5 12.5l1.2.4.4 1.2.4-1.2 1.2-.4-1.2-.4-.4-1.2-.4 1.2z" />
  </>),
};

export function Icon({ name, size = 24 }: { name: string; size?: number }) {
  const g = ICONS[name];
  if (!g) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {g}
    </svg>
  );
}

// Avatar fallback monogram — a colored disc with the name's initial. Never an
// empty circle (reads as loading).
const MONO_COLORS = ['#ff5d73', '#ffb13e', '#3ee0c8', '#5d9bff', '#c46bff', '#ff6bd6'];
export function Monogram({ name, size = 22 }: { name: string; size?: number }) {
  const ch = (name || '?').trim().charAt(0).toUpperCase() || '?';
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const bg = MONO_COLORS[h % MONO_COLORS.length];
  return (
    <span
      className="rr-mono"
      style={{
        width: size,
        height: size,
        background: bg,
        fontSize: size * 0.5,
      }}
    >
      {ch}
    </span>
  );
}
