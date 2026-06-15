import { prisma } from '@repo/db';
import { auth } from '~/server/auth';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// POST - Create a new test case
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

    const { questionId, input, expectedOutput, points, timeout, isHidden } = await req.json();

    if (!questionId || !input || !expectedOutput) {
      return NextResponse.json(
        { error: 'Мяу! Укажите вопрос, входные данные и ожидаемый результат.' },
        { status: 400 },
      );
    }

    // Verify the question belongs to a test owned by this user
    const question = await prisma.examQuestion.findUnique({
      where: { id: questionId },
      include: {
        exam: true,
      },
    });

    if (!question || question.exam.teacherId !== user.id) {
      return NextResponse.json(
        { error: 'Мяу! Нет прав доступа к этому вопросу.' },
        { status: 403 },
      );
    }

    const testCase = await prisma.testCase.create({
      data: {
        id: uuidv4(),
        questionId,
        input,
        expectedOutput,
        points: points || 1,
        timeout: timeout || 5000,
        isHidden: isHidden || false,
      },
    });

    return NextResponse.json(
      {
        message: 'Тестовый случай успешно создан!',
        testCase,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Create test case error:', error);
    return NextResponse.json(
      { error: 'Что-то пошло не так при создании тестового случая.' },
      { status: 500 },
    );
  }
}
