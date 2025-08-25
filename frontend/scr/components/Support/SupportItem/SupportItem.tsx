import { Flex, Text } from '@gravity-ui/uikit';
import type { SupportItemData } from '../../../mocks/initialSupportInfo';

export default function SupportItem({ item }: { item: SupportItemData }) {
  return (
    <Flex alignItems="flex-start" justifyContent="space-between" gap={10}>
      <Text color="hint">{item.date}</Text>
      <Flex direction="column" gap={2}>
        <Text variant="subheader-3">{item.title}</Text>
        <Flex direction="column">
          {item.imageUrl && (
            <img src={item.imageUrl} alt={item.title} style={{ width: 500, height: 'auto' }} />
          )}
          <Text variant="body-1">{item.description}</Text>
        </Flex>
      </Flex>
    </Flex>
  );
}
