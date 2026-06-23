'use server';

import { auth } from '~/server/auth';
import { prisma } from '@repo/db';
import { assertAdmin } from '~/utils/auth-guards';
import { revalidatePath } from 'next/cache';

const BADGE_NAMES: Record<string, string> = {
  contributor: 'Контрибьютер',
};

export async function awardBadgeAction(data: { toUserId: string; badgeSlug: string }) {
  const session = await auth();
  assertAdmin(session);

  const fromUserId = session?.user?.id;
  if (!fromUserId) throw new Error('Пользователь не авторизован');
  if (!data.toUserId) throw new Error('Не выбран пользователь');
  if (!data.badgeSlug) throw new Error('Не выбран значок');

  await prisma.userBadge.upsert({
    where: {
      userId_badgeSlug: {
        userId: data.toUserId,
        badgeSlug: data.badgeSlug,
      },
    },
    update: {},
    create: {
      userId: data.toUserId,
      badgeSlug: data.badgeSlug,
    },
  });

  const badgeName = BADGE_NAMES[data.badgeSlug] ?? data.badgeSlug;

  await prisma.notification.create({
    data: {
      type: 'SYSTEM',
      toUserId: data.toUserId,
      fromUserId,
      blurb: `🎖️ Вы получили значок «${badgeName}»!`,
      url: `/badges/${data.badgeSlug}`,
    },
  });

  revalidatePath('/dashboard/awards');
  return { success: true };
}
