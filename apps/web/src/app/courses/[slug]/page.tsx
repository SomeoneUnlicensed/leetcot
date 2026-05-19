import type { Metadata } from 'next';
import { prisma } from '@repo/db';
import { notFound } from 'next/navigation';
import { buildMetaForDefault } from '~/app/metadata';
import { auth } from '~/server/auth';
import { Footsies } from '~/components/footsies';
import Link from 'next/link';
import { Badge } from '@repo/ui/components/badge';
import { EnrollCourseButton } from '../_components/enroll-course-button';

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await prisma.course.findFirst({ where: { slug } });
  if (!course) return buildMetaForDefault({ title: 'Курс не найден | ЛитКот' });
  return buildMetaForDefault({
    title: `${course.name} | ЛитКот`,
    description: course.description,
  });
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { slug } = await params;
  const session = await auth();

  const course = await prisma.course.findFirst({
    where: { slug },
    include: {
      tracks: {
        include: {
          _count: {
            select: { trackChallenges: true, enrolledUsers: true },
          },
          trackChallenges: session?.user
            ? {
                include: {
                  challenge: {
                    include: {
                      submission: {
                        where: {
                          userId: session.user.id,
                          isSuccessful: true,
                        },
                        take: 1,
                      },
                    },
                  },
                },
              }
            : {
                include: {
                  challenge: true,
                },
              },
        },
        orderBy: { name: 'asc' },
      },
      _count: {
        select: { enrolledUsers: true },
      },
      enrolledUsers: session?.user
        ? {
            where: { id: session.user.id },
          }
        : false,
    },
  });

  if (!course) {
    notFound();
  }

  const isEnrolled =
    Array.isArray(course.enrolledUsers) && course.enrolledUsers.length > 0;

  const totalChallenges = course.tracks.reduce(
    (acc, t) => acc + t._count.trackChallenges,
    0,
  );

  return (
    <>
      <div className="container pb-8 pt-6 md:pt-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 flex items-center gap-3">
              <span className="text-3xl">📚</span>
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white md:text-4xl">
                {course.name}
              </h1>
            </div>
            <p className="mt-2 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
              {course.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-zinc-500 dark:text-zinc-400">
              <span>{course.tracks.length} треков</span>
              <span>·</span>
              <span>{totalChallenges} задач</span>
              <span>·</span>
              <span>{course._count.enrolledUsers} участников</span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <EnrollCourseButton
              courseId={course.id}
              isEnrolled={isEnrolled}
              isLoggedIn={!!session?.user}
            />
          </div>
        </div>

        {/* Tracks list */}
        <h2 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-white">
          Треки в этом курсе
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {course.tracks.map((track) => {
            const completedCount = session?.user
              ? track.trackChallenges.filter((tc: any) =>
                  tc.challenge?.submission?.some((s: any) => s.isSuccessful),
                ).length
              : 0;
            const totalCount = track._count.trackChallenges;
            const progressPct =
              totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            return (
              <Link
                key={track.id}
                href={`/tracks/${track.slug}`}
                className="group"
              >
                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-500">
                  <h3 className="mb-1 text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {track.name}
                  </h3>
                  <p className="mb-3 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                    {track.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="default">
                      {totalCount} задач
                    </Badge>
                    {session?.user && totalCount > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          {completedCount}/{totalCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <Footsies />
    </>
  );
}
