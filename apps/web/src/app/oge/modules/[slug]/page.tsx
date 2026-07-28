import type { Metadata } from 'next';
import { prisma } from '@repo/db';
import { notFound } from 'next/navigation';
import { auth } from '~/server/auth';
import { buildMetaForDefault } from '~/app/metadata';
import { Footsies } from '~/components/footsies';
import Link from 'next/link';
import { Markdown } from '@repo/ui/components/markdown';
import { Badge } from '@repo/ui/components/badge';

interface ModulePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: ModulePageProps): Promise<Metadata> {
  const { slug } = await params;
  const track = await prisma.track.findFirst({ where: { slug } });
  if (!track) return buildMetaForDefault({ title: 'Модуль не найден | ЛитКот' });
  return buildMetaForDefault({
    title: `${track.name} | ОГЭ Информатика | ЛитКот`,
    description: track.description,
  });
}

export default async function OgeModulePage({ params }: ModulePageProps) {
  const { slug } = await params;
  const session = await auth();

  const track = await prisma.track.findFirst({
    where: { slug },
    include: {
      course: true,
      ogeLessons: {
        orderBy: { order: 'asc' },
      },
      ogeTasks: {
        where: { status: 'ACTIVE' },
        orderBy: { order: 'asc' },
      },
      ogeProgress: session?.user
        ? {
            where: { userId: session.user.id },
            take: 1,
          }
        : false,
    },
  });

  if (!track || !track.course) {
    notFound();
  }

  const progress = Array.isArray(track.ogeProgress) ? track.ogeProgress[0] : null;

  const totalLessons = track.ogeLessons.length;
  const totalTasks = track.ogeTasks.length;
  const completedPct = progress
    ? Math.round(
        ((progress.completedLessons + progress.completedTasks) /
          Math.max(totalLessons + totalTasks, 1)) * 100,
      )
    : 0;

  const tasksByExamNumber = track.ogeTasks.reduce(
    (acc, task) => {
      const key = task.examQuestionNumber;
      if (!acc[key]) acc[key] = [];
      acc[key].push(task);
      return acc;
    },
    {} as Record<number, typeof track.ogeTasks>,
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#0f0c1a] to-[#1a1528] text-white">
        <div className="from-[#ec4899]/10 pointer-events-none fixed inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b to-transparent" />

        <div className="container py-8">
          <Link
            href={`/courses/${track.course.slug}`}
            className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-[#ffaad8]/70 transition hover:text-[#ffaad8]"
          >
            ← Назад к курсу
          </Link>

          <div className="mb-8">
            <div className="mb-2 inline-flex items-center gap-2 rounded-2xl border border-[#ff8ecb]/30 bg-[#211827]/80 px-4 py-1.5 text-xs font-black text-[#ffaad8] shadow-2xl shadow-pink-950/10">
              ОГЭ Информатика · модуль
            </div>
            <h1
              className="mt-3 text-3xl leading-tight md:text-4xl"
              style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
            >
              {track.name}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#d8d4df]/70">
              {track.description}
            </p>

            {session?.user && (
              <div className="mt-4 flex items-center gap-3">
                <div className="h-2 w-48 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#ff8ecb] to-[#8ef0de] transition-all"
                    style={{ width: `${completedPct}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-[#d8d4df]/60">
                  {progress?.completedLessons || 0}/{totalLessons} уроков ·{' '}
                  {progress?.completedTasks || 0}/{totalTasks} заданий
                </span>
              </div>
            )}
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div>
              {/* Lessons section */}
              <section>
                <h2 className="mb-4 text-xl font-black text-[#8ef0de]">Уроки</h2>
                <div className="space-y-3">
                  {track.ogeLessons.map((lesson, idx) => (
                    <Link
                      key={lesson.id}
                      href={`/oge/lessons/${lesson.slug}`}
                      className="group block rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-[#ff8ecb]/30 hover:bg-white/[0.06]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] font-mono text-sm font-bold text-[#ffaad8]">
                            {idx + 1}
                          </span>
                          <div>
                            <h3 className="text-lg font-bold text-white">{lesson.title}</h3>
                            <p className="mt-1 text-sm text-[#d8d4df]/50">
                              ~{lesson.duration} мин
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 text-xs text-[#8ef0de]">Читать →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Tasks section */}
              <section className="mt-10">
                <h2 className="mb-4 text-xl font-black text-[#8ef0de]">Практика</h2>

                {Object.entries(tasksByExamNumber).map(([examNum, tasks]) => (
                  <div key={examNum} className="mb-6">
                    <h3 className="mb-2 text-sm font-semibold text-[#ffaad8]/70">
                      Задание №{examNum} КИМ
                    </h3>
                    <div className="space-y-2">
                      {tasks.map((task) => (
                        <Link
                          key={task.id}
                          href={`/oge/tasks/${task.id}`}
                          className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 transition hover:border-[#8ef0de]/30"
                        >
                          <span
                            className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              task.difficulty === 'BASIC'
                                ? 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                                : task.difficulty === 'ADVANCED'
                                  ? 'border border-amber-400/30 bg-amber-400/10 text-amber-300'
                                  : 'border border-rose-400/30 bg-rose-400/10 text-rose-300'
                            }`}
                          >
                            {task.difficulty === 'BASIC'
                              ? 'Баз'
                              : task.difficulty === 'ADVANCED'
                                ? 'Пов'
                                : 'Выс'}
                          </span>
                          <span className="flex-1 text-sm font-medium text-[#d8d4df]/80 transition group-hover:text-white">
                            {task.prompt.slice(0, 80)}...
                          </span>
                          <span className="shrink-0 text-xs text-[#8ef0de]/50">→</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            </div>

            {/* Sidebar */}
            <aside className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <h3 className="text-sm font-bold text-white">О модуле</h3>
                <ul className="mt-3 space-y-2 text-sm text-[#d8d4df]/60">
                  <li>📖 {totalLessons} уроков</li>
                  <li>✏️ {totalTasks} заданий для практики</li>
                  <li>🎯 Затрагивает задания КИМ: {Object.keys(tasksByExamNumber).join(', ')}</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <h3 className="text-sm font-bold text-white">Связанные задания КИМ</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.keys(tasksByExamNumber).map((num) => (
                    <Badge key={num} variant="secondary">
                      №{num}
                    </Badge>
                  ))}
                </div>
              </div>

              {Object.keys(tasksByExamNumber).includes('15') && (
                <Link
                  href="/oge/robot-simulator"
                  className="block rounded-2xl border border-[#8ef0de]/20 bg-[#8ef0de]/5 p-5 transition hover:bg-[#8ef0de]/10"
                >
                  <h3 className="text-sm font-bold text-[#8ef0de]">🤖 Тренажёр Робота</h3>
                  <p className="mt-2 text-xs leading-6 text-[#d8d4df]/60">
                    Интерактивный тренажёр исполнителя «Робот». Пишите алгоритмы, расставляйте стены,
                    выполняйте пошагово.
                  </p>
                </Link>
              )}

              {Object.keys(tasksByExamNumber).includes('16') && (
                <Link
                  href="/oge/code-runner"
                  className="block rounded-2xl border border-[#8ef0de]/20 bg-[#8ef0de]/5 p-5 transition hover:bg-[#8ef0de]/10"
                >
                  <h3 className="text-sm font-bold text-[#8ef0de]">🐍 Python Code Runner</h3>
                  <p className="mt-2 text-xs leading-6 text-[#d8d4df]/60">
                    Пишите и запускайте Python-код на сервере. Быстрые шаблоны для типовых задач ОГЭ.
                  </p>
                </Link>
              )}

              <div className="rounded-2xl border border-[#8ef0de]/20 bg-[#8ef0de]/5 p-5">
                <h3 className="text-sm font-bold text-[#8ef0de]">Совет</h3>
                <p className="mt-2 text-xs leading-6 text-[#d8d4df]/60">
                  Проходите уроки по порядку, затем решайте задания. Если что-то непонятно —
                  вернитесь к уроку.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
      <Footsies />
    </>
  );
}
