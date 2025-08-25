export type NotificationType = 'Комментарий' | 'Ответ' | 'Приглашение в команду';

export interface Notification {
  id: number;
  author: string;
  type: NotificationType;
  project: string;
  date: string; // ISO-формат даты, например "2025-08-11"
  isUnread: boolean;
}
