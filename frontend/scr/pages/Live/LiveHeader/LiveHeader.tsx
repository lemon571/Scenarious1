import { SquareXmark } from '@gravity-ui/icons';
import { Button, Flex, Icon, Text } from '@gravity-ui/uikit';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classes from './LiveHeader.module.css';

export default function LiveHeader() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(interval); // очищаем таймер при размонтировании
  }, []);

  const timeString = currentDate.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Flex gap={2} alignItems="center" className={classes.header}>
      <Flex alignItems="center" className={classes.timeLine} justifyContent="space-between">
        <Text color="info">Live</Text>
        <Text>Время: {timeString} МСК</Text>
      </Flex>
      <Button
        view="flat"
        onClick={() => {
          navigate('/');
        }}
      >
        <Icon data={SquareXmark} />
        <Text>Выйти </Text>
      </Button>
    </Flex>
  );
}
