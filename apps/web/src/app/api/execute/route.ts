import {
  enqueueCodeRun,
  getCodeRunJobView,
  getQueueDepth,
  normalizeLanguage,
} from '@repo/code-runner';
import { NextResponse } from 'next/server';

const MAX_QUEUE_DEPTH = Number(process.env.CODE_RUNNER_MAX_QUEUE_DEPTH ?? 20);

export async function POST(req: Request) {
  try {
    const { code, tests, language } = (await req.json()) as {
      code?: string;
      language?: string;
      tests?: string;
    };

    if (!language || !code) {
      return NextResponse.json(
        { success: false, error: 'Мяу! Переданы не все параметры.' },
        { status: 400 },
      );
    }

    const normalizedLanguage = normalizeLanguage(language);

    if (!normalizedLanguage) {
      return NextResponse.json({
        success: false,
        error: `Исполнение для языка ${language} пока не реализовано`,
      });
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
      tests: tests ?? '',
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
  const url = new URL(req.url);
  const jobId = url.searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json(
      { success: false, error: 'Не передан идентификатор проверки.' },
      { status: 400 },
    );
  }

  const job = await getCodeRunJobView(jobId);

  if (!job) {
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
