import { useQuery } from '@tanstack/react-query';
import api from '../services/axios';
import { templatesKeys } from '../services/queryKeys';
import type { ScenarioTemplate } from '../types/ScenarioTemplate';
import type { BlockTemplate } from '../types/BlockTemplate';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export function useScenarioTemplates(params?: { is_popular?: boolean; category?: string }) {
  return useQuery({
    queryKey: templatesKeys.scenario(params),
    queryFn: async (): Promise<ScenarioTemplate[]> => {
      if (USE_MOCKS) {
        const { initialScenarioTemplates } = await import('../mocks/initialScenarioTemplates');
        return initialScenarioTemplates as unknown as ScenarioTemplate[];
      }
      const search = new URLSearchParams();
      if (params?.is_popular != null) search.set('is_popular', String(params.is_popular));
      if (params?.category) search.set('category', params.category);
      const res = await api.get(
        `/templates/scenario${search.toString() ? `?${search.toString()}` : ''}`,
      );
      const noramlized = res.data.map(({ _id, ...rest }: ScenarioTemplate) => ({
        ...rest,
        id: _id,
      }));
      return noramlized as ScenarioTemplate[];
    },
  });
}

export function useBlockTemplates(params?: { tag?: string }) {
  return useQuery({
    queryKey: templatesKeys.block(params),
    queryFn: async (): Promise<BlockTemplate[]> => {
      if (USE_MOCKS) {
        const { initialBlockTemplates } = await import('../mocks/initialBlockTemplates');
        return initialBlockTemplates as unknown as BlockTemplate[];
      }
      const search = new URLSearchParams();
      if (params?.tag) search.set('tag', params.tag);
      const res = await api.get(
        `/templates/blocks${search.toString() ? `?${search.toString()}` : ''}`,
      );
      return res.data as BlockTemplate[];
    },
  });
}
