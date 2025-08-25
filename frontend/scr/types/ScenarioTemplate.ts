import type { Block } from './Block';

export interface ScenarioTemplate {
  _id?: string;
  id: string;
  name: string;
  description: string;
  blocksCount: number;
  category: string;
  isPopular?: boolean;
  blocks: Block[];
}
