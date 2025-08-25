import { Button, Flex, Icon, Text } from '@gravity-ui/uikit';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import YandexIcon from '../../components/Icons/YandexIcon';
import { sendCodeToBackend } from '../../services/authApi';
import classes from './Auth.module.css';
import SoonWrapper from '../../components/SoonWrapper/SoonWrapper';

const CLIENT_ID = import.meta.env.VITE_YANDEX_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_YANDEX_REDIRECT_URI;
const authUrl = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

export default function Auth() {
  const navigate = useNavigate();

  const sendCodeMutation = useMutation({
    mutationFn: sendCodeToBackend,
    onSuccess: data => {
      console.log('Ответ от backend:', data);
      navigate('/');
    },
    onError: error => {
      if (error) {
        console.error('Ошибка при отправке code на backend:', error.message);
      } else {
        console.error('Неизвестная ошибка:', error);
      }
    },
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      sendCodeMutation.mutate(code);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [sendCodeMutation]);

  const handleYandexAuth = () => {
    window.location.href = authUrl;
  };

  return (
    <div className={classes.authContainer}>
      <img src="/logo.svg" alt="Scenariosus logo" width={240} height={50} />
      <div className={classes.authContent}>
        <SoonWrapper msg="Чиним..." blur={'20'}>
          <Flex
            style={{ minHeight: '600px' }}
            gap={3}
            direction="column"
            justifyContent="center"
            alignItems="center"
          >
            <div className={classes.flexText}>
              <Text variant="header-2">Привет!</Text>
              <Text variant="body-2" color="secondary" style={{ textAlign: 'center' }}>
                Добро пожаловать в сервис, где ты можешь создавать сценарии к мероприятиям
                <br />и работать в команде в одном месте
              </Text>
            </div>
            <div style={{ width: 'fit-content' }}>
              <Button
                view="action"
                size="l"
                state="default"
                starticon="true"
                onClick={handleYandexAuth}
              >
                <Icon data={YandexIcon}></Icon>
                <Text variant="body-2">Войти с Яндекс ID</Text>
              </Button>
            </div>
          </Flex>
        </SoonWrapper>
      </div>
    </div>
  );
}
