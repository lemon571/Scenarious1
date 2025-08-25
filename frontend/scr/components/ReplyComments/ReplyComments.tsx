import { CircleChevronRightFill, Xmark } from '@gravity-ui/icons';
import { Avatar, Button, Flex, Icon, Text, TextInput, Tooltip } from '@gravity-ui/uikit';
import { useState, type ChangeEvent } from 'react';
import type { Comment } from '../../types';
import classes from './ReplyComments.module.css';

interface Props {
  placeholder: string;
  onSubmit: (content: string) => void;
  replyComment?: Comment | null;
  discard?: () => void;
  loading?: boolean;
}

export default function ReplyComments({
  placeholder,
  onSubmit,
  replyComment,
  discard,
  loading,
}: Props) {
  const [reply, setReply] = useState<string>('');

  return (
    <div className={classes.replyInputWrapper}>
      {replyComment && (
        <Flex alignItems="center" justifyContent="space-between" width="100%">
          <Text variant="body-1" color="secondary" ellipsis>
            Вы отвечаете на <Text color="primary">{replyComment?.description}</Text>{' '}
          </Text>
          <Button view="flat-secondary" size="s" onClick={discard}>
            <Icon data={Xmark}></Icon>
          </Button>
        </Flex>
      )}
      <Flex gap={3} alignItems="center">
        <Avatar imgUrl="/avatar.svg" size="m" />
        <TextInput
          value={reply}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setReply(e.target.value)}
          placeholder={placeholder}
          size="l"
          disabled={loading}
          endContent={
            <Tooltip content="Отправить">
              <Button
                view="flat-action"
                color="secondary"
                onClick={() => {
                  onSubmit(reply);
                  setReply('');
                }}
                disabled={reply === '' || loading}
                loading={loading}
              >
                <Icon data={CircleChevronRightFill} size={18} />
              </Button>
            </Tooltip>
          }
        />
      </Flex>
    </div>
  );
}
