'use server';

import { auth } from '~/server/auth';
import type { Prisma, RoleTypes } from '@repo/db';
import { hashPassword, prisma } from '@repo/db';
import { revalidatePath } from 'next/cache';
import { assertAdmin } from '~/utils/auth-guards';

const ALL_ROLES: RoleTypes[] = [
  'USER',
  'ADMIN',
  'MODERATOR',
  'CREATOR',
  'SUPPORTER',
  'CONTRIBUTOR',
  'BUSINESS_ADMIN',
  'CHAMPIONSHIP_MANAGER',
  'TEACHER',
  'STUDENT',
];

export type ActionResult = { message: string; ok: false } | { message: string; ok: true };

export type BannedUsers = NonNullable<Awaited<ReturnType<typeof getUsers>>>;
export async function getUsers() {
  const session = await auth();
  assertAdmin(session);
  const now = new Date();

  return prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      roles: true,
      sessions: {
        where: { expires: { gt: now } },
        select: { id: true, expires: true },
      },
      _count: {
        select: {
          submission: true,
          comment: true,
          challenge: true,
          accounts: true,
        },
      },
    },
  });
}

export async function getUserStats() {
  const session = await auth();
  assertAdmin(session);
  const now = new Date();

  const [total, verified, unverified, banned, activeSessions] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { emailVerified: { not: null } } }),
    prisma.user.count({ where: { emailVerified: null } }),
    prisma.user.count({ where: { status: 'BANNED' } }),
    prisma.session.count({ where: { expires: { gt: now } } }),
  ]);

  return { total, verified, unverified, banned, activeSessions };
}
/**
 * The function updates the user to indicate a status
 * of `BANNED`.
 * @param userId The id of the user.
 * @param reportId Optional id of the report.
 * @returns
 */
export async function banUser(userId: string, reportId?: number | null, banReason?: string) {
  const session = await auth();
  assertAdmin(session);

  const updates: Prisma.PrismaPromise<unknown>[] = [
    prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        status: 'BANNED',
        banReason,
      },
    }),
    prisma.challenge.updateMany({
      where: {
        userId,
      },
      data: {
        status: 'BANNED',
      },
    }),
    prisma.session.deleteMany({
      where: {
        userId,
      },
    }),
    prisma.comment.updateMany({
      where: {
        userId,
      },
      data: {
        visible: false,
      },
    }),
  ];

  if (reportId !== undefined && reportId !== null) {
    updates.push(
      prisma.report.update({
        where: {
          id: reportId,
        },
        data: {
          status: 'CLEARED',
          moderatorId: session?.user?.id,
          updatedAt: new Date(),
        },
      }),
    );
  }

  await prisma.$transaction(updates);
  revalidatePath('/dashboard/users');
}
/**
 * The function lifts the ban off the user i.e. updates
 * the status to `ACTIVE`.
 * @param userId The id of the user.
 * @returns
 */
export async function unbanUser(userId: string) {
  const session = await auth();
  assertAdmin(session);

  await prisma.$transaction([
    prisma.challenge.updateMany({
      where: {
        userId,
      },
      data: {
        status: 'ACTIVE',
      },
    }),
    prisma.comment.updateMany({
      where: {
        userId,
      },
      data: {
        visible: true,
      },
    }),
    prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        status: 'ACTIVE',
        banReason: null,
      },
    }),
  ]);

  revalidatePath('/dashboard/users');
}

export async function updateUserRoles(userId: string, roles: string[]) {
  const session = await auth();
  assertAdmin(session);
  const normalizedRoles = Array.from(
    new Set(roles.map((role) => role.trim().toUpperCase()).filter(Boolean)),
  ) as RoleTypes[];

  if (normalizedRoles.some((role) => !ALL_ROLES.includes(role))) {
    return { ok: false, message: 'Есть неизвестная роль.' } satisfies ActionResult;
  }

  // Get all target roles from database, creating them if they don't exist
  const roleIds = await Promise.all(
    normalizedRoles.map(async (roleName) => {
      const roleRow = await prisma.role.upsert({
        where: { role: roleName },
        update: {},
        create: { role: roleName },
      });
      return { id: roleRow.id };
    }),
  );

  // Update user's roles
  await prisma.user.update({
    where: { id: userId },
    data: {
      roles: {
        set: roleIds,
      },
    },
  });

  revalidatePath('/dashboard/users');
  return { ok: true, message: 'Роли обновлены.' } satisfies ActionResult;
}

export async function verifyUserEmail(userId: string) {
  const session = await auth();
  assertAdmin(session);

  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: new Date() },
  });

  revalidatePath('/dashboard/users');
  return { ok: true, message: 'Email подтвержден.' } satisfies ActionResult;
}

export async function updateUserProfile(userId: string, data: { name: string; email: string }) {
  const session = await auth();
  assertAdmin(session);
  const email = data.email.trim().toLowerCase();
  const name = data.name.trim();

  if (!email || !name) {
    return { ok: false, message: 'Имя и email обязательны.' } satisfies ActionResult;
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { name, email },
    });
  } catch {
    return { ok: false, message: 'Не удалось обновить: возможно, email уже занят.' };
  }

  revalidatePath('/dashboard/users');
  return { ok: true, message: 'Пользователь обновлен.' } satisfies ActionResult;
}

export async function updateUserPassword(userId: string, password: string) {
  const session = await auth();
  assertAdmin(session);

  if (password.length < 3) {
    return { ok: false, message: 'Пароль слишком короткий.' } satisfies ActionResult;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { password: await hashPassword(password) },
  });
  await prisma.session.deleteMany({ where: { userId } });

  revalidatePath('/dashboard/users');
  return { ok: true, message: 'Пароль обновлен, старые сессии сброшены.' } satisfies ActionResult;
}

export async function deleteUser(userId: string) {
  const session = await auth();
  assertAdmin(session);

  if (session?.user?.id === userId) {
    return { ok: false, message: 'Нельзя удалить самого себя.' } satisfies ActionResult;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: true,
      _count: { select: { challenge: true, comment: true, submission: true } },
    },
  });

  if (!user) {
    return { ok: false, message: 'Пользователь не найден.' } satisfies ActionResult;
  }

  if (user.roles.some((role) => role.role === 'ADMIN')) {
    return { ok: false, message: 'Админа удалять нельзя: сначала снимите роль ADMIN.' };
  }

  if (user._count.challenge || user._count.comment || user._count.submission) {
    return {
      ok: false,
      message:
        'У пользователя есть контент/посылки. Сначала забаньте или разберите данные вручную.',
    };
  }

  try {
    await prisma.$transaction([
      prisma.session.deleteMany({ where: { userId } }),
      prisma.account.deleteMany({ where: { userId } }),
      prisma.verificationToken.deleteMany({
        where: {
          OR: [
            { identifier: user.email },
            { identifier: { startsWith: `register:${user.email}:` } },
          ],
        },
      }),
      prisma.user.update({ where: { id: userId }, data: { roles: { set: [] } } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);
  } catch {
    return { ok: false, message: 'Удаление не прошло: у пользователя остались связанные данные.' };
  }

  revalidatePath('/dashboard/users');
  return { ok: true, message: 'Пользователь удален.' } satisfies ActionResult;
}

export async function deleteUnverifiedUsers() {
  const session = await auth();
  assertAdmin(session);

  const staleUsers = await prisma.user.findMany({
    where: {
      emailVerified: null,
      challenge: { none: {} },
      comment: { none: {} },
      submission: { none: {} },
    },
    select: { id: true, email: true },
  });

  for (const user of staleUsers) {
    await prisma.$transaction([
      prisma.session.deleteMany({ where: { userId: user.id } }),
      prisma.account.deleteMany({ where: { userId: user.id } }),
      prisma.verificationToken.deleteMany({
        where: {
          OR: [
            { identifier: user.email },
            { identifier: { startsWith: `register:${user.email}:` } },
          ],
        },
      }),
      prisma.user.update({ where: { id: user.id }, data: { roles: { set: [] } } }),
      prisma.user.delete({ where: { id: user.id } }),
    ]);
  }

  revalidatePath('/dashboard/users');
  return {
    ok: true,
    message: `Удалено неподтвержденных пользователей: ${staleUsers.length}.`,
  } satisfies ActionResult;
}
