export const sortKeys = [
  {
    label: 'Сначала новые',
    value: 'newest',
    key: 'createdAt',
    order: 'desc',
  },
  {
    label: 'Сначала старые',
    value: 'oldest',
    key: 'createdAt',
    order: 'asc',
  },
  {
    label: 'Больше голосов',
    value: 'votes',
    key: 'vote',
    order: 'desc',
  },
  {
    label: 'Больше ответов',
    value: 'replies',
    key: 'replies',
    order: 'desc',
  },
] as const;

export const commentErrors = {
  empty: { title: 'Пустой комментарий', description: 'Нельзя отправить пустой комментарий.' },
  unauthorized: {
    title: 'Нужен вход',
    description: 'Войдите в аккаунт, чтобы оставить комментарий.',
  },
  unexpected: {
    title: 'Что-то пошло не так',
    description: 'Не удалось удалить комментарий.',
  },
  invalidId: { title: 'Некорректный комментарий', description: 'ID комментария некорректен.' },
};
