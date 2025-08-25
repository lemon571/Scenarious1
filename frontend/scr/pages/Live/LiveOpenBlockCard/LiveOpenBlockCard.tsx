import { Card, Flex, Label, Text } from '@gravity-ui/uikit';
import type { Block } from '../../../types';
import {
  formatDurationByHoursMinutesAndSeconds,
  formatTime,
} from '../../../utils/dateTimeFormatter';
import { getRoleDisplayName } from '../../../utils/roleMapping';
import classes from './LiveOpenBlockCard.module.css';

type Props = {
  isActiveCard: boolean;
  setIsActiveCard: React.Dispatch<React.SetStateAction<boolean>>;
  activeBlock: Block;
};

export default function LiveOpenBlockCard({ isActiveCard, setIsActiveCard, activeBlock }: Props) {
  return (
    <Card className={classes.container}>
      <Flex
        className={`${classes.card} ${isActiveCard ? classes.isOpenBlockActive : ''}`}
        onClick={() => {
          setIsActiveCard(!isActiveCard);
        }}
      >
        <Flex justifyContent="space-between" alignItems="center">
          <Text color="secondary" variant="body-2">
            Сейчас
          </Text>
          <Flex gap={3}>
            {activeBlock.roles.map(role => (
              <Label key={role}>{getRoleDisplayName(role)}</Label>
            ))}
          </Flex>
        </Flex>
        <Flex gap={2} alignItems="center">
          <Text variant="subheader-2">{formatTime(activeBlock.start)}</Text>
          <Text color="hint">{formatDurationByHoursMinutesAndSeconds(activeBlock.duration)}</Text>
        </Flex>
        <Text variant="header-1">{activeBlock.title}</Text>
        {/* <Text>{activeBlock.description}</Text> */}
        <div dangerouslySetInnerHTML={{ __html: activeBlock.description }} />
      </Flex>
    </Card>
  );
}
