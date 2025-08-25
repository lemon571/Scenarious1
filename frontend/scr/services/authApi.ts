import api from './axios';

export const sendCodeToBackend = async (code: string) => {
  const response = await api.get(`/auth/yandex?code=${encodeURIComponent(code)}`);

  if (!response) {
    throw new Error('Ошибка при отправке code на backend');
  }

  return response;
};

// был git stash !!!
