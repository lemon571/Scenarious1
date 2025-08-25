import { CommentPlus, SquarePlus } from '@gravity-ui/icons';
import { Button, Icon, Popover, Select, Text, Tooltip, useToaster } from '@gravity-ui/uikit';
import { useState, type Dispatch, type SetStateAction } from 'react';

import { EmptyBlock } from '../../mocks/EmptyBlock';
import type { Block } from '../../types';
import type { ConvertedRole } from '../../types/ConvertedRoles';
import ReplyComments from '../ReplyComments/ReplyComments';
import classes from './ThreeButtons.module.css';
import { useBlockCreate } from '../../hooks/useBlockCreate';
import { useCreateComment } from '../../hooks/useCreateComment';

interface ThreeButtonsProps {
  roles: ConvertedRole[];
  blocks: Block[];
  setBlocks: Dispatch<SetStateAction<Block[]>>;
  scenarioId: string;
  onRolesChange: (roles: string[] | undefined) => void;
}

export default function ThreeButtons({
  roles,
  blocks,
  setBlocks,
  scenarioId,
  onRolesChange,
}: ThreeButtonsProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string>('');
  const [isCommentPopoverOpen, setIsCommentPopoverOpen] = useState(false);
  const { add } = useToaster();
  const blockCreateMutation = useBlockCreate();
  const createCommentMutation = useCreateComment();

  // Получаем список блоков для выбора
  const getBlocksForSelection = () => {
    const result: { block_id: string; title: string }[] = [];

    const addBlock = (block: Block) => {
      result.push({ block_id: block.block_id, title: block.title });
      if (block.children && block.children.length > 0) {
        block.children.forEach(addBlock);
      }
    };

    blocks.forEach(addBlock);
    return result;
  };

  const blocksForSelection = getBlocksForSelection();

  const handleCreateBlock = () => {
    const newBlockData = {
      title: EmptyBlock.title,
      location: EmptyBlock.location,
      description: EmptyBlock.description,
      roles: EmptyBlock.roles,
      color: EmptyBlock.color,
      start: Date.now(), // текущее время как время начала
      duration: EmptyBlock.duration * 60 * 1000, // конвертируем минуты в миллисекунды
    };

    blockCreateMutation.mutate(
      {
        scenarioId,
        blockId: 'root', // или другой подходящий ID для корневого блока
        body: newBlockData,
      },
      {
        onSuccess: createdBlock => {
          setBlocks(blocks => [...blocks, createdBlock]);

          add({
            name: 'created-block',
            content: <Text className={classes.toastContainer}>Блок создан</Text>,
            theme: 'info',
            autoHiding: 2000,
            isClosable: false,
            className: classes.toastBlock,
          });
        },
        onError: () => {
          add({
            name: 'created-block-error',
            content: <Text className={classes.toastContainer}>Ошибка при создании блока</Text>,
            theme: 'danger',
            autoHiding: 3000,
            isClosable: true,
            className: classes.toastBlock,
          });
        },
      },
    );
  };

  const handleCommentSubmit = (comment: string) => {
    if (!selectedBlockId) {
      add({
        name: 'comment-error',
        content: <Text className={classes.toastContainer}>Выберите блок для комментария</Text>,
        theme: 'danger',
        autoHiding: 3000,
        isClosable: true,
        className: classes.toastBlock,
      });
      return;
    }

    createCommentMutation.mutate(
      {
        scenarioId,
        blockId: selectedBlockId,
        description: comment,
        creatorId: 'current-user', // В реальном приложении это должен быть ID текущего пользователя
      },
      {
        onSuccess: () => {
          add({
            name: 'comment-success',
            content: <Text className={classes.toastContainer}>Комментарий добавлен</Text>,
            theme: 'info',
            autoHiding: 2000,
            isClosable: false,
            className: classes.toastBlock,
          });
          // Закрываем поповер после отправки комментария
          setIsCommentPopoverOpen(false);
          // Очищаем выбранный блок
          setSelectedBlockId('');
        },
        onError: () => {
          add({
            name: 'comment-error',
            content: (
              <Text className={classes.toastContainer}>Ошибка при добавлении комментария</Text>
            ),
            theme: 'danger',
            autoHiding: 3000,
            isClosable: true,
            className: classes.toastBlock,
          });
        },
      },
    );
  };

  return (
    <div className={classes.buttonGroup}>
      <Select
        placeholder="Фильтровать по"
        value={selectedRoles}
        onUpdate={values => {
          const newRoles = values as string[];
          setSelectedRoles(newRoles);
          onRolesChange?.(newRoles);
        }}
        width={300}
        popupWidth={300}
        size="l"
        multiple
        view="normal"
      >
        <Select.OptionGroup label="Ролям">
          {roles.map(role => (
            <Select.Option key={role} value={role}>
              {role}
            </Select.Option>
          ))}
        </Select.OptionGroup>
      </Select>

      <Popover
        content={
          <div className={classes.popoverItem}>
            <div className={classes.popoverTitle}>
              <Text className={classes.popoverText}>Новый комментарий</Text>
              <Select
                placeholder="Выберите блок..."
                className={classes.select}
                value={[selectedBlockId]}
                onUpdate={value => {
                  const selected = value as string[];
                  setSelectedBlockId(selected[0] || '');
                }}
              >
                {blocksForSelection.map(block => (
                  <Select.Option key={block.block_id} value={block.block_id}>
                    {block.title}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <ReplyComments
              onSubmit={handleCommentSubmit}
              placeholder="Комментарий..."
              loading={createCommentMutation.isPending}
            />
          </div>
        }
        className={classes.commentPopover}
        open={isCommentPopoverOpen}
        onOpenChange={setIsCommentPopoverOpen}
      >
        <Button
          size="l"
          onClick={() => setIsCommentPopoverOpen(true)}
          loading={createCommentMutation.isPending}
          disabled={createCommentMutation.isPending}
        >
          <Icon data={CommentPlus} />
        </Button>
      </Popover>

      <Tooltip content="Создать блок сценария">
        <Button
          view="action"
          size="l"
          onClick={handleCreateBlock}
          loading={blockCreateMutation.isPending}
          disabled={blockCreateMutation.isPending}
        >
          <Icon data={SquarePlus} />
        </Button>
      </Tooltip>
    </div>
  );
}
