import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/axios';
import { blocksKeys } from '../services/queryKeys';

type DeletePayload = { blockId: string; scenarioId: string };

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export function useBlockDelete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ blockId }: DeletePayload) => {
      if (USE_MOCKS) return true;
      const res = await api.delete(`/blocks/${blockId}`);
      return res.status === 200;
    },
    onSuccess: (_ok, { scenarioId }) => {
      if (!USE_MOCKS) qc.invalidateQueries({ queryKey: blocksKeys.byScenarioId(scenarioId) });
    },
  });
}


