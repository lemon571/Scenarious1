// src/hooks/useNotifications.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { initialNotifications } from '../mocks/initialNotifications';
import api from '../services/axios';
import { notificationsKeys } from '../services/queryKeys';
import type { Notification } from '../types/Notification';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export function useNotifications() {
  return useQuery({
    queryKey: notificationsKeys.all,
    queryFn: async (): Promise<Notification[]> => {
      if (USE_MOCKS) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return initialNotifications as Notification[];
      }
      const response = await api.get<Notification[]>('/notifications');
      return response.data;
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (USE_MOCKS) {
        await new Promise(resolve => setTimeout(resolve, 200));
        return;
      }
      await api.patch('/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.setQueryData<Notification[]>(
        notificationsKeys.all,
        old => old?.map(n => ({ ...n, isUnread: false })) ?? [],
      );
    },
  });
}
