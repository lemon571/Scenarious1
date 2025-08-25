import {
  Clock,
  File as FileIcon,
  MapPin,
  Pencil as PencilIcon,
  TrashBin as TrashBinIcon,
} from '@gravity-ui/icons';
import { Button, Flex, Icon, Label, Text } from '@gravity-ui/uikit';
import { Link } from 'react-router-dom';
import type { Block } from '../../types/Block';
import { htmlToText } from '../../utils/htmlToText';
import { getRoleDisplayName } from '../../utils/roleMapping';
import { ExpandableText } from '../ExpandableText/ExpandableText';
import styles from './Block.module.css';

import { formatDurationBlocks, formatTime } from '../../utils/dateTimeFormatter';

export default function Block({
  title,
  description,
  roles,
  start,
  duration,
  block_id,
  location = 'Средний зал',
  children,
  comments,
  color = 'gray',
}: Block) {
  return (
    <div className={styles.blockContainer}>
      <div
        className={`${styles.timeBlock} ${children && children.length > 0 ? styles.thickLine : ''}`}
        style={{ borderColor: color }}
      >
        <Text variant="subheader-3">{formatTime(start)}</Text>

        <Flex gap={1}>
          <Text color="secondary">
            <Icon data={Clock} size={16} />
          </Text>
          <Text color="secondary" ellipsis>
            {formatDurationBlocks(duration)}
          </Text>
        </Flex>
        <Flex gap={1}>
          <Text color="secondary">
            <Icon data={MapPin} size={16} />
          </Text>
          <Text color="secondary">{location}</Text>
        </Flex>
      </div>

      <div className={styles.eventsContainer}>
        <div className={`${styles.eventBlock}`} data-block-id={block_id}>
          <div className={styles.contentBlock}>
            <div className={styles.blockBody}>
              {roles.filter(r => r != '').length ? (
                <div className={styles.tags}>
                  {roles.map((role, index) => (
                    <Label key={index} theme="normal" onClick={() => false} size="xs">
                      {getRoleDisplayName(role)}
                    </Label>
                  ))}
                </div>
              ) : (
                ''
              )}

              <div className={`${styles.title} ${comments && comments.length && styles.active}`}>
                <Text variant="subheader-2">{title}</Text>
              </div>
              <div className={styles.descriptionContainer}>
                <ExpandableText text={htmlToText(description)} lines={1} />
              </div>
            </div>
            <div className={styles.icons}>
              <Button view="flat">
                <Icon size={15} data={FileIcon} />
              </Button>
              {block_id && (
                <Link to={`block/${block_id}`}>
                  <Button view="flat">
                    <Icon size={15} data={PencilIcon} />
                  </Button>
                </Link>
              )}

              <Button view="flat">
                <Icon size={15} data={TrashBinIcon} />
              </Button>
            </div>
          </div>
        </div>

        {children && children.length > 0 && (
          <div className={`${styles.childrenContainer}`} style={{ borderLeftColor: color }}>
            {children.map(child => (
              <div key={child.block_id} className={styles.childEventBlock} data-block-id={child.id}>
                <div className={styles.childContentBlock}>
                  <div className={styles.childTags}>
                    {child?.roles?.map((role, index) => (
                      <Label key={index} theme="normal" onClick={() => false} size="xs">
                        {getRoleDisplayName(role)}
                      </Label>
                    ))}
                  </div>
                  <div
                    className={`${styles.title} ${child.comments && child.comments.length && styles.active}`}
                  >
                    <Text variant="subheader-2">{child.title}</Text>
                  </div>
                  <div className={styles.description}>
                    <ExpandableText text={htmlToText(child.description)} lines={1} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
