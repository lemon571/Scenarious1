import type { Block } from './Block';
import type { Author } from './Comment';

export type scenarioStatus =
  | 'draft'
  | 'in_progress'
  | 'approved'
  | 'ready_for_air'
  | 'on_air'
  | 'archive';

export interface Scenario {
  _id?: string;
  id: string;
  name: string;
  description: string;
  status: scenarioStatus;
  start?: number; // timestamp in milliseconds
  start_time?: number;
  duration?: number; // duration in milliseconds
  time?: string; // например, '9:00'
  date?: string; // например, '2025-08-15'
  blocks: Block[];
  director_id?: string;
  updatedAt?: number;
  updatedAT?: number; // timestamp последнего изменения
  updatedBy: Author;
  participants: Author[]; // для аватаров
  role?: string;
  blocksCount?: number;
}
