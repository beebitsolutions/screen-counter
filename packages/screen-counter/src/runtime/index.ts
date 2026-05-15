import type { AnalysisResult } from '../types.js';

const fallback: AnalysisResult = {
  count: 0,
  routes: [],
  modals: [],
  disabled: [],
};

export const data: AnalysisResult = fallback;
export const count: number = fallback.count;
export const generatedAt: string | null = null;
