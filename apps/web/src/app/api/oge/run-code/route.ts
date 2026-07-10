import {
  enqueueCodeRun,
  getCodeRunJobView,
  normalizeLanguage,
} from '@repo/code-runner';
import { prisma } from '@repo/db';
import { verifySolution } from 'altcha-lib/v1';
import { NextResponse } from 'next/server';
import { getAltchaHmacKey } from '~/server/altcha';
import { auth } from '~/server/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Не авторизован.' }, { status: 401 });
    }

    const { code, language, captcha } = (await req.json()) as {
      captcha?: string;
      code?: string;
      language?: string;
    };

    if (!code || !language) {
      return NextResponse.json(
        { success: false, error: 'Переданы не все параметры.' },
        { status: 400 },
      );
    }

    if (!captcha || !(await verifySolution(captcha, getAltchaHmacKey()))) {
      return NextResponse.json(
        { success: false, error: 'Антибот-защита не пройдена.' },
        { status: 403 },
      );
    }

    const normalizedLanguage = normalizeLanguage(language);
    if (!normalizedLanguage) {
      return NextResponse.json({ success: false, error: `Язык ${language} не поддерживается.` });
    }

    // Ищем или создаём задачу-заглушку для запуска кода без тестов
    const ogeRunner = await prisma.challenge.findFirst({
      where: { slug: 'oge-python-runner' },
    });

    if (!ogeRunner) {
      return NextResponse.json(
        { success: false, error: 'Runner challenge not found. Run db:seed:all first.' },
        { status: 500 },
      );
    }

    const job = await enqueueCodeRun({
      code,
      language: normalizedLanguage,
      tests: '', // без тестов — только вывод программы
      challengeId: ogeRunner.id,
      userId: session.user.id,
    });

    return NextResponse.json({
      jobId: job.id,
      message: 'Код отправлен на выполнение.',
      position: job.position,
      status: job.status,
      success: true,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('OGE code runner error:', err);
    return NextResponse.json(
      { success: false, error: 'Ошибка выполнения. Попробуйте ещё раз.' },
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
    return NextResponse.json({ success: false, error: 'Не передан jobId.' }, { status: 400 });
  }

  const job = await getCodeRunJobView(jobId);
  if (!job || job.userId !== session.user.id) {
    return NextResponse.json({ success: false, error: 'Проверка не найдена.' }, { status: 404 });
  }

  return NextResponse.json({
    jobId: job.id,
    position: job.position,
    result: job.result,
    status: job.status,
    success: true,
  });
}
