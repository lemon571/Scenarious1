import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/axios';
import { scenariosKeys } from '../services/queryKeys';
import type { Scenario } from '../types/Scenario';

type UpdatePayload = {
  scenarioId: string;
  body: Partial<Omit<Scenario, 'id' | 'blocks' | 'comments'>> & {
    blocks?: [];
    comments?: [];
  };
};

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export function useScenarioUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ scenarioId, body }: UpdatePayload) => {
      if (USE_MOCKS) return { ...body, id: scenarioId } as Scenario;
      const res = await api.patch(`/scenario/${scenarioId}`, body);
      return res.data as Scenario;
    },
    onSuccess: (data, { scenarioId }) => {
      qc.setQueryData(scenariosKeys.byId(scenarioId), data);
      if (!USE_MOCKS) qc.invalidateQueries({ queryKey: scenariosKeys.all });
    },
  });
}
