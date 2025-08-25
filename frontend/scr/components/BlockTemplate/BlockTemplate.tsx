import { SquarePlus } from '@gravity-ui/icons';
import { Button, Card, Flex, Icon, Label, Text } from '@gravity-ui/uikit';

import type { BlockTemplate } from '../../types/BlockTemplate';
import { getRoleDisplayName } from '../../utils/roleMapping';
import styles from './BlockTemplate.module.css';

export default function BlockTemplate({ template }: { template: BlockTemplate }) {
  // Конвертируем duration из миллисекунд в минуты для отображения
  const formatDuration = (durationMs: number) => {
    const minutes = Math.floor(durationMs / (1000 * 60));
    return `${minutes} мин`;
  };

  // Форматируем время начала
  const formatStartTime = (startMs: number) => {
    const date = new Date(startMs);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card key={template.id} className={styles.templateCard} view="outlined" type="action" size="l">
      <Flex direction="column" gap={2}>
        <Flex gap={3}>
          <Flex gap={2}>
            <Text variant="subheader-1" color="primary">
              {formatStartTime(template.start)}
            </Text>
            <Text variant="body-1" color="secondary">
              {formatDuration(template.duration)}
            </Text>
          </Flex>
          <Label size="xs" theme="warning">
            {template.location}
          </Label>
        </Flex>

        <Text variant="subheader-2" color="primary">
          {template.title}
        </Text>

        <Text variant="body-1" color="secondary">
          {template.description}
        </Text>

        <Flex gap={3}>
          {template.roles.map(role => (
            <Label key={role} theme="normal" size="xs">
              {getRoleDisplayName(role)}
            </Label>
          ))}
        </Flex>
      </Flex>

      {/* Кнопка добавления */}
      <div className={styles.cardFooter}>
        <Button view="normal" size="l" starticon className={styles.addButton}>
          <Icon data={SquarePlus}></Icon>
          Добавить в сценарий
        </Button>
      </div>
    </Card>
  );
}
