import { Text, useToaster, Card } from '@gravity-ui/uikit';
import ReplyComments from '../ReplyComments/ReplyComments';
import api from '../../services/axios';
import classes from './CommentNew.module.css';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { blocksKeys } from '../../services/queryKeys';

type Props = {
  scenarioId: string;
  blockId: string;
  onSuccess: () => void;
  linePosition?: number;
};

type AddCommentArgs = {
  blockId: string;
  scenarioId: string;
  userId: string;
  content: string;
  linePosition?: number;
};

function usePostComment(blockId: string, onSuccess: () => void) {
  const queryClient = useQueryClient();

  return useMutation<Comment, Error, AddCommentArgs>({
    mutationFn: ({ blockId, scenarioId, userId, content, linePosition }) =>
      postComment(blockId, scenarioId, userId, content, linePosition),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: blocksKeys.byId(blockId),
      });
      onSuccess();
    },
  });
}

async function postComment(
  blockId: string,
  scenarioId: string,
  userId: string,
  content: string,
  linePosition?: number,
): Promise<Comment> {
  const body: Record<string, string | number> = {
    description: content,
    creator_id: userId,
  };
  if (linePosition) body.line_position = linePosition;

  const responce = await api.post(`/comment/${scenarioId}/${blockId}`, body);
  return responce.data;
}

export default function CommentNew({ scenarioId, blockId, linePosition, onSuccess }: Props) {
  // const [open, setOpen] = useState<boolean>(false);
  //   const handleCreateComment = () => {
  //   setOpen(!open);
  // };\
  const userId = '68986e4568de3274660a97cc';
  const { add } = useToaster();

  const { mutate, isPending } = usePostComment(blockId, () => {
    add({
      name: 'created-block',
      content: <Text className={classes.toastContainer}>Комметарий отправлен</Text>,
      theme: 'info',
      autoHiding: 2000,
      isClosable: false,
      className: classes.toastBlock,
    });
    onSuccess();
  });

  const createComment = (content: string) => {
    if (!content) return;
    mutate({
      scenarioId,
      blockId,
      userId,
      content,
      linePosition,
    });
  };

  return (
    <Card className={classes.popover}>
      <div className={classes.popoverItem}>
        <div className={classes.popoverTitle}>
          <Text color="secondary">Новый комментарий</Text>
        </div>
        {isPending ? (
          <Text>Отправляем...</Text>
        ) : (
          <ReplyComments placeholder="Комментарий..." onSubmit={createComment} />
        )}
      </div>
    </Card>
  );
}
