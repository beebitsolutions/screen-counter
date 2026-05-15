'use client';

import { count as virtualCount } from '@beebit/screen-counter/runtime';
import { useHidden } from './hooks/use-hidden.js';
import { useVisibility, type ShowMode } from './hooks/use-visibility.js';
import {
  buttonStyle,
  CLASS,
  containerStyle,
  STYLE_TAG_CSS,
  textStyle,
  type BadgeColor,
  type BadgePosition,
} from './styles.js';

const DEFAULT_LIMIT = 20;
const DEFAULT_POSITION: BadgePosition = 'top-right';
const DEFAULT_THRESHOLDS = { amber: 80, red: 100 } as const;

export interface ScreenCounterBadgeProps {
  count?: number;
  limit?: number;
  position?: BadgePosition;
  thresholds?: { amber: number; red: number };
  show?: ShowMode;
}

function isFiniteNonNegative(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n >= 0;
}

function resolveLimit(propLimit: number | undefined): number | null {
  if (isFiniteNonNegative(propLimit)) return propLimit;
  const raw = process.env['NEXT_PUBLIC_SCREEN_COUNTER_LIMIT'];
  if (raw !== undefined && raw !== '') {
    const parsed = Number.parseInt(raw, 10);
    if (isFiniteNonNegative(parsed)) return parsed;
  }
  return DEFAULT_LIMIT;
}

function resolveCount(propCount: number | undefined): number | null {
  if (isFiniteNonNegative(propCount)) return propCount;
  if (isFiniteNonNegative(virtualCount)) return virtualCount;
  return null;
}

function pickColor(
  count: number,
  limit: number,
  thresholds: { amber: number; red: number },
): BadgeColor {
  if (limit <= 0) return 'red';
  const pct = (count / limit) * 100;
  if (pct >= thresholds.red) return 'red';
  if (pct >= thresholds.amber) return 'amber';
  return 'green';
}

export function ScreenCounterBadge(props: ScreenCounterBadgeProps = {}) {
  const policyVisible = useVisibility(props.show);
  const { hidden, hide } = useHidden();

  const resolvedLimit = resolveLimit(props.limit);
  const resolvedCount = resolveCount(props.count);

  if (resolvedLimit === null || resolvedCount === null) {
    if (process.env['NODE_ENV'] !== 'production') {
      console.warn(
        '[screen-counter] badge: count/limit could not be resolved; rendering nothing. ' +
          'Pass `count` and `limit` as props, set NEXT_PUBLIC_SCREEN_COUNTER_LIMIT, ' +
          'or install the plugin so `@beebit/screen-counter/runtime` exposes a count.',
      );
    }
    return null;
  }

  if (!policyVisible || hidden) return null;

  const thresholds = props.thresholds ?? DEFAULT_THRESHOLDS;
  const position = props.position ?? DEFAULT_POSITION;
  const color = pickColor(resolvedCount, resolvedLimit, thresholds);

  return (
    <>
      <style data-screen-counter="disable">{STYLE_TAG_CSS}</style>
      <div
        role="status"
        aria-label="Screen counter"
        data-screen-counter="disable"
        style={containerStyle(position, color)}
      >
        <span style={textStyle}>
          {resolvedCount}/{resolvedLimit} screens
        </span>
        <button
          type="button"
          aria-label="Hide screen counter"
          className={CLASS.close}
          onClick={hide}
          style={buttonStyle}
        >
          ×
        </button>
      </div>
    </>
  );
}
