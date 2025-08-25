import {
  Breadcrumbs,
  Button,
  Icon,
  Tab,
  TabList,
  TabPanel,
  TabProvider,
  Text,
  Tooltip,
} from '@gravity-ui/uikit';

import scenarioPageStyles from '../../pages/Scenario/Scenario.module.css';
import styles from './ScenarioCreate.module.css';

import { Blocks, DraggableBlockArea } from '../../components';

import { useCallback, useState } from 'react';

import type { Block as BlockType } from '../../types';
import { ArrowLeft, Bell, Clock, Cube } from '@gravity-ui/icons';
import { calculateTotalDurationFormatted } from '../../utils/blocks';
import pluralize from '../../utils/pluralize';

export default function ScenarioPagePreview({
  id,
  name,
  initialBlocks,
  pageVisibilityHandler,
  selectTemplate,
}: {
  id: string;
  name: string;
  initialBlocks: BlockType[];
  pageVisibilityHandler: (arg0: boolean) => void;
  selectTemplate: (arg0: string) => void;
}) {
  const [activeTab, setActiveTab] = useState('detailed');
  /* const { id } = useParams(); */

  const [blocks, setBlocks] = useState<BlockType[]>(initialBlocks);

  const recalculateTimeline = useCallback((reorderedBlocks: BlockType[]): BlockType[] => {
    let currentTime = 540;

    return reorderedBlocks.map(block => {
      const updatedBlock = {
        ...block,
        start: currentTime,
      };

      // Обновляем время для дочерних элементов
      if (block.children && block.children.length > 0) {
        updatedBlock.children = block.children.map((child, index) => ({
          ...child,
          start: currentTime + index * 5, // Каждый дочерний элемент через 5 минут
        }));
      }

      currentTime += block.duration;
      return updatedBlock;
    });
  }, []);

  // Обработчик изменения порядка блоков
  const handleBlocksReorder = useCallback(
    (reorderedBlocks: BlockType[]) => {
      const updatedBlocks = recalculateTimeline(reorderedBlocks);
      setBlocks(updatedBlocks);
    },
    [recalculateTimeline],
  );

  return (
    <div className={scenarioPageStyles.scenarioPage}>
      {/* Header */}
      <div className={scenarioPageStyles.realHeader}>
        <div className={scenarioPageStyles.breadCrumbsHeader}>
          <Breadcrumbs maxItems={10} style={{ flexBasis: '450px' }}>
            <Breadcrumbs.Item disabled={true}>Шаблоны</Breadcrumbs.Item>
            <Breadcrumbs.Item>{name}</Breadcrumbs.Item>
          </Breadcrumbs>
          <Tooltip content="Уведомления">
            <Button style={{ padding: '6px' }} iconOnly={true} size="m">
              <Bell width={16} height={16} />
            </Button>
          </Tooltip>
        </div>
        <header className={scenarioPageStyles.header}>
          <div className={scenarioPageStyles.headerLeft}>
            <Text variant="header-1">{name}</Text>
          </div>

          <div className={scenarioPageStyles.headerCenter}>
            <div className={scenarioPageStyles.eventInfo}>
              <div className={scenarioPageStyles.eventStats}>
                <div className={scenarioPageStyles.stat}>
                  <Cube width={16} height={16} />
                  <Text variant="body-1">
                    {blocks.length} {pluralize(blocks.length, 'блок', 'блока', 'блоков')}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      <div className={scenarioPageStyles.navigationBlocks}>
        <div className={scenarioPageStyles.sidebar}>
          <div className={scenarioPageStyles.sidebarContainer}>
            <div className={scenarioPageStyles.sidebarHeader}>
              <Text variant="header-2">Блоки сценария</Text>
              <div className={scenarioPageStyles.duration}>
                <Clock width={16} height={16} />
                <Text variant="body-1">{calculateTotalDurationFormatted(blocks)}</Text>
              </div>
            </div>

            <div className={scenarioPageStyles.viewTabs}>
              <TabProvider value={activeTab} onUpdate={setActiveTab}>
                <TabList>
                  <Tab value="detailed">Подробный</Tab>
                  <Tab value="short">Краткий</Tab>
                </TabList>
              </TabProvider>
            </div>
          </div>
        </div>
      </div>

      <main className={scenarioPageStyles.mainContent}>
        {/* Right Content */}
        <div className={scenarioPageStyles.content}>
          <TabProvider value={activeTab} onUpdate={setActiveTab}>
            <TabPanel value="detailed">
              <Blocks blocks={blocks} />
            </TabPanel>
            <TabPanel value="short">
              <DraggableBlockArea blocks={blocks} onBlocksReorder={handleBlocksReorder} />
            </TabPanel>
          </TabProvider>
        </div>
      </main>
      <div className={styles.invisibleButtons}>
        <Button size="l" onlyIcon={true} onClick={() => pageVisibilityHandler(false)}>
          <Icon size={16} data={ArrowLeft} />
        </Button>
        <Button
          size="l"
          view="action"
          onClick={() => {
            selectTemplate(id);
            pageVisibilityHandler(false);
          }}
        >
          Выбрать шаблон
        </Button>
      </div>
    </div>
  );
}
