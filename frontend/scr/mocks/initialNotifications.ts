import type { Notification } from '../types/Notification';

export const initialNotifications: Notification[] = [
  {
    id: 1,
    author: 'Вячеслав',
    type: 'Комментарий',
    project: 'YANG COM',
    date: '2025-08-11',
    isUnread: true,
  },
  {
    id: 2,
    author: 'Вячеслав',
    type: 'Комментарий',
    project: 'YANG COM',
    date: '2025-08-11',
    isUnread: true,
  },
  {
    id: 3,
    author: 'Вячеслав',
    type: 'Комментарий',
    project: 'YANG COM',
    date: '2025-08-11',
    isUnread: true,
  },
  {
    id: 4,
    author: 'Вячеслав',
    type: 'Ответ',
    project: 'YANG COM',
    date: '2025-08-07',
    isUnread: false,
  },
  {
    id: 5,
    author: 'YANG COM',
    type: 'Приглашение в команду',
    project: 'YANG COM',
    date: '2025-08-05',
    isUnread: false,
  },
  {
    id: 6,
    author: 'Вячеслав',
    type: 'Ответ',
    project: 'YANG COM',
    date: '2025-08-05',
    isUnread: false,
  },
];
