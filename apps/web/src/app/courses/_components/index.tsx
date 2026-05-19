import { prisma } from '@repo/db';
import { Footsies } from '~/components/footsies';
import { auth } from '~/server/auth';
import { CourseCard } from './course-card';
import { CourseCardSoon } from './course-card-soon';

export async function CoursesPage() {
  const session = await auth();

  const courses = await prisma.course.findMany({
    where: { visible: true },
    include: {
      tracks: {
        include: {
          _count: {
            select: { trackChallenges: true },
          },
        },
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
    orderBy: { isComingSoon: 'asc' },
  });

  return (
    <>
      <div className="flex flex-col gap-5 pb-8 md:gap-10 md:py-5">
        <div className="container">
          <h1 className="mb-8 text-4xl font-bold tracking-tight text-neutral-900 sm:px-8 md:px-0 dark:text-white">
            Курсы
          </h1>
          <p className="max-w-[69ch] text-lg leading-10 text-neutral-600 sm:px-8 md:px-0 dark:text-white/50">
            Курсы объединяют несколько треков в структурированную программу обучения.
            Запишитесь на курс, чтобы последовательно пройти все треки и задачи.
          </p>
        </div>
        <div className="container">
          <section className="w-[calc(100% + 8rem)] grid grid-cols-1 gap-4 sm:px-8 md:-mx-16 md:grid-cols-2 md:px-0 lg:mx-0 lg:w-full xl:grid-cols-3 2xl:gap-8">
            {courses.map((course) => {
              if (course.isComingSoon) {
                return <CourseCardSoon key={`course-${course.id}`} course={course} />;
              }
              return <CourseCard key={`course-${course.id}`} course={course} />;
            })}
          </section>
        </div>
      </div>
      <Footsies />
    </>
  );
}
