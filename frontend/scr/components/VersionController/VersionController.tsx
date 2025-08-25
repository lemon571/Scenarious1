// VersionController.tsx

import { Xmark } from '@gravity-ui/icons';
import { Avatar, Button, Card, Flex, Icon, Text } from '@gravity-ui/uikit';
import { useEffect, useState } from 'react';
import { initialVersions } from '../../mocks/initialVersions';
import type { Version } from '../../types/Version';
import { groupKey, groupTitles, type GroupKey } from '../../utils/dateGrouping';
import { formatLongDate, formatTime } from '../../utils/dateTimeFormatter';
import styles from './VersionController.module.css';

// Импортируем общую логику группировки

function byTimeDesc(a: Version, b: Version) {
  return b.createdAt - a.createdAt;
}

export default function VersionController({
  versions = initialVersions,
  setVersionsVisibility,
}: {
  versions?: Version[];
  setVersionsVisibility: (arg0: boolean) => void;
}) {
  const [closing, setClosing] = useState(false);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 500);
  }, []);

  const onClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setVersionsVisibility(false);
      window.dispatchEvent(new Event('resize'));
    }, 500);
  };

  // Группируем версии
  const groups: Partial<Record<GroupKey, Version[]>> = {};
  versions
    .slice()
    .sort(byTimeDesc)
    .forEach(v => {
      const k = groupKey(v.createdAt);
      (groups[k] ||= []).push(v);
    });

  return (
    <div className={`${styles.wrapper} ${closing && styles.closed}`}>
      <Flex direction="column" gap={8} className={styles.content}>
        <Flex width="100%" alignItems="center" justifyContent="space-between">
          <Flex direction="column" gap={1}>
            <Text variant="header-1">История версий</Text>
            <Text variant="body-1" color="secondary">
              Версий: {versions.length}
            </Text>
          </Flex>
          <Button size="m" onlyIcon onClick={() => onClose()}>
            <Icon data={Xmark} />
          </Button>
        </Flex>

        <Flex direction="column" gap={4}>
          {(Object.keys(groupTitles) as GroupKey[]).map(key => {
            const list = groups[key];
            if (!list || list.length === 0) return null;
            return (
              <Flex key={key} direction="column" gap={3}>
                <Text variant="subheader-1">{groupTitles[key]}</Text>
                <Flex direction="column" gap={2}>
                  {list.map(v => (
                    <Card
                      key={v.id}
                      view="raised"
                      type="action"
                      className={`${styles.itemCard} ${v.id === selected ? styles.selected : ''}`}
                      onClick={() => setSelected(v.id)}
                    >
                      <Flex justifyContent="space-between" alignItems="center">
                        <Flex direction="column" gap={2}>
                          {v.isCurrent && <Text color="secondary">Текущая версия</Text>}
                          <Text variant="subheader-2">
                            {formatLongDate(v.createdAt)}, {formatTime(v.createdAt)}
                          </Text>
                          {!v.isCurrent && (
                            <Flex alignItems="center" gap={1} className={styles.itemHeader}>
                              <Avatar
                                imgUrl={v.authorAvatar || '/avatar.svg'}
                                size="xs"
                                alt="avatar"
                              />
                              <Text variant="body-1" color="secondary">
                                {v.authorName}
                              </Text>
                            </Flex>
                          )}
                        </Flex>
                        {selected === v.id && (
                          <Button size="l" view="action">
                            Восстановить версию
                          </Button>
                        )}
                      </Flex>
                    </Card>
                  ))}
                </Flex>
              </Flex>
            );
          })}
        </Flex>
      </Flex>
    </div>
  );
}
