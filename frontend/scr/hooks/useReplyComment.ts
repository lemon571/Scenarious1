import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/axios';
import { blocksKeys, commentsKeys } from '../services/queryKeys';
import type { Comment, Reply } from '../types/Comment';

type Payload = { commentId: string; scenarioId: string; blockId: string; content: string };

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export function useReplyComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ commentId, content }: Payload) => {
      if (USE_MOCKS) {
        return {
          id: `tmp-${Date.now()}`,
          description: content,
          time: Date.now(),
          author: { name: 'Вы', avatar: '' },
          replies: [],
        } as unknown as Comment; // will be merged client-side
      }
      const res = await api.post(`/comment_reply/${commentId}`, {
        description: content,
        time: Date.now(),
        replies: [],
      });
      return res.data as Comment;
    },
    onMutate: async ({ scenarioId, blockId, commentId, content }) => {
      await qc.cancelQueries({ queryKey: blocksKeys.byScenarioId(scenarioId) });
      const previous = qc.getQueryData<Comment[]>(commentsKeys.byBlock(scenarioId, blockId));

      // Optimistically append reply to the matching comment
      const optimisticReply: Reply = {
        id: `tmp-${Date.now()}`,
        description: content,
        time: Date.now(),
        author: { name: 'Вы', avatar: '' },
        replies: [],
        block_id: blockId,
        scenario_id: scenarioId,
      } as Reply;

      if (previous) {
        const next = previous.map(c => (c.id === commentId ? { ...c, replies: [...c.replies, optimisticReply] } : c));
        qc.setQueryData(commentsKeys.byBlock(scenarioId, blockId), next);
      }

      return { previous, scenarioId, blockId };
    },
    onError: (_e, { scenarioId, blockId }, ctx) => {
      if (ctx?.previous) qc.setQueryData(commentsKeys.byBlock(scenarioId, blockId), ctx.previous);
    },
    onSettled: (_data, _e, { scenarioId }) => {
      if (!USE_MOCKS) qc.invalidateQueries({ queryKey: blocksKeys.byScenarioId(scenarioId) });
    },
  });
}

