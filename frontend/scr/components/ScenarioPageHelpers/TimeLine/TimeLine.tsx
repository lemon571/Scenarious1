import moment from 'moment';
import { Calendar, momentLocalizer } from 'react-big-calendar';
// @ts-expect-error: locale import is a side-effect module without types
import 'moment/locale/ru';
import './TimeLine.css';

import { useEffect, useMemo, useState } from 'react';
import type { Block } from '../../../types';
import { blocksToEvents } from '../../../utils/blocksToEvents';
import { Button, Flex, Icon, Text } from '@gravity-ui/uikit';
import { ChevronLeft, ChevronRight, Clock } from '@gravity-ui/icons';
import { calculateTotalDurationFormatted } from '../../../utils/blocks';

function hexToRgba(hex: string, alpha = 0.2) {
  let c = hex.replace('#', '');
  if (c.length === 3)
    c = c
      .split('')
      .map(x => x + x)
      .join('');
  if (c.length === 8) c = c.slice(2); // если #AARRGGBB, убираем alpha
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

export function TimeLine({ blocks }: { blocks: Block[] }) {
  moment.locale('ru');
  const localizer = momentLocalizer(moment);

  const events = useMemo(() => blocksToEvents(blocks), [blocks]);

  const earliestEventDate = useMemo(() => {
    if (events.length === 0) return new Date();
    const earliestTime = Math.min(...events.map(e => e.start.getTime()));
    const date = new Date(earliestTime);
    date.setHours(0, 0, 0, 0);
    return date;
  }, [events]);

  const [currentDate, setCurrentDate] = useState<Date>(earliestEventDate);

  useEffect(() => {
    setCurrentDate(earliestEventDate);
  }, [earliestEventDate]);

  // Обрезаем лишнее время: берем минимум и максимум среди событий
  const minTime = new Date(currentDate);
  const maxTime = new Date(currentDate);
  if (events.length > 0) {
    const earliest = new Date(Math.min(...events.map(e => e.start.getTime())));
    const latest = new Date(Math.max(...events.map(e => e.end.getTime())));
    minTime.setHours(earliest.getHours(), earliest.getMinutes(), 0, 0);
    maxTime.setHours(latest.getHours(), latest.getMinutes(), 0, 0);
  } else {
    // Фолбэк, если событий нет
    minTime.setHours(8, 0, 0, 0);
    maxTime.setHours(20, 0, 0, 0);
  }

  return (
    <Flex className="timelineWrapper" gap={4} direction="column">
      <Flex justifyContent="space-between" alignItems="center">
        <Flex gap={3} alignItems="center">
          <Text variant="header-1">Таймлайн</Text>
          <Text color="secondary" variant="body-1">
            <Icon data={Clock} size={16} /> {calculateTotalDurationFormatted(blocks)}
          </Text>
        </Flex>
        <Flex gap={3}>
          <Button
            size="l"
            view="flat"
            onClick={() => setCurrentDate(new Date(currentDate.getTime() - 1000 * 3600 * 24))}
          >
            <Icon data={ChevronLeft} />
          </Button>
          <Button
            size="l"
            view="flat"
            onClick={() => setCurrentDate(new Date(currentDate.getTime() + 1000 * 3600 * 24))}
          >
            <Icon data={ChevronRight} />
          </Button>
        </Flex>
      </Flex>
      <main>
        <Calendar
          key={currentDate.toDateString()}
          culture="ru"
          toolbar={false}
          date={currentDate}
          onNavigate={(d: Date) => setCurrentDate(new Date(d))}
          events={events}
          dayLayoutAlgorithm="no-overlap"
          localizer={localizer}
          showMultiDayTimes
          defaultView="day"
          views={['day']}
          step={5}
          timeslots={1}
          min={minTime}
          max={maxTime}
          formats={{
            dayHeaderFormat: (date, culture, l) => l!.format(date, 'D MMMM YYYY, dddd', culture),
            timeGutterFormat: (date, culture, l) => l!.format(date, 'HH:mm', culture),
            eventTimeRangeFormat: ({ start, end }, culture, l) =>
              `${l!.format(start, 'HH:mm', culture)} – ${l!.format(end, 'HH:mm', culture)}`,
            agendaTimeRangeFormat: ({ start, end }, culture, l) =>
              `${l!.format(start, 'HH:mm', culture)} – ${l!.format(end, 'HH:mm', culture)}`,
          }}
          messages={{
            today: 'Сегодня',
            previous: 'Назад',
            next: 'Вперёд',
            month: 'Месяц',
            week: 'Неделя',
            work_week: 'Рабочая неделя',
            day: 'День',
            agenda: 'Повестка',
            date: 'Дата',
            time: 'Время',
            event: 'Событие',
            noEventsInRange: 'Нет событий в этом диапазоне',
          }}
          eventPropGetter={event => ({
            style: {
              backgroundColor: hexToRgba(event.color || '#1976d2', 0.2),
              color: event.color || '#1976d2',
              borderRadius: 6,
              border: 'none',
              fontWeight: 600,
            },
          })}
        />
      </main>
    </Flex>
  );
}
