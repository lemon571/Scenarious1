// src/components/Notifications/Notifications.tsx
import { Text } from '@gravity-ui/uikit';
import { useMarkAllNotificationsAsRead, useNotifications } from '../../hooks/useNotifications';
import classes from './Notifications.module.css';
import NotificationsBody from './NotificationsBody/NotificationsBody';
import HotificationsHeader from './NotificationsHeader/NotificationsHeader';

export default function Notifications() {
  const { data: notifications = [], isLoading } = useNotifications();
  const { mutate: readAllNotifications } = useMarkAllNotificationsAsRead();

  const countNotification = notifications.length;
  const unReadCount = notifications.filter(n => n.isUnread).length;

  if (isLoading) {
    return <Text className={classes.loading}>Загрузка уведомлений...</Text>;
  }

  return (
    <div className={classes.notificationsPopover}>
      <HotificationsHeader
        countNotification={countNotification}
        unReadCount={unReadCount}
        readAllNotifications={() => readAllNotifications()}
      />
      <NotificationsBody notifications={notifications} countNotification={countNotification} />
    </div>
  );
}
