import { fontParams } from './zodParams';

const baseUrl =
  process.env.NODE_ENV === 'production' ? 'https://og.leetcot.ru' : 'http://localhost:4200';

export const fetchFont = (family: string, weight?: number, text?: string) =>
  fetch(
    `${baseUrl}/api/font?${fontParams.toSearchString({
      family,
      weight,
      text,
    })}`,
  ).then((res) => res.arrayBuffer());
