import {
  enqueueCodeRun,
  getCodeRunJobView,
  getQueueDepth,
  normalizeLanguage,
} from '@repo/code-runner';
import { prisma } from '@repo/db';
import { verifySolution } from 'altcha-lib/v1';
import { NextResponse } from 'next/server';
import { getAltchaHmacKey } from '~/server/altcha';
import { auth } from '~/server/auth';

const MAX_QUEUE_DEPTH = Number(process.env.CODE_RUNNER_MAX_QUEUE_DEPTH ?? 20);

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Не авторизован.' }, { status: 401 });
    }

    const { code, challengeId, language, captcha } = (await req.json()) as {
      captcha?: string;
      challengeId?: number;
      code?: string;
      language?: string;
    };

    if (!language || !code || !challengeId) {
      return NextResponse.json(
        { success: false, error: 'Мяу! Переданы не все параметры.' },
        { status: 400 },
      );
    }

    // Проверка антибот-защиты (ALTCHA proof-of-work) — решается невидимо в
    // фоне на клиенте, не мешает живым пользователям, но не даёт скриптам
    // задёшево заваливать очередь проверки мусорными отправками.
    if (!captcha || !(await verifySolution(captcha, getAltchaHmacKey()))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Не пройдена проверка антибот-защиты. Обновите страницу и попробуйте снова.',
        },
        { status: 403 },
      );
    }

    const normalizedLanguage = normalizeLanguage(language);

    if (!normalizedLanguage) {
      return NextResponse.json({
        success: false,
        error: `Исполнение для языка ${language} пока не реализовано`,
      });
    }

    // Тесты берём из БД — клиент не может их подменить
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      select: { tests: true },
    });

    if (!challenge) {
      return NextResponse.json(
        { success: false, error: 'Задача не найдена.' },
        { status: 404 },
      );
    }

    const queueDepth = await getQueueDepth();

    if (queueDepth >= MAX_QUEUE_DEPTH) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Сервер проверки сейчас перегружен. Попробуйте ещё раз через пару минут.',
        },
        { status: 429 },
      );
    }

    const job = await enqueueCodeRun({
      code,
      language: normalizedLanguage,
      tests: challenge.tests,
      challengeId,
      userId: session.user.id,
    });

    return NextResponse.json({
      jobId: job.id,
      message: 'Минутку, сервер проверки принял ваше решение в очередь.',
      position: job.position,
      status: job.status,
      success: true,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Execution enqueue error:', err);

    return NextResponse.json(
      { success: false, error: `Ошибка очереди проверки: ${err.message}` },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Не авторизован.' }, { status: 401 });
  }

  const url = new URL(req.url);
  const jobId = url.searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json(
      { success: false, error: 'Не передан идентификатор проверки.' },
      { status: 400 },
    );
  }

  const job = await getCodeRunJobView(jobId);

  if (!job || job.userId !== session.user.id) {
    return NextResponse.json(
      { success: false, error: 'Проверка не найдена или уже устарела.' },
      { status: 404 },
    );
  }

  return NextResponse.json({
    jobId: job.id,
    position: job.position,
    result: job.result,
    status: job.status,
    success: true,
  });
}
