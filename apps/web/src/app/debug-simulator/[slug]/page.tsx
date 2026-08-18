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
    <main className="min-h-screen bg-white px-4 py-10 text-[#131722]">
      <section className="mx-auto max-w-3xl">
        <Link
          href="/debug-simulator"
          className="mb-4 inline-block text-sm text-[#131722]/50 hover:text-[#131722]"
        >
          ← Все задачи
        </Link>

        <div className="border-border rounded-2xl border bg-white p-8 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <DifficultyBadge difficulty={task.difficulty} />
            <span className="text-sm font-bold text-[#131722]/50">{task.points} pts</span>
          </div>

          <h1 className="text-2xl font-bold text-[#131722] sm:text-3xl">{task.title}</h1>

          <div className="prose mt-5 max-w-none text-[#131722]/75">
            <Markdown>{task.instructions}</Markdown>
          </div>

          {!task.dockerImage ? (
            <div className="mt-6 rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900">
              Адрес и доступ к вашему серверу для этой задачи выдаются организаторами отдельно
              (на месте или в личном кабинете команды).
            </div>
          ) : null}
        </div>

        {task.dockerImage ? (
          <div className="mt-4">
            <TaskTerminal taskSlug={task.slug} />
          </div>
        ) : null}

        <div className="border-border mt-4 rounded-2xl border bg-white p-6 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-[#131722]/60">Флаг</p>
          <FlagForm slug={task.slug} points={task.points} initiallySolved={Boolean(solvedSubmission)} />
        </div>
      </section>
    </main>
  );
}
