import { Clock } from '@gravity-ui/icons';
import { Icon, Tab, TabList, TabPanel, TabProvider, Text } from '@gravity-ui/uikit';
import { useState, type Dispatch, type SetStateAction } from 'react';
import styles from '../../../pages/Scenario/Scenario.module.css';
import type { Block } from '../../../types';
import type { ConvertedRole } from '../../../types/ConvertedRoles';
import { calculateTotalDurationFormatted } from '../../../utils/blocks';
import Blocks from '../../Blocks/Blocks';
import DraggableBlockArea from '../../DraggableBlockArea/DraggableBlockArea';
import ThreeButtons from '../../ThreeButtons/ThreeButtons';

interface ConstructorTab {
  blocks: Block[];
  setBlocks: Dispatch<SetStateAction<Block[]>>;
  handleBlocksReorder: (arg0: Block[]) => void;
  roles: ConvertedRole[];
  scenarioId: string;
}

export default function ConstructorTab({
  blocks,
  setBlocks,
  handleBlocksReorder,
  roles,
  scenarioId,
}: ConstructorTab) {
  const [activeTab, setActiveTab] = useState('detailed');

  const [filteredRoles, setFilteredRoles] = useState<string[] | undefined>([]);

  return (
    <>
      <div className={styles.navigationBlocks}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarContainer}>
            <div className={styles.sidebarHeader}>
              <Text variant="header-1">Блоки сценария</Text>
              <div className={styles.duration}>
                <Icon data={Clock} size={16} />
                <Text variant="body-1">{calculateTotalDurationFormatted(blocks)}</Text>
              </div>
            </div>

            <div className={styles.viewTabs}>
              <TabProvider value={activeTab} onUpdate={setActiveTab}>
                <TabList>
                  <Tab value="detailed">Подробный</Tab>
                  <Tab value="short">Краткий</Tab>
                </TabList>
              </TabProvider>
            </div>
          </div>
          <ThreeButtons
            roles={roles}
            blocks={blocks}
            setBlocks={setBlocks}
            scenarioId={scenarioId}
            onRolesChange={(roles: string[] | undefined) => {
              setFilteredRoles(roles);
            }}
          />
        </div>
      </div>
      <main className={styles.mainContent}>
        <TabProvider value={activeTab} onUpdate={setActiveTab}>
          <TabPanel value="detailed">
            <Blocks blocks={blocks} filteredRoles={filteredRoles} scenarioId={scenarioId} />
          </TabPanel>
          <TabPanel value="short">
            <DraggableBlockArea
              blocks={blocks}
              onBlocksReorder={handleBlocksReorder}
              scenarioId={scenarioId}
            />
          </TabPanel>
        </TabProvider>
      </main>
    </>
  );
}
