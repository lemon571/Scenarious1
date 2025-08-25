import { useQuery } from '@tanstack/react-query';
import api from '../services/axios';
import { blocksKeys } from '../services/queryKeys';
import type { Block } from '../types/Block';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export function useScenarioBlocks(scenarioId: string) {
  return useQuery({
    queryKey: blocksKeys.byScenarioId(scenarioId),
    enabled: !!scenarioId,
    queryFn: async (): Promise<Block[]> => {
      if (USE_MOCKS) {
        const { initialBlocks } = await import('../mocks/initialBlocks');
        return initialBlocks as Block[];
      }
      const res = await api.get(`/blocks/get-blocks-by-scenario-id/${scenarioId}`);
      return res.data as Block[];
    },
  });
}

