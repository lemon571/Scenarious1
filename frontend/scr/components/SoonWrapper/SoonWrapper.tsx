import styles from './SoonWrapper.module.css';
import { Flex, Text } from '@gravity-ui/uikit';

export default function SoonWrapper({
  children,
  msg = 'Скоро...',
  blur = '5',
}: {
  children: React.ReactNode;
  msg?: string;
  blur?: string;
}) {
  return (
    <div className={styles.soon}>
      <Flex className={styles.soonMessage}>
        <img width={400} height={400} src="/manWithGear.svg"></img>
        <Flex direction="column" gap={3}>
          <Text variant="display-3">{msg}</Text>
          <Text variant="body-2" color="secondary">
            Мы очень старались, но кое-что не успели...
          </Text>
        </Flex>
      </Flex>
      <div className={styles.soonBlur} style={{ filter: `blur(${blur}px)` }}>
        {children}
      </div>
    </div>
  );
}
