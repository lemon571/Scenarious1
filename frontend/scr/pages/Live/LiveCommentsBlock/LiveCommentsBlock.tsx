import { Card, Flex } from '@gravity-ui/uikit';
import { useState } from 'react';
import CommentTemplate from '../../../components/CommentTemplate/CommentTemplate';
import ReplyComments from '../../../components/ReplyComments/ReplyComments';
import type { Block, Comment } from '../../../types';
import classes from './LiveCommentsBlock.module.css';

export interface LiveCommentsBlock {
  scenarioId?: string;
  blockId?: string;
  comments: Comment[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setActiveBlock: React.Dispatch<React.SetStateAction<Block>>;
  expanded?: boolean;
}

export default function LiveCommentsBlock({
  blockId,
  comments,
  setBlocks,
  setActiveBlock,
  expanded,
}: LiveCommentsBlock) {
  const internalExpanded = true;
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);

  const isExpanded = expanded ?? internalExpanded;

  if (!comments || comments.length === 0) {
    return null;
  }

  return (
    <Card className={classes.commentCard} view="clear">
      <Flex direction="column">
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
                />
              ))}
            </div>
          </Flex>
        ))}
      </Flex>
      <ReplyComments
        discard={() => setSelectedComment(null)}
        placeholder="Ответ"
        onSubmit={comment => {
          console.log('selectedComment: ', selectedComment);

          const convertedComment = {
            id: String(Date.now()),
            author: { name: 'Олег', avatar: '/avatar.svg' },
            description: comment,
            time: Date.now(),
            replies: [],
            block_id: '',
            scenario_id: '',
            solved: false,
          };

          setActiveBlock(block => {
            if (selectedComment) {
              return {
                ...block,
                comments: block.comments.map(c =>
                  c.id === selectedComment.id
                    ? { ...c, replies: [...(c.replies || []), convertedComment] }
                    : c,
                ),
              };
            }
            return {
              ...block,
              comments: [...(block.comments || []), convertedComment],
            };
          });
          setBlocks(prev =>
            prev.map(block => {
              if (block.id !== blockId) return block;

              if (selectedComment) {
                return {
                  ...block,
                  comments: block.comments.map(c =>
                    c.id === selectedComment.id
                      ? { ...c, replies: [...c.replies, convertedComment] }
                      : c,
                  ),
                };
              }

              return { ...block, comments: [...block.comments, convertedComment] };
            }),
          );
          setSelectedComment(null);
        }}
        replyComment={selectedComment}
      />
    </Card>
  );
}
