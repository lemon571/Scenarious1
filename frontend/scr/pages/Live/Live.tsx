import { Alert, Flex, SegmentedRadioGroup } from '@gravity-ui/uikit';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ScenarioInfo from '../../components/ScenarioInfo/ScenarioInfo';
import { useScenario } from '../../hooks/useScenario';
import { useScenarioBlocks } from '../../hooks/useScenarioBlocks';
import { initialBlocks } from '../../mocks/initialBlocks';
import type { Block } from '../../types';
import classes from './Live.module.css';
import LiveCloseBlocksCard from './LiveCloseBlocksCard/LiveCloseBlocksCard';
import LiveCommentsCard from './LiveCommentsCard/LiveCommentsCard';
import LiveFooter from './LiveFooter/LiveFooter';
import LiveHeader from './LiveHeader/LiveHeader';
import LiveOpenBlockCard from './LiveOpenBlockCard/LiveOpenBlockCard';

type ActionTab = 'AllBlocks' | 'BlocksForMe';

type TabOption = {
  id: ActionTab;
  title: string;
};

const tabs: TabOption[] = [
  { id: 'AllBlocks', title: 'Все блоки' },
  { id: 'BlocksForMe', title: 'Блоки для меня' },
];

export default function Live() {
  const { id: scenarioId } = useParams();
  const { data: scenarioInfo, isLoading: isScenarioLoading } = useScenario(scenarioId || '');
  const { data: fetchedBlocks, isLoading: isBlocksLoading } = useScenarioBlocks(scenarioId || '');
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [filteredBlocks, setFilteredBlocks] = useState<Block[]>(initialBlocks);
  const [currentActionTab, setCurrentActionTab] = useState<ActionTab>('AllBlocks');
  const [isActiveCard, setIsActiveCard] = useState<boolean>(true);
  const [indexActiveBlock, setIndexActiveBlock] = useState<number>(1);
  const [activeBlock, setActiveBlock] = useState<Block>(blocks[0]);
  const [isFinished, setIsFinished] = useState<boolean>(true);
  const navigate = useNavigate();

  // Функция для фильтрации блоков по ролям пользователя
  const filterBlocksByUserRoles = (
    blocks: Block[],
    userRoles: string[] = ['technician', 'speaker'],
  ): Block[] => {
    return blocks.filter(block => {
      // Проверяем, есть ли пересечение ролей блока с ролями пользователя
      const hasMatchingRole = block.roles.some(role => userRoles.includes(role));

      // Если у блока есть дочерние элементы, проверяем их тоже
      if (block.children && block.children.length > 0) {
        const hasMatchingChildren = block.children.some(child =>
          child.roles.some(role => userRoles.includes(role)),
        );
        return hasMatchingRole || hasMatchingChildren;
      }

      return hasMatchingRole;
    });
  };

  // Обновляем блоки когда они загружаются
  useEffect(() => {
    if (fetchedBlocks) {
      setBlocks(fetchedBlocks);
      setFilteredBlocks(fetchedBlocks);
      // Устанавливаем первый блок как активный, если блоки есть
      if (fetchedBlocks.length > 0) {
        setActiveBlock(fetchedBlocks[0]);
        setIndexActiveBlock(1);
      }
    }
  }, [fetchedBlocks]);

  // Фильтруем блоки при изменении вкладки
  useEffect(() => {
    if (currentActionTab === 'AllBlocks') {
      setFilteredBlocks(blocks);
    } else if (currentActionTab === 'BlocksForMe') {
      // Здесь можно передать реальные роли пользователя
      const userRoles = ['technician', 'speaker']; // Временные роли для демонстрации
      const filtered = filterBlocksByUserRoles(blocks, userRoles);
      setFilteredBlocks(filtered);

      // Обновляем активный блок, если текущий не входит в отфильтрованные
      if (filtered.length > 0 && !filtered.find(b => b.id === activeBlock.id)) {
        setActiveBlock(filtered[0]);
        setIndexActiveBlock(1);
      }
    }
  }, [currentActionTab, blocks]);

  // Показываем загрузку, пока сценарий или блоки загружаются
  if (isScenarioLoading || isBlocksLoading || !scenarioInfo || !fetchedBlocks) {
    return (
      <Flex className={classes.page} direction="column" justifyContent="center" alignItems="center">
        <div>Загрузка...</div>
      </Flex>
    );
  }

  return (
    <Flex className={classes.page} direction="column">
      {isFinished && (
        <div className={classes.alertOverlay}>
          <Alert
            theme="success"
            title="Мероприятие завершено"
            message="Спасибо за участие! Нажмите на крестик, чтобы вернуться на главную."
            onClose={() => {
              navigate('/');
            }}
            className={classes.alert}
          />
        </div>
      )}

      <LiveHeader />
      <Flex justifyContent="space-between" className={classes.info}>
        <ScenarioInfo scenarioInfo={scenarioInfo} blocks={filteredBlocks} />
        <SegmentedRadioGroup
          name="modeTabs"
          defaultValue="AllBlocks"
          value={currentActionTab}
          onUpdate={value => setCurrentActionTab(value as ActionTab)}
        >
          {tabs.map(tab => (
            <SegmentedRadioGroup.Option key={tab.id} value={tab.id}>
              {tab.title}{' '}
              {tab.id === 'AllBlocks' ? `(${blocks.length})` : `(${filteredBlocks.length})`}
            </SegmentedRadioGroup.Option>
          ))}
        </SegmentedRadioGroup>
      </Flex>
      <Flex direction="row" gap={5}>
        <Flex direction="column" gap={5} className={classes.blocks}>
          <LiveOpenBlockCard
            isActiveCard={isActiveCard}
            setIsActiveCard={setIsActiveCard}
            activeBlock={activeBlock}
          />
          <LiveCloseBlocksCard
            activeBlock={activeBlock}
            setActiveBlock={setActiveBlock}
            setIndexActiveBlock={setIndexActiveBlock}
            blocks={filteredBlocks}
          />
        </Flex>
        <LiveCommentsCard
          comments={activeBlock.comments}
          setBlocks={setBlocks}
          setActiveBlock={setActiveBlock}
        />
      </Flex>
      <LiveFooter
        blocks={filteredBlocks}
        setBlocks={setBlocks}
        activeBlock={activeBlock}
        countBlocks={filteredBlocks.length}
        isFinished={isFinished}
        indexActiveBlock={indexActiveBlock}
        setActiveBlock={setActiveBlock}
        setIndexActiveBlock={setIndexActiveBlock}
        setIsFinished={setIsFinished}
      />
    </Flex>
  );
}
