import { MapPin } from '@gravity-ui/icons';
import { Icon, Label, Text } from '@gravity-ui/uikit';

import type { Block } from '../../types/Block';
import { getRoleDisplayName } from '../../utils/roleMapping';

import { formatDuration, formatTime } from '../../utils/dateTimeFormatter';
import styles from './PrintScenario.module.css';

export default function PrintBlock({
  id,
  title,
  description,
  roles,
  start,
  duration,
  location = 'Средний зал',
  children,
  color = 'gray',
}: Block) {
  return (
    <div className={styles.blockContainer}>
      <div className={styles.eventsContainer}>
        <div className={`${styles.eventBlock}`} data-block-id={id}>
          <div className={styles.timeBlock}>
            <Text variant="subheader-3">{formatTime(start)}</Text>
            <Text variant="body-1" color="secondary">
              {formatDuration(duration)}
            </Text>
            <Text
              variant="body-1"
              color="secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Icon data={MapPin} size={12} />
              {location}
            </Text>
          </div>

          <div className={styles.contentBlock} style={{ borderLeftColor: color }}>
            <div className={styles.blockBody}>
              <div className={styles.tags}>
                {roles?.length > 0 && roles[0].length > 0 ? (
                  roles.map((role, index) => (
                    <Label key={index} theme="normal" onClick={() => false} size="xs">
                      {getRoleDisplayName(role)}
                    </Label>
                  ))
                ) : (
                  <Label>
                    <Text variant="body-1">Роли не выбраны</Text>
                  </Label>
                )}
              </div>

              <div className={`${styles.title}`}>
                <Text variant="subheader-2">{title}</Text>
              </div>
              <div
                className={styles.descriptionContainer}
                dangerouslySetInnerHTML={{ __html: description }}
              ></div>
            </div>
          </div>
        </div>

        {children && children.length > 0 && (
          <div className={`${styles.childrenContainer}`}>
            {children.map(child => (
              <div key={child.id} className={styles.childEventBlock} data-block-id={child.id}>
                <div className={styles.timeBlock}>
                  <Text variant="subheader-3">{formatTime(child.start)}</Text>
                  <Text variant="body-1" color="secondary">
                    {formatDuration(child.duration)}
                  </Text>
                </div>
                <div className={styles.childContentBlock} style={{ borderLeftColor: color }}>
                  <div className={styles.childTags}>
                    {child.roles.map((role, index) => (
                      <Label key={index} theme="normal" onClick={() => false} size="xs">
                        {getRoleDisplayName(role)}
                      </Label>
                    ))}
                  </div>
                  <div className={`${styles.title}`}>
                    <Text variant="subheader-2">{child.title}</Text>
                  </div>
                  <div
                    className={styles.description}
                    dangerouslySetInnerHTML={{ __html: child.description }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
