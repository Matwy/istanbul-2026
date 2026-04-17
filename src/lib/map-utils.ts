export function buildGoogleMapsUrl(lat: number, lng: number, label?: string): string {
  const query = label ? `${encodeURIComponent(label)}` : `${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${query}&center=${lat},${lng}`;
}

const HEX_COLOR = /^#[0-9A-Fa-f]{3,8}$/;

function sanitizeColor(color: string): string {
  return HEX_COLOR.test(color) ? color : '#1B3A6B';
}

function escapeXmlText(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string
  );
}

export function buildPinSvg(color: string, label?: string): string {
  const safeColor = sanitizeColor(color);
  const text = label ? escapeXmlText(label) : '';
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" />
      <feOffset dx="0" dy="1" result="o" />
      <feComponentTransfer><feFuncA type="linear" slope="0.4" /></feComponentTransfer>
      <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
  </defs>
  <g filter="url(#shadow)">
    <path d="M16 1 C8 1 2 7 2 15 C2 26 16 41 16 41 C16 41 30 26 30 15 C30 7 24 1 16 1 Z" fill="${safeColor}" stroke="#FAF7F0" stroke-width="1.5"/>
    <circle cx="16" cy="15" r="5" fill="#FAF7F0"/>
    ${text ? `<text x="16" y="18" text-anchor="middle" font-size="8" font-weight="700" fill="${safeColor}" font-family="Inter, sans-serif">${text}</text>` : ''}
  </g>
</svg>`;
}

export function pinDataUrl(color: string, label?: string): string {
  const svg = buildPinSvg(color, label);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

export const DAY_COLORS: Record<string, string> = {
  g1: '#5A5A5A',
  g2: '#1B3A6B',
  g3: '#C9A961',
  g4: '#8B2635',
  g5: '#5A5A5A',
  optional: '#8A8A8A',
};

export const ISTANBUL_CENTER: [number, number] = [41.0135, 28.9784];
