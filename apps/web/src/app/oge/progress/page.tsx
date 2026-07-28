import type { Metadata } from 'next';
import { prisma } from '@repo/db';
import { redirect } from 'next/navigation';
import { auth } from '~/server/auth';
import { buildMetaForDefault } from '~/app/metadata';
import { Footsies } from '~/components/footsies';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return buildMetaForDefault({
    title: 'Прогресс | ОГЭ Информатика | ЛитКот',
    description: 'Отслеживайте свой прогресс подготовки к ОГЭ по информатике.',
  });
}

export default async function OgeProgressPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const progress = await prisma.ogeProgress.findMany({
    where: { userId: session.user.id },
    include: { track: true },
    orderBy: { updatedAt: 'desc' },
  });

  const overallCompletedLessons = progress.reduce((s, p) => s + p.completedLessons, 0);
  const overallTotalLessons = progress.reduce((s, p) => s + p.totalLessons, 0);
  const overallCompletedTasks = progress.reduce((s, p) => s + p.completedTasks, 0);
  const overallTotalTasks = progress.reduce((s, p) => s + p.totalTasks, 0);
  const overallAccuracy =
    progress.length > 0
      ? Math.round(progress.reduce((s, p) => s + p.accuracy, 0) / progress.length)
      : 0;

  const overallPct =
    overallTotalLessons + overallTotalTasks > 0
      ? Math.round(
          ((overallCompletedLessons + overallCompletedTasks) /
            (overallTotalLessons + overallTotalTasks)) * 100,
        )
      : 0;

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
              ОГЭ Информатика · прогресс
            </div>
            <h1
              className="mt-3 text-3xl leading-tight md:text-4xl"
              style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
            >
              Мой прогресс
            </h1>
          </div>

          {/* Overall stats */}
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
              <div className="font-mono text-2xl font-black text-[#8ef0de]">{overallPct}%</div>
              <div className="mt-1 text-xs font-semibold text-[#d8d4df]/50">Общий прогресс</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
              <div className="font-mono text-2xl font-black text-[#ffaad8]">
                {overallCompletedLessons}/{overallTotalLessons}
              </div>
              <div className="mt-1 text-xs font-semibold text-[#d8d4df]/50">Уроков пройдено</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
              <div className="font-mono text-2xl font-black text-[#ffd700]">
                {overallCompletedTasks}/{overallTotalTasks}
              </div>
              <div className="mt-1 text-xs font-semibold text-[#d8d4df]/50">Заданий решено</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
              <div className="font-mono text-2xl font-black text-[#8ef0de]">{overallAccuracy}%</div>
              <div className="mt-1 text-xs font-semibold text-[#d8d4df]/50">Точность</div>
            </div>
          </div>

          {/* Per-module breakdown */}
          <h2 className="mb-4 text-xl font-black text-[#8ef0de]">По модулям</h2>
          <div className="space-y-4">
            {progress.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-8 text-center">
                <p className="text-[#d8d4df]/50">
                  Вы ещё не начали обучение.{' '}
                  <Link href="/courses/oge-informatika-2026" className="text-[#ffaad8] underline">
                    Перейти к курсу
                  </Link>
                </p>
              </div>
            )}

            {progress.map((p) => {
              const modulePct =
                p.totalLessons + p.totalTasks > 0
                  ? Math.round(
                      ((p.completedLessons + p.completedTasks) /
                        (p.totalLessons + p.totalTasks)) * 100,
                    )
                  : 0;

              return (
                <Link
                  key={p.id}
                  href={`/oge/modules/${p.track.slug}`}
                  className="group block rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-[#8ef0de]/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold text-white">{p.track.name}</h3>
                      <div className="mt-2 flex items-center gap-4 text-xs text-[#d8d4df]/50">
                        <span>📖 {p.completedLessons}/{p.totalLessons} уроков</span>
                        <span>✏️ {p.completedTasks}/{p.totalTasks} заданий</span>
                        <span>🎯 {Math.round(p.accuracy)}% точность</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#ff8ecb] to-[#8ef0de] transition-all"
                          style={{ width: `${modulePct}%` }}
                        />
                      </div>
                      <span className="font-mono text-sm font-bold text-[#8ef0de]">{modulePct}%</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      <Footsies />
    </>
  );
}
