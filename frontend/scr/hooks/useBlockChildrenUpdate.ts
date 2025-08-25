import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/axios';
import { blocksKeys } from '../services/queryKeys';
import type { Block } from '../types/Block';

type UpdateChildrenPayload = {
  blockId: string;
  scenarioId?: string; // for invalidation convenience
  children: Block[];
};

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export function useBlockChildrenUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ blockId, children }: UpdateChildrenPayload) => {
      if (USE_MOCKS) return { ...children[0], _id: blockId } as Block;
      const res = await api.patch(`/blocks/${blockId}/children`, children);
      return res.data as Block;
    },
    onSuccess: (_data, { scenarioId }) => {
      if (scenarioId && !USE_MOCKS) qc.invalidateQueries({ queryKey: blocksKeys.byScenarioId(scenarioId) });
    },
  });
}
