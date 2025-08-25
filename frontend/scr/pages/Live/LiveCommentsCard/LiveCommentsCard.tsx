import { Card, Flex, Text } from '@gravity-ui/uikit';
import type { Block, Comment } from '../../../types';
import LiveCommentsBlock from '../LiveCommentsBlock/LiveCommentsBlock';
import classes from './LiveCommentsCard.module.css';

type LiveCommentsCardProps = {
  comments: Comment[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setActiveBlock: React.Dispatch<React.SetStateAction<Block>>;
};

export default function LiveCommentsCard({
  comments,
  setBlocks,
  setActiveBlock,
}: LiveCommentsCardProps) {
  return (
    <Card className={classes.card}>
      <Flex direction="column" gap={3}>
        <Flex justifyContent="space-between">
          <Text variant="subheader-2">Комментарии к текущему блоку</Text>
          <Text color="secondary">3 комментария</Text>
        </Flex>
        <LiveCommentsBlock
          comments={comments}
          setBlocks={setBlocks}
          setActiveBlock={setActiveBlock}
        />
      </Flex>
    </Card>
  );
}
