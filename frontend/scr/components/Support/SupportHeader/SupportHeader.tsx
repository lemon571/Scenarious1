import { Xmark } from '@gravity-ui/icons';
import { Button, Flex, Icon, Popover, Text } from '@gravity-ui/uikit';

type SupportHeaderProps = {
  setIsSupportOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function SupportHeader({ setIsSupportOpen }: SupportHeaderProps) {
  return (
    <Flex alignItems="center" justifyContent="space-between" gap={10}>
      <Text variant="subheader-3">Список изменений</Text>
      <Flex gap={6}>
        <Popover
          content={<Text style={{ padding: '15px' }}>В разработке</Text>}
          placement="bottom-end"
        >
          <Button view="outlined">Задать вопрос в поддержку</Button>
        </Popover>
        <Button
          view="flat"
          onClick={() => {
            setIsSupportOpen(false);
          }}
        >
          <Icon data={Xmark} />
        </Button>
      </Flex>
    </Flex>
  );
}
