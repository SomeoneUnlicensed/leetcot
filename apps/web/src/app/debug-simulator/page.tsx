import type { Metadata } from 'next';
import { prisma } from '@repo/db';
import { DifficultyBadge } from '@repo/ui/components/difficulty-badge';
import { CheckCircle, Lock } from '@repo/ui/icons';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '~/server/auth';
import { getQueueState, isParticipantLocked } from '~/server/task-queue';

export const metadata: Metadata = {
  title: 'Дебаг-Симулятор — Lenta tech',
  description: 'Задачи дебаг-симулятора: живой сервер и 20 практических инцидентов.',
};

export default async function DebugSimulatorPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect('/login?callbackUrl=/debug-simulator');
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    redirect('/login?callbackUrl=/debug-simulator');
  }
  if (await isParticipantLocked(user.id)) {
    redirect('/login?locked=1');
  }

  const { championship, tasks, solvedTaskIds, currentTask } = await getQueueState(user.id);

  const participant = await prisma.championshipParticipant.findUnique({
    where: {
      championshipId_userId: { championshipId: championship?.id ?? '', userId: user.id },
    },
  });

  const totalPoints = tasks.reduce((sum, t) => sum + t.points, 0);
  const solvedCount = tasks.filter((t) => solvedTaskIds.has(t.id)).length;
  const allSolved = tasks.length > 0 && solvedCount === tasks.length;

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
          <p className="mt-3 max-w-2xl text-[#131722]/70">
            «Продукты и Баги» — сеть из 200+ магазинов — только что пережила ребрендинг ИТ-отдела:
            штатная команда безопасности в полном составе уронила свои навыки в шредер во время
            миграции на новую CRM. Их место на сегодня занимаете вы.
          </p>
          <p className="mt-2 max-w-2xl text-[#131722]/65">
            Каждая задача — реальный сервер и конкретный инцидент: от простых команд в терминале до
            восстановления упавшего узла кластера. Найдите флаг и отправьте его прямо в терминале.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#131722]/60">
            <span>
              Доступно задач: <span className="font-bold text-[#131722]">{tasks.length}</span>
            </span>
            <span>
              Решено: <span className="font-bold text-[#131722]">{solvedCount}</span>
            </span>
            <span>
              Ваш счёт: <span className="font-bold text-[#00A0FF]">{participant?.score ?? 0}</span> из{' '}
              {totalPoints}
            </span>
            {!allSolved && currentTask ? (
              <Link
                href={`/debug-simulator/${currentTask.slug}`}
                className="ml-auto rounded-lg bg-[#00A0FF] px-4 py-2 text-sm font-bold text-white hover:bg-[#0090e6]"
              >
                Продолжить →
              </Link>
            ) : null}
          </div>
        </div>

        {allSolved ? (
          <div className="border-border mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <p className="font-bold text-emerald-700">Все задачи решены! Вы прошли дебаг-симулятор целиком.</p>
          </div>
        ) : null}

        {tasks.length === 0 ? (
          <div className="border-border rounded-2xl border bg-white p-8 text-center text-[#131722]/60">
            Задачи ещё не опубликованы. Загляните позже.
          </div>
        ) : (
          <p className="mb-5 text-sm text-[#131722]/50">
            Задачи открываются по очереди — в том порядке, в котором они перечислены ниже. Следующая
            становится доступна сразу после решения текущей.
          </p>
        )}

        <ol className="grid gap-2">
          {tasks.map((task, index) => {
            const isSolved = solvedTaskIds.has(task.id);
            const isCurrent = currentTask?.id === task.id;
            const isLocked = !isSolved && !isCurrent;

            const itemContent = (
              <>
                <span
                  className={`w-7 shrink-0 text-right text-sm font-bold tabular-nums ${isLocked ? 'text-[#131722]/25' : 'text-[#131722]/40'}`}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    {isSolved ? (
                      <CheckCircle className="h-4 w-4 shrink-0 stroke-emerald-500" />
                    ) : (
                      <Lock className="h-4 w-4 shrink-0 stroke-[#131722]/30" />
                    )}
                    <span
                      className={`min-w-0 font-semibold ${isLocked ? 'text-[#131722]/40' : 'text-[#131722] group-hover:text-[#003C96]'}`}
                    >
                      {task.title}
                    </span>
                    {isCurrent ? (
                      <span className="shrink-0 rounded-full bg-[#00A0FF]/10 px-2 py-0.5 text-[11px] font-bold text-[#00A0FF]">
                        текущая
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2">
                  <span className={`text-sm font-bold ${isLocked ? 'text-[#131722]/30' : 'text-[#131722]/50'}`}>
                    {task.points} pts
                  </span>
                  <DifficultyBadge difficulty={task.difficulty} />
                </div>
              </>
            );

            return (
              <li key={task.id} className="min-w-0">
                {isLocked ? (
                  <div
                    className="border-border flex min-w-0 cursor-not-allowed items-center justify-between gap-3 rounded-xl border bg-[#FAFBFC] p-4 opacity-60"
                    title="Сначала решите текущую задачу"
                  >
                    {itemContent}
                  </div>
                ) : (
                  <Link
                    href={`/debug-simulator/${task.slug}`}
                    className={`group flex min-w-0 items-center justify-between gap-3 rounded-xl border p-4 transition-colors duration-200 hover:border-[#00A0FF]/40 hover:bg-[#F5F9FF] ${
                      isCurrent ? 'border-[#00A0FF]/50 bg-[#F5F9FF]' : 'border-border bg-white'
                    }`}
                  >
                    {itemContent}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>

        <div className="mt-8">
          <Link href="/leaderboard" className="text-sm font-semibold text-[#00A0FF] hover:text-[#0090e6]">
            Смотреть лидерборд →
          </Link>
        </div>
      </section>
    </main>
  );
}
