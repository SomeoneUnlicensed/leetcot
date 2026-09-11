import type { Metadata } from 'next';
import { prisma } from '@repo/db';
import { DifficultyBadge } from '@repo/ui/components/difficulty-badge';
import { Markdown } from '@repo/ui/components/markdown';
import { Terminal as TerminalIcon } from '@repo/ui/icons';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '~/server/auth';
import { FlagForm } from './_components/flag-form';
import { TaskTerminal } from './_components/task-terminal';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const task = await prisma.debugTask.findUnique({ where: { slug: params.slug } });
  return { title: task ? `${task.title} — Дебаг-Симулятор` : 'Дебаг-Симулятор' };
}

export default async function DebugTaskPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.email) {
    redirect(`/login?callbackUrl=/debug-simulator/${params.slug}`);
  }

  const task = await prisma.debugTask.findUnique({ where: { slug: params.slug } });
  if (!task?.isActive) {
    notFound();
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  const solvedSubmission = user
    ? await prisma.debugSubmission.findFirst({
        where: { taskId: task.id, userId: user.id, isCorrect: true },
      })
    : null;
  const solved = Boolean(solvedSubmission);

  return (
    <div className="mx-auto flex max-w-[1800px] flex-col lg:h-[calc(100vh-73px)] lg:flex-row">
      {/* Task panel — objective, brief, status. Scrolls independently of the terminal. */}
      <aside className="border-border w-full shrink-0 border-b lg:h-full lg:w-[420px] lg:overflow-y-auto lg:border-r lg:border-b-0">
        <div className="p-6 sm:p-8">
          <Link
            href="/debug-simulator"
            className="mb-5 inline-flex items-center gap-1.5 text-sm text-[#131722]/40 transition-colors hover:text-[#131722]"
          >
            ← Все задачи
          </Link>

          <div className="mb-3 flex flex-wrap items-center gap-3">
            <DifficultyBadge difficulty={task.difficulty} />
            <span className="text-sm font-bold text-[#00A0FF]">{task.points} pts</span>
          </div>

          <h1 className="text-xl font-bold text-[#131722] sm:text-2xl">{task.title}</h1>

          <div className="prose prose-sm mt-4 max-w-none text-[#131722]/70">
            <Markdown>{task.instructions}</Markdown>
          </div>

          <div className="mt-6 border-t border-[#131722]/10 pt-6">
            {solved ? (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
                <span className="font-semibold">Решено</span>
                <span className="text-emerald-600/70">+{task.points} очков</span>
              </div>
            ) : task.dockerImage ? (
              <p className="flex items-start gap-2 text-xs text-[#131722]/45">
                <TerminalIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Флаг отправляется прямо в терминале: наберите{' '}
                <code className="text-[#00A0FF]">submit LENTA{'{...}'}</code> и нажмите Enter.
              </p>
            ) : null}
          </div>

          {!task.dockerImage ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900">
                Адрес и доступ к вашему серверу для этой задачи выдаются организаторами отдельно
                (на месте или в личном кабинете команды).
              </div>
              <FlagForm slug={task.slug} points={task.points} initiallySolved={solved} />
            </div>
          ) : null}
        </div>
      </aside>

      {/* Terminal — the actual workspace, fills whatever height the panel gets. */}
      {task.dockerImage ? (
        <main className="min-h-[70vh] min-w-0 flex-1 lg:h-full lg:min-h-0">
          <TaskTerminal taskSlug={task.slug} points={task.points} initiallySolved={solved} />
        </main>
      ) : null}
    </div>
  );
}
