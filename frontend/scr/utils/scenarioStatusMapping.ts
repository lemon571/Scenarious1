import type { scenarioStatus } from '../types/Scenario';

export const scenarioStatuses: scenarioStatus[] = [
  'draft',
  'in_progress',
  'approved',
  'ready_for_air',
  'on_air',
  'archive',
];

export const scenarioStatusMapping: Record<scenarioStatus, string> = {
  draft: 'черновик',
  in_progress: 'в работе',
  approved: 'согласован',
  ready_for_air: 'готов к эфиру',
  on_air: 'в эфире',
  archive: 'архив',
};

export const scenarioStatusThemeMapping: Record<scenarioStatus, labelTheme> = {
  draft: 'unknown',
  in_progress: 'normal',
  approved: 'utility',
  ready_for_air: 'success',
  on_air: 'warning',
  archive: 'clear',
};

export const getStatusDisplayName = (status: scenarioStatus): string => {
  return scenarioStatusMapping[status];
};

type labelTheme =
  | 'info'
  | 'warning'
  | 'danger'
  | 'utility'
  | 'normal'
  | 'clear'
  | 'success'
  | 'unknown'
  | undefined;

export const getStatusTheme = (status: scenarioStatus): labelTheme => {
  return scenarioStatusThemeMapping[status];
};
