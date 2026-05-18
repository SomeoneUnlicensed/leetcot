import type { Metadata } from 'next';
import { buildMetaForDefault } from '~/app/metadata';

export function generateMetadata(): Metadata {
  return buildMetaForDefault({
    title: 'Треки обучения | ЛитКот',
    description:
      'Изучайте специализированные треки задач на ЛитКот. Эти подборки помогут вам последовательно прокачать навыки в различных языках программирования.',  });
}

export { Tracks as default } from './_components';
