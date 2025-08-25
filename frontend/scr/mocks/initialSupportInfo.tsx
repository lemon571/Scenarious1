// mock.ts
export interface SupportItemData {
  date: string; // формат 'YYYY-MM-DD'
  title: string;
  description: string;
  imageUrl: string; // массив путей к изображениям
}

// mock.ts

export const initialSupportInfo: SupportItemData[] = [
  {
    date: '03 Jul 2025', // строка в формате "03 Jul 2025"
    title: 'Добавления раздела Команд',
    description: 'Теперь вы сможете назначать роли участникам своих команд в одном месте',
    imageUrl: '/supportPicture.svg',
  },
  {
    date: '01 Jul 2025', // строка в формате "03 Jul 2025"
    title: 'Добавления раздела Команд2',
    description: 'Теперь вы сможете назначать роли участникам своих команд в одном месте',
    imageUrl: '',
  },
  //   {
  //     date: '2025-08-11',
  //     title: 'Добавления раздела Команд',
  //     description: 'Теперь вы сможете назначать роли участникам своих команд в одном месте.',
  //     imageUrls: ['./supportPicture1.svg', './supportPicture2.svg'],
  //   },
  //   {
  //     date: '2025-07-25',
  //     title: 'Новая система уведомлений',
  //     description: 'Уведомления теперь можно фильтровать по типу и проекту.',
  //     imageUrls: ['./notifications.svg'],
  //   },
  //   {
  //     date: '2025-06-15',
  //     title: 'Экспорт отчётов в PDF',
  //     description: 'Теперь можно экспортировать любые отчёты в формате PDF с логотипом компании.',
  //     imageUrls: ['./pdf-export-1.svg', './pdf-export-2.svg', './pdf-export-3.svg'],
  //   },
];
