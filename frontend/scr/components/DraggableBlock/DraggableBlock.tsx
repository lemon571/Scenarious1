import { Label, Text } from '@gravity-ui/uikit';
import type { Block } from '../../types/Block';
import { getRoleDisplayName } from '../../utils/roleMapping';
import styles from './DraggableBlock.module.css';

interface DraggableBlockProps {
  block: Block;
  dragHandleRef?: (element: HTMLElement | null) => void;
  dragHandleListeners?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function DraggableBlock({
  block,
  dragHandleRef,
  dragHandleListeners,
}: DraggableBlockProps) {
  const formatTime = (timestampMs: number) => {
    const date = new Date(timestampMs);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const formatDuration = (durationMs: number) => {
    const totalMinutes = Math.floor(durationMs / (1000 * 60));

    if (totalMinutes < 60) {
      return `${totalMinutes} минут`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return minutes > 0 ? `${hours} ч ${minutes} мин` : `${hours} ч`;
  };

  return (
    <div className={styles.blockItem}>
      <div className={styles.dragHandle} ref={dragHandleRef} {...dragHandleListeners}>
        ⋮⋮
      </div>
      <div className={styles.blockContent}>
        <div className={styles.timeInfo}>
          <Text variant="subheader-2">{formatTime(block.start)}</Text>
          <Text variant="body-1" color="secondary" className={styles.duration}>
            {formatDuration(block.duration)}
          </Text>
        </div>

        <Text variant="subheader-2">{block.title}</Text>
        <div className={styles.roles}>
          {block.roles.map((role, index) => (
            <Label key={index} theme="normal" size="xs">
              {getRoleDisplayName(role)}
            </Label>
          ))}
        </div>
      </div>
    </div>
  );
}
