import type { Metadata } from 'next';
import { buildMetaForDefault } from '~/app/metadata';

// CI fails without this
export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return buildMetaForDefault({
    title: 'Исследовать задачки | ЛитКот',
    description:
      'Изучай алгоритмы на Python и TypeScript. Интерактивные задачи с котиками для прокачки навыков программирования.',
  });
}

import { Explore } from './_components';

export default async function Page({ searchParams }: { searchParams: Promise<any> }) {
  return <Explore searchParams={searchParams} />;
}
