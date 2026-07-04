import type { Metadata } from 'next';
import { buildMetaForDefault } from '~/app/metadata';

export function generateMetadata(): Metadata {
  return buildMetaForDefault({
    title: 'Треки обучения | ЛитКот',
    description:
      'Изучайте специализированные треки задач на ЛитКот. Эти подборки помогут последовательно прокачать код на разных языках и отдельную SQL-практику.',
  });
}

export { Tracks as default } from './_components';
