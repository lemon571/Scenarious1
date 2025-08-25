import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/axios';
import { scenariosKeys } from '../services/queryKeys';

type DeletePayload = { scenarioId: string };

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export function useScenarioDelete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ scenarioId }: DeletePayload) => {
      if (USE_MOCKS) return true;
      const res = await api.delete(`/scenario/${scenarioId}`);
      return res.status === 200;
    },
    onSuccess: () => {
      if (!USE_MOCKS) qc.invalidateQueries({ queryKey: scenariosKeys.all });
    },
  });
}


