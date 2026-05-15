export const VERSION = '0.0.0';

export interface ScreenInfo {
  filePath: string;
  kind: 'route' | 'modal' | 'forced' | 'disabled';
  signals?: string[];
}

export interface AnalysisResult {
  count: number;
  routes: ScreenInfo[];
  modals: ScreenInfo[];
  disabled: ScreenInfo[];
}

export interface Config {
  rootDir?: string;
  include?: string[];
  exclude?: string[];
}

export async function analyze(_rootDir: string, _config: Config = {}): Promise<AnalysisResult> {
  throw new Error('analyze() not implemented yet. See Epic 2 in the plan.');
}
