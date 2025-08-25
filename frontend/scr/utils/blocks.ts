import type { Block as BlockType } from '../types/Block';

/**
 * Recalculate sequential start times for top-level blocks and optional child offsets.
 * Возвращает абсолютные Unix-времена в миллисекундах.
 * Логика:
 * - База = сегодня 09:00 (локальное время)
 * - Первый блок ставим на базу, дальше каждый следующий примыкает по duration
 * - Дочерние блоки получают start = start родителя + index * childOffset
 */
export function recalculateTimeline(
  reorderedBlocks: BlockType[],
  startAt: number = 32400000, // 9:00 AM в миллисекундах от начала дня
  childOffset: number = 300000, // 5 минут по умолчанию
): BlockType[] {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const baseTimeMs = todayStart.getTime() + startAt; // абсолютный unix мс

  let currentTime = baseTimeMs;

  return reorderedBlocks.map(block => {
    const updatedBlock: BlockType = {
      ...block,
      start: currentTime, // абсолютные unix мс
      children:
        block.children?.map((child, index) => ({
          ...child,
          start: currentTime + index * childOffset, // абсолютные unix мс
        })) ?? [],
    };

    currentTime += block.duration;
    return updatedBlock;
  });
}

/** Sum of durations in milliseconds */
export function calculateTotalDuration(blocks: BlockType[]): number {
  return blocks.reduce((total, block) => total + block.duration, 0);
}

export function calculateTotalDurationFormatted(blocks: BlockType[]): string {
  const duration = calculateTotalDuration(blocks);
  return `${Math.floor(duration / (1000 * 60 * 60))} ч ${Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))} мин`;
}
/** Convenience wrapper that applies default timeline rules */
export function handleBlocksReorder(reorderedBlocks: BlockType[]): BlockType[] {
  return recalculateTimeline(reorderedBlocks);
}
