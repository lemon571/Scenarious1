export const blocksKeys = {
  all: ['blocks'] as const,
  byId: (blockId: string) => ['block', blockId] as const,
  byScenarioId: (scenarioId: string) => ['blocks', scenarioId] as const,
  byScenarionId: (scenarioId: string) => ['blocks', scenarioId] as const, // backward-compat if used elsewhere
};

export const scenariosKeys = {
  all: ['scenarios'] as const,
  byId: (scenarioId: string) => ['scenario', scenarioId] as const,
};

export const commentsKeys = {
  all: ['comments'] as const,
  byBlock: (scenarioId: string, blockId: string) => ['comments', scenarioId, blockId] as const,
};

export const templatesKeys = {
  all: ['templates'] as const,
  scenario: (params?: { is_popular?: boolean; category?: string }) =>
    ['templates', 'scenario', params?.is_popular ?? false, params?.category ?? ''] as const,
  block: (params?: { tag?: string }) => ['templates', 'block', params?.tag ?? ''] as const,
};

export const notificationsKeys = {
  all: ['notifications'] as const,
};
