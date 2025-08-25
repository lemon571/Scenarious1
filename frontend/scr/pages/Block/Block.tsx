import {
  Bell,
  File,
  LayoutHeaderCellsLarge,
  MusicNote,
  Person,
  Picture,
  Plus,
  Video,
} from '@gravity-ui/icons';
import {
  ActionTooltip,
  Button,
  Disclosure,
  Icon,
  Text,
  Tooltip,
  TextInput,
  Flex,
  Loader,
} from '@gravity-ui/uikit';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BlockDetails from '../../components/BlockDetails/BlockDetails';
import type { BreadCrumbPathItem } from '../../components/BreadCrumbsPath/BreadCrumbsPath';
import BreadCrumbsPath from '../../components/BreadCrumbsPath/BreadCrumbsPath';
import ColorPicker, { type Color } from '../../components/ColorPicker/ColorPicker';
import CommentsOfNestedBlocks from '../../components/CommentsOfNestedBlocks/CommentsOfNestedBlocks';
import Editor from '../../components/Editor/Editor';
import classes from './Block.module.css';
import { useBlockUpdate } from '../../hooks/useBlockUpdate';
import { useScenario } from '../../hooks/useScenario';
import type { DateTime } from '@gravity-ui/date-utils';
import { useBlockById } from '../../hooks/useBlockById.ts';

export default function BlockPage() {
  const { id: scenarioId, blockId } = useParams();
  const { data: blockDetails } = useBlockById(blockId || '', scenarioId || '');
  const { data: scenarioDetails } = useScenario(scenarioId || '');

  const { mutate } = useBlockUpdate();

  const changeColor = (color: Color) => {
    mutate({
      blockId: blockId || '',
      scenarioId: scenarioId || '',
      body: { color: color.content },
    });
  };

  const changeStartTime = (startTime: DateTime | null) => {
    if (!startTime || !scenarioDetails?.start) return;
    const selected = new Date(startTime.valueOf());
    const scenarioDate = new Date(scenarioDetails.start);
    const aligned = new Date(scenarioDate);
    aligned.setHours(
      selected.getHours(),
      selected.getMinutes(),
      selected.getSeconds(),
      selected.getMilliseconds(),
    );

    mutate({
      blockId: blockId || '',
      scenarioId: scenarioId || '',
      body: { start: aligned.getTime() },
    });
  };

  const changeLocation = (nextLocation: string) => {
    mutate({
      blockId: blockId || '',
      scenarioId: scenarioId || '',
      body: { location: nextLocation },
    });
  };

  const changeRoles = (nextRoles: string[]) => {
    mutate({
      blockId: blockId || '',
      scenarioId: scenarioId || '',
      body: { roles: nextRoles },
    });
  };

  const changeDuration = (durationMs: number) => {
    mutate({
      blockId: blockId || '',
      scenarioId: scenarioId || '',
      body: { duration: durationMs },
    });
  };

  // Inline title editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  useEffect(() => {
    if (blockDetails?.title) setTitleDraft(blockDetails.title);
  }, [blockDetails?.title]);

  const submitTitle = () => {
    const newTitle = titleDraft.trim();
    if (!blockDetails) return;
    if (!newTitle || newTitle === blockDetails.title) {
      setIsEditingTitle(false);
      setTitleDraft(blockDetails.title);
      return;
    }
    mutate({
      blockId: blockId || '',
      scenarioId: scenarioId || '',
      body: { title: newTitle },
    });
    setIsEditingTitle(false);
  };

  const onTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.currentTarget as HTMLInputElement).blur();
    } else if (e.key === 'Escape') {
      if (blockDetails?.title) setTitleDraft(blockDetails.title);
      setIsEditingTitle(false);
    }
  };

  const [selectedColor, setSelectedColor] = useState<Color>({
    id: 'blue',
    title: 'Голубой',
    content: 'rgba(54, 151, 241, 0.8)',
  });

  const items: BreadCrumbPathItem[] = [
    { key: '/', label: 'Все сценарии' },
    { key: '', label: blockDetails?.title || '' },
  ];

  useEffect(() => {
    if (blockDetails?.color) {
      setSelectedColor({ id: 'custom', title: 'Цвет блока', content: blockDetails.color });
    }
  }, [blockDetails?.color]);

  if (!blockDetails)
    return (
      <Flex justifyContent="center" alignItems="center" style={{ width: '100%', height: '100%' }}>
        <Loader size="l" />
      </Flex>
    );

  return (
    <div className={classes.blockPage}>
      <div className={classes.headerSection}>
        <BreadCrumbsPath items={items} />
        <Tooltip content="Уведомления">
          <Button className={classes.notificationButton}>
            <Bell />
          </Button>
        </Tooltip>
      </div>
      <div className={classes.contentContainer}>
        <div className={classes.blockTitleRow}>
          <div className={classes.introSection}>
            {isEditingTitle ? (
              <TextInput
                autoFocus
                size="l"
                value={titleDraft}
                onUpdate={setTitleDraft}
                onBlur={submitTitle}
                onKeyDown={onTitleKeyDown}
              />
            ) : (
              <div style={{ cursor: 'text' }} onClick={() => setIsEditingTitle(true)}>
                <Text variant="header-2">{blockDetails.title}</Text>
              </div>
            )}
            <ActionTooltip title="Выбор цвета">
              <ColorPicker
                selectedColor={selectedColor}
                setSelectedColor={changeColor}
              ></ColorPicker>
            </ActionTooltip>
          </div>
          <div className={classes.userInfo}>
            <Button size="xs">
              <Icon data={Person} size={13} />
            </Button>
            <Text>Петров В.И.</Text>
          </div>
        </div>
        <BlockDetails
          startTime={new Date(Number(blockDetails.start))}
          duration={new Date(Number(blockDetails.duration))}
          updateStartTime={changeStartTime}
          location={blockDetails.location}
          roles={blockDetails.roles}
          updateLocation={changeLocation}
          updateRoles={changeRoles}
          updateDuration={changeDuration}
        />
        {/* <div className={classes.commentsSection}>
          <Text color="secondary">Комментарии</Text>
          <div className={classes.addCommentRow}>
            <img src="/avatar.svg" alt="Аватар" width="24px" height="24px" />
            <TextInput view="clear" placeholder="Добавить комментарий" />
          </div>
        </div> */}
        <div className={classes.disclosure}>
          <Disclosure
            summary={<Text color="secondary">Вложенные блоки</Text>}
            className={classes.disclosureBlocks}
          >
            <CommentsOfNestedBlocks />
          </Disclosure>
          <Icon data={Plus} className={classes.iconColor}></Icon>
        </div>
        <div>
          <div className={classes.descriptionHeaderRow}>
            <Text color="secondary">Описание</Text>
            <div className={classes.descriptionIconsRow}>
              <Icon data={Picture} className={classes.iconColor} />
              <Icon data={Video} className={classes.iconColor} />
              <Icon data={File} className={classes.iconColor} />
              <Icon data={MusicNote} className={classes.iconColor} />
              <Icon data={LayoutHeaderCellsLarge} className={classes.iconColor} />
            </div>
          </div>
          <div className={classes.descriptionSection}>
            <Editor
              username={'Пользователь'}
              userAvatar="https://avatars.githubusercontent.com/u/6522772?v=4"
              scenarioId={scenarioId || ''}
              blockId={blockId || ''}
              blockDescription={blockDetails.description}
              blockComments={blockDetails.comments}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
