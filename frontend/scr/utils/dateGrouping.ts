// src/utils/groupNotificationsByDate.ts

import moment from 'moment';
// @ts-expect-error: side-effect locale import without types
import 'moment/locale/ru';
moment.locale('ru');

export type GroupKey = 'today' | 'yesterday' | 'lastWeek' | 'older';

export const groupTitles: Record<GroupKey, string> = {
  today: 'Сегодня',
  yesterday: 'Вчера',
  lastWeek: 'На этой неделе',
  older: 'Ранее',
};

export function groupKey(ts: number): GroupKey {
  const d = moment(ts).startOf('day');
  const today = moment().startOf('day');
  if (d.isSame(today, 'day')) return 'today';
  if (d.isSame(moment(today).subtract(1, 'day'), 'day')) return 'yesterday';
  if (d.isAfter(moment(today).subtract(1, 'week'))) return 'lastWeek';
  return 'older';
}
