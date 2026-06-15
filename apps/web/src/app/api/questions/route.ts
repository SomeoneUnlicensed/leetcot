import { prisma } from '@repo/db';
import { auth } from '~/server/auth';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// POST - Create a new question
export async function POST(req: Request) {
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

    const { examId, type, content, order, points, language, options, correctAnswers } =
      await req.json();

    if (!examId || !type || !content) {
      return NextResponse.json(
        { error: 'Мяу! Укажите тест, тип вопроса и содержание.' },
        { status: 400 },
      );
    }

    // Verify the exam belongs to this user
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam || exam.teacherId !== user.id) {
      return NextResponse.json({ error: 'Мяу! Нет прав доступа к этому тесту.' }, { status: 403 });
    }

    const question = await prisma.examQuestion.create({
      data: {
        id: uuidv4(),
        examId,
        type,
        content,
        order: order || 0,
        points: points || 1,
        language: language || undefined,
        options: options || null,
        correctAnswers: correctAnswers || null,
      },
    });

    return NextResponse.json(
      {
        message: 'Вопрос успешно создан!',
        question,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Create question error:', error);
    return NextResponse.json(
      { error: 'Что-то пошло не так при создании вопроса.' },
      { status: 500 },
    );
  }
}
