import { Button, Flex, Text, Popover } from '@gravity-ui/uikit';
import { Archive, ArrowRightToSquare, Gear, House, Persons, SquarePlus } from '@gravity-ui/icons';
import DefaultAvatar from '../Avatars/DefaultAvatar';
import classes from './CustomAsideHeader.module.css';
import { NavLink } from 'react-router-dom';

export default function CustomAsideHeader() {
  return (
    <div className={classes.container}>
      <DefaultAvatar />

      <Popover
        hasArrow
        placement="right-start"
        content={
          <Flex direction="column" style={{ padding: '10px', maxWidth: '300px' }}>
            <Text variant="subheader-1">Создать</Text>
            <Text variant="body-1">Создай свой первый сценарий.</Text>
          </Flex>
        }
      >
        <NavLink to="/scenario/create" end>
          {({ isActive }) => (
            <Button className={classes.button} view="action" selected={isActive}>
              <SquarePlus width="20px" height="20px" />
            </Button>
          )}
        </NavLink>
      </Popover>

      <Popover
        hasArrow
        placement="right-start"
        content={
          <Flex direction="column" style={{ padding: '10px', maxWidth: '300px' }}>
            <Text variant="subheader-1">Все сценарии</Text>
            <Text variant="body-1">Все сценарии находятся здесь.</Text>
          </Flex>
        }
      >
        <NavLink to="/" end>
          {({ isActive }) => (
            <Button view="normal" className={classes.button} selected={isActive}>
              <House width="20px" height="20px" />
            </Button>
          )}
        </NavLink>
      </Popover>

      <Popover
        hasArrow
        placement="right-start"
        content={
          <Flex direction="column" style={{ padding: '10px', maxWidth: '300px' }}>
            <Text variant="subheader-1">Шаблоны</Text>
            <Text variant="body-1">Скоро здесь будут шаблоны, очень скоро...</Text>
          </Flex>
        }
      >
        <NavLink to="/">
          {({ isActive }) => (
            <Button view="normal" className={classes.button} selected={isActive} disabled>
              <Archive width="20px" height="20px" />
            </Button>
          )}
        </NavLink>
      </Popover>

      <Popover
        hasArrow
        placement="right-start"
        content={
          <Flex direction="column" style={{ padding: '10px', maxWidth: '300px' }}>
            <Text variant="subheader-1">Команды</Text>
            <Text variant="body-1">
              Уже очень скоро ты сможешь их посмотреть, а пока разработчики красят другие кнопки.
            </Text>
          </Flex>
        }
      >
        <NavLink to="/">
          {({ isActive }) => (
            <Button view="normal" className={classes.button} selected={isActive} disabled>
              <Persons width="20px" height="20px" />
            </Button>
          )}
        </NavLink>
      </Popover>

      <Popover
        hasArrow
        placement="right-start"
        content={
          <Flex direction="column" style={{ padding: '10px', maxWidth: '300px' }}>
            <Text variant="subheader-1">Настройки</Text>
            <Text variant="body-1">
              Куда в прод без настроек? Хотя сейчас они где-то потерялись. Попробуй другие фичи.
            </Text>
          </Flex>
        }
      >
        <NavLink to="/">
          {({ isActive }) => (
            <Button view="normal" className={classes.button} selected={isActive} disabled>
              <Gear width="20px" height="20px" />
            </Button>
          )}
        </NavLink>
      </Popover>

      <Popover
        hasArrow
        placement="right-start"
        content={
          <Flex direction="column" style={{ padding: '10px', maxWidth: '300px' }}>
            <Text variant="subheader-1">Выход</Text>
            <Text variant="body-1">Уже уходишь? Мы только начали...</Text>
          </Flex>
        }
      >
        <NavLink to="/">
          <Button className={classes.button} view="normal" disabled>
            <ArrowRightToSquare width="20px" height="20px" />
          </Button>
        </NavLink>
      </Popover>
    </div>
  );
}
