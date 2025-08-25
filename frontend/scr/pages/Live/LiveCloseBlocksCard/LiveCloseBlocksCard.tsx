import { Card, Flex, Text } from '@gravity-ui/uikit';
import type { Block } from '../../../types';
import LiveShortBlockCard from '../LiveShortBlockCard/LiveShortBlockCard';
import classes from './LiveCloseBlocksCard.module.css';

type Props = {
  activeBlock: Block;
  setActiveBlock: React.Dispatch<React.SetStateAction<Block>>;
  setIndexActiveBlock: React.Dispatch<React.SetStateAction<number>>;
  blocks: Block[];
};

export default function LiveCloseBlocksCard({
  activeBlock,
  setActiveBlock,
  setIndexActiveBlock,
  blocks,
}: Props) {
  return (
    <Flex className={classes.container}>
      <Card className={classes.card}>
        <Flex alignItems="center" justifyContent="space-between">
          <Text variant="subheader-3">Все блоки</Text>
          <Text color="secondary">5 блоков</Text>
        </Flex>
        {blocks.map((block, index) => (
          <LiveShortBlockCard
            key={block.id}
            index={index}
            block={block}
            isActive={block.id === activeBlock.id}
            setActiveBlock={setActiveBlock}
            setIndexActiveBlock={setIndexActiveBlock}
          />
        ))}
      </Card>
    </Flex>
  );
}
