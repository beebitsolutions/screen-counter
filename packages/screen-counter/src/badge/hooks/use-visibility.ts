export type ShowMode = 'auto' | 'always' | 'never';

function normalizeShow(value: unknown): ShowMode | undefined {
  if (value === 'auto' || value === 'always' || value === 'never') return value;
  return undefined;
}

export interface ResolveVisibilityInput {
  showProp: ShowMode | undefined;
  showEnv: string | undefined;
  nodeEnv: string | undefined;
}

export function resolveVisibility(input: ResolveVisibilityInput): boolean {
  const show: ShowMode = normalizeShow(input.showProp) ?? normalizeShow(input.showEnv) ?? 'auto';
  switch (show) {
    case 'always':
      return true;
    case 'never':
      return false;
    case 'auto':
      return input.nodeEnv !== 'production';
  }
}

export function useVisibility(showProp: ShowMode | undefined): boolean {
  return resolveVisibility({
    showProp,
    showEnv: process.env['NEXT_PUBLIC_SCREEN_COUNTER_SHOW'],
    nodeEnv: process.env['NODE_ENV'],
  });
}
