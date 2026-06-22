import { exec } from 'node:child_process';
import { writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { prisma } from '@repo/db';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Helper function to execute code with stdin
function runCodeWithStdin(
  cmd: string,
  stdinText: string,
  timeoutMs = 5000,
): Promise<{ stdout: string; stderr: string; error?: unknown }> {
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

// Wraps the student's code with a harness that calls `functionName` with the JSON-encoded
// args and prints the JSON-encoded return value, so we never have to ask students to read
// stdin/print stdout themselves. Args are base64-encoded to avoid quoting/escaping issues.
function buildFunctionHarness(
  isPython: boolean,
  code: string,
  functionName: string,
  argsJson: string,
): string {
  const argsB64 = Buffer.from(argsJson, 'utf-8').toString('base64');
  if (isPython) {
    return `${code}\n\nimport json as __json, base64 as __base64\n__args = __json.loads(__base64.b64decode("${argsB64}").decode("utf-8"))\n__result = ${functionName}(*__args)\nprint(__json.dumps(__result))\n`;
  }
  return `${code}\n\nconst __args = JSON.parse(Buffer.from("${argsB64}", "base64").toString("utf-8"));\nconst __result = ${functionName}(...__args);\nconsole.log(JSON.stringify(__result));\n`;
}

// Deterministic shuffle (same seed -> same order across reloads) used to present
// matching/ordering options to students without leaking position-based correct answers.
function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 2147483647;
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) % 2147483647;
    const j = h % (i + 1);
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

// Case/whitespace-insensitive comparison used for short-answer style grading.
function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function parseStringArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map((v) => String(v ?? '')) : [];
  } catch {
    return [];
  }
}

// Compares expected/actual test case values. For function-based tasks both sides are JSON;
// falls back to a trimmed string comparison if either side isn't valid JSON (e.g. a crash).
function valuesMatch(expectedRaw: string, actualRaw: string): boolean {
  try {
    return JSON.stringify(JSON.parse(expectedRaw)) === JSON.stringify(JSON.parse(actualRaw));
  } catch {
    return expectedRaw.trim() === actualRaw.trim();
  }
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

const RunCodeSchema = z.object({
  questionId: z.string().uuid('Invalid question ID'),
  answer: z.string(),
  action: z.literal('run'),
});

const PutRequestSchema = z.union([SaveAnswerSchema, SubmitExamSchema, RunCodeSchema]);

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
          const {
            correctAnswers: _correctAnswers,
            correctAnswerText: _correctAnswerText,
            blankAnswers: _blankAnswers,
            orderingItems: _orderingItems,
            matchingPairs: _matchingPairs,
            ...questionData
          } = q;

          if (q.type === 'MATCHING' && Array.isArray(q.matchingPairs)) {
            const pairs = q.matchingPairs as { left: string; right: string }[];
            return {
              ...questionData,
              matchingLeftItems: pairs.map((p) => p.left),
              matchingRightOptions: seededShuffle(
                pairs.map((p) => p.right),
                `${q.id}-right`,
              ),
            };
          }
          if (q.type === 'FILL_IN_BLANK' && Array.isArray(q.blankAnswers)) {
            return { ...questionData, blankCount: (q.blankAnswers as unknown[]).length };
          }
          if (q.type === 'ORDERING' && Array.isArray(q.orderingItems)) {
            return {
              ...questionData,
              orderingShuffledItems: seededShuffle(q.orderingItems as string[], `${q.id}-order`),
            };
          }
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
        testResults?: unknown;
      }[] = [];

      let codeTasksScore = 0;
      // Also accumulates SHORT_ANSWER/MATCHING/FILL_IN_BLANK/ORDERING scores
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
        } else if (question.type === 'SHORT_ANSWER') {
          const correctText = question.correctAnswerText;
          const isCorrect = Boolean(
            correctText && normalizeText(answer.answer) === normalizeText(correctText),
          );
          const score = isCorrect ? question.points : 0;
          multipleChoiceScore += score;
          gradedAnswers.push({ answerId: answer.id, score });
        } else if (question.type === 'MATCHING') {
          const pairs = (question.matchingPairs as { left: string; right: string }[] | null) || [];
          const studentSelections = parseStringArray(answer.answer);
          const correctCount = pairs.reduce(
            (acc, pair, idx) =>
              acc +
              (normalizeText(studentSelections[idx] || '') === normalizeText(pair.right) ? 1 : 0),
            0,
          );
          const score =
            pairs.length > 0 ? Math.round(question.points * (correctCount / pairs.length)) : 0;
          multipleChoiceScore += score;
          gradedAnswers.push({ answerId: answer.id, score });
        } else if (question.type === 'FILL_IN_BLANK') {
          const correctBlanks = (question.blankAnswers as string[] | null) || [];
          const studentBlanks = parseStringArray(answer.answer);
          const correctCount = correctBlanks.reduce(
            (acc, correctValue, idx) =>
              acc +
              (normalizeText(studentBlanks[idx] || '') === normalizeText(correctValue) ? 1 : 0),
            0,
          );
          const score =
            correctBlanks.length > 0
              ? Math.round(question.points * (correctCount / correctBlanks.length))
              : 0;
          multipleChoiceScore += score;
          gradedAnswers.push({ answerId: answer.id, score });
        } else if (question.type === 'ORDERING') {
          const correctOrder = (question.orderingItems as string[] | null) || [];
          const studentOrder = parseStringArray(answer.answer);
          const isCorrect =
            correctOrder.length > 0 &&
            correctOrder.length === studentOrder.length &&
            correctOrder.every(
              (item, idx) => normalizeText(item) === normalizeText(studentOrder[idx] || ''),
            );
          const score = isCorrect ? question.points : 0;
          multipleChoiceScore += score;
          gradedAnswers.push({ answerId: answer.id, score });
        } else if (question.type === 'CODE_TASK' && question.language) {
          const code = answer.answer;
          const testCases =
            (
              question as {
                testCases?: {
                  id: string;
                  input: string | null;
                  expectedOutput: string;
                  timeout?: number;
                }[];
              }
            ).testCases || [];

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
            const isFunctionBased = Boolean(question.functionName);
            const fileName = isPython ? 'main.py' : 'main.js';
            const filePath = path.join(tmpDir, fileName);

            const normalizedTmpDir = tmpDir.replace(/\\/g, '/');
            const cmd = isPython
              ? `docker run -i --rm --network none -m 128m --cpus 0.5 -v "${normalizedTmpDir}:/code" -w /code python:3.11-alpine python main.py`
              : `docker run -i --rm --network none -m 128m --cpus 0.5 -v "${normalizedTmpDir}:/code" -w /code node:20-alpine node main.js`;

            if (!isFunctionBased) {
              await writeFile(filePath, code);
            }

            const results = [];
            let passedCount = 0;

            for (const tc of testCases) {
              if (isFunctionBased) {
                await writeFile(
                  filePath,
                  buildFunctionHarness(isPython, code, question.functionName!, tc.input || '[]'),
                );
              }

              const start = Date.now();
              const { stdout, stderr, error } = await runCodeWithStdin(
                cmd,
                isFunctionBased ? '' : tc.input || '',
                tc.timeout || 5000,
              );
              const duration = Date.now() - start;

              const actualOutput = stdout ? stdout.trim() : '';
              const expectedOutput = tc.expectedOutput ? tc.expectedOutput.trim() : '';
              const passed =
                !error &&
                !stderr &&
                (isFunctionBased
                  ? valuesMatch(expectedOutput, actualOutput)
                  : actualOutput === expectedOutput);

              if (passed) passedCount++;

              results.push({
                testCaseId: tc.id,
                input: tc.input,
                expected: expectedOutput,
                actual: actualOutput,
                error: stderr || (error ? (error as Error).message : null),
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
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            console.error('Code task evaluation failed:', err);
            gradedAnswers.push({
              answerId: answer.id,
              score: 0,
              testResults: [{ error: `Ошибка тестирования: ${errorMsg}`, passed: false }],
            });
          } finally {
            await rm(tmpDir, { recursive: true, force: true }).catch(() => undefined);
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

    // Handle temporary code testing (Run Code)
    if (validatedData.action === 'run') {
      const { questionId, answer: code } = validatedData;

      const question = session.exam.questions.find((q) => q.id === questionId);
      if (!question || question.type !== 'CODE_TASK' || !question.language) {
        return NextResponse.json(
          { error: 'Вопрос не найден или не является задачей по программированию.' },
          { status: 400 },
        );
      }

      // Filter out hidden test cases (students only check against public ones)
      const testCases = question.testCases.filter((tc) => !tc.isHidden) || [];

      if (testCases.length === 0) {
        return NextResponse.json({
          message: 'Для этой задачи не настроено публичных тестов.',
          testResults: [],
        });
      }

      // Run tests in sandbox
      const runId = uuidv4();
      const tmpDir = path.join(os.tmpdir(), `litkot-exam-run-${runId}`);

      try {
        await mkdir(tmpDir, { recursive: true });

        const isPython = question.language.toLowerCase() === 'python';
        const isFunctionBased = Boolean(question.functionName);
        const fileName = isPython ? 'main.py' : 'main.js';
        const filePath = path.join(tmpDir, fileName);

        const normalizedTmpDir = tmpDir.replace(/\\/g, '/');
        const cmd = isPython
          ? `docker run -i --rm --network none -m 128m --cpus 0.5 -v "${normalizedTmpDir}:/code" -w /code python:3.11-alpine python main.py`
          : `docker run -i --rm --network none -m 128m --cpus 0.5 -v "${normalizedTmpDir}:/code" -w /code node:20-alpine node main.js`;

        if (!isFunctionBased) {
          await writeFile(filePath, code);
        }

        const testResults = [];
        for (const tc of testCases) {
          if (isFunctionBased) {
            await writeFile(
              filePath,
              buildFunctionHarness(isPython, code, question.functionName!, tc.input || '[]'),
            );
          }

          const start = Date.now();
          const { stdout, stderr, error } = await runCodeWithStdin(
            cmd,
            isFunctionBased ? '' : tc.input || '',
            tc.timeout || 5000,
          );
          const duration = Date.now() - start;

          const actualOutput = stdout ? stdout.trim() : '';
          const expectedOutput = tc.expectedOutput ? tc.expectedOutput.trim() : '';
          const passed =
            !error &&
            !stderr &&
            (isFunctionBased
              ? valuesMatch(expectedOutput, actualOutput)
              : actualOutput === expectedOutput);

          testResults.push({
            testCaseId: tc.id,
            input: tc.input,
            expected: expectedOutput,
            actual: actualOutput,
            error: stderr || (error ? (error as Error).message : null),
            duration,
            passed,
          });
        }

        // Clean up temp files
        try {
          await rm(tmpDir, { recursive: true, force: true });
        } catch (cleanupErr) {
          console.error('Cleanup error:', cleanupErr);
        }

        return NextResponse.json({
          message: 'Код успешно проверен на публичных тестах!',
          testResults,
        });
      } catch (runErr) {
        console.error('Run code error:', runErr);
        return NextResponse.json(
          { error: 'Ошибка при запуске кода в песочнице.' },
          { status: 500 },
        );
      }
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
