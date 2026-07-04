import type { Metadata } from 'next';
import { buildMetaForDefault } from '~/app/metadata';

export function generateMetadata(): Metadata {
  return buildMetaForDefault({
    title: 'Новости | ЛитКот',
    description: 'Подпишитесь на новости ЛитКот и узнавайте об обновлениях первыми.',
  });
}
export { Newsletter as default } from './_components';
