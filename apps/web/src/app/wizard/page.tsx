import type { Metadata } from 'next';
import { buildMetaForDefault } from '~/app/metadata';
import { Wizard } from './_components';

export function generateMetadata(): Metadata {
  return buildMetaForDefault({
    title: 'Создать задачу | ЛитКот',
    description: 'Создайте свою задачу на ЛитКот и поделитесь ею с кошачьим сообществом!',
  });
}

export default function Page() {
  return <Wizard />;
}
