export function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
}

export function formatLongDate(ts: number, needYear = false) {
  const now = new Date();
  const date = new Date(ts);

  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
  };

  if (date.getFullYear() !== now.getFullYear() || needYear) {
    options.year = 'numeric';
  }

  return date.toLocaleDateString('ru-RU', options);
}

export function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('ru-RU', {
    hour: 'numeric',
    minute: 'numeric',
  });
}
export function formatDurationCompact(ts: number): string {
  const totalSeconds = Math.floor(ts / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatDurationByHoursMinutesAndSeconds(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);

  // Помощник для склонения
  const plural = (n: number, forms: [string, string, string]) => {
    n = Math.abs(n) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return forms[2]; // 11-19
    if (n1 > 1 && n1 < 5) return forms[1]; // 2,3,4
    if (n1 === 1) return forms[0]; // 1
    return forms[2]; // 0, 5-9, 20+
  };

  if (totalHours >= 1) {
    return `${totalHours} ${plural(totalHours, ['час', 'часа', 'часов'])}`;
  }

  if (totalMinutes >= 1) {
    return `${totalMinutes} ${plural(totalMinutes, ['минута', 'минуты', 'минут'])}`;
  }

  if (totalSeconds >= 1) {
    return `${totalSeconds} ${plural(totalSeconds, ['секунда', 'секунды', 'секунд'])}`;
  }

  return '0 секунд';
}

export const formatDuration = (durationMs: number) => {
  const totalMinutes = Math.floor(durationMs / (1000 * 60));

  if (totalMinutes < 60) {
    return `${totalMinutes} минут`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return minutes > 0 ? `${hours} ч ${minutes} мин` : `${hours} ч`;
};

export const formatDurationBlocks = (s: number) => {
  if (s < 60 * 60 * 1000) {
    return `${s / 60 / 1000} минут`;
  }
  const hours = Math.floor(s / 60 / 60 / 1000);
  const mins = (s / 60 / 1000) % 24;
  return mins > 0 ? `${hours} ч ${mins} мин` : `${hours} ч`;
};
