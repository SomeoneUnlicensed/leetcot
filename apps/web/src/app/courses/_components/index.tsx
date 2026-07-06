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
      <main className="overflow-hidden bg-[#121018] px-4 text-white">
        <div className="from-[#ec4899]/16 pointer-events-none fixed inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b to-transparent" />
        <div className="container py-16 md:py-20">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-[#ff8ecb]/30 bg-[#211827]/80 px-4 py-2 text-sm font-black text-[#ffaad8] shadow-2xl shadow-pink-950/10">
              ЛитКот · курсы
            </div>
            <h1
              className="text-balance text-4xl leading-[1.14] tracking-normal sm:text-5xl md:text-6xl lg:text-[4.05rem]"
              style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
            >
              Курсы для практики по направлениям
            </h1>
            <p className="mt-6 max-w-2xl text-base font-semibold leading-7 text-[#d8d4df]/80 sm:text-lg">
              Python-алгоритмы, SQL и Go собраны отдельно, чтобы удобно выбирать формат практики и
              возвращаться к прогрессу.
            </p>
          </div>
        </div>

        <div className="container">
          <section className="grid grid-cols-1 gap-4 pb-16 md:grid-cols-2 xl:grid-cols-3 2xl:gap-6">
            {courses.map((course) => {
              if (course.isComingSoon) {
                return <CourseCardSoon key={`course-${course.id}`} course={course} />;
              }
              return <CourseCard key={`course-${course.id}`} course={course} />;
            })}
          </section>
        </div>
      </main>
      <Footsies />
    </>
  );
}
