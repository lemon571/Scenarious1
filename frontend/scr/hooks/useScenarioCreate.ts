import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/axios';
import { scenariosKeys } from '../services/queryKeys';
import type { Scenario } from '../types/Scenario';
import type { Author } from '../types/Comment';

type CreatePayload = {
  templateId?: string;
  body: Partial<Omit<Scenario, 'id' | 'updatedAt' | 'updatedBy' | 'participants' | 'blocks'>> & {
    blocks?: Scenario['blocks'];
    participants?: Author[];
    updatedBy?: Author;
  };
};

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export function useScenarioCreate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ templateId, body }: CreatePayload) => {
      /* if (USE_MOCKS) {
        const created: Scenario = {
          name: body.name || 'Новый сценарий',
          description: body.description || '',
          status: body.status || 'draft',
          start: body.start || Date.now(),
          blocks: body.blocks || [],
          updatedAt: Date.now(),
          updatedBy: body.updatedBy || { name: 'Вы', avatar: '' },
          participants: body.participants || [],
        };
        return ;
      } */
      const res = await api.post(
        '/scenario' + (templateId ? `?template_id=${templateId}` : ''),
        body,
      );
      return res.data as Scenario;
    },
    onSuccess: () => {
      if (!USE_MOCKS) qc.invalidateQueries({ queryKey: scenariosKeys.all });
    },
  });
}
