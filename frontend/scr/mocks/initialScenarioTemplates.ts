import type { ScenarioTemplate } from '../types/ScenarioTemplate';

export const initialScenarioTemplates: ScenarioTemplate[] = [
  {
    id: 'conference',
    name: 'Конференция',
    description: 'Блоки с выступлениями и кофе брейками',
    blocksCount: 16,
    category: 'business',
    isPopular: true,
    blocks: [
      {
        id: '1',
        block_id: '1',
        title: 'Введение',
        location: 'Средний зал',
        roles: ['speaker'],
        start: 32400000, // 9:00 AM in milliseconds
        duration: 300000, // 5 minutes in milliseconds
        children: [],
        description:
          'Про историю Школ и зачем это бизнесу. Впервые мы провели Школу менеджеров Яндекса в Про историю Школ и зачем это бизнесу. Впервые мы провели Школу менеджеров Яндекса в',
        comments: [],
        color: '#3b82f6',
      },
      {
        id: '2',
        block_id: '2',
        title: 'Масштабирование',
        location: 'Средний зал',
        roles: ['lead', 'technician'],
        start: 32700000, // 9:05 AM in milliseconds
        duration: 900000, // 15 minutes in milliseconds
        children: [
          {
            id: '2.1',
            block_id: '2.1',
            title: 'Про новые треки',
            location: 'Средний зал',
            roles: ['speaker'],
            start: 33000000, // 9:10 AM in milliseconds
            duration: 300000, // 5 minutes in milliseconds
            children: [],
            description:
              'Обзор новых образовательных треков и возможностей для развития. Обзор новых образовательных треков и возможностей для развития. Обзор новых образовательных треков и возможностей для развития. Обзор новых образовательных треков и возможностей для развития.',
            comments: [],
          },
          {
            id: '2.2',
            block_id: '2.2',
            title: 'Зачем делаем в хабах (часть аудитории тут, есть проекты на местах)',
            location: 'Средний зал',
            roles: ['speaker'],
            start: 33300000, // 9:15 AM in milliseconds
            duration: 300000, // 5 minutes in milliseconds
            children: [],
            description:
              'Обсуждение стратегии развития в региональных хабах и локальных проектах. Обзор новых образовательных треков и возможностей для развития. Обзор новых образовательных треков и возможностей для развития. Обзор новых образовательных треков и возможностей для развития.',
            comments: [],
          },
        ],
        description:
          'Как правильно масштабировать проекты и команды. Основные принципы и практики...',
        comments: [],
        color: '#10b981',
      },
      {
        id: '3',
        block_id: '3',
        title: 'Интересная тема + блогер',
        location: 'Средний зал',
        roles: ['speaker', 'screenWriter'],
        start: 33600000, // 9:20 AM in milliseconds
        duration: 1200000, // 20 minutes in milliseconds
        children: [
          {
            id: '3.1',
            block_id: '3.1',
            title: 'Про новые треки',
            location: 'Средний зал',
            roles: ['speaker'],
            start: 33000000, // 9:10 AM in milliseconds
            duration: 300000, // 5 minutes in milliseconds
            children: [],
            description: 'Обзор новых образовательных треков и возможностей для развития...',
            comments: [],
          },
        ],
        description: 'Обзор новых образовательных треков и возможностей для развития...',
        comments: [],
        color: '#9370DB',
      },
      {
        id: '4',
        block_id: '4',
        title: 'Школы VS Лекторий',
        location: 'Средний зал',
        roles: ['speaker'],
        start: 34800000, // 9:40 AM in milliseconds
        duration: 900000, // 15 minutes in milliseconds
        children: [],
        description: 'Сравнение подходов к образованию в школах и лекториях...',
        comments: [],
        color: 'gray',
      },
    ],
  },
  {
    id: 'concert',
    name: 'Концерт',
    description: 'Артисты, вечеринки и важные блоки для техника',
    blocksCount: 16,
    category: 'entertainment',
    isPopular: true,
    blocks: [
      {
        id: '5.1',
        block_id: '5.1',
        title: 'Подготовка сцены',
        location: 'Главная сцена',
        roles: ['technician', 'lead'],
        start: 32400000, // 9:00 AM in milliseconds
        duration: 1800000, // 30 minutes in milliseconds
        children: [],
        description: 'Подготовка технического оборудования и сцены к выступлению',
        comments: [],
        color: '#dc2626',
      },
      {
        block_id: 'rfrfrfrfr2',
        id: 'rfrfrfrfr2',
        title: 'Выступление артистов',
        location: 'Главная сцена',
        roles: ['speaker'],
        start: 34200000, // 9:30 AM in milliseconds
        duration: 2700000, // 45 minutes in milliseconds
        children: [],
        description: 'Основное выступление артистов с музыкальной программой',
        comments: [],
        color: '#7c3aed',
      },
      {
        id: 'erfrefreferfrefre3',
        block_id: 'erfrefreferfrefre3',
        title: 'Вечеринка',
        location: 'Танцпол',
        roles: ['speaker', 'lead'],
        start: 36900000, // 10:15 AM in milliseconds
        duration: 3600000, // 60 minutes in milliseconds
        children: [],
        description: 'Танцевальная вечеринка с диджеем',
        comments: [],
        color: '#06b6d4',
      },
      {
        id: 'rferfrefrefrefreadadd',
        block_id: 'rferfrefrefrefreadadd',
        title: 'Завершение',
        location: 'Главная сцена',
        roles: ['lead', 'technician'],
        start: 40500000, // 11:15 AM in milliseconds
        duration: 900000, // 15 minutes in milliseconds
        children: [],
        description: 'Завершение мероприятия и уборка',
        comments: [],
        color: '#64748b',
      },
    ],
  },
  {
    id: 'lecture',
    name: 'Открытый Лекторий',
    description: 'Кофе брейк и деление по сценам',
    blocksCount: 16,
    category: 'education',
    isPopular: true,
    blocks: [],
  },
];
