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

    // Filter out correct answers before sending to student
    const sanitizedSession = {
      ...session,
      exam: {
        ...session.exam,
        questions: session.exam.questions.map((q: any) => {
          const { correctAnswers, ...questionData } = q;
          return questionData;
        }),
      },
    };

    return NextResponse.json({
      session: sanitizedSession,
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
      // Calculate total score with proper grading
      let totalScore = 0;
      let maxScore = 0;

      // Create/update answers with grades
      for (const question of session.exam.questions) {
        maxScore += question.points;

        // Find answer for this question
        const answer = session.answers.find((a: any) => a.questionId === question.id);

        if (!answer) {
          // No answer given
          continue;
        }

        // Score based on question type
        if (question.type === 'MULTIPLE_CHOICE' && question.correctAnswers) {
          // Parse correct answers (could be array or JSON)
          let correctAnswerIndices: number[] = [];
          if (Array.isArray(question.correctAnswers)) {
            correctAnswerIndices = question.correctAnswers as number[];
          } else {
            try {
              correctAnswerIndices = JSON.parse(question.correctAnswers as string);
            } catch {
              correctAnswerIndices = [question.correctAnswers];
            }
          }

          // Check if student's answer is correct
          const studentAnswerIndex = parseInt(answer.answer);
          if (correctAnswerIndices.includes(studentAnswerIndex)) {
            totalScore += question.points;

            // Update answer status
            await prisma.examAnswer.update({
              where: { id: answer.id },
              data: {
                score: question.points,
                status: 'GRADED',
              },
            });
          }
        } else if (question.type === 'SHORT_ANSWER') {
          // Short answers need manual grading - mark as answered
          // Don't award points automatically
        } else if (question.type === 'CODE_TASK') {
          // Code tasks need auto-grading later - mark as answered
          // Don't award points automatically
        }
      }

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
          isGraded: maxScore > 0 ? true : false, // Marked as graded only for multiple choice
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
