import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/axios';
import { blocksKeys } from '../services/queryKeys';
import type { Block } from '../types/Block';

type UpdatePayload = {
  blockId: string;
  scenarioId?: string; // for invalidation convenience
  body: Partial<Omit<Block, 'id' | 'children' | 'comments'>>;
};

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export function useBlockUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ blockId, scenarioId, body }: UpdatePayload) => {
      if (USE_MOCKS) return { ...body, id: blockId } as Block;
      const res = await api.patch(`/blocks/${blockId}`, { ...body, scenario_id: scenarioId });
      return res.data as Block;
    },
    onSuccess: (_, { blockId, scenarioId }) => {
      // qc.setQueryData(blocksKeys.byId(blockId), data);
      if (blockId && !USE_MOCKS)
        qc.invalidateQueries({ queryKey: blocksKeys.byId(blockId) });
      if (scenarioId && !USE_MOCKS)
        qc.invalidateQueries({ queryKey: blocksKeys.byScenarioId(scenarioId) });
    },
  });
}
