import { prisma } from '@repo/db';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// GET - Get session and current progress
export async function GET(
  req: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await prisma.examSession.findUnique({
      where: { id: params.sessionId },
      include: {
        answers: true,
        result: true,
        exam: {
          include: {
            questions: {
              include: {
                testCases: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Сессия не найдена.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      session,
    });
  } catch (error) {
    console.error('Get session error:', error);
    return NextResponse.json(
      { error: 'Что-то пошло не так при получении сессии.' },
      { status: 500 }
    );
  }
}

// PUT - Save answer(s) or submit exam
export async function PUT(
  req: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const {
      questionId,
      answer,
      action, // 'save' or 'submit'
    } = await req.json();

    // Find the session
    const session = await prisma.examSession.findUnique({
      where: { id: params.sessionId },
      include: {
        answers: true,
        exam: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Сессия не найдена.' },
        { status: 404 }
      );
    }

    // Handle submission
    if (action === 'submit') {
      // Calculate total score
      const answeredQuestions = session.answers.length;
      const totalQuestions = session.exam.questions.length;
      
      let totalScore = 0;
      let maxScore = 0;

      for (const question of session.exam.questions) {
        maxScore += question.points;
      }

      // For now, just count answered questions
      // Auto-grading will be handled separately for code tasks
      totalScore = answeredQuestions; // Simple scoring for now

      // Update session
      const updatedSession = await prisma.examSession.update({
        where: { id: params.sessionId },
        data: {
          status: 'SUBMITTED',
          submittedAt: new Date(),
          duration: session.startedAt 
            ? new Date().getTime() - new Date(session.startedAt).getTime()
            : undefined,
        },
      });

      // Create result
      const result = await prisma.examResult.create({
        data: {
          id: uuidv4(),
          examId: session.examId,
          sessionId: params.sessionId,
          totalScore,
          maxScore,
          percentage: maxScore > 0 ? (totalScore / maxScore) * 100 : 0,
          isGraded: false,
        },
      });

      return NextResponse.json({
        message: 'Тест успешно отправлен!',
        session: updatedSession,
        result,
      });
    }

    // Handle answer saving
    if (!questionId || answer === undefined) {
      return NextResponse.json(
        { error: 'Мяу! Укажите вопрос и ответ.' },
        { status: 400 }
      );
    }

    // Update or create answer
    let existingAnswer = await prisma.examAnswer.findFirst({
      where: {
        sessionId: params.sessionId,
        questionId,
      },
    });

    if (existingAnswer) {
      existingAnswer = await prisma.examAnswer.update({
        where: { id: existingAnswer.id },
        data: {
          answer: answer.toString(),
          status: 'ANSWERED',
        },
      });
    } else {
      existingAnswer = await prisma.examAnswer.create({
        data: {
          id: uuidv4(),
          sessionId: params.sessionId,
          questionId,
          answer: answer.toString(),
          status: 'ANSWERED',
        },
      });
    }

    return NextResponse.json({
      message: 'Ответ сохранен!',
      answer: existingAnswer,
    });
  } catch (error) {
    console.error('Put exam session error:', error);
    return NextResponse.json(
      { error: 'Что-то пошло не так при обработке запроса.' },
      { status: 500 }
    );
  }
}

// DELETE - Submit exam (finalize session)
export async function DELETE(
  req: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await prisma.examSession.findUnique({
      where: { id: params.sessionId },
      include: {
        answers: true,
        exam: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Сессия не найдена.' },
        { status: 404 }
      );
    }

    // Calculate total score
    const answeredQuestions = session.answers.length;
    const totalQuestions = session.exam.questions.length;
    
    let totalScore = 0;
    let maxScore = 0;

    for (const question of session.exam.questions) {
      maxScore += question.points;
    }

    // For now, just count answered questions
    // Auto-grading will be handled separately for code tasks
    totalScore = answeredQuestions; // Simple scoring for now

    // Update session
    const updatedSession = await prisma.examSession.update({
      where: { id: params.sessionId },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        duration: session.startedAt 
          ? new Date().getTime() - new Date(session.startedAt).getTime()
          : undefined,
      },
    });

    // Create result
    const result = await prisma.examResult.create({
      data: {
        id: uuidv4(),
        examId: session.examId,
        sessionId: params.sessionId,
        totalScore,
        maxScore,
        percentage: maxScore > 0 ? (totalScore / maxScore) * 100 : 0,
        isGraded: false,
      },
    });

    return NextResponse.json({
      message: 'Тест успешно отправлен!',
      session: updatedSession,
      result,
    });
  } catch (error) {
    console.error('Submit exam error:', error);
    return NextResponse.json(
      { error: 'Что-то пошло не так при отправке теста.' },
      { status: 500 }
    );
  }
}
