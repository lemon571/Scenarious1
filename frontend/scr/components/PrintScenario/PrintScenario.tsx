import { Button, Flex, Icon, Text } from '@gravity-ui/uikit';
import type { Block as BlockType, Scenario } from '../../types';

import { Calendar, Clock, Cube, Person } from '@gravity-ui/icons';
import { formatLongDate, formatTime } from '../../utils/dateTimeFormatter';
import PrintBlock from './PrintBlock';

import styles from './PrintScenario.module.css';

export default function PrintScenario({
  scenario,
  blocks,
}: {
  scenario: Scenario;
  blocks: BlockType[];
}) {
  const handleCancel = () => {
    // Здесь можно добавить логику для закрытия/возврата
    console.log('Отмена печати');
  };

  return (
    <div>
      <Flex direction="column" gap={4} className={styles.printContainer}>
        <Flex>
          <img src="/logo.svg" alt="logo" width={215} height={38} />
        </Flex>
        <Flex gap={4} alignItems="center">
          <Text variant="header-1">{scenario.name}</Text>

          <Text color="secondary" variant="body-1">
            <Icon data={Calendar} size={16} /> {formatLongDate(scenario.start || 0, true)}
          </Text>

          <Text color="secondary" variant="body-1">
            <Icon data={Clock} size={16} /> {formatTime(scenario.start || 0)}
          </Text>

          <Text color="secondary" variant="body-1">
            <Icon data={Person} size={16} /> {scenario.participants?.length || 0} участников
          </Text>

          <Text color="secondary" variant="body-1">
            <Icon data={Cube} size={16} /> {blocks.length} блоков
          </Text>
        </Flex>

        <Flex gap={3} direction="column">
          {blocks.map(block => (
            <PrintBlock key={block.id} {...block} />
          ))}
        </Flex>

        <Flex justifyContent="center" gap={4} className={styles.stickyButtons}>
          <Button
            size="l"
            view="action"
            onClick={() => window.print()}
            className={styles.printButton}
          >
            На печать
          </Button>

          <Button size="l" view="normal" onClick={handleCancel} className={styles.printButton}>
            Отмена
          </Button>
        </Flex>
      </Flex>
    </div>
  );
}
