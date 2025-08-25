import { Card, Flex } from '@gravity-ui/uikit';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCreateComment } from '../../hooks/useCreateComment';
import { useReplyComment } from '../../hooks/useReplyComment';
import type { Comment } from '../../types/Comment';
import CommentTemplate from '../CommentTemplate/CommentTemplate';
import ReplyComments from '../ReplyComments/ReplyComments';
import classes from './CommentBlock.module.css';

export interface CommentBlockProps {
  scenarioId?: string;
  blockId?: string;
  comments: Comment[];
  expanded?: boolean;
  onToggle?: (next: boolean) => void;
}

export default function CommentBlock({
  scenarioId,
  blockId,
  comments,
  expanded,
  onToggle,
}: CommentBlockProps) {
  const [internalExpanded, setInternalExpanded] = useState<boolean>(false);

  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);

  const isExpanded = expanded ?? internalExpanded;
  const { id: routeScenarioId } = useParams();

  const createComment = useCreateComment();
  const replyComment = useReplyComment();

  // Показываем состояние загрузки для создания комментариев
  const isCreating = createComment.isPending;
  const isReplying = replyComment.isPending;

  function handleClick(value: string) {
    if (!value) return;
    // Если выбран комментарий — отправляем ответ
    if (selectedComment) {
      const effScenarioId =
        selectedComment.scenario_id || scenarioId || routeScenarioId || comments[0]?.scenario_id;
      const effBlockId = selectedComment.block_id || blockId || comments[0]?.block_id;
      if (!effScenarioId || !effBlockId) return;
      replyComment.mutate({
        scenarioId: effScenarioId,
        blockId: effBlockId,
        commentId: selectedComment.id,
        content: value,
      });
      return;
    }
    // Иначе создаём верхнеуровневый комментарий
    const effScenarioId = scenarioId || routeScenarioId || comments[0]?.scenario_id;
    const effBlockId = blockId || comments[0]?.block_id;
    if (!effScenarioId || !effBlockId) return;
    //@ts-expect-error нет строки creatorId: 'current-user',
    createComment.mutate({
      scenarioId: effScenarioId,
      blockId: effBlockId,
      description: value,
    });
  }

  function expandOnly(evt: React.MouseEvent) {
    evt.stopPropagation();
    if (!isExpanded) {
      if (expanded === undefined) setInternalExpanded(true);
      onToggle?.(true);
    }
  }

  if (!comments || comments.length === 0) {
    return null;
  }

  return (
    <div className={classes.commentsWrapper}>
      <Card className={classes.commentCard} onClick={expandOnly} type="action">
        <div
          className={
            classes.comments + (isExpanded ? ' ' + classes.visible : ' ' + classes.unvisible)
          }
        >
          {comments.map((comment: Comment) => (
            <Flex
              direction="column"
              gap={isExpanded ? 3 : 0}
              key={comment.id}
              style={{ transition: 'all .3s ease' }}
            >
              <CommentTemplate
                key={comment.id}
                comment={comment}
                commentCount={comments.length + comment?.replies?.length}
                isHovered={isExpanded}
                setSelected={setSelectedComment}
                selected={selectedComment}
                scenarioId={scenarioId}
                blockId={blockId}
              />
              <div className={classes.replies}>
                {comment?.replies?.map((reply: Comment) => (
                  <CommentTemplate
                    key={reply.id}
                    comment={reply}
                    commentCount={comments.length + comment.replies.length}
                    isReply={true}
                    replyFrom={comment}
                    isHovered={isExpanded}
                    setSelected={setSelectedComment}
                    selected={selectedComment}
                    scenarioId={scenarioId}
                    blockId={blockId}
                  />
                ))}
              </div>
            </Flex>
          ))}
        </div>
        <div
          className={
            classes.replyCommentsWrapper +
            (isExpanded ? ' ' + classes.replyInputVisible : ' ' + classes.replyInputHidden)
          }
        >
          <ReplyComments
            discard={() => {
              setSelectedComment(null);
            }}
            placeholder="Ответ"
            onSubmit={handleClick}
            replyComment={selectedComment}
            loading={isCreating || isReplying}
          />
        </div>
      </Card>
    </div>
  );
}
