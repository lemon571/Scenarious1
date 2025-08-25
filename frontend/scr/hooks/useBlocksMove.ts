import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/axios';
import { blocksKeys } from '../services/queryKeys';
import type { Block } from '../types/Block';

type MovePayload = {
  scenarioId: string;
  blocks: Block[];
};

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export function useBlocksMove() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ scenarioId, blocks }: MovePayload) => {
      if (USE_MOCKS) return 'success';
      const res = await api.patch('/scenario/' + scenarioId + '/blocks', {
        blocks, // отправляем пересчитанные блоки напрямую, без поля data
      });
      return res.data as string;
    },
    onMutate: async ({ scenarioId, blocks }) => {
      // Отменяем текущие запросы для этого сценария
      await qc.cancelQueries({ queryKey: blocksKeys.byScenarioId(scenarioId) });

      // Сохраняем предыдущее состояние
      const previous = qc.getQueryData<Block[]>(blocksKeys.byScenarioId(scenarioId));

      if (previous) {
        // Обновляем кэш новым порядком блоков
        qc.setQueryData(blocksKeys.byScenarioId(scenarioId), blocks);
      }

      return { previous, scenarioId };
    },
    onError: (_error, { scenarioId }, context) => {
      // В случае ошибки восстанавливаем предыдущее состояние
      if (context?.previous) {
        qc.setQueryData(blocksKeys.byScenarioId(scenarioId), context.previous);
      }
    },
    onSuccess: (_data, { scenarioId }) => {
      if (!USE_MOCKS) {
        // Инвалидируем кэш для получения актуальных данных с сервера
        qc.invalidateQueries({ queryKey: blocksKeys.byScenarioId(scenarioId) });
      }
    },
  });
}
