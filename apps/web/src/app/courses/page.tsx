import type { Metadata } from 'next';
import { buildMetaForDefault } from '~/app/metadata';

export function generateMetadata(): Metadata {
  return buildMetaForDefault({
    title: 'Курсы | ЛитКот',
    description:
      'Изучайте структурированные курсы на ЛитКот. Каждый курс объединяет несколько треков для последовательного и глубокого обучения.',
  });
}

export { CoursesPage as default } from './_components';
