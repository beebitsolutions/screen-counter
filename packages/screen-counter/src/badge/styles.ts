import type { CSSProperties } from 'react';

export type BadgePosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type BadgeColor = 'green' | 'amber' | 'red';

export const COLORS: Record<BadgeColor, string> = {
  green: '#16a34a',
  amber: '#d97706',
  red: '#dc2626',
};

export const CLASS = {
  close: 'beebit-sc-close',
} as const;

const POSITION_OFFSET = 16;

export function containerStyle(position: BadgePosition, color: BadgeColor): CSSProperties {
  const base: CSSProperties = {
    position: 'fixed',
    zIndex: 2147483000,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(17, 24, 39, 0.92)',
    color: '#f9fafb',
    borderRadius: 9999,
    padding: '6px 10px 6px 12px',
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: 12,
    lineHeight: 1,
    fontWeight: 500,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
    pointerEvents: 'auto',
    boxSizing: 'border-box',
    borderLeft: `4px solid ${COLORS[color]}`,
  };
  switch (position) {
    case 'top-left':
      return { ...base, top: POSITION_OFFSET, left: POSITION_OFFSET };
    case 'top-right':
      return { ...base, top: POSITION_OFFSET, right: POSITION_OFFSET };
    case 'bottom-left':
      return { ...base, bottom: POSITION_OFFSET, left: POSITION_OFFSET };
    case 'bottom-right':
      return { ...base, bottom: POSITION_OFFSET, right: POSITION_OFFSET };
  }
}

export const textStyle: CSSProperties = {
  whiteSpace: 'nowrap',
};

export const buttonStyle: CSSProperties = {
  background: 'transparent',
  color: 'inherit',
  border: 0,
  padding: '0 2px',
  margin: 0,
  font: 'inherit',
  fontSize: 16,
  lineHeight: 1,
  cursor: 'pointer',
  opacity: 0.7,
  borderRadius: 4,
};

export const STYLE_TAG_CSS = `
.${CLASS.close}:hover { opacity: 1; }
.${CLASS.close}:focus-visible {
  outline: 2px solid #60a5fa;
  outline-offset: 2px;
  opacity: 1;
}
@media (prefers-reduced-motion: no-preference) {
  .${CLASS.close} { transition: opacity 200ms ease; }
}
`.trim();
