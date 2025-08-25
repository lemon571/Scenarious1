import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/axios';
import { blocksKeys } from '../services/queryKeys';
import type { Block } from '../types/Block';

type CreatePayload = {
  scenarioId: string;
  blockId: string; // path param in API
  templateId?: string;
  body: Partial<Omit<Block, 'id' | 'children' | 'comments'>> & {
    title: string;
    comments?: [];
    children?: [];
  };
};

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export function useBlockCreate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ scenarioId, templateId, body }: CreatePayload) => {
      if (USE_MOCKS) {
        const created: Block = {
          id: body.title + '-' + Date.now(),
          block_id: String(Math.random()),
          title: body.title,
          location: body.location || '',
          start: body.start || Date.now(),
          duration: body.duration || 0,
          roles: body.roles || [],
          color: body.color,
          children: [],
          comments: [],
          description: body.description || '',
        };
        return created;
      }
      const res = await api.post(
        `/blocks/${scenarioId}/` + (templateId ? `?template_id=${templateId}` : ''),
        body,
      );
      return res.data as Block;
    },
    onSuccess: (_data, { scenarioId }) => {
      if (!USE_MOCKS) qc.invalidateQueries({ queryKey: blocksKeys.byScenarioId(scenarioId) });
    },
  });
}
