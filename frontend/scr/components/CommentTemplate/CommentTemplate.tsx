import {
  ArrowShapeTurnUpLeft,
  ArrowUturnCcwRight,
  Check,
  Comments,
  EllipsisVertical,
  TrashBin,
} from '@gravity-ui/icons';
import { Avatar, Button, DropdownMenu, Icon, Text, Tooltip, useToaster } from '@gravity-ui/uikit';
import type { Comment } from '../../types/Comment';
import classes from './CommentTemplate.module.css';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import { useDeleteComment } from '../../hooks/useDeleteComment';

export interface CommentTemplateProps {
  comment: Comment;
  commentCount: number;
  isHovered: boolean;
  isReply?: boolean;
  replyFrom?: Comment;
  selected?: Comment | null;
  setSelected?: (arg0: Comment | null) => void;
  scenarioId?: string;
  blockId?: string;
}

export default function CommentTemplate({
  comment,
  commentCount,
  isHovered,
  isReply,
  replyFrom,
  setSelected,
  selected,
  scenarioId,
  blockId,
}: CommentTemplateProps) {
  const { add } = useToaster();
  const deleteCommentMutation = useDeleteComment();

  const handleDeleteComment = () => {
    if (!scenarioId || !blockId) {
      add({
        name: 'delete-comment-error',
        content: <Text>Не удалось удалить комментарий: отсутствуют необходимые данные</Text>,
        theme: 'danger',
        autoHiding: 3000,
      });
      return;
    }

    if (confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      deleteCommentMutation.mutate(
        {
          commentId: comment.id,
          scenarioId,
          blockId,
        },
        {
          onSuccess: () => {
            add({
              name: 'delete-comment-success',
              content: <Text>Комментарий удален</Text>,
              theme: 'info',
              autoHiding: 2000,
            });
          },
          onError: () => {
            add({
              name: 'delete-comment-error',
              content: <Text>Ошибка при удалении комментария</Text>,
              theme: 'danger',
              autoHiding: 3000,
            });
          },
        },
      );
    }
  };
  return (
    <div
      className={
        classes.layout +
        (isHovered ? ' ' + classes.hovered : '') +
        (isReply ? ' ' + classes.reply : '') +
        (selected?.id === comment.id && isHovered ? ' ' + classes.selected : '') +
        (comment.solved ? ' ' + classes.solved : '')
      }
    >
      <Avatar imgUrl={comment?.author?.avatar || '/avatar.svg'} />

      <div className={classes.commentContent}>
        <div className={classes.authorDetailsAndCommentCount}>
          <div className={classes.authorDetails}>
            <Text variant="body-1" className={classes.authorName}>
              {comment?.author?.name}
            </Text>
            <Text variant="body-2" className={classes.timeAgo}>
              {formatRelativeTime(comment.time)}
            </Text>
            {isReply && replyFrom && (
              <Text variant="body-1" color="secondary">
                <Icon size={15} data={ArrowUturnCcwRight} /> {replyFrom.author.name}
              </Text>
            )}
          </div>
          <Text
            variant="body-1"
            className={classes.commentCount + (!isHovered ? '' : ' ' + classes.hideOnHover)}
          >
            <Icon data={Comments} /> {isNaN(commentCount) ? '' : commentCount}
          </Text>
          <div
            className={
              classes.commentActions + (isHovered && !isReply ? '' : ' ' + classes.hideOnNotHover)
            }
          >
            <Tooltip content="Отметить как решенный">
              <Button view="flat-action">
                <Icon data={Check} size={16} />
              </Button>
            </Tooltip>
            {/* <Tooltip content="Еще"> */}
            <DropdownMenu
              popupProps={{ placement: 'bottom-end' }}
              renderSwitcher={props => (
                <Button {...props} view="flat-secondary">
                  <Icon data={EllipsisVertical} size={16} />
                </Button>
              )}
              items={[
                {
                  action: () => setSelected && setSelected(comment),
                  iconStart: <ArrowShapeTurnUpLeft />,
                  text: 'Ответить',
                },
                {
                  action: handleDeleteComment,
                  iconStart: <TrashBin />,
                  text: 'Удалить',
                  theme: 'danger',
                },
              ]}
            />
            {/* </Tooltip> */}
          </div>
        </div>
        <div
          className={
            classes.commentTextWrapper + ' ' + (isHovered ? classes.expanded : classes.collapsed)
          }
        >
          <Text
            variant="caption-2"
            className={isHovered ? classes.commentTextLong : classes.commentTextShort}
            title={comment.description}
          >
            {comment.description}
          </Text>
        </div>
      </div>
    </div>
  );
}
