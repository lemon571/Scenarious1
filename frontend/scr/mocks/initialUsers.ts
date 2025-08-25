export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  status: 'current' | 'invited' | 'accepted';
}

export const initialUsers: User[] = [
  {
    id: '1',
    name: 'Вячеслав (Вы)',
    email: 'ramloygirgo@yandex.ru',
    avatar: '',
    role: 'Администратор',
    status: 'current',
  },
  {
    id: '2',
    name: 'Пользователь',
    email: '12394yaghj@yandex.ru',
    avatar: '',
    role: '',
    status: 'invited',
  },
  {
    id: '3',
    name: 'Пользователь',
    email: 'syuie02@gmail.com',
    avatar: '',
    role: '',
    status: 'invited',
  },
]; 