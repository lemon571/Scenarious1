import { CircleFill, Comment } from '@gravity-ui/icons';
import { Avatar, Card, Flex, Icon, Text } from '@gravity-ui/uikit';
import type { Notification } from '../../../types/Notification';
import classes from './NotificationTemplate.module.css';

interface NotificationTemplateProps {
  notification: Notification;
}

const NotificationTemplate: React.FC<NotificationTemplateProps> = ({ notification }) => {
  return (
    <Card className={classes.card} view="clear">
      <Flex alignItems="center" justifyContent="space-between" gap={3}>
        <Flex alignItems="center" gap={2}>
          {notification.type === 'Приглашение в команду' && (
            <Avatar imgUrl="/invite.png" alt="Аватар" size="l" />
          )}
          {notification.type !== 'Приглашение в команду' && (
            <Avatar imgUrl="/avatar.svg" alt="Аватар" size="l" />
          )}
          <Flex direction="column">
            <Text>{notification.author}</Text>
            <Flex alignItems="center" gap="1">
              <Icon data={Comment} size={12} />
              <Text>{notification.type}</Text>
              <Text>|</Text>
              <Text>{notification.project}</Text>
            </Flex>
          </Flex>
        </Flex>
        <Flex gap={1} alignItems="center">
          <Text color="hint">{notification.date}</Text>
          {notification.isUnread && (
            <Icon data={CircleFill} fill="#111" size={13} className={classes.actionNotification} />
          )}
        </Flex>
      </Flex>
    </Card>
  );
};

export default NotificationTemplate;
