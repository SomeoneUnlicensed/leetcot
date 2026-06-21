import { prisma } from '@repo/db';
import { auth } from '~/server/auth';
import { NextResponse } from 'next/server';

export async function GET(_req: Request): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Мяу! Нужно авторизоваться.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        roles: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Котик не найден.' }, { status: 404 });
    }

    const hasTeacherRole = user.roles.some(
      (role) => role.role === 'TEACHER' || role.role === 'ADMIN',
    );
    if (!hasTeacherRole) {
      return NextResponse.json(
        { error: 'Мяу! Нет прав доступа. Требуется роль учителя.' },
        { status: 403 },
      );
    }

    const challenges = await prisma.challenge.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        difficulty: true,
        description: true,
        shortDescription: true,
        language: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ challenges });
  } catch (error) {
    console.error('Fetch challenges for teacher error:', error);
    return NextResponse.json(
      { error: 'Что-то пошло не так при загрузке базы задач.' },
      { status: 500 },
    );
  }
}
