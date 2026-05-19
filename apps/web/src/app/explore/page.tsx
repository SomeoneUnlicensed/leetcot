import type { Metadata } from 'next';
import { buildMetaForDefault } from '~/app/metadata';

// CI fails without this
export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return buildMetaForDefault({
    title: 'Исследовать испытания | ЛитКот',
    description:
      'Исследуйте все испытания по сложности на ЛитКот. Это интерактивные задачи по программированию, которые помогут вам изучить и улучшить свои навыки TypeScript.',
  });
}

export { Explore as default } from './_components';
