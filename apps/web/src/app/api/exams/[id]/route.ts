import { prisma } from '@repo/db';
import { auth } from '~/server/auth';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Мяу! Нужно авторизоваться.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Котик не найден.' }, { status: 404 });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
      include: {
        questions: {
          include: {
            testCases: true,
          },
        },
        sessions: true,
        results: true,
      },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Тест не найден.' }, { status: 404 });
    }

    // Check if user is the teacher of this exam or admin
    if (exam.teacherId !== user.id) {
      return NextResponse.json({ error: 'Мяу! Нет прав доступа к этому тесту.' }, { status: 403 });
    }

    return NextResponse.json({ exam });
  } catch (error) {
    console.error('Get exam error:', error);
    return NextResponse.json(
      { error: 'Что-то пошло не так при получении теста.' },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Мяу! Нужно авторизоваться.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Котик не найден.' }, { status: 404 });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Тест не найден.' }, { status: 404 });
    }

    // Check if user is the teacher of this exam
    if (exam.teacherId !== user.id) {
      return NextResponse.json({ error: 'Мяу! Нет прав доступа к этому тесту.' }, { status: 403 });
    }

    const {
      title,
      description,
      classLevel,
      status,
      startDate,
      endDate,
      maxAttempts,
      showResultsImmediately,
    } = await req.json();

    const updatedExam = await prisma.exam.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(classLevel && { classLevel }),
        ...(status && { status }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(maxAttempts !== undefined && { maxAttempts }),
        ...(showResultsImmediately !== undefined && { showResultsImmediately }),
      },
      include: {
        questions: {
          include: {
            testCases: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Тест успешно обновлен!',
      exam: updatedExam,
    });
  } catch (error) {
    console.error('Update exam error:', error);
    return NextResponse.json(
      { error: 'Что-то пошло не так при обновлении теста.' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Мяу! Нужно авторизоваться.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Котик не найден.' }, { status: 404 });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Тест не найден.' }, { status: 404 });
    }

    // Check if user is the teacher of this exam
    if (exam.teacherId !== user.id) {
      return NextResponse.json({ error: 'Мяу! Нет прав доступа к этому тесту.' }, { status: 403 });
    }

    await prisma.exam.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: 'Тест успешно удален!',
    });
  } catch (error) {
    console.error('Delete exam error:', error);
    return NextResponse.json({ error: 'Что-то пошло не так при удалении теста.' }, { status: 500 });
  }
}
