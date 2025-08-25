import { useQuery } from '@tanstack/react-query';
import api from '../services/axios';
import { scenariosKeys } from '../services/queryKeys';

interface ScenarioVersion {
  author: string;
  timestamp: number;
}

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export function useScenarioVersions(scenarioId: string) {
  return useQuery({
    queryKey: [...scenariosKeys.byId(scenarioId), 'versions'],
    enabled: !!scenarioId,
    queryFn: async (): Promise<ScenarioVersion[]> => {
      if (USE_MOCKS) {
        return [
          { author: 'Иван', timestamp: Date.now() - 86400000 },
          { author: 'Мария', timestamp: Date.now() - 172800000 },
        ];
      }
      const res = await api.get(`/scenario/versions/${scenarioId}`);
      return res.data as ScenarioVersion[];
    },
  });
}
