'use server';

import { auth } from '~/server/auth';
import { prisma } from '@repo/db';
import { assertAdmin } from '~/utils/auth-guards';
import { revalidatePath } from 'next/cache';

export async function sendNotificationAction(data: {
  targetType: 'all' | 'user';
  toUserId?: string;
  blurb: string;
  url: string;
}) {
  const session = await auth();
  assertAdmin(session);

  const fromUserId = session?.user?.id;
  if (!fromUserId) throw new Error('Пользователь не авторизован');

  if (data.targetType === 'all') {
    const users = await prisma.user.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true },
    });

    await prisma.notification.createMany({
      data: users.map((u) => ({
        type: 'SYSTEM',
        toUserId: u.id,
        fromUserId,
        blurb: data.blurb,
        url: data.url || '/',
      })),
    });
  } else {
    if (!data.toUserId) throw new Error('Не выбран получатель');
    await prisma.notification.create({
      data: {
        type: 'SYSTEM',
        toUserId: data.toUserId,
        fromUserId,
        blurb: data.blurb,
        url: data.url || '/',
      },
    });
  }

  revalidatePath('/dashboard/notifications');
  return { success: true };
}
