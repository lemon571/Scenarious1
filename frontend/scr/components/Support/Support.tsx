// Support.tsx
import { Flex } from '@gravity-ui/uikit';
import { useState } from 'react';
import { initialSupportInfo, type SupportItemData } from '../../mocks/initialSupportInfo';
import classes from './Support.module.css';
import SupportHeader from './SupportHeader/SupportHeader';
import SupportItem from './SupportItem/SupportItem';

type SupportProps = {
  setIsSupportOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Support({ setIsSupportOpen }: SupportProps) {
  const [supportItems] = useState<SupportItemData[]>(initialSupportInfo); // мок данные

  return (
    <Flex direction="column" className={classes.support} gap={4}>
      <SupportHeader setIsSupportOpen={setIsSupportOpen} />
      <Flex direction="column" gap={9}>
        {supportItems.map((item, index) => (
          <SupportItem key={index} item={item} />
        ))}
      </Flex>
    </Flex>
  );
}
