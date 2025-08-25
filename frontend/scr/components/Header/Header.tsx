import {
  ChevronDown as ArrowIcon,
  Bell as BellIcon,
  ArrowRightFromSquare as ExitIcon,
  Gear as GearIcon,
  CircleQuestion as QuestionIcon,
} from '@gravity-ui/icons';
import { Avatar, Button, DropdownMenu, Icon, Popover } from '@gravity-ui/uikit';

import { useState } from 'react';
import Notifications from '../Notifications/Notifications';
import Support from '../Support/Support';
import styles from './Header.module.css';

export default function Header() {
  // const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isSupportOpen, setIsSupportOpen] = useState<boolean>(false);

  return (
    <div className={styles.header}>
      <img src="/logo.svg" alt="Scenariosus logo" width={215} height={38} />
      <div className={styles.rightPanel}>
        <div className={styles.buttons}>
          <Popover
            open={isSupportOpen}
            content={<Support setIsSupportOpen={setIsSupportOpen} />}
            className={styles.supportPopover}
            placement="bottom-end"
          >
            <Button
              size="l"
              state="default"
              view="flat"
              onClick={() => {
                setIsSupportOpen(!isSupportOpen);
              }}
            >
              <Icon data={QuestionIcon} size={16} />
            </Button>
          </Popover>
          <Popover
            // open={isNotificationsOpen}
            content={<Notifications />}
            className={styles.notificationPopover}
            placement="bottom-end"
          >
            <Button
              size="l"
              state="default"
              onlyIcon
              view="flat"
              // onClick={() => {
              //   setIsNotificationsOpen(!isNotificationsOpen);
              // }}
            >
              <Icon data={BellIcon} size={16} />
            </Button>
          </Popover>
        </div>
        <DropdownMenu
          renderSwitcher={props => (
            <>
              <Avatar
                borderColor="#32ba76cc"
                imgUrl="/avatar.svg"
                size="s"
                theme="normal"
                view="filled"
              />
              <Button {...props} view="flat" size="m" state="default">
                <Icon size={16} data={ArrowIcon} />
              </Button>
            </>
          )}
          items={[
            {
              iconStart: <Icon size={16} data={GearIcon} />,
              action: () => console.log('Settings'),
              text: 'Настройки',
            },
            {
              iconStart: <Icon size={16} data={ExitIcon} />,
              action: () => console.log('Exit'),
              text: 'Выход',
              theme: 'danger',
            },
          ]}
        />
      </div>
    </div>
  );
}
