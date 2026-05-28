import { prisma } from '@repo/db';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { shareToken: string } }
) {
  try {
    const exam = await prisma.exam.findUnique({
      where: { shareToken: params.shareToken },
      include: {
        questions: {
          include: {
            testCases: {
              select: {
                id: true,
                input: true,
                expectedOutput: true,
                points: true,
                timeout: true,
                // Don't expose if test case is hidden on initial fetch
                isHidden: false,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!exam) {
      return NextResponse.json(
        { error: 'Тест не найден.' },
        { status: 404 }
      );
    }

    // Check if exam is active
    const now = new Date();
    if (exam.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Этот тест недоступен.' },
        { status: 403 }
      );
    }

    if (exam.startDate && exam.startDate > now) {
      return NextResponse.json(
        { error: 'Тест еще не начался.' },
        { status: 403 }
      );
    }

    if (exam.endDate && exam.endDate < now) {
      return NextResponse.json(
        { error: 'Тест завершен.' },
        { status: 403 }
      );
    }

    // Don't expose teacher info to students or correct answers
    const { teacherId, ...examData } = exam;
    
    // Remove correct answers from questions
    const sanitizedExam = {
      ...examData,
      questions: examData.questions.map((q: any) => {
        const { correctAnswers, ...questionData } = q;
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
      { status: 500 }
    );
  }
}
