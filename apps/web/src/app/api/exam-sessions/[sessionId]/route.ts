import { exec } from 'node:child_process';
import { writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { prisma } from '@repo/db';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Helper function to execute code with stdin
function runCodeWithStdin(cmd: string, stdinText: string, timeoutMs = 5000): Promise<{ stdout: string; stderr: string; error?: any }> {
  return new Promise((resolve) => {
    const child = exec(cmd, { timeout: timeoutMs }, (error, stdout, stderr) => {
      resolve({ stdout, stderr, error });
    });
    if (child.stdin) {
      if (stdinText) {
        child.stdin.write(stdinText);
      }
      child.stdin.end();
    }
  });
}

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
  { params }: { params: { sessionId: string } },
): Promise<NextResponse> {
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
      return NextResponse.json({ error: 'Сессия не найдена.' }, { status: 404 });
    }

    // Filter out correct answers before sending to student
    const sanitizedSession = {
      ...session,
      exam: {
        ...session.exam,
        questions: session.exam.questions.map((q: { [key: string]: unknown }) => {
          const { correctAnswers: _correctAnswers, ...questionData } = q;
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
      { status: 500 },
    );
  }
}

// PUT - Save answer(s) or submit exam
export async function PUT(
  req: Request,
  { params }: { params: { sessionId: string } },
): Promise<NextResponse> {
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
      return NextResponse.json({ error: 'Сессия не найдена.' }, { status: 404 });
    }

    // Handle submission
    if (validatedData.action === 'submit') {
      // Check if already submitted
      if (session.status === 'SUBMITTED' || session.status === 'GRADED') {
        return NextResponse.json({ error: 'Тест уже отправлен.' }, { status: 409 });
      }

      // Pre-calculate grades for all questions, including executing CODE_TASKs
      const gradedAnswers: {
        answerId: string;
        score: number;
        testResults?: any;
      }[] = [];

      let codeTasksScore = 0;
      let multipleChoiceScore = 0;

      for (const question of session.exam.questions) {
        const answer = session.answers.find(
          (a: { questionId: string; id: string; answer: string }) => a.questionId === question.id,
        );

        if (!answer) continue;

        if (question.type === 'MULTIPLE_CHOICE' && question.correctAnswers) {
          // Parse correct answers
          let correctAnswerIndices: number[] = [];
          if (Array.isArray(question.correctAnswers)) {
            correctAnswerIndices = (question.correctAnswers as unknown[]).map((v) => Number(v));
          } else if (typeof question.correctAnswers === 'number') {
            correctAnswerIndices = [question.correctAnswers];
          } else {
            try {
              const parsed = JSON.parse(question.correctAnswers as string);
              correctAnswerIndices = Array.isArray(parsed)
                ? (parsed as unknown[]).map((v) => Number(v))
                : [Number(parsed)];
            } catch {
              const parsed = parseInt(question.correctAnswers as string);
              if (!isNaN(parsed)) correctAnswerIndices = [parsed];
            }
          }

          const studentAnswerIndex = parseInt(answer.answer);
          if (!isNaN(studentAnswerIndex) && correctAnswerIndices.includes(studentAnswerIndex)) {
            multipleChoiceScore += question.points;
            gradedAnswers.push({
              answerId: answer.id,
              score: question.points,
            });
          } else {
            gradedAnswers.push({
              answerId: answer.id,
              score: 0,
            });
          }
        } else if (question.type === 'CODE_TASK' && question.language) {
          const code = answer.answer;
          const testCases = (question as any).testCases || [];

          if (testCases.length === 0) {
            // No test cases defined - 0 score
            gradedAnswers.push({
              answerId: answer.id,
              score: 0,
              testResults: [],
            });
            continue;
          }

          // Run tests in sandbox
          const runId = uuidv4();
          const tmpDir = path.join(os.tmpdir(), `litkot-exam-run-${runId}`);
          
          try {
            await mkdir(tmpDir, { recursive: true });

            const isPython = question.language.toLowerCase() === 'python';
            const fileName = isPython ? 'main.py' : 'main.js';
            const filePath = path.join(tmpDir, fileName);
            await writeFile(filePath, code);

            const normalizedTmpDir = tmpDir.replace(/\\/g, '/');
            const cmd = isPython
              ? `docker run -i --rm --network none -m 128m --cpus 0.5 -v "${normalizedTmpDir}:/code" -w /code python:3.11-alpine python main.py`
              : `docker run -i --rm --network none -m 128m --cpus 0.5 -v "${normalizedTmpDir}:/code" -w /code node:20-alpine node main.js`;

            const results = [];
            let passedCount = 0;

            for (const tc of testCases) {
              const start = Date.now();
              const { stdout, stderr, error } = await runCodeWithStdin(cmd, tc.input || '', tc.timeout || 5000);
              const duration = Date.now() - start;

              const actualOutput = stdout ? stdout.trim() : '';
              const expectedOutput = tc.expectedOutput ? tc.expectedOutput.trim() : '';
              const passed = !error && !stderr && actualOutput === expectedOutput;

              if (passed) passedCount++;

              results.push({
                testCaseId: tc.id,
                input: tc.input,
                expected: expectedOutput,
                actual: actualOutput,
                error: stderr || (error ? error.message : null),
                duration,
                passed,
              });
            }

            const calculatedScore = Math.round(question.points * (passedCount / testCases.length));
            codeTasksScore += calculatedScore;

            gradedAnswers.push({
              answerId: answer.id,
              score: calculatedScore,
              testResults: results,
            });
          } catch (err: any) {
            console.error('Code task evaluation failed:', err);
            gradedAnswers.push({
              answerId: answer.id,
              score: 0,
              testResults: [{ error: `Ошибка тестирования: ${err.message}`, passed: false }],
            });
          } finally {
            await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
          }
        }
      }

      // Calculate total final scores
      const totalScore = multipleChoiceScore + codeTasksScore;
      let maxScore = 0;
      for (const q of session.exam.questions) {
        maxScore += q.points;
      }

      // Use transaction to save all results in DB
      const result = await prisma.$transaction(async (tx) => {
        // Update answers status to GRADED and record their scores/results
        for (const graded of gradedAnswers) {
          await tx.examAnswer.update({
            where: { id: graded.answerId },
            data: {
              score: graded.score,
              status: 'GRADED',
              testResults: graded.testResults ? JSON.stringify(graded.testResults) : undefined,
            },
          });
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
            isGraded: true, // Marked as fully graded since code tasks are now autograded
          },
        });

        return { updatedSession, examResult };
      });

      return NextResponse.json({
        message: 'Тест успешно отправлен и оценен!',
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

    return NextResponse.json({ error: 'Некорректное действие.' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Мяу! Некорректные данные в запросе.', details: error.errors },
        { status: 400 },
      );
    }

    console.error('Put exam session error:', error);
    return NextResponse.json(
      { error: 'Что-то пошло не так при обработке запроса.' },
      { status: 500 },
    );
  }
}
