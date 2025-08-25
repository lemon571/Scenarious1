import { CirclePlayFill, ForwardStep, Minus, Pause, Play, Plus } from '@gravity-ui/icons';
import { Button, Card, Flex, Icon, Progress, Text } from '@gravity-ui/uikit';
import { useCallback, useEffect, useState } from 'react';
import type { Block } from '../../../types';
import { formatDurationCompact } from '../../../utils/dateTimeFormatter';
import classes from './LiveFooter.module.css';

type LiveFooterProps = {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  activeBlock: Block;
  countBlocks: number;
  isFinished: boolean;
  indexActiveBlock: number;
  setActiveBlock: React.Dispatch<React.SetStateAction<Block>>;
  setIndexActiveBlock: React.Dispatch<React.SetStateAction<number>>;
  setIsFinished: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function LiveFooter({
  blocks,
  setBlocks,
  activeBlock,
  countBlocks,
  isFinished,
  indexActiveBlock,
  setActiveBlock,
  setIndexActiveBlock,
  setIsFinished,
}: LiveFooterProps) {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  function goToPrevBlock() {
    const newIndex = indexActiveBlock - 1;
    if (newIndex < 1) {
      setCurrentTime(0);
      return;
    }

    setIndexActiveBlock(newIndex);
    setActiveBlock(blocks[newIndex - 1]);
  }

  // Переход к следующему блоку
  const goToNextBlock = useCallback(() => {
    setCurrentTime(0);
    if (indexActiveBlock >= blocks.length) {
      setIsFinished(true);
      setIsPlaying(false);
      return;
    }

    const nextIndex = indexActiveBlock;
    setIndexActiveBlock(nextIndex + 1);
    setActiveBlock(blocks[nextIndex]);
  }, [indexActiveBlock, blocks, setActiveBlock, setIndexActiveBlock, setIsFinished]);

  // Уменьшение времени блока на 1 минуту
  const reduceDuration = useCallback(() => {
    const newDuration = Math.max(0, activeBlock.duration - 60000);

    setBlocks(prev =>
      prev.map(block =>
        block.id === activeBlock.id ? { ...block, duration: newDuration } : block,
      ),
    );
    setActiveBlock(prev => ({ ...prev, duration: newDuration }));

    // Проверяем, нужно ли завершить блок
    if (currentTime >= newDuration) {
      goToNextBlock();
    }
  }, [activeBlock.duration, activeBlock.id, setBlocks, setActiveBlock, currentTime, goToNextBlock]);

  // Увеличение времени блока на 1 минуту
  const increaseDuration = useCallback(() => {
    const newDuration = activeBlock.duration + 60000;

    setBlocks(prev =>
      prev.map(block =>
        block.id === activeBlock.id ? { ...block, duration: newDuration } : block,
      ),
    );
    setActiveBlock(prev => ({ ...prev, duration: newDuration }));
  }, [activeBlock.duration, activeBlock.id, setBlocks, setActiveBlock]);

  // Сброс времени при смене блока
  useEffect(() => {
    setCurrentTime(0);
  }, [activeBlock.id]);

  // Основной таймер
  useEffect(() => {
    if (!isPlaying || !activeBlock.duration || activeBlock.duration <= 0) {
      return;
    }

    setIsFinished(prev => (prev ? false : prev));

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + 1000;

        if (next >= activeBlock.duration) {
          goToNextBlock();
          return activeBlock.duration;
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, activeBlock.duration, goToNextBlock, isFinished]);

  const progress = activeBlock.duration ? (currentTime / activeBlock.duration) * 100 : 0;

  return (
    <Card className={classes.card}>
      <Flex justifyContent="space-between">
        <Flex gap={5} alignItems="center">
          <Flex direction="column" gap={1}>
            <Text variant="caption-2" color="secondary">
              Текущий блок {indexActiveBlock}/{countBlocks}
            </Text>
            <Text variant="subheader-2">{activeBlock.title}</Text>
          </Flex>
          <Flex direction="column">
            <Flex gap={2} alignItems="center">
              <Icon data={CirclePlayFill} />
              <Text>
                {formatDurationCompact(currentTime)} / {formatDurationCompact(activeBlock.duration)}
              </Text>
            </Flex>
            <Progress value={progress} className={classes.progress} theme="info" />
          </Flex>
        </Flex>
        <Flex gap={2}>
          <Button size="l" onClick={reduceDuration}>
            <Icon data={Minus} />
            <Text>1 мин</Text>
          </Button>
          <Button view="action" size="l" onClick={goToPrevBlock}>
            <Icon data={ForwardStep} className={classes.icon} />
          </Button>
          <Button view="action" size="l" onClick={() => setIsPlaying(!isPlaying)}>
            <Icon data={isPlaying ? Pause : Play} />
          </Button>
          <Button view="action" size="l" onClick={goToNextBlock}>
            <Icon data={ForwardStep} />
            <Text>Следующий блок</Text>
          </Button>
          <Button size="l" onClick={increaseDuration}>
            <Icon data={Plus} />
            <Text>1 мин</Text>
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}
