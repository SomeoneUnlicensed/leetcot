'use server';

import { auth } from '~/server/auth';
import type { Prisma, RoleTypes } from '@repo/db';
import { prisma } from '@repo/db';
import { revalidatePath } from 'next/cache';
import { assertAdmin } from '~/utils/auth-guards';

export type BannedUsers = NonNullable<Awaited<ReturnType<typeof getUsers>>>;
export async function getUsers() {
  const session = await auth();
  assertAdmin(session);

  return prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      roles: true,
    },
  });
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

  revalidatePath('/dashboard/users');
  return prisma.$transaction([
    prisma.challenge.updateMany({
      where: {
        userId,
      },
      data: {
        status: 'ACTIVE',
      },
    }),
    prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        status: 'ACTIVE',
      },
    }),
  ]);
}

export async function updateUserRoles(userId: string, roles: string[]) {
  const session = await auth();
  assertAdmin(session);

  // Get all target roles from database, creating them if they don't exist
  const roleIds = await Promise.all(
    roles.map(async (roleName) => {
      const roleRow = await prisma.role.upsert({
        where: { role: roleName as RoleTypes },
        update: {},
        create: { role: roleName as RoleTypes },
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
}
