import type { Metadata } from 'next';
import { buildMetaForDefault } from '~/app/metadata';
import { auth } from '~/server/auth';
import NotificationPage from './notification-page';

export function generateMetadata(): Metadata {
  return buildMetaForDefault({
    title: 'Уведомления',
    description: 'Уведомления профиля ЛитКота: ответы, упоминания и события аккаунта.',
  });
}

export default async function Page() {
  const session = await auth();

  if (!session) {
    throw new Error('not authed');
  }

  return <NotificationPage />;
}
