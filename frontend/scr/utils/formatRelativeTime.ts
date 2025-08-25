export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));

  if (years > 0) {
    return `${years}г. назад`;
  } else if (days > 0) {
    return `${days}д. назад`;
  } else if (hours > 0) {
    return `${hours}ч. назад`;
  } else if (minutes > 0) {
    return `${minutes}мин. назад`;
  } else {
    return 'только что';
  }
};
