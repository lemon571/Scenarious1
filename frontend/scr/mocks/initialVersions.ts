import type { Version } from '../types/Version';

const now = new Date();

function at(date: Date, h: number, m: number) {
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const yesterday = new Date(today);
const lastWeek = new Date(today);
yesterday.setDate(today.getDate() - 1);
lastWeek.setDate(today.getDate() - 7);

export const initialVersions: Version[] = [
  { id: 'v-current', createdAt: at(today, 12, 47), authorName: 'Вячеслав', isCurrent: true, authorAvatar: '' },
  { id: 'v-today-1', createdAt: at(today, 11, 40), authorName: 'Вячеслав', authorAvatar: '' },
  { id: 'v-today-2', createdAt: at(today, 11, 40), authorName: 'Вячеслав', authorAvatar: '' },
  { id: 'v-yesterday-1', createdAt: at(yesterday, 11, 40), authorName: 'Вячеслав', authorAvatar: '' },
  { id: 'v-lastweek-1', createdAt: at(lastWeek, 11, 40), authorName: 'Вячеслав', authorAvatar: '' },
  { id: 'v-lastweek-2', createdAt: at(lastWeek, 11, 40), authorName: 'Вячеслав', authorAvatar: '' },
]; 