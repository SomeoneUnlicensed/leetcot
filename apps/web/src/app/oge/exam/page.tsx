import type { Metadata } from 'next';
import { prisma } from '@repo/db';
import { redirect } from 'next/navigation';
import { auth } from '~/server/auth';
import { buildMetaForDefault } from '~/app/metadata';
import { Footsies } from '~/components/footsies';
import Link from 'next/link';
import { Badge } from '@repo/ui/components/badge';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return buildMetaForDefault({
    title: 'Пробные варианты | ОГЭ Информатика | ЛитКот',
    description: 'Пробные варианты ОГЭ по информатике 2026 с таймером, подсчётом баллов и разбором.',
  });
}

export default async function OgeExamPage() {
  const session = await auth();

  // Fetch available practice exams created as Exam entities
  const exams = await prisma.exam.findMany({
    where: {
      classLevel: '9',
      status: 'ACTIVE',
    },
    include: {
      _count: { select: { questions: true } },
      sessions: session?.user
        ? {
            where: { studentId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 1,
          }
        : false,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#0f0c1a] to-[#1a1528] text-white">
        <div className="from-[#ec4899]/10 pointer-events-none fixed inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b to-transparent" />

        <div className="container py-8">
          <Link
            href="/courses/oge-informatika-2026"
            className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-[#ffaad8]/70 transition hover:text-[#ffaad8]"
          >
            ← Назад к курсу
          </Link>

          <div className="mb-8">
            <div className="mb-2 inline-flex items-center gap-2 rounded-2xl border border-[#ff8ecb]/30 bg-[#211827]/80 px-4 py-1.5 text-xs font-black text-[#ffaad8]">
              ОГЭ Информатика · экзамен
            </div>
            <h1
              className="mt-3 text-3xl leading-tight md:text-4xl"
              style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
            >
              Пробные варианты
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#d8d4df]/70">
              Полноценная имитация ОГЭ 2026: 16 заданий, таймер 150 минут, автоматический подсчёт
              баллов и разбор каждого задания после сдачи.
            </p>
          </div>

          {exams.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-12 text-center">
              <p className="text-3xl">📝</p>
              <p className="mt-4 text-lg font-semibold text-[#d8d4df]/60">
                Пробные варианты скоро появятся
              </p>
              <p className="mt-2 text-sm text-[#d8d4df]/40">
                Мы готовим для вас экзаменационные варианты. А пока — изучайте модули курса!
              </p>
              <Link
                href="/courses/oge-informatika-2026"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] px-6 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Вернуться к курсу
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {exams.map((exam) => {
                const lastSession = Array.isArray(exam.sessions) ? exam.sessions[0] : null;

                return (
                  <Link
                    key={exam.id}
                    href={`/exam/${exam.shareToken}`}
                    className="group rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-[#8ef0de]/30"
                  >
                    <h3 className="text-lg font-bold text-white">{exam.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-[#d8d4df]/60">
                      {exam.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <Badge variant="secondary">{exam._count.questions} заданий</Badge>
                      {lastSession && (
                        <span className="text-xs text-[#d8d4df]/40">
                          {lastSession.status === 'SUBMITTED'
                            ? '✅ Пройден'
                            : lastSession.status === 'IN_PROGRESS'
                              ? '⏳ В процессе'
                              : 'Начать'}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footsies />
    </>
  );
}
