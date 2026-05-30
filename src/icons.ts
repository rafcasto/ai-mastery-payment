/* Lucide-accurate inline SVG icons (2px stroke, rounded caps), ported from icons.jsx. */

interface IconDef {
  s?: string[];
  f?: string;
  rect?: { x: number; y: number; w: number; h: number; rx: number }[];
  circle?: { cx: number; cy: number; r: number }[];
}

const ICON_PATHS: Record<string, IconDef> = {
  check: { s: ['M20 6 9 17l-5-5'] },
  'check-circle': { s: ['M21.801 10A10 10 0 1 1 17 3.335', 'm9 11 3 3L22 4'] },
  star: {
    f: 'M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z',
  },
  lock: { s: ['M7 11V7a5 5 0 0 1 10 0v4'], rect: [{ x: 3, y: 11, w: 18, h: 11, rx: 2 }] },
  'shield-check': {
    s: [
      'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
      'm9 12 2 2 4-4',
    ],
  },
  'credit-card': { s: ['M2 10h20'], rect: [{ x: 2, y: 5, w: 20, h: 14, rx: 2 }] },
  'chevron-down': { s: ['m6 9 6 6 6-6'] },
  play: { f: 'M6 3v18l15-9z' },
  globe: {
    s: ['M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20', 'M2 12h20'],
    circle: [{ cx: 12, cy: 12, r: 10 }],
  },
  plus: { s: ['M5 12h14', 'M12 5v14'] },
  'arrow-up-right': { s: ['M7 7h10v10', 'M7 17 17 7'] },
  tag: {
    s: [
      'M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z',
    ],
    circle: [{ cx: 7.5, cy: 7.5, r: 0.6 }],
  },
  x: { s: ['M18 6 6 18', 'm6 6 12 12'] },
  mail: { s: ['m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'], rect: [{ x: 2, y: 4, w: 20, h: 16, rx: 2 }] },
  users: {
    s: [
      'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
      'M22 21v-2a4 4 0 0 0-3-3.87',
      'M16 3.13a4 4 0 0 1 0 7.75',
    ],
    circle: [{ cx: 9, cy: 7, r: 4 }],
  },
  clock: { s: ['M12 6v6l4 2'], circle: [{ cx: 12, cy: 12, r: 10 }] },
  infinity: { s: ['M6 16c5 0 7-8 12-8a4 4 0 0 1 0 8c-5 0-7-8-12-8a4 4 0 0 0 0 8'] },
  'badge-check': {
    s: [
      'M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z',
      'm9 12 2 2 4-4',
    ],
  },
  'book-open': {
    s: [
      'M12 7v14',
      'M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z',
    ],
  },
  target: { s: [], circle: [{ cx: 12, cy: 12, r: 10 }, { cx: 12, cy: 12, r: 6 }, { cx: 12, cy: 12, r: 2 }] },
  zap: {
    f: 'M9.3 1.2a1 1 0 0 0-1.76.62L7 9H3.5a1 1 0 0 0-.78 1.63l9.2 11.55a1 1 0 0 0 1.76-.62L14 14h3.5a1 1 0 0 0 .78-1.63z',
  },
  sparkles: {
    s: [
      'M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z',
    ],
  },
  'help-circle': {
    s: ['M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3', 'M12 17h.01'],
    circle: [{ cx: 12, cy: 12, r: 10 }],
  },
  'arrow-left': { s: ['m12 19-7-7 7-7', 'M19 12H5'] },
};

export interface IconOpts {
  size?: number;
  stroke?: number;
  fill?: boolean;
  color?: string;
  className?: string;
}

/** Returns an SVG markup string for the named icon (empty string if unknown). */
export function icon(name: string, opts: IconOpts = {}): string {
  const d = ICON_PATHS[name];
  if (!d) return '';
  const { size = 20, stroke = 2, color = 'currentColor', className = '' } = opts;
  const cls = className ? ` class="${className}"` : '';
  const base = `xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"${cls}`;

  if (d.f) {
    return `<svg ${base} fill="${color}" stroke="none"><path d="${d.f}"/></svg>`;
  }

  let inner = '';
  (d.rect || []).forEach((r) => {
    inner += `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="${r.rx}"/>`;
  });
  (d.circle || []).forEach((c) => {
    inner += `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}"/>`;
  });
  (d.s || []).forEach((p) => {
    inner += `<path d="${p}"/>`;
  });

  return `<svg ${base} fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}
