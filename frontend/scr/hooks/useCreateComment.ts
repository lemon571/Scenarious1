import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/axios';
import { blocksKeys, commentsKeys } from '../services/queryKeys';
import type { Block } from '../types/Block';
import type { Comment } from '../types/Comment';

type Payload = {
  scenarioId: string;
  blockId: string;
  description: string;
  creatorId: string;
  linePosition?: number;
};

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export function useCreateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ scenarioId, blockId, description, creatorId, linePosition }: Payload) => {
      if (USE_MOCKS) {
        return {
          success: true,
          id: `tmp-${Date.now()}`,
          parent_type: 'block',
        };
      }
      const res = await api.post(`/comment/${scenarioId}/${blockId}`, {
        description,
        creator_id: creatorId,
        line_position: linePosition || 0,
      });
      return res.data;
    },
    onMutate: async ({ scenarioId, blockId, description }) => {
      await qc.cancelQueries({ queryKey: blocksKeys.byScenarioId(scenarioId) });
      const previous = qc.getQueryData<Block[]>(blocksKeys.byScenarioId(scenarioId));
      const prevComments = qc.getQueryData<Comment[]>(commentsKeys.byBlock(scenarioId, blockId));

      // Optimistic comment structure - adjust based on your Comment type
      const optimistic = {
        id: `tmp-${Date.now()}`,
        description,
        creator_id: 'current-user',
        line_position: 0,
      };

      if (previous) {
        const next = previous.map(b =>
          b.id === blockId ? { ...b, comments: [optimistic, ...(b.comments || [])] } : b,
        );
        qc.setQueryData(blocksKeys.byScenarioId(scenarioId), next);
      }
      if (prevComments) {
        qc.setQueryData(commentsKeys.byBlock(scenarioId, blockId), [optimistic, ...prevComments]);
      }
      return { previous, scenarioId, blockId, prevComments };
    },
    onError: (_e, { scenarioId, blockId }, ctx) => {
      if (ctx?.previous) qc.setQueryData(blocksKeys.byScenarioId(scenarioId), ctx.previous);
      if (ctx?.prevComments)
        qc.setQueryData(commentsKeys.byBlock(scenarioId, blockId), ctx.prevComments);
    },
    onSettled: (_data, _e, { scenarioId }) => {
      if (!USE_MOCKS) qc.invalidateQueries({ queryKey: blocksKeys.byScenarioId(scenarioId) });
    },
  });
}
