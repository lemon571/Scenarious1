import { SegmentedRadioGroup } from '@gravity-ui/uikit';
import classes from './Modetabs.module.css';

export type ActionTab = 'сonstructor' | 'timeline' | 'templateLibrary';
type TabOption = {
  id: ActionTab;
  title: string;
};
const tabs: TabOption[] = [
  { id: 'сonstructor', title: 'Конструктор' },
  { id: 'timeline', title: 'Таймлайн' },
  { id: 'templateLibrary', title: 'Библиотека шаблонов' },
];

export default function ModeTabs({
  currentActionTab,
  setCurrentActionTab,
}: {
  currentActionTab: ActionTab;
  setCurrentActionTab: (arg0: ActionTab) => void;
}) {
  return (
    <div className={classes.navigationTabs}>
      <SegmentedRadioGroup name="modeTabs" defaultValue="сonstructor" value={currentActionTab}>
        {tabs.map(tab => (
          <SegmentedRadioGroup.Option
            key={tab.id}
            value={tab.id}
            onFocus={() => setCurrentActionTab(tab.id)}
          >
            {tab.title}
          </SegmentedRadioGroup.Option>
        ))}
      </SegmentedRadioGroup>
    </div>
  );
}
