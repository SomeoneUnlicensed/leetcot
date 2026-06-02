import { faker } from '@faker-js/faker';
import { type Prisma } from '@prisma/client';
import uuidByString from 'uuid-by-string';

const trashId = uuidByString('trash-user');

const catComments = [
  'Отличная задачка! Решил через рекурсию 🐾',
  'Мне понравилось, но можно было бы добавить больше примеров',
  'Котик одобряет это решение! 😺',
  'А можно подсказку? Застрял на втором тесте...',
  'Решил за 5 минут, спасибо за задачу!',
  'Интересный подход с использованием generic типов',
  'Кажется, есть более элегантное решение',
  'Наконец-то разобрался с conditional types!',
  'Этот трек супер полезный для изучения TypeScript',
  'Спасибо автору за подробное описание 🐱',
  'Хорошая задача для тренировки mapped types',
  'Мяу! Все тесты пройдены с первого раза!',
  'Сложная задача, но очень поучительная',
  'Не сразу понял условие, но потом разобрался',
  'Классная серия задач, хочу ещё!',
];

export function createComment(
  commentNumber: number,
  parentId?: number,
): Prisma.CommentCreateManyInput {
  const text = parentId
    ? `Ответ на комментарий: ${catComments[commentNumber % catComments.length]}`
    : catComments[commentNumber % catComments.length]!;
  return {
    text,
    userId: trashId,
    parentId,
    createdAt: faker.date.past(),
  };
}
