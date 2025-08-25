import { Button, Flex, Text } from '@gravity-ui/uikit';
import { useState } from 'react';

import styles from './ErrorWrapper.module.css';

export default function ErrorWrapper({
  title,
  text,
}: {
  title: React.ReactNode;
  text: React.ReactNode;
}) {
  const [opened, setOpened] = useState(false);
  return (
    <Flex
      alignItems="center"
      style={{ maxWidth: '800px' }}
      gap={5}
      className={styles.errorContainer}
    >
      <img width={600} height={400} src="/errorFloating.svg" alt="error" />
      <Flex direction="column" gap={3}>
        <Text variant="display-3">Ошибочка...</Text>
        <Text variant="header-2" color="secondary">
          Но мы уже чиним!
        </Text>
        {opened ? (
          <Text variant="body-2" color="secondary">
            {title} {text}
          </Text>
        ) : (
          <Button className={styles.button} view="flat-secondary" onClick={() => setOpened(true)}>
            Подробнее
          </Button>
        )}
      </Flex>
    </Flex>
  );
}
