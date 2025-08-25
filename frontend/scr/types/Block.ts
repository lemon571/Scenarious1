import type { Comment } from './Comment';

export type Block = {
  id: string;
  block_id: string;
  title: string;
  location: string;
  start: number; // timestamp in milliseconds
  duration: number; // duration in milliseconds
  roles: string[]; // array of role strings
  color?: string; // hex color code
  children: Block[];
  comments: Comment[];
  description: string;
  /* isActive?: boolean; */
  /* timelineColor?: 'blue' | 'green' | 'gray'; */
};
