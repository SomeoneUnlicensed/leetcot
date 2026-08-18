import type { Metadata } from 'next';
import { LENTA_CHAMPIONSHIP_SLUG, prisma } from '@repo/db';
import { Difficulty } from '@repo/db/types';
import { DifficultyBadge } from '@repo/ui/components/difficulty-badge';
import { CheckCircle, Lock } from '@repo/ui/icons';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '~/server/auth';

export const metadata: Metadata = {
  title: 'Дебаг-Симулятор — Lenta tech',
  description: 'Задачи дебаг-симулятора: живой сервер и 20 практических инцидентов.',
};

const TIER_LABELS: Partial<Record<Difficulty, string>> = {
  EASY: 'Лёгкие / стартовые',
  MEDIUM: 'Средние',
  EVENT: 'Финальная',
};

const TIER_ORDER: Difficulty[] = [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.EVENT];

export default async function DebugSimulatorPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect('/login?callbackUrl=/debug-simulator');
  }

  const championship = await prisma.championship.findUnique({
    where: { slug: LENTA_CHAMPIONSHIP_SLUG },
    include: {
      debugTasks: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });

  const solvedTaskIds = user
    ? new Set(
        (
          await prisma.debugSubmission.findMany({
            where: { userId: user.id, isCorrect: true },
            select: { taskId: true },
          })
        ).map((s) => s.taskId),
      )
    : new Set<string>();

  const participant = user
    ? await prisma.championshipParticipant.findUnique({
        where: {
          championshipId_userId: { championshipId: championship?.id ?? '', userId: user.id },
        },
      })
    : null;

  const tasks = championship?.debugTasks ?? [];
  const totalPoints = tasks.reduce((sum, t) => sum + t.points, 0);

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-[#131722]">
      <section className="mx-auto max-w-5xl">
        <div className="border-border mb-8 rounded-2xl border bg-[#F5F9FF] p-8">
          <h1
            className="text-3xl tracking-tight text-[#131722] sm:text-4xl"
            style={{ fontFamily: 'var(--font-brand)', fontWeight: 700 }}
          >
            Дебаг-Симулятор
          </h1>
          <p className="mt-3 max-w-2xl text-[#131722]/65">
            Каждая задача — реальный сервер и конкретный инцидент: от подбора SSH-пароля до
            восстановления упавшего узла кластера. Найдите флаг и отправьте его ниже.
          </p>
          <p className="mt-4 text-sm text-[#131722]/60">
            Ваш счёт: <span className="font-bold text-[#00A0FF]">{participant?.score ?? 0}</span> из{' '}
            {totalPoints}
          </p>
        </div>

        {tasks.length === 0 ? (
          <div className="border-border rounded-2xl border bg-white p-8 text-center text-[#131722]/60">
            Задачи ещё не опубликованы. Загляните позже.
          </div>
        ) : (
          TIER_ORDER.map((tier) => {
            const tierTasks = tasks.filter((t) => t.difficulty === tier);
            if (tierTasks.length === 0) return null;

            return (
              <div key={tier} className="mb-8">
                <h2 className="mb-3 text-lg font-bold text-[#131722]/80">{TIER_LABELS[tier]}</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {tierTasks.map((task) => {
                    const isSolved = solvedTaskIds.has(task.id);
                    return (
                      <Link
                        key={task.id}
                        href={`/debug-simulator/${task.slug}`}
                        className="border-border group flex min-w-0 items-center justify-between gap-3 rounded-xl border bg-white p-4 transition-colors duration-200 hover:border-[#00A0FF]/40 hover:bg-[#F5F9FF]"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center gap-2">
                            {isSolved ? (
                              <CheckCircle className="h-4 w-4 shrink-0 stroke-emerald-500" />
                            ) : (
                              <Lock className="h-4 w-4 shrink-0 stroke-[#131722]/30" />
                            )}
                            <span className="min-w-0 truncate font-semibold text-[#131722] group-hover:text-[#003C96]">
                              {task.title}
                            </span>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2">
                          <span className="text-sm font-bold text-[#131722]/50">{task.points} pts</span>
                          <DifficultyBadge difficulty={task.difficulty} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        <div className="mt-8">
          <Link href="/leaderboard" className="text-sm font-semibold text-[#00A0FF] hover:text-[#0090e6]">
            Смотреть лидерборд →
          </Link>
        </div>
      </section>
    </main>
  );
}
