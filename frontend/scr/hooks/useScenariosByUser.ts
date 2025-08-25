import { useQuery } from '@tanstack/react-query';
import api from '../services/axios';
import { scenariosKeys } from '../services/queryKeys';
import type { Scenario } from '../types/Scenario';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export function useScenariosByUser() {
  return useQuery({
    queryKey: scenariosKeys.all,
    queryFn: async (): Promise<Scenario[]> => {
      if (USE_MOCKS) {
        const { initialScenarios } = await import('../mocks/initialScenarios');
        return initialScenarios as unknown as Scenario[];
      }
      const res = await api.get('/scenario/user-scenario');
      const normalized = res.data.map(({ _id, ...rest }: Scenario) => ({
        ...rest,
        id: _id,
      }));
      return normalized as Scenario[];
    },
  });
}
