import { prisma } from '@repo/db';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Validation schemas
const SaveAnswerSchema = z.object({
  questionId: z.string().uuid('Invalid question ID'),
  answer: z.union([z.string(), z.number()], {
    errorMap: () => ({ message: 'Answer must be a string or number' }),
  }),
  action: z.literal('save'),
});

const SubmitExamSchema = z.object({
  action: z.literal('submit'),
});

const PutRequestSchema = z.union([SaveAnswerSchema, SubmitExamSchema]);

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
    const body = await req.json();

    // Validate request
    const validatedData = PutRequestSchema.parse(body);

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
    if (validatedData.action === 'submit') {
      // Check if already submitted
      if (session.status === 'SUBMITTED' || session.status === 'GRADED') {
        return NextResponse.json(
          { error: 'Тест уже отправлен.' },
          { status: 409 }
        );
      }

      // Use transaction to ensure consistency
      const result = await prisma.$transaction(async (tx) => {
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
              correctAnswerIndices = question.correctAnswers.map((v: any) => Number(v));
            } else if (typeof question.correctAnswers === 'number') {
              correctAnswerIndices = [question.correctAnswers];
            } else {
              try {
                const parsed = JSON.parse(question.correctAnswers as string);
                correctAnswerIndices = Array.isArray(parsed)
                  ? (parsed as any[]).map((v: any) => Number(v))
                  : [Number(parsed)];
              } catch {
                const parsed = parseInt(question.correctAnswers as string);
                if (!isNaN(parsed)) {
                  correctAnswerIndices = [parsed];
                }
              }
            }

            // Check if student's answer is correct
            const studentAnswerIndex = parseInt(answer.answer);
            if (!isNaN(studentAnswerIndex) && correctAnswerIndices.includes(studentAnswerIndex)) {
              totalScore += question.points;

              // Update answer status
              await tx.examAnswer.update({
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
        const updatedSession = await tx.examSession.update({
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
        const examResult = await tx.examResult.create({
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

        return { updatedSession, examResult };
      });

      return NextResponse.json({
        message: 'Тест успешно отправлен!',
        session: result.updatedSession,
        result: result.examResult,
      });
    }

    // Handle answer saving
    if (validatedData.action === 'save') {
      const { questionId, answer } = validatedData;

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
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Мяу! Некорректные данные в запросе.', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Put exam session error:', error);
    return NextResponse.json(
      { error: 'Что-то пошло не так при обработке запроса.' },
      { status: 500 }
    );
  }
}
