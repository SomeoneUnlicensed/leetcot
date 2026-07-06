import { Badge } from '@repo/ui/components/badge';
import { ArrowUpRight, Compass } from '@repo/ui/icons';
import Link from 'next/link';

interface CourseCardProps {
  course: {
    id: number;
    name: string;
    slug: string;
    description: string;
    tracks: { _count: { trackChallenges: number } }[];
    _count: { enrolledUsers: number };
    enrolledUsers?: { id: string }[] | false;
  };
}

export function CourseCard({ course }: CourseCardProps) {
  const isEnrolled = Array.isArray(course.enrolledUsers) && course.enrolledUsers.length > 0;
  const totalChallenges = course.tracks.reduce((acc, t) => acc + t._count.trackChallenges, 0);

  return (
    <Link href={`/courses/${course.slug}`} className="group">
      <article className="relative h-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-6 transition hover:border-[#8ef0de]/35 hover:bg-white/[0.055]">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#2dd4bf]/10 blur-3xl transition group-hover:bg-[#ff4fa3]/10" />
        <div className="relative flex h-full flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8ef0de] text-[#121018]">
              <Compass className="h-5 w-5" />
            </div>
            {isEnrolled ? (
              <span className="rounded-full bg-[#e9f6a8] px-3 py-1 text-xs font-black text-[#121018]">
                вы записаны
              </span>
            ) : null}
          </div>

          <h2 className="mt-6 text-2xl font-black text-white">{course.name}</h2>
          <p className="mt-3 line-clamp-3 text-sm font-semibold leading-6 text-[#d8d4df]/65">
            {course.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Badge className="border-white/10 bg-white/[0.06] text-[#d8d4df]" variant="outline">
              {course.tracks.length} треков
            </Badge>
            <Badge className="border-white/10 bg-white/[0.06] text-[#d8d4df]" variant="outline">
              {totalChallenges} задач
            </Badge>
          </div>

          <div className="mt-auto flex items-center gap-2 pt-7 text-sm font-black text-[#8ef0de]">
            Открыть курс
            <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
        </div>
      </article>
    </Link>
  );
}
