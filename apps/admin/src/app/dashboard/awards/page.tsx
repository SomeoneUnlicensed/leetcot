import { auth } from '~/server/auth';
import { prisma } from '@repo/db';
import { RoleTypes } from '@repo/db/types';
import { redirect } from 'next/navigation';
import { AwardBadgeForm } from './_components/award-badge-form';

const BADGES = [{ slug: 'contributor', name: 'Контрибьютер' }] as const;

const BADGE_NAMES = Object.fromEntries(BADGES.map((badge) => [badge.slug, badge.name]));

export default async function AwardsPage() {
  const session = await auth();

  if (!session?.user?.role.includes(RoleTypes.ADMIN)) {
    redirect('/');
  }

  const [users, recentAwards] = await Promise.all([
    prisma.user.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    }),
    prisma.userBadge.findMany({
      take: 20,
      orderBy: { awardedAt: 'desc' },
      select: {
        id: true,
        badgeSlug: true,
        awardedAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Награждение значками</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Выдавайте значки пользователям. Пользователь получит системное уведомление.
        </p>
      </div>
      <AwardBadgeForm badges={BADGES} users={users} />
      <div>
        <h2 className="mb-3 text-xl font-semibold">Последние награждения</h2>
        <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Пользователь</th>
                <th className="px-4 py-3 text-left font-medium">Значок</th>
                <th className="px-4 py-3 text-left font-medium">Дата</th>
              </tr>
            </thead>
            <tbody>
              {recentAwards.map((award) => (
                <tr key={award.id} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="px-4 py-3">{award.user.name ?? award.user.email}</td>
                  <td className="px-4 py-3">{BADGE_NAMES[award.badgeSlug] ?? award.badgeSlug}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(award.awardedAt).toLocaleDateString('ru-RU')}
                  </td>
                </tr>
              ))}
              {recentAwards.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-zinc-400">
                    Наград ещё нет
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
