import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/axios';
import { blocksKeys, commentsKeys } from '../services/queryKeys';
import type { Block } from '../types/Block';
import type { Comment } from '../types/Comment';

type Payload = { 
  commentId: string; 
  scenarioId: string; 
  blockId: string; 
};

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export function useDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ commentId }: Payload) => {
      if (USE_MOCKS) {
        return { success: true };
      }
      const res = await api.delete(`/comment/${commentId}`);
      return res.data;
    },
    onMutate: async ({ scenarioId, blockId, commentId }) => {
      await qc.cancelQueries({ queryKey: blocksKeys.byScenarioId(scenarioId) });
      const previous = qc.getQueryData<Block[]>(blocksKeys.byScenarioId(scenarioId));
      const prevComments = qc.getQueryData<Comment[]>(commentsKeys.byBlock(scenarioId, blockId));

      if (previous) {
        const next = previous.map((block: Block) => {
          if (block.id === blockId) {
            return {
              ...block,
              comments: block.comments?.filter((c: Comment) => c.id !== commentId) || [],
            };
          }
          return block;
        });
        qc.setQueryData(blocksKeys.byScenarioId(scenarioId), next);
      }

      if (prevComments) {
        const nextComments = prevComments.filter((c: Comment) => c.id !== commentId);
        qc.setQueryData(commentsKeys.byBlock(scenarioId, blockId), nextComments);
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
