import { Flex, Text } from '@gravity-ui/uikit';

export default function LoadingWrapper({
  title,
  text,
  status = 'loading',
}: {
  title: React.ReactNode;
  text: React.ReactNode;
  status: string;
}) {
  const RenderIcon = () => {
    if (status === 'success') return <img src="/success.svg" width={500} height={500} />;
    if (status === 'error') return <img src="/error.svg" width={500} height={500} />;
    return <img src="/loading.svg" width={500} height={500} />;
  };
  return (
    <Flex alignItems="center" style={{ padding: '1rem 3rem' }}>
      <RenderIcon />
      <Flex direction="column" gap={3}>
        <Text variant="display-3">{title}</Text>
        <Text variant="body-2">{text}</Text>
      </Flex>
    </Flex>
  );
}
