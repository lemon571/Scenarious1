import { useQuery } from '@tanstack/react-query';
import api from '../services/axios';
import { commentsKeys } from '../services/queryKeys';
import type { Comment } from '../types/Comment';
import type { Block } from '../types/Block';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export function useComments(scenarioId: string, blockId: string) {
  return useQuery({
    queryKey: commentsKeys.byBlock(scenarioId, blockId),
    enabled: !!scenarioId && !!blockId,
    queryFn: async (): Promise<Comment[]> => {
      if (USE_MOCKS) {
        const { initialBlocks } = await import('../mocks/initialBlocks');
        const flattenBlocks = (list: Block[]): Block[] =>
          list.flatMap((b: Block) => [b, ...(b.children && b.children.length ? flattenBlocks(b.children) : [])]);
        const all: Block[] = flattenBlocks(initialBlocks as unknown as Block[]);
        const found = all.find((b: Block) => b.id === blockId);
        return found?.comments || [];
      }
      const res = await api.get(`/comments/${scenarioId}/${blockId}`);
      return res.data as Comment[];
    },
  });
}


