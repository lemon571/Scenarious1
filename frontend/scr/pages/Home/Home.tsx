import {
  Magnifier as magnifierIcon,
  SquarePlus as plusIcon,
  FaceRobot as robotIcon,
} from '@gravity-ui/icons';
import { Button, Flex, Icon, Loader, Popover, Select, Text, TextInput } from '@gravity-ui/uikit';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components';
import EventCard from '../../components/EventCard/EventCard';
import { useScenariosByUser } from '../../hooks/useScenariosByUser';
import type { scenarioStatus } from '../../types';
import { getStatusDisplayName, scenarioStatuses } from '../../utils/scenarioStatusMapping';
import styles from './Home.module.css';
import ErrorWrapper from '../../components/ErrorWrapper/ErrorWrapper';

export default function Home() {
  const { data: scenarios, isLoading, isError, error } = useScenariosByUser();

  type Filter = {
    status: scenarioStatus[];
    search: string;
  };
  const [filter, setFilter] = useState<Filter>({ status: [], search: '' });

  const getErrorMessage = (e: unknown) => (e instanceof Error ? e.message : 'Ошибка при запросе');

  if (isLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" style={{ width: '100%', height: '100%' }}>
        <Loader size="l" />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Flex
        direction="column"
        justifyContent="center"
        alignItems="center"
        style={{ width: '100%', height: '100%' }}
      >
        <ErrorWrapper
          title="Не удалось загрузить сценарии"
          text={getErrorMessage(error)}
        ></ErrorWrapper>
      </Flex>
    );
  }

  return (
    <div className={styles.homePage}>
      <Header></Header>
      <div className={styles.subheader}>
        <div className={styles.flexColumn}>
          <Text variant="display-1">Все сценарии</Text>
          <Text variant="body-1">Управляйте вашими мероприятиями</Text>
        </div>
        <div className={styles.flex}>
          <Popover
            hasArrow
            placement="bottom-end"
            content={
              <Flex direction="column" style={{ padding: '10px', maxWidth: '300px' }}>
                <Text variant="subheader-1">Не всё сразу)</Text>
                <Text variant="body-1">
                  Такое тоже, конечно, будет. Осталось только взять всю команду в штат...
                </Text>
              </Flex>
            }
          >
            <Button view="outlined-utility" size="l" state="default">
              <Icon data={robotIcon} size={16} />
              Создать с помощью AI
            </Button>
          </Popover>
          <Link to="/scenario/create">
            <Button view="action" size="l" state="default">
              <Icon size={16} data={plusIcon} />
              Новый сценарий
            </Button>
          </Link>
        </div>
      </div>
      <div className={styles.searchPanel}>
        <div className={styles.searchLeft}>
          <TextInput
            className={styles.searchInput}
            onUpdate={val => {
              setFilter({ ...filter, search: val });
            }}
            startContent={
              <Icon
                className={styles.searchIcon}
                fill="text/secondary"
                data={magnifierIcon}
                size={16}
              />
            }
            size="l"
            view="normal"
            placeholder="Поиск по сценариям"
          />

          <Select
            value={filter.status}
            onUpdate={(val: string[]) => setFilter({ ...filter, status: val as scenarioStatus[] })}
            multiple
            view="normal"
            size="l"
            placeholder="Статус"
            width="max"
          >
            {scenarioStatuses.map(status => (
              <Select.Option value={status} key={status}>
                {getStatusDisplayName(status)}
              </Select.Option>
            ))}
          </Select>
        </div>
        <Text variant="body-1" color="secondary">
          {scenarios?.length || 0} сценариев
        </Text>
      </div>
      <main className={styles.main}>
        {scenarios?.map(
          scenario =>
            Object.values(scenario).some(value =>
              String(value).toLowerCase().includes(filter.search),
            ) &&
            (filter.status.length === 0 || filter.status.includes(scenario.status)) && (
              <EventCard key={scenario.id} {...scenario} />
            ),
        )}
      </main>
    </div>
  );
}
