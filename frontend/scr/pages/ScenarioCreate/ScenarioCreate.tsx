import {
  Avatar,
  Button,
  Card,
  Flex,
  Icon,
  Loader,
  Modal,
  Radio,
  Stepper,
  Text,
  TextArea,
  TextInput,
} from '@gravity-ui/uikit';
import { Header } from '../../components';
import styles from './ScenarioCreate.module.css';

import { DateField, DatePicker } from '@gravity-ui/date-components';
import { Eye, File, FileZipper } from '@gravity-ui/icons';
import { useState } from 'react';
import type { ScenarioTemplate } from '../../types/ScenarioTemplate';

import type { DateTime } from '@gravity-ui/date-utils';
import ScenarioPagePreview from './ScenarioPagePreview';

import UserInvitation from '../../components/UserInvitation/UserInvitaion';
import { useScenarioTemplates } from '../../hooks/useTemplates';
import SoonWrapper from '../../components/SoonWrapper/SoonWrapper';
import ErrorWrapper from '../../components/ErrorWrapper/ErrorWrapper';
import pluralize from '../../utils/pluralize';
import { useScenarioCreate } from '../../hooks/useScenarioCreate';
import LoadingWrapper from '../../components/LoadingWrapper/LoadingWrapper';
import { Link } from 'react-router-dom';

type Step = 'way' | 'details' | 'participants';
type Way = 'unset' | 'empty' | 'template';
type Form = {
  name: string;
  date: DateTime | null;
  start: DateTime | null;
  duration: DateTime | null;
  descriptin: string;
};

export default function ScenarioCreate() {
  const [step, setStep] = useState<Step>('way');
  const [way, setWay] = useState<Way>('unset');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const [creationModalOpen, setCreationModalOpen] = useState(false);

  const { data: scenarioTemplates, isLoading, isError, error } = useScenarioTemplates();
  const getErrorMessage = (e: unknown) => (e instanceof Error ? e.message : 'Ошибка при запросе');
  /* const [users, setUsers] = useState<UserType[]>(initialUsers); */

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewScenario, setPreviewScenario] = useState<ScenarioTemplate>();

  const scenarioCreateFn = useScenarioCreate();

  const handleCreation = () => {
    setCreationModalOpen(true);
    const computeStartTimestamp = () => {
      const baseDate = form.date ? new Date(form.date.valueOf()) : new Date();
      if (form.start) {
        const startDate = new Date(form.start.valueOf());
        baseDate.setHours(startDate.getHours(), startDate.getMinutes(), startDate.getSeconds(), 0);
      }
      return baseDate.getTime();
    };

    const computeDuration = () => {
      if (form.duration) {
        const durationDate = new Date(form.duration.valueOf());
        // Convert hours and minutes to milliseconds
        const hours = durationDate.getHours();
        const minutes = durationDate.getMinutes();
        return hours * 60 * 60 * 1000 + minutes * 60 * 1000;
      }
      return undefined;
    };

    if (way === 'template') {
      const template = scenarioTemplates?.find(t => t.id === selectedTemplate);
      scenarioCreateFn.mutate({
        templateId: selectedTemplate,
        body: {
          name: template?.name || 'Новый сценарий',
          description: template?.description || '',
          start_time: computeStartTimestamp(),
          duration: computeDuration(),
          // pass blocks for mock mode compatibility
          blocks: template?.blocks || [],
        },
      });
      return;
    }

    if (way === 'empty') {
      scenarioCreateFn.mutate({
        body: {
          name: form.name,
          description: form.descriptin,
          start_time: computeStartTimestamp(),
          duration: computeDuration(),
        },
      });
    }
  };

  const [form, setForm] = useState<Form>({
    name: '',
    date: null,
    start: null,
    duration: null,
    descriptin: '',
  });

  function isValidForm() {
    if (way === 'empty') {
      return (
        form.name != '' && form.duration != null && form.start != null && form.descriptin != ''
      );
    }

    if (way === 'template') {
      return selectedTemplate !== '';
    }
    return false;
  }

  const RenderStep = (step: Step, way: Way) => {
    switch (step) {
      case 'way':
        return (
          <>
            <Text variant="display-1">Как создадим сценарий?</Text>
            <div className={styles.cardsFlex}>
              <Card
                onClick={() => {
                  setStep('details');
                  setWay('empty');
                }}
                type="action"
                view="outlined"
                size="l"
                className={styles.card}
              >
                <Avatar theme="brand" icon={File} size="xl" />
                <Text variant="display-1">С нуля</Text>
                <Text variant="body-2" color="secondary">
                  Уникальный сценарий для нестандартных или объемных мероприятий
                </Text>
              </Card>
              <Card
                onClick={() => {
                  setStep('details');
                  setWay('template');
                }}
                type="action"
                view="outlined"
                size="l"
                className={styles.card}
              >
                <Avatar theme="brand" icon={FileZipper} size="xl" />
                <Text variant="display-1">По шаблону</Text>
                <Text variant="body-2" color="secondary">
                  Быстро подготовтесь ко дню рождения, лекторию или свадьбе
                </Text>
              </Card>
            </div>
          </>
        );
      case 'details':
        if (way === 'empty') {
          return (
            <>
              <div className={styles.textFlex}>
                <Text variant="display-1">Заполним всю информацию</Text>
                <Text variant="body-1" color="secondary">
                  Вы всегда сможете вернуться к редактированию сценария
                </Text>
              </div>
              <div className={styles.form}>
                <TextInput
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  size="xl"
                  view="normal"
                  placeholder="Название"
                />
                <Text variant="subheader-1" color="secondary">
                  Дата мероприятия
                </Text>
                <DatePicker
                  value={form.date}
                  size="xl"
                  view="normal"
                  format="DD.MM.YYYY"
                  onUpdate={val => setForm({ ...form, date: val })}
                />
                <Text variant="subheader-1" color="secondary">
                  Тайминг
                </Text>
                <div className={styles.inputFlex}>
                  <DateField
                    value={form.start}
                    format="HH:mm"
                    onUpdate={val => setForm({ ...form, start: val })}
                    size="l"
                    view="normal"
                    placeholder="Время начала"
                  />
                  <DateField
                    value={form.duration}
                    format="hh:mm"
                    onUpdate={val => setForm({ ...form, duration: val })}
                    size="l"
                    view="normal"
                    placeholder="Сколько идет"
                  />
                </div>
                <Text variant="subheader-1" color="secondary">
                  Описание
                </Text>
                <TextArea
                  value={form.descriptin}
                  onChange={e => setForm({ ...form, descriptin: e.target.value })}
                  placeholder="Подробнее о мероприятии"
                  size="l"
                  minRows={3}
                ></TextArea>
                <div className={styles.buttonFlex}>
                  <Button
                    onClick={() => {
                      setStep('way');
                      setWay('unset');
                    }}
                    size="l"
                    view="normal"
                  >
                    Назад
                  </Button>
                  <Button
                    disabled={!isValidForm()}
                    onClick={() => setStep('participants')}
                    size="l"
                    view="action"
                  >
                    Перейти к участникам
                  </Button>
                </div>
              </div>
            </>
          );
        } else {
          return (
            <>
              <div className={styles.textFlex}>
                <Text variant="display-1">Выберем подходящий шаблон</Text>
                <Text variant="body-1" color="secondary">
                  Собрали популярные варианты мероприятий
                </Text>
              </div>
              <div className={styles.form}>
                {isLoading && (
                  <Flex
                    justifyContent="center"
                    alignItems="center"
                    style={{ width: '100%', height: '100%', padding: '3rem' }}
                  >
                    <Loader size="l" />
                  </Flex>
                )}
                {isError && (
                  <Flex
                    justifyContent="center"
                    alignItems="center"
                    style={{ width: '100%', height: 'fit-content', padding: '3rem' }}
                  >
                    <ErrorWrapper
                      title="Не удалось загрузить шаблоны"
                      text={getErrorMessage(error)}
                    />
                  </Flex>
                )}
                <div className={styles.cardSelector}>
                  {scenarioTemplates?.map((template: ScenarioTemplate) => (
                    <Card
                      key={template.id}
                      className={`${styles.templateCard} ${selectedTemplate === template.id && styles.templateCard_active}`}
                      view="outlined"
                      type="container"
                      size="l"
                      selected={selectedTemplate === template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <div className={styles.cardBody}>
                        <div className={styles.templateHeader}>
                          <Text variant="subheader-2" ellipsis>
                            {template.name}{' '}
                          </Text>
                          <Radio
                            size="xl"
                            value={template.id}
                            checked={selectedTemplate === template.id}
                            onChange={() => setSelectedTemplate(template.id)}
                          />
                        </div>
                        <Text variant="body-1" color="complementary">
                          {template.description}
                        </Text>
                        <Text variant="caption-2" color="secondary">
                          {template.blocks?.length}{' '}
                          {pluralize(template.blocks?.length, 'блок', 'блока', 'блоков')}
                        </Text>
                      </div>
                      <div className={styles.cardFooter}>
                        <Button
                          view="normal"
                          size="l"
                          starticon="true"
                          onClick={() => {
                            setPreviewScenario(template);
                            setPreviewVisible(true);
                          }}
                        >
                          <Icon data={Eye} size={16} /> Посмотреть
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
                <div className={styles.buttonFlex}>
                  <Button
                    onClick={() => {
                      setStep('way');
                      setWay('unset');
                    }}
                    size="l"
                    view="normal"
                  >
                    Назад
                  </Button>
                  <Button
                    disabled={!isValidForm()}
                    onClick={() => setStep('participants')}
                    size="l"
                    view="action"
                  >
                    Перейти к участникам
                  </Button>
                </div>
              </div>
            </>
          );
        }
      case 'participants':
        return (
          <>
            <div className={styles.textFlex}>
              <Text variant="display-1">Пригласим участников команды</Text>
              <Text variant="body-1" color="secondary">
                Вы можете добавить участников в ваш сценарий и назначить им роли, когда они примут
                приглашение
              </Text>
            </div>
            <div className={styles.form}>
              <SoonWrapper blur="10">
                <UserInvitation></UserInvitation>
              </SoonWrapper>

              <div className={styles.buttonFlex}>
                <Button
                  onClick={() => {
                    setStep('details');
                  }}
                  size="l"
                  view="normal"
                >
                  Назад
                </Button>
                <Button
                  size="l"
                  view="action"
                  onClick={() => handleCreation()}
                  loading={scenarioCreateFn.isPending}
                  disabled={scenarioCreateFn.isPending}
                >
                  Создать сценарий
                </Button>
              </div>
            </div>
          </>
        );
      default:
        return <p>Неизвестный статус</p>;
    }
  };
  return previewVisible ? (
    <ScenarioPagePreview
      id={previewScenario?.id || ''}
      pageVisibilityHandler={setPreviewVisible}
      selectTemplate={setSelectedTemplate}
      name={previewScenario?.name || ''}
      initialBlocks={previewScenario?.blocks || []}
    />
  ) : (
    <div className={styles.scenarioCreatePage}>
      <Header></Header>
      <main className={styles.main}>
        <Stepper value={step} size="l" onUpdate={val => setStep(val as Step)}>
          <Stepper.Item id="way" view={way === 'unset' ? 'idle' : 'success'}>
            Способ создания
          </Stepper.Item>
          <Stepper.Item
            disabled={way === 'unset'}
            view={!isValidForm() ? 'idle' : 'success'}
            id="details"
          >
            Детали
          </Stepper.Item>
          <Stepper.Item disabled={!isValidForm()} id="participants">
            Участники
          </Stepper.Item>
        </Stepper>
        {RenderStep(step, way)}
        <Modal open={creationModalOpen} contentClassName={styles.modalContent}>
          <LoadingWrapper
            status={
              scenarioCreateFn.isSuccess
                ? 'success'
                : scenarioCreateFn.isError
                  ? 'error'
                  : 'loading'
            }
            title={
              scenarioCreateFn.isSuccess
                ? 'Получилось!'
                : scenarioCreateFn.isError
                  ? 'Что-то пошло не так...'
                  : 'Уже загружаю...'
            }
            text={
              scenarioCreateFn.isSuccess
                ? 'Ура! Мы успешно создали сценарий!'
                : scenarioCreateFn.isError
                  ? 'Кажется, что-то пошло не так во время создания сценария.'
                  : 'Создаю сценарий, уже скоро он станет доступен.'
            }
          ></LoadingWrapper>
          {!scenarioCreateFn.isPending && (
            <Flex gap={4} alignItems="center" justifyContent="center" style={{ width: '100%' }}>
              {scenarioCreateFn.isSuccess ? (
                <Link to={`/scenario/${scenarioCreateFn.data?._id}`}>
                  <Button size="l" view="action">
                    К сценарию
                  </Button>
                </Link>
              ) : (
                <Button
                  size="l"
                  view="normal"
                  onClick={() => {
                    setCreationModalOpen(false);
                  }}
                >
                  Закрыть
                </Button>
              )}
            </Flex>
          )}
        </Modal>
      </main>
    </div>
  );
}
