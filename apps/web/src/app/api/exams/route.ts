import { prisma } from '@repo/db';
import { auth } from '~/server/auth';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET(_req: Request) {
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

    // Check if user has TEACHER role
    const hasTeacherRole = user.roles.some((role) => role.role === 'TEACHER');
    if (!hasTeacherRole) {
      return NextResponse.json(
        { error: 'Мяу! Нет прав доступа. Требуется роль учителя.' },
        { status: 403 },
      );
    }

    // Get all exams created by this teacher
    const exams = await prisma.exam.findMany({
      where: { teacherId: user.id },
      include: {
        questions: true,
        sessions: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ exams });
  } catch (error) {
    console.error('Get exams error:', error);
    return NextResponse.json(
      { error: 'Что-то пошло не так при получении тестов.' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
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

    // Check if user has TEACHER role
    const hasTeacherRole = user.roles.some((role) => role.role === 'TEACHER');
    if (!hasTeacherRole) {
      return NextResponse.json(
        { error: 'Мяу! Нет прав доступа. Требуется роль учителя.' },
        { status: 403 },
      );
    }

    const {
      title,
      description,
      classLevel,
      startDate,
      endDate,
      maxAttempts,
      showResultsImmediately,
    } = await req.json();

    if (!title || !classLevel) {
      return NextResponse.json({ error: 'Мяу! Укажите название теста и класс.' }, { status: 400 });
    }

    const exam = await prisma.exam.create({
      data: {
        title,
        description: description || '',
        classLevel,
        shareToken: uuidv4(),
        teacherId: user.id,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        maxAttempts: maxAttempts || 1,
        showResultsImmediately: showResultsImmediately !== false,
        status: 'DRAFT',
      },
    });

    return NextResponse.json(
      {
        message: 'Тест успешно создан!',
        exam,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Create exam error:', error);
    return NextResponse.json({ error: 'Что-то пошло не так при создании теста.' }, { status: 500 });
  }
}
