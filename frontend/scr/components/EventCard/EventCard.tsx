import {
  Calendar,
  Check,
  CirclePlay,
  Clock,
  Copy,
  Eye,
  PencilToSquare,
  TrashBin,
} from '@gravity-ui/icons';
import { Avatar, Button, Card, Flex, Icon, Label, Popover, Text } from '@gravity-ui/uikit';
import { Link, useNavigate } from 'react-router-dom';
import { useScenarioUpdate } from '../../hooks/useScenarioUpdate';
import { useScenarioDelete } from '../../hooks/useScenarioDelete';
import type { Scenario } from '../../types';
import { formatDate, formatTime } from '../../utils/dateTimeFormatter';
import {
  getStatusDisplayName,
  getStatusTheme,
  scenarioStatuses,
} from '../../utils/scenarioStatusMapping';
import DefaultAvatar from '../Avatars/DefaultAvatar';
import styles from './EventCard.module.css';
import pluralize from '../../utils/pluralize';

/* function formatDate(date: string) {
  // Ожидается формат YYYY-MM-DD
  const [year, month, day] = date.split('-');
  return `${day}.${month}.${year}`;
}
 */

export default function EventCard({
  id,
  name,
  description,
  start_time,
  blocksCount,
  status,
  updatedAT,
  participants = [],
  role,
}: Scenario) {
  const scenarioUpdate = useScenarioUpdate();
  const scenarioDelete = useScenarioDelete();
  const navigate = useNavigate();
  const canModify = role == 'lead' || true;

  const handleSaveTag = (status: Scenario['status']) => {
    scenarioUpdate.mutate({
      scenarioId: id,
      body: { status: status },
    });
  };

  const handleDelete = () => {
    if (confirm('Вы уверены, что хотите удалить этот сценарий?')) {
      scenarioDelete.mutate({ scenarioId: id });
    }
  };
  return (
    <Card className={styles.eventCard} view="outlined" type="container" size="l">
      <div className={styles.cardBody}>
        <div className={styles.eventHeader}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Text variant="subheader-2">{name}</Text>
            <div style={{ display: 'flex', gap: 4 }}>
              {participants.slice(0, 2).map((p, i) =>
                p.avatar ? (
                  <Avatar
                    key={i}
                    imgUrl={p.avatar}
                    alt={p.name}
                    style={{
                      border: '2px solid #fff',
                      marginLeft: i ? -12 : 0,
                    }}
                  />
                ) : (
                  <span key={i} style={{ marginLeft: i ? -12 : 0 }}>
                    <DefaultAvatar width={32} height={32} />
                  </span>
                ),
              )}
            </div>
          </div>
          <Text variant="body-1" color="complementary">
            {description}
          </Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Text
            color="secondary"
            variant="caption-2"
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Icon data={Calendar} size={18} /> {formatDate(start_time || 0)}
          </Text>
          <Text
            color="secondary"
            variant="caption-2"
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Icon data={Clock} size={18} /> {formatTime(start_time || 0)}
          </Text>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Text variant="caption-2" color="secondary">
            {blocksCount} {pluralize(blocksCount || 0, 'блок', 'блока', 'блоков')}
          </Text>
          <Text variant="caption-2" color="secondary">
            Изменен {formatDate(updatedAT || 0)}
          </Text>
        </div>
        <div>
          <Popover
            placement="bottom-start"
            content={
              <Flex gap={2} className={styles.popover} direction="column">
                <Text variant="subheader-1" className={styles.popoverTitle}>
                  Выберите статус сценария
                </Text>
                <Flex gap={1} direction={'column'}>
                  {scenarioStatuses.map(st => (
                    <Flex key={st} gap={2} alignItems="center">
                      <Label onClick={() => handleSaveTag(st)} theme={getStatusTheme(st)} size="m">
                        {getStatusDisplayName(st)}
                      </Label>
                      <Icon
                        size={20}
                        data={Check}
                        className={`${styles.popIcon} ${st === status && styles.iconChecked}`}
                      />
                    </Flex>
                  ))}
                </Flex>
              </Flex>
            }
          >
            <Label onClick={() => false} theme={getStatusTheme(status)} size="m">
              {getStatusDisplayName(status)}
            </Label>
          </Popover>
        </div>
      </div>
      <div className={styles.cardFooter}>
        <div className={styles.buttonGroup}>
          <Link to={`/scenario/${id}`}>
            <Button view="normal" size="l">
              <Icon data={canModify ? PencilToSquare : Eye} size={16} />{' '}
              {canModify ? 'Редактировать' : 'Смотреть'}
            </Button>
          </Link>

          <Button view="outlined-success" size="l" onClick={() => navigate(`/scenario/${id}/live`)}>
            <Icon data={CirclePlay} size={16} />
          </Button>
        </div>
        {canModify ? (
          <div className={`${styles.buttonGroup} ${styles.littleGap}`}>
            <Button view="flat" size="m">
              <Icon data={Copy} size={16} />
            </Button>
            <Button
              view="flat-danger"
              color="secondary"
              size="m"
              onClick={handleDelete}
              loading={scenarioDelete.isPending}
              disabled={scenarioDelete.isPending}
            >
              <Icon data={TrashBin} size={16} />
            </Button>
          </div>
        ) : (
          ''
        )}
      </div>
    </Card>
  );
}
