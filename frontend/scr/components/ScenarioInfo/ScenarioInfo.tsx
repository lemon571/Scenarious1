import { Calendar, Clock, Cube, Person } from '@gravity-ui/icons';
import { Text } from '@gravity-ui/uikit';
import type { Scenario } from '../../types';
import type { Block as BlockType } from '../../types/Block';
import { formatLongDate } from '../../utils/dateTimeFormatter';
import styles from './ScenarioInfo.module.css';

type ScenarioInfo = {
  scenarioInfo: Scenario;
  blocks: BlockType[];
};

export default function ScenarioInfo({ scenarioInfo, blocks }: ScenarioInfo) {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <Text variant="header-1">{scenarioInfo.name}</Text>
      </div>

      <div className={styles.headerCenter}>
        <div className={styles.eventInfo}>
          <div className={styles.eventCalendar}>
            <Calendar width={16} height={16} />
            <Text variant="body-1">{formatLongDate(scenarioInfo.start || 0, true)}</Text>
          </div>
          <div className={styles.eventClock}>
            <Clock width={16} height={16} />
            <Text variant="body-1">
              {new Date(scenarioInfo.start || 0).toLocaleTimeString('ru-RU', {
                hour: 'numeric',
                minute: 'numeric',
              })}
            </Text>
          </div>
          <div className={styles.eventStats}>
            <div className={styles.stat}>
              <Person width={16} height={16} />
              <Text variant="body-1">{scenarioInfo.participants?.length || 0} участников</Text>
            </div>
            <div className={styles.stat}>
              <Cube width={16} height={16} />
              <Text variant="body-1">{blocks.length} блоков</Text>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
