import { useQuery } from '@tanstack/react-query';
import api from '../services/axios';
import { blocksKeys } from '../services/queryKeys';
import type { Block } from '../types/Block';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

function findBlockById(blocks: Block[], id: string): Block | undefined {
  for (const b of blocks) {
    if (b.id === id) return b;
    const child = findBlockById(b.children || [], id);
    if (child) return child;
  }
  return undefined;
}

export function useBlockById(blockId: string, scenarioId: string) {
  return useQuery({
    queryKey: blocksKeys.byId(blockId),
    enabled: !!blockId,
    queryFn: async (): Promise<Block> => {
      if (USE_MOCKS) {
        const { initialBlocks } = await import('../mocks/initialBlocks');
        const found = findBlockById(initialBlocks as unknown as Block[], blockId);
        if (!found) throw new Error('Block not found');
        return found;
      }
      const res = await api.get(`/blocks/latest/${scenarioId}/${blockId}`);
      return res.data as Block;
    },
  });
}
