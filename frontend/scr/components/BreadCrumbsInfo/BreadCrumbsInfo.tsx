import { ArrowUpFromSquare, Bell, ClockArrowRotateLeft, Printer } from '@gravity-ui/icons';
import { Button, Icon, Popover, Tooltip } from '@gravity-ui/uikit';
import DefaultAvatar from '../Avatars/DefaultAvatar';
import Notifications from '../Notifications/Notifications';
import classes from './BreadCrumbsInfo.module.css';

export default function BreadCrumbsInfo({
  setModalOpen,
  setPrintModalOpen,
  setVersionsVisible,
}: {
  setModalOpen: (arg0: boolean) => void;
  setPrintModalOpen: (arg0: boolean) => void;
  setVersionsVisible: (arg0: boolean) => void;
}) {
  return (
    <div className={classes.container}>
      <p className={classes.text}>1 онлайн</p>
      <DefaultAvatar width="28" height="28" />

      <Tooltip content="Настройки доступа">
        <Button onClick={() => setModalOpen(true)} size="m">
          <Icon data={ArrowUpFromSquare} />
          Настройки доступа
        </Button>
      </Tooltip>
      <Popover content={<Notifications />} className={classes.notificationsPopover}>
        <Button size="m" onlyIcon>
          <Icon data={Bell} />
        </Button>
      </Popover>
      <Tooltip content="Печать">
        <Button onClick={() => setPrintModalOpen(true)} size="m">
          <Icon data={Printer} />
        </Button>
      </Tooltip>
      <Tooltip content="История версий">
        <Button size="m" onClick={() => setVersionsVisible(true)}>
          <Icon data={ClockArrowRotateLeft} />
        </Button>
      </Tooltip>
    </div>
  );
}
