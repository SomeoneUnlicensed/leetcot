'use server';

import { prisma } from '@repo/db';
import { revalidatePath } from 'next/cache';
import { auth } from '~/server/auth';

export async function enrollUserInCourse(courseId: number) {
  const session = await auth();
  if (!session?.user?.id) {
    return 'Пользователь не авторизован';
  }

  // Verify user exists in DB
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return 'Пользователь не найден в базе данных';
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { tracks: true },
  });

  if (!course) {
    return 'Курс не найден';
  }

  try {
    // Enroll user in the course
    await prisma.course.update({
      where: { id: courseId },
      data: {
        enrolledUsers: {
          connect: { id: user.id },
        },
      },
    });

    // Auto-enroll user into all tracks of this course
    for (const track of course.tracks) {
      try {
        await prisma.track.update({
          where: { id: track.id },
          data: {
            enrolledUsers: {
              connect: { id: user.id },
            },
          },
        });
      } catch {
        // User may already be enrolled in this track, skip
      }
    }
  } catch (e: any) {
    console.error('Ошибка при записи на курс:', e);
    return 'Ошибка при записи на курс';
  }

  revalidatePath(`/courses/${course.slug}`);
  revalidatePath('/courses');
  revalidatePath('/tracks');
}

export async function unenrollUserFromCourse(courseId: number) {
  const session = await auth();
  if (!session?.user?.id) {
    return 'Пользователь не авторизован';
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    return 'Курс не найден';
  }

  try {
    await prisma.course.update({
      where: { id: courseId },
      data: {
        enrolledUsers: {
          disconnect: { id: session.user.id },
        },
      },
    });
  } catch (e: any) {
    console.error('Ошибка при отписке от курса:', e);
    return 'Ошибка при отписке от курса';
  }

  revalidatePath(`/courses/${course.slug}`);
  revalidatePath('/courses');
}
