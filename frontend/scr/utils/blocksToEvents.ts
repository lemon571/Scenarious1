import type { Block } from '../types/Block';

type EventBlock = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  description: string;
  location: string;
  roles: string[];
};

export function blocksToEvents(blocks: Block[]): EventBlock[] {
  const result: EventBlock[] = [];

  function addBlock(block: Block, parentColor?: string) {
    const start = new Date(block.start);

    const end = new Date(block.start + block.duration);

    const color = block.color || parentColor;

    result.push({
      id: block.block_id,
      title: block.title,
      start,
      end,
      color,
      description: block.description,
      location: block.location,
      roles: block.roles,
    });
    if (block.children && block.children.length > 0) {
      block.children.forEach(child => addBlock(child, color));
    }
  }

  blocks.forEach(block => addBlock(block));
  return result;
}
