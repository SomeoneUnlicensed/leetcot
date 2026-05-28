import { prisma } from '@repo/db';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Мяу! Нужно авторизоваться.' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Котик не найден.' },
        { status: 404 }
      );
    }

    // Verify exam belongs to teacher
    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
    });

    if (!exam || exam.teacherId !== user.id) {
      return NextResponse.json(
        { error: 'Мяу! Нет прав доступа к этому тесту.' },
        { status: 403 }
      );
    }

    // Get all sessions and results for this exam
    const results = await prisma.examResult.findMany({
      where: { examId: params.id },
      include: {
        session: {
          include: {
            answers: {
              include: {
                question: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate statistics
    const totalSessions = results.length;
    const avgScore = totalSessions > 0
      ? results.reduce((sum, r) => sum + r.totalScore, 0) / totalSessions
      : 0;
    const maxScoreOverall = results.length > 0
      ? results[0].maxScore
      : 0;

    return NextResponse.json({
      exam,
      results,
      statistics: {
        totalSessions,
        avgScore,
        avgPercentage: totalSessions > 0
          ? results.reduce((sum, r) => sum + r.percentage, 0) / totalSessions
          : 0,
        maxScoreOverall,
      },
    });
  } catch (error) {
    console.error('Get exam results error:', error);
    return NextResponse.json(
      { error: 'Что-то пошло не так при получении результатов.' },
      { status: 500 }
    );
  }
}
