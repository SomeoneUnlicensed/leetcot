import type { Metadata } from 'next';
import { prisma } from '@repo/db';
import { DifficultyBadge } from '@repo/ui/components/difficulty-badge';
import { Markdown } from '@repo/ui/components/markdown';
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

  return (
    <main className="min-h-screen bg-[#0a0e17]">
      <div className="border-b border-white/5 bg-[#0d1220]">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
          <Link
            href="/debug-simulator"
            className="mb-5 inline-flex items-center gap-1.5 text-sm text-white/40 transition-colors hover:text-white/70"
          >
            ← Все задачи
          </Link>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <DifficultyBadge difficulty={task.difficulty} />
                <span className="text-sm font-bold text-[#00A0FF]">{task.points} pts</span>
              </div>

              <h1 className="text-2xl font-bold text-white sm:text-3xl">{task.title}</h1>

              <div className="prose prose-invert mt-3 max-w-2xl text-sm text-white/50">
                <Markdown>{task.instructions}</Markdown>
              </div>
            </div>

            <div className="w-full shrink-0 lg:w-80">
              <FlagForm slug={task.slug} points={task.points} initiallySolved={Boolean(solvedSubmission)} />
            </div>
          </div>
        </div>
      </div>

      {task.dockerImage ? (
        <TaskTerminal taskSlug={task.slug} />
      ) : (
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-300">
            Адрес и доступ к вашему серверу для этой задачи выдаются организаторами отдельно
            (на месте или в личном кабинете команды).
          </div>
        </div>
      )}
    </main>
  );
}
