import { Button, Text } from '@gravity-ui/uikit';
import classes from './HotificationsHeader.module.css';

type HotificationsHeaderProps = {
  countNotification: number;
  unReadCount: number;
  readAllNotifications: () => void;
};

export default function HotificationsHeader({
  countNotification,
  unReadCount,
  readAllNotifications,
}: HotificationsHeaderProps) {
  return (
    <div className={classes.header}>
      <Text>
        Все уведомления {countNotification ? <Text color="info">({countNotification})</Text> : null}
      </Text>
      <Button view="flat" onClick={readAllNotifications} disabled={!unReadCount}>
        <Text color={unReadCount > 0 ? 'info' : 'hint'}>Прочитать всё</Text>
      </Button>
    </div>
  );
}
