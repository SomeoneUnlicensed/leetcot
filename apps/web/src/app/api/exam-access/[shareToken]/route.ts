import { prisma } from '@repo/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { shareToken: string } }): Promise<NextResponse> {
  try {
    const exam = await prisma.exam.findUnique({
      where: { shareToken: params.shareToken },
      include: {
        questions: {
          include: {
            testCases: {
              where: { isHidden: false },
              select: {
                id: true,
                input: true,
                expectedOutput: true,
                points: true,
                timeout: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Тест не найден.' }, { status: 404 });
    }

    // Check if exam is active
    const now = new Date();
    if (exam.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Этот тест недоступен.' }, { status: 403 });
    }

    if (exam.startDate && exam.startDate > now) {
      return NextResponse.json({ error: 'Тест еще не начался.' }, { status: 403 });
    }

    if (exam.endDate && exam.endDate < now) {
      return NextResponse.json({ error: 'Тест завершен.' }, { status: 403 });
    }

    // Don't expose teacher info to students or correct answers
    const { teacherId: _teacherId, ...examData } = exam;

    // Remove correct answers from questions
    const sanitizedExam = {
      ...examData,
      questions: examData.questions.map((q: { [key: string]: unknown }) => {
        const { correctAnswers: _correctAnswers, ...questionData } = q;
        return questionData;
      }),
    };

    return NextResponse.json({
      exam: sanitizedExam,
    });
  } catch (error) {
    console.error('Get exam by share token error:', error);
    return NextResponse.json(
      { error: 'Что-то пошло не так при получении теста.' },
      { status: 500 },
    );
  }
}
