import type { Metadata } from 'next';
import { prisma } from '@repo/db';
import { DifficultyBadge } from '@repo/ui/components/difficulty-badge';
import { Markdown } from '@repo/ui/components/markdown';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '~/server/auth';
import { FlagForm } from './_components/flag-form';

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
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
      <section className="mx-auto max-w-3xl">
        <Link
          href="/debug-simulator"
          className="mb-4 inline-block text-sm text-zinc-500 hover:text-zinc-300"
        >
          ← Все задачи
        </Link>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <DifficultyBadge difficulty={task.difficulty} />
            <span className="text-sm font-bold text-zinc-400">{task.points} pts</span>
          </div>

          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{task.title}</h1>

          <div className="prose prose-invert prose-pink mt-5 max-w-none text-zinc-300">
            <Markdown>{task.instructions}</Markdown>
          </div>

          <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
            Адрес и доступ к вашему серверу для этой задачи выдаются организаторами отдельно
            (на месте или в личном кабинете команды).
          </div>

          <div className="mt-6">
            <FlagForm slug={task.slug} points={task.points} initiallySolved={Boolean(solvedSubmission)} />
          </div>
        </div>
      </section>
    </main>
  );
}
