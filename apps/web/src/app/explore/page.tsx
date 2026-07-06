import type { Metadata } from 'next';
import { buildMetaForDefault } from '~/app/metadata';

import { Explore } from './_components';

// CI fails without this
export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return buildMetaForDefault({
    title: 'Исследовать задачки | ЛитКот',
    description:
      'Выбирай задачи, решай их в редакторе и смотри прогресс. Алгоритмы, SQL и курсы ЛитКота помогают тренироваться регулярно.',
  });
}

// eslint-disable-next-line @typescript-eslint/require-await
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string[] | string | undefined>>;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Explore searchParams={searchParams as any} />;
}
