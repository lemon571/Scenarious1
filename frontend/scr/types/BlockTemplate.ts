import type { Comment } from './Comment';

export type BlockTemplate = {
  id: string;
  block_id: string;
  title: string;
  name: string;
  description: string;
  tags?: string[];
  location: string;
  start: number; // timestamp in milliseconds
  duration: number; // duration in milliseconds
  roles: string[]; // массив ролей
  color?: string; // hex цвет для категории
  children: BlockTemplate[]; // вложенные блоки
  comments: Comment[]; // комментарии
};
