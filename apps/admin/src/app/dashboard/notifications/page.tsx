import { auth } from '~/server/auth';
import { assertAdmin } from '~/utils/auth-guards';
import { prisma } from '@repo/db';
import { NotificationsForm } from './_components/notifications-form';

export default async function NotificationsPage() {
  const session = await auth();
  assertAdmin(session);

  const users = await prisma.user.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Кастомные уведомления</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Отправляйте системные уведомления конкретному пользователю или транслируйте их всем
          участникам платформы.
        </p>
      </div>
      <div className="grid gap-6">
        <NotificationsForm users={users} />
      </div>
    </div>
  );
}
