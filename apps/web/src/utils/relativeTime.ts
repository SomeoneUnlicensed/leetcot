import { formatDistanceToNow, formatDistanceToNowStrict } from 'date-fns';
import { ru } from 'date-fns/locale';

export const getRelativeTimeStrict = (date: Date | string) => {
  if (typeof date === 'string') date = new Date(date);
  return formatDistanceToNowStrict(date, {
    addSuffix: true,
    locale: ru,
  });
};

export const getRelativeTime = (date: Date | string) => {
  if (typeof date === 'string') date = new Date(date);
  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: ru,
  });
};
