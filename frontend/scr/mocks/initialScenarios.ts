import type { Scenario } from '../types/Scenario';

export const initialScenarios: Scenario[] = [
  {
    id: '689865d568de3274660a97c8',
    name: 'YANG COM',
    description: 'Мероприятие по конференции Яндекс',
    status: 'in_progress',
    start: 1755266400000,
    blocks: [],
    director_id: 'user-1',
    updatedAt: 1752718800000, // 17.07.2025
    updatedBy: { name: 'Иван', avatar: '/avatar.svg' },
    participants: [
      { name: 'Иван', avatar: '/avatar.svg' },
      { name: 'Мария', avatar: '/avatar.svg' },
    ],
  },
  {
    id: 'scn-2',
    name: 'Tech Meetup',
    description: 'Встреча технических специалистов',
    status: 'approved',
    start: 1693003200000, // 26.08.2025
    time: '14:00',
    date: '2025-08-26',
    blocks: [],
    director_id: 'user-2',
    updatedAt: 1752805200000, // 18.07.2025
    updatedBy: { name: 'Иван', avatar: '/avatar.svg' },
    participants: [{ name: 'Алексей', avatar: '/avatar.svg' }],
  },
  {
    id: 'scn-3',
    name: 'Tech Back',
    description: 'Встреча специалистов',
    status: 'ready_for_air',
    start: 1693003200000, // 26.08.2025
    time: '14:00',
    date: '2025-08-26',
    blocks: [],
    director_id: 'user-2',
    updatedAt: 1752805200000, // 18.07.2025
    updatedBy: { name: 'Иван', avatar: '/avatar.svg' },
    participants: [{ name: 'Алексей', avatar: '/avatar.svg' }],
  },
];
