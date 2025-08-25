import { useQuery } from '@tanstack/react-query';
import api from '../services/axios';
import { scenariosKeys } from '../services/queryKeys';
import type { Scenario } from '../types/Scenario';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export function useScenario(scenarioId: string) {
  return useQuery({
    queryKey: scenariosKeys.byId(scenarioId),
    enabled: !!scenarioId,
    queryFn: async (): Promise<Scenario> => {
      if (USE_MOCKS) {
        const { initialScenarios } = await import('../mocks/initialScenarios');
        const found = (initialScenarios as unknown as Scenario[]).find(s => s.id === scenarioId);
        if (!found) throw new Error('Scenario not found');
        return found;
      }
      const res = await api.get(`/scenario/${scenarioId}`);
      return res.data as Scenario;
    },
  });
}


