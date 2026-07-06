import type { Metadata } from 'next';
import { buildMetaForDefault } from '~/app/metadata';

export function generateMetadata(): Metadata {
  return buildMetaForDefault({
    title: 'Треки обучения | ЛитКот',
    description:
      'Проходите треки ЛитКота: задачи идут по темам, прогресс сохраняется, а автопроверка помогает не застревать на догадках.',
  });
}

export { Tracks as default } from './_components';
