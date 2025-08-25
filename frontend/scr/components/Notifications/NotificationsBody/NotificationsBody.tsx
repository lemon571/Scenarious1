// src/components/Notifications/NotificationsBody/NotificationsBody.tsx

import { Flex, Text } from '@gravity-ui/uikit';
import type { Notification } from '../../../types/Notification';
import { groupKey, groupTitles, type GroupKey } from '../../../utils/dateGrouping';
import NotificationTemplate from '../NotificationTemplate/NotificationTemplate';
import classes from './NotificationsBody.module.css';

type NotificationsBodyProps = {
  notifications: Notification[];
  countNotification: number;
};

export default function NotificationsBody({
  notifications,
  countNotification,
}: NotificationsBodyProps) {
  const groups: Record<GroupKey, Notification[]> = {
    today: [],
    yesterday: [],
    lastWeek: [],
    older: [],
  };

  notifications.forEach(notification => {
    const date = new Date(notification.date);
    const timestamp = date.getTime();
    const key = groupKey(timestamp);
    groups[key].push(notification);
  });

  return (
    <>
      {!countNotification && (
        <div className={classes.bodyText}>
          <Text>Пока пусто</Text>
          <Text color="hint" className={classes.bodyDescription}>
            Когда кто-то ответит на ваш комментарий или оставит новый, вы увидите это здесь.
          </Text>
        </div>
      )}

      {countNotification > 0 && (
        <Flex direction="column" gap={4}>
          {(Object.keys(groupTitles) as GroupKey[]).map(key => {
            const list = groups[key];
            if (list.length === 0) return null;

            return (
              <Flex key={key} direction="column" gap={2}>
                <Text variant="subheader-1" color="secondary">
                  {groupTitles[key]}
                </Text>
                <Flex direction="column" gap={2}>
                  {list.map(notification => (
                    <NotificationTemplate key={notification.id} notification={notification} />
                  ))}
                </Flex>
              </Flex>
            );
          })}
        </Flex>
      )}
    </>
  );
}
