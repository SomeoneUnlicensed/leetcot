import type { Metadata } from 'next';
import { buildMetaForDefault } from '~/app/metadata';

export function generateMetadata(): Metadata {
  return buildMetaForDefault({
    title: 'Newsletter | ЛитКот',
    description: 'Subscribe to the ЛитКот newsletter and stay informed about our latest updates!',
  });
}
export { Newsletter as default } from './_components';
