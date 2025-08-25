import { Outlet } from 'react-router-dom';
/* import { AsideHeader } from '@gravity-ui/navigation';
import SquarePlus from '@gravity-ui/icons/SquarePlus';
import House from '@gravity-ui/icons/House';
import Archive from '@gravity-ui/icons/Archive';
import Persons from '@gravity-ui/icons/Persons';
import Gear from '@gravity-ui/icons/Gear';
import ArrowRightToSquare from '@gravity-ui/icons/ArrowRightToSquare'; */
import classes from './Layout.module.css';
import CustomAsideHeader from '../AsideHeader/CustomAsideHeader';

/* for using AsideHeader
const menuItems = [
  {
    id: 'home',
    title: '',
    icon: House,
    tooltipText: 'Главная',
  },
  {
    id: 'archive',
    title: '',
    icon: Archive,
    tooltipText: 'Шаблоны',
  },
  {
    id: 'persons',
    title: '',
    icon: Persons,
    tooltipText: 'Команды',
  },
  {
    id: 'settings',
    title: '',
    icon: Gear,
    tooltipText: 'Настройки',
  },
  {
    id: 'logout',
    title: '',
    icon: ArrowRightToSquare,
    tooltipText: 'Выйти',
  },
]; */

export default function Layout() {
  return (
    <div className={classes.layout} style={{ display: 'flex', height: '100vh' }}>
      <CustomAsideHeader></CustomAsideHeader>
      <main className={classes.main}><Outlet /></main>
    </div>
  );
}
/*
<AsideHeader
        compact
        hideCollapseButton
        menuItems={menuItems}
        headerDecoration={false}
        subheaderItems={[
          {
            item: {
              id: 'add',
              title: '',
              icon: SquarePlus,
              tooltipText: 'Создать',
              iconSize: 20,
            },
          },
        ]}
        logo={{
          iconSrc: '/avatar.svg',
          text: '',
          iconSize: 30,
        }}
        renderContent={() => <main className={classes.main}>{children}</main>}
      />
 */
