import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useEffect } from 'react';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { Flex, Loader, Text, useToaster } from '@gravity-ui/uikit';
import DraggableBlock from '../DraggableBlock/DraggableBlock';
import type { Block } from '../../types/Block';
import { useBlocksMove } from '../../hooks/useBlocksMove';
import { recalculateTimeline } from '../../utils/blocks';
import styles from './DraggableBlockArea.module.css';

interface DraggableBlockAreaProps {
  blocks?: Block[];
  onBlocksReorder?: (blocks: Block[]) => void;
  scenarioId?: string;
}

// Сортируемый элемент блока
function SortableBlockItem({ block }: { block: Block }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <DraggableBlock
        block={block}
        dragHandleRef={setActivatorNodeRef}
        dragHandleListeners={listeners}
      />
    </div>
  );
}

// Главный компонент
export default function DraggableBlockArea({
  blocks = [],
  onBlocksReorder,
  scenarioId,
}: DraggableBlockAreaProps) {
  const [items, setItems] = useState<Block[]>(blocks);
  const { add } = useToaster();

  const { mutate: moveBlock, isPending } = useBlocksMove();

  // Синхронизируем состояние с props (в хронологическом порядке)
  useEffect(() => {
    const ordered = [...blocks].sort((a, b) => a.start - b.start);
    setItems(ordered);
  }, [blocks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id && over) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex);
      const recalculated = recalculateTimeline(reordered);
      const ordered = [...recalculated].sort((a, b) => a.start - b.start);

      // Обновляем локальное состояние пересчитанными и отсортированными блоками
      setItems(ordered);
      onBlocksReorder?.(ordered);

      // Отправляем изменения на сервер (пересчитанный и отсортированный список)
      if (scenarioId) {
        moveBlock(
          {
            scenarioId,
            blocks: ordered,
          },
          {
            onSuccess: () => {
              add({
                name: 'move-block-success',
                content: <Text>Блоки успешно перемещены</Text>,
                theme: 'success',
                autoHiding: 2000,
                isClosable: false,
              });
            },
            onError: () => {
              add({
                name: 'move-block-error',
                content: <Text>Ошибка при перестановке блоков</Text>,
                theme: 'danger',
                autoHiding: 3000,
                isClosable: true,
              });
            },
          },
        );
      }
    }
  };

  return (
    <div className={styles.container}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
          {items.map(block => (
            <SortableBlockItem key={block.id} block={block} />
          ))}
        </SortableContext>
      </DndContext>
      {isPending && (
        <div className={styles.loadingOverlay}>
          <Flex
            justifyContent="center"
            alignItems="center"
            style={{ width: '100%', height: '100%', padding: '1rem' }}
          >
            <Loader size="l" />
          </Flex>
        </div>
      )}
    </div>
  );
}
