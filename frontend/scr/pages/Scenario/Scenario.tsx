import { Xmark } from '@gravity-ui/icons';
import { Button, Flex, Icon, Loader, Modal, Text } from '@gravity-ui/uikit';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import BreadCrumbsInfo from '../../components/BreadCrumbsInfo/BreadCrumbsInfo';
import BreadCrumbsPath, {
  type BreadCrumbPathItem,
} from '../../components/BreadCrumbsPath/BreadCrumbsPath';

import ModeTabs, { type ActionTab } from '../../components/ModeTabs/Modetabs';

import type { Block as BlockType } from '../../types/Block';

import ScenarioInfo from '../../components/ScenarioInfo/ScenarioInfo.tsx';
import ConstructorTab from '../../components/ScenarioPageHelpers/ConstructorTab/ConstructorTab.tsx';
import TemplatesLibraryTab from '../../components/ScenarioPageHelpers/TemplatesLibraryTab/TemplatesLibraryTab.tsx';
import TimeLineTab from '../../components/ScenarioPageHelpers/TimeLineTab/TimeLineTab.tsx';
import UserInvitation from '../../components/UserInvitation/UserInvitaion.tsx';
import VersionController from '../../components/VersionController/VersionController.tsx';
import { useScenario } from '../../hooks/useScenario';
import { useScenarioBlocks } from '../../hooks/useScenarioBlocks';
import { initialRoles } from '../../mocks/initialRoles.ts';
import { initialScenarios } from '../../mocks/initialScenarios.ts';
import type { ConvertedRole } from '../../types/ConvertedRoles.ts';
import type { Scenario } from '../../types/Scenario.ts';
import { recalculateTimeline } from '../../utils/blocks';
import styles from './Scenario.module.css';
import PrintScenario from '../../components/PrintScenario/PrintScenario.tsx';
import ErrorWrapper from '../../components/ErrorWrapper/ErrorWrapper.tsx';

export default function Scenario() {
  const [currentActionTab, setCurrentActionTab] = useState<ActionTab>('сonstructor');

  const [versionsVisible, setVersrionsVisible] = useState(false);

  const { id: scenarioId } = useParams();

  const {
    data: fetchedBlocks,
    isLoading: isBlocksLoading,
    isError: isBlocksError,
    error: blocksError,
  } = useScenarioBlocks(scenarioId || '');
  const {
    data: fetchedScenario,
    isLoading: isScenarioLoading,
    isError: isScenarioError,
    error: scenarioError,
  } = useScenario(scenarioId || '');

  const [blocks, setBlocks] = useState<BlockType[]>([]);

  useEffect(() => {
    if (fetchedBlocks) {
      setBlocks(fetchedBlocks);
    }
  }, [fetchedBlocks]);

  // Обработчик изменения порядка блоков
  const handleBlocksReorder = useCallback((reorderedBlocks: BlockType[]) => {
    const updatedBlocks = recalculateTimeline(reorderedBlocks);
    setBlocks(updatedBlocks);
  }, []);

  const [scenarioInfo, setScenarioInfo] = useState<Scenario>(initialScenarios[0]);
  useEffect(() => {
    if (fetchedScenario) setScenarioInfo(fetchedScenario);
  }, [fetchedScenario]);
  const [roles] = useState<ConvertedRole[]>(initialRoles);

  const [modalOpen, setModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  const items: BreadCrumbPathItem[] = [
    { key: '/', label: 'Все сценарии' },
    { key: '', label: scenarioInfo.name },
  ];

  if (isScenarioLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" style={{ width: '100%', height: '100%' }}>
        <Loader size="l" />
      </Flex>
    );
  }

  const getErrorMessage = (e: unknown) => (e instanceof Error ? e.message : 'Ошибка при запросе');

  if (isScenarioError) {
    return (
      <Flex
        direction="column"
        justifyContent="center"
        alignItems="center"
        style={{ width: '100%', height: '100%' }}
      >
        <ErrorWrapper
          title="Не удалось загрузить данные"
          text={getErrorMessage(scenarioError)}
        ></ErrorWrapper>
      </Flex>
    );
  }

  return (
    <Flex>
      <div className={styles.scenarioPage}>
        {/* Header */}
        <div className={styles.realHeader}>
          <div className={styles.breadCrumbsHeader}>
            <BreadCrumbsPath items={items} />
            <BreadCrumbsInfo
              setPrintModalOpen={setPrintModalOpen}
              setModalOpen={setModalOpen}
              setVersionsVisible={setVersrionsVisible}
            />
          </div>
          <ScenarioInfo scenarioInfo={scenarioInfo} blocks={blocks} />
        </div>

        <Modal
          open={printModalOpen}
          onClose={() => setPrintModalOpen(false)}
          className={`${styles.modal}`}
          contentClassName={`${styles.modalContent} ${styles.largeModalContent}`}
        >
          <PrintScenario scenario={scenarioInfo} blocks={blocks}></PrintScenario>
        </Modal>

        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          className={styles.modal}
          contentClassName={styles.modalContent}
        >
          <Flex direction="column" gap={4}>
            <Flex justifyContent="space-between" alignItems="center">
              <Text variant="header-1">Поделиться этим сценарием</Text>
              <Button view="flat" size="xl" iconOnly onClick={() => setModalOpen(false)}>
                <Icon size={20} data={Xmark}></Icon>
              </Button>
            </Flex>
            <UserInvitation />
          </Flex>
        </Modal>

        <ModeTabs currentActionTab={currentActionTab} setCurrentActionTab={setCurrentActionTab} />

        {isBlocksLoading && (
          <Flex
            justifyContent="center"
            alignItems="center"
            style={{ width: '100%', height: '100%' }}
          >
            <Loader size="l" />
          </Flex>
        )}

        {isBlocksError && (
          <Flex
            direction="column"
            justifyContent="center"
            alignItems="center"
            style={{ width: '100%', height: '100%' }}
          >
            <ErrorWrapper
              title="Не удалось загрузить блоки"
              text={getErrorMessage(blocksError)}
            ></ErrorWrapper>
          </Flex>
        )}
        {fetchedBlocks && (
          <>
            {currentActionTab === 'сonstructor' && (
              <ConstructorTab
                blocks={blocks}
                setBlocks={setBlocks}
                handleBlocksReorder={handleBlocksReorder}
                roles={roles}
                scenarioId={scenarioId || ''}
              />
            )}

            {currentActionTab === 'timeline' && <TimeLineTab blocks={blocks} />}
            {currentActionTab === 'templateLibrary' && <TemplatesLibraryTab />}
          </>
        )}
      </div>
      {versionsVisible && <VersionController setVersionsVisibility={setVersrionsVisible} />}
    </Flex>
  );
}
