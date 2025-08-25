import { CircleFill } from '@gravity-ui/icons';
import { Card, Flex, Icon, Text } from '@gravity-ui/uikit';
import type { Block } from '../../../types';
import {
  formatDurationByHoursMinutesAndSeconds,
  formatTime,
} from '../../../utils/dateTimeFormatter';
import classes from './LiveShortBlockCard.module.css';
type LiveShortBlockCardProps = {
  block: Block;
  isActive: boolean;
  index: number;
  setActiveBlock: React.Dispatch<React.SetStateAction<Block>>;
  setIndexActiveBlock: React.Dispatch<React.SetStateAction<number>>;
};

export default function LiveShortBlockCard({
  isActive,
  block,
  index,
  setActiveBlock,
  setIndexActiveBlock,
}: LiveShortBlockCardProps) {
  return (
    <Flex
      onClick={() => {
        setActiveBlock(block);
        setIndexActiveBlock(index + 1);
      }}
      className={classes.container}
    >
      <Card
        className={isActive ? `${classes.card} ${classes.isActiveShortCard}` : classes.card}
        view="filled"
      >
        <Flex direction="column">
          <Flex gap={2}>
            <Text>{formatTime(block.start)}</Text>
            <Text color="secondary">{formatDurationByHoursMinutesAndSeconds(block.duration)}</Text>
          </Flex>
          <Flex>
            <Text variant="subheader-1">{block.title}</Text>
          </Flex>
        </Flex>
        {isActive && <Icon data={CircleFill} className={classes.icon} />}
      </Card>
    </Flex>
  );
}
