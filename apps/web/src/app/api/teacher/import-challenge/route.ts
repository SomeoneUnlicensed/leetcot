import { prisma } from '@repo/db';
import { auth } from '~/server/auth';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Мяу! Нужно авторизоваться.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { roles: true },
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

    const { examId, challengeId, points } = await req.json();

    if (!examId || !challengeId) {
      return NextResponse.json(
        { error: 'Мяу! Укажите ID теста и ID задачи для импорта.' },
        { status: 400 },
      );
    }

    // Verify the exam belongs to this teacher
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: true },
    });

    if (!exam || exam.teacherId !== user.id) {
      return NextResponse.json(
        { error: 'Мяу! Тест не найден или у вас нет к нему доступа.' },
        { status: 403 },
      );
    }

    // Fetch the platform challenge
    const challenge = await prisma.challenge.findUnique({
      where: { id: Number(challengeId) },
    });

    if (!challenge) {
      return NextResponse.json({ error: 'Задача на платформе не найдена.' }, { status: 404 });
    }

    const difficultyPoints: Record<string, number> = {
      BEGINNER: 1,
      EASY: 2,
      MEDIUM: 3,
      HARD: 5,
      EXTREME: 10,
      EVENT: 3,
    };

    const finalPoints = points || difficultyPoints[challenge.difficulty] || 3;
    const nextOrder = exam.questions.length + 1;

    // Create the code task question
    const questionContent = `### ${challenge.name}\n\n${challenge.shortDescription}\n\n${challenge.description}`;

    const question = await prisma.examQuestion.create({
      data: {
        id: uuidv4(),
        examId,
        type: 'CODE_TASK',
        content: questionContent,
        order: nextOrder,
        points: finalPoints,
        language: 'PYTHON', // Default to Python as it is most common for school exams
      },
    });

    // Create a sample test case for the teacher to customize
    await prisma.testCase.create({
      data: {
        id: uuidv4(),
        questionId: question.id,
        input: '5',
        expectedOutput: '25',
        points: 1,
        timeout: 5000,
        isHidden: false,
      },
    });

    return NextResponse.json({
      message: 'Задача успешно импортирована в тест!',
      question,
    });
  } catch (error) {
    console.error('Import challenge error:', error);
    return NextResponse.json({ error: 'Что-то пошло не так при импорте задачи.' }, { status: 500 });
  }
}
