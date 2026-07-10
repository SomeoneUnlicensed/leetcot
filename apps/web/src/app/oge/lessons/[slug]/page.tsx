import type { Metadata } from 'next';
import { prisma } from '@repo/db';
import { notFound } from 'next/navigation';
import { auth } from '~/server/auth';
import { buildMetaForDefault } from '~/app/metadata';
import { Footsies } from '~/components/footsies';
import Link from 'next/link';
import { Markdown } from '@repo/ui/components/markdown';

interface LessonPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const lesson = await prisma.ogeLesson.findFirst({ where: { slug }, include: { track: true } });
  if (!lesson) return buildMetaForDefault({ title: 'Урок не найден | ЛитКот' });
  return buildMetaForDefault({
    title: `${lesson.title} | ОГЭ Информатика | ЛитКот`,
    description: `Урок по теме «${lesson.title}» в рамках курса подготовки к ОГЭ по информатике.`,
  });
}

export default async function OgeLessonPage({ params }: LessonPageProps) {
  const { slug } = await params;
  const session = await auth();

  const lesson = await prisma.ogeLesson.findFirst({
    where: { slug },
    include: {
      track: true,
    },
  });

  if (!lesson) {
    notFound();
  }

  // Get previous and next lessons
  const allLessons = await prisma.ogeLesson.findMany({
    where: { trackId: lesson.trackId },
    orderBy: { order: 'asc' },
    select: { slug: true, title: true, order: true },
  });

  const currentIdx = allLessons.findIndex((l) => l.slug === slug);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  // Update user progress
  if (session?.user) {
    await prisma.ogeProgress.upsert({
      where: {
        userId_trackId: {
          userId: session.user.id,
          trackId: lesson.trackId,
        },
      },
      update: {
        completedLessons: {
          increment: 1,
        },
        totalLessons: allLessons.length,
      },
      create: {
        userId: session.user.id,
        trackId: lesson.trackId,
        completedLessons: 1,
        totalLessons: allLessons.length,
        totalTasks: 0,
      },
    });
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#0f0c1a] to-[#1a1528] text-white">
        <div className="from-[#ec4899]/10 pointer-events-none fixed inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b to-transparent" />

        <div className="container py-8">
          <Link
            href={`/oge/modules/${lesson.track.slug}`}
            className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-[#ffaad8]/70 transition hover:text-[#ffaad8]"
          >
            ← К списку уроков
          </Link>

          <div className="mx-auto max-w-3xl">
            <div className="mb-6">
              <div className="mb-2 inline-flex items-center gap-2 rounded-2xl border border-[#ff8ecb]/30 bg-[#211827]/80 px-4 py-1.5 text-xs font-black text-[#ffaad8]">
                {lesson.track.name} · урок {lesson.order}
              </div>
              <h1
                className="mt-3 text-3xl leading-tight md:text-4xl"
                style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
              >
                {lesson.title}
              </h1>
              <p className="mt-2 text-sm text-[#d8d4df]/50">~{lesson.duration} минут</p>
            </div>

            <article className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-headings:font-bold prose-a:text-[#ffaad8] prose-code:text-[#8ef0de] prose-code:bg-white/5 prose-code:rounded prose-code:px-1 prose-pre:bg-[#1a1528] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-2xl prose-strong:text-white prose-td:text-[#d8d4df] prose-th:text-white">
              <Markdown>{lesson.content}</Markdown>
            </article>

            {/* Navigation */}
            <div className="mt-12 flex items-center justify-between gap-4 border-t border-white/10 pt-6">
              {prevLesson ? (
                <Link
                  href={`/oge/lessons/${prevLesson.slug}`}
                  className="group rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-3 text-left transition hover:border-[#ff8ecb]/30"
                >
                  <span className="text-xs text-[#d8d4df]/40">← Предыдущий</span>
                  <p className="mt-1 text-sm font-semibold text-white">{prevLesson.title}</p>
                </Link>
              ) : (
                <div />
              )}
              {nextLesson ? (
                <Link
                  href={`/oge/lessons/${nextLesson.slug}`}
                  className="group rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-3 text-right transition hover:border-[#8ef0de]/30"
                >
                  <span className="text-xs text-[#d8d4df]/40">Следующий →</span>
                  <p className="mt-1 text-sm font-semibold text-white">{nextLesson.title}</p>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>
        </div>
      </div>
      <Footsies />
    </>
  );
}
